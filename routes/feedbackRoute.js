const express = require("express");
const feedbackRoute = express.Router();
const mongoose = require("mongoose");
const AssignmentFeedback = require("../models/assignmentFeedback");
const Assignment = require("../models/assignments");
const Submission = require("../models/submission");

// API to get feedback and scores for a student
feedbackRoute.get("/student/:id", async (req, res) => {
  const studentId = req.params.id;
  try {
    const feedbackData = await AssignmentFeedback.find({ studentId });

    if (!feedbackData.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this student." });
    }

    const scoreBreakdown = feedbackData.map((feedback) => ({
      assignmentId: feedback.assignmentId,
      accuracy: feedback.overallFeedback.accuracy,
      completeness: feedback.overallFeedback.completeness,
      creativity: feedback.overallFeedback.creativity,
      reasoning: feedback.overallFeedback.reasoning,
      writingQuality: feedback.overallFeedback.writing_quality,
      instructionFollowing: feedback.overallFeedback.instruction_following,
      feedback: feedback.overallFeedback.feedback,
      detailedFeedback: feedback.individualFeedback, // Array of specific comments
    }));

    res.json(scoreBreakdown);
  } catch (error) {
    console.error("Error fetching student feedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

feedbackRoute.get("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;

  // Validate the assignmentId
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({ error: "Invalid assignmentId format" });
  }

  try {
    // Fetch the assignment details
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Fetch the latest submission associated with the assignment
    const submission = await Submission.findOne({ assignmentId })
      .sort({ submittedAt: -1 }) // Get the most recent submission
      .select("file"); // Select only the file field

    if (!submission) {
      return res
        .status(404)
        .json({ error: "No submissions found for this assignment" });
    }

    // Respond with the assignment details and the Base64-encoded file
    res.json({
      title: assignment.title,
      description: assignment.description,
      file: submission.file, // Assuming the file is already stored as a Base64 string
    });
  } catch (error) {
    console.error("Error fetching assignment details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = feedbackRoute;
