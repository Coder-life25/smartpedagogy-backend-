const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { Minhash } = require("minhash"); // Correct MinHash package
require("dotenv").config();
const Submission = require("../models/submission");

const checkAssignmentRoute = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:generateContent";

// Function to extract text from a Base64 PDF
const extractTextFromPDF = async (base64String) => {
  const pdfBuffer = Buffer.from(base64String, "base64");
  const pdfData = await pdfParse(pdfBuffer);
  return pdfData.text;
};

// Function to extract text from a Base64 Image using OCR
const extractTextFromImage = async (base64String) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(Buffer.from(base64String, "base64"), "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => resolve(text))
      .catch((error) => reject(error));
  });
};

// Function to compute MinHash signature
const computeMinHash = (text) => {
  if (!text || text.trim().length === 0) return []; // Handle empty input

  const minhash = new Minhash();
  text.split(/\s+/).forEach((word) => {
    if (word) minhash.update(word); // Ensure valid words are added
  });

  return Array.from(minhash.hashValues || []); // Ensure it's an array
};

// Function to check plagiarism using Jaccard similarity
const checkPlagiarism = async (submissionText) => {
  const newSubmissionHash = computeMinHash(submissionText);
  if (!Array.isArray(newSubmissionHash)) {
    throw new Error(
      "MinHash computation failed: newSubmissionHash is not an array"
    );
  }

  const allSubmissions = await Submission.find();

  let maxSimilarity = 0;
  let mostSimilarAssignment = null;

  for (const pastSubmission of allSubmissions) {
    const pastText = Buffer.from(
      pastSubmission.file.split(",")[1],
      "base64"
    ).toString("utf-8");

    const pastSubmissionHash = computeMinHash(pastText);

    if (!Array.isArray(pastSubmissionHash)) {
      console.warn("Skipping past submission due to invalid MinHash result.");
      continue;
    }

    // Jaccard similarity calculation
    const intersection = newSubmissionHash.filter((hash) =>
      pastSubmissionHash.includes(hash)
    ).length;
    const union = new Set([...newSubmissionHash, ...pastSubmissionHash]).size;
    const similarity = union === 0 ? 0 : intersection / union; // Avoid division by zero

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarAssignment = pastSubmission;
    }
  }

  return {
    similarity: maxSimilarity,
    similarAssignment: mostSimilarAssignment,
  };
};

// Analyze Assignment API
checkAssignmentRoute.post("/analyze/assignment", async (req, res) => {
  try {
    const { submissionId } = req.body;
    console.log("Processing Submission ID:", submissionId);

    // Fetch submitted assignment
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Extract MIME type and Base64 content
    const fileParts = submission.file.split(",");
    if (fileParts.length < 2) {
      return res.status(400).json({ error: "Invalid file format" });
    }
    const mimeType = fileParts[0].split(":")[1].split(";")[0];
    const base64Content = fileParts[1];

    let assignmentText = "";

    if (mimeType === "application/pdf") {
      console.log("Processing PDF File...");
      assignmentText = await extractTextFromPDF(base64Content);
    } else if (mimeType.startsWith("image/")) {
      console.log("Processing Image File...");
      assignmentText = await extractTextFromImage(base64Content);
    } else if (mimeType === "text/plain") {
      console.log("Processing Plain Text File...");
      assignmentText = Buffer.from(base64Content, "base64").toString("utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    console.log("Extracted Text:", assignmentText.substring(0, 200)); // Log first 200 chars

    // Check for plagiarism
    const { similarity, similarAssignment } = await checkPlagiarism(
      assignmentText
    );
    console.log(`Plagiarism Similarity: ${similarity * 100}%`);

    // Prepare request payload for Gemini
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `Evaluate the following assignment based on accuracy, common mistakes, plagiarism, and feedback and write the accuracy in float form, common mistakes in text, plagiarism in text and feedback in text. Don't give irrelevant output.:\n\n${assignmentText}`,
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

    // Extract response from Gemini
    const geminiResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    // Return results to frontend
    res.status(200).json({
      feedback: jsonData,
      plagiarism: {
        similarity: similarity * 100,
        matchedAssignment: similarAssignment ? similarAssignment._id : null,
      },
    });
  } catch (error) {
    console.error("Error analyzing assignment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = checkAssignmentRoute;
