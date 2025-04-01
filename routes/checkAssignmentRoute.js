const express = require("express");
const axios = require("axios");
require("dotenv").config();
const Submission = require("../models/submission");
const AssignmentFeedback = require("../models/assignmentFeedback");
const extractText = require("../helper/extractQ&A");
const extractTextFromPDF = require("../helper/extractQ&AFromPDF");
const { PROMPT } = require("../helper/constants");
const { AuthUser } = require("../middlewares/Auth");

const checkAssignmentRoute = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:generateContent";

// Analyze Assignment API
checkAssignmentRoute.post("/analyze/assignment", AuthUser, async (req, res) => {
  try {
    const { submissionId } = req.body;
    const studentId = req.user._id;
    console.log("Processing Submission ID:", submissionId);

    // Fetch submitted assignment
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignmentId = submission.assignmentId;
    console.log(assignmentId);

    // Extract MIME type and Base64 content
    const fileParts = submission.file.split(",");
    if (fileParts.length < 2) {
      return res.status(400).json({ error: "Invalid file format" });
    }
    const mimeType = fileParts[0].split(":")[1].split(";")[0];
    const base64Content = fileParts[1];
    let outputData = "";

    if (mimeType === "application/pdf") {
      console.log("Processing PDF File...");
      outputData = await extractTextFromPDF(base64Content);
      console.log(outputData);
      // assignmentText = await extractTextFromPDF(base64Content);
    } else if (
      mimeType === "image/jpeg" ||
      mimeType === "image/jpg" ||
      mimeType === "image/png"
    ) {
      console.log("Processing Image File...");
      outputData = await extractText(base64Content);
      console.log(outputData);
      // assignmentText = await extractTextFromImage(base64Content);
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    const results = await Promise.all(
      outputData.map(async (data) => {
        const requestData = {
          contents: [
            {
              parts: [
                {
                  text:
                    PROMPT +
                    `
  
          Now, evaluate the following assignment:
          Teacher Question: ${data.question}
          Student Answer: ${data.answer}
          Evaluation:
      `,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 1024 },
        };

        // Call Gemini API
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          requestData,
          { headers: { "Content-Type": "application/json" } }
        );

        const evaluationText =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response from AI";

        // Extract JSON from backticks and parse it
        const jsonMatch = evaluationText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
          console.error("Invalid response format from AI:", evaluationText);
          return null;
        }

        try {
          return JSON.parse(jsonMatch[1]);
        } catch (error) {
          console.error("Error parsing AI response:", error);
          return null;
        }
      })
    );

    // Filter out null responses
    const validResults = results.filter((r) => r !== null);

    // Calculate overall feedback
    const overallFeedback = {
      accuracy: 0,
      completeness: 0,
      instruction_following: 0,
      creativity: 0,
      writing_quality: 0,
      reasoning: 0,
      feedback: [],
    };

    validResults.forEach((result) => {
      overallFeedback.accuracy += parseFloat(result.accuracy || "0");
      overallFeedback.completeness += parseFloat(result.completeness || "0");
      overallFeedback.instruction_following += parseFloat(
        result.instruction_following || "0"
      );
      overallFeedback.creativity += parseFloat(result.creativity || "0");
      overallFeedback.writing_quality += parseFloat(
        result.writing_quality || "0"
      );
      overallFeedback.reasoning += parseFloat(result.reasoning || "0");
      overallFeedback.feedback.push(result.feedback);
    });

    const totalQuestions = validResults.length;
    if (totalQuestions > 0) {
      overallFeedback.accuracy =
        (overallFeedback.accuracy / totalQuestions).toFixed(2) + "%";
      overallFeedback.completeness =
        (overallFeedback.completeness / totalQuestions).toFixed(2) + "%";
      overallFeedback.instruction_following =
        (overallFeedback.instruction_following / totalQuestions).toFixed(2) +
        "%";
      overallFeedback.creativity =
        (overallFeedback.creativity / totalQuestions).toFixed(2) + "%";
      overallFeedback.writing_quality =
        (overallFeedback.writing_quality / totalQuestions).toFixed(2) + "%";
      overallFeedback.reasoning =
        (overallFeedback.reasoning / totalQuestions).toFixed(2) + "%";
      overallFeedback.feedback = overallFeedback.feedback.join(" ");
    }

    const feedbackEntry = new AssignmentFeedback({
      studentId,
      assignmentId,
      individualFeedback: validResults,
      overallFeedback,
    });

    await feedbackEntry.save();

    // Return results to frontend
    res.status(200).json({
      individualFeedback: validResults,
      overallFeedback,
    });
  } catch (error) {
    console.error("Error analyzing assignment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = checkAssignmentRoute;
