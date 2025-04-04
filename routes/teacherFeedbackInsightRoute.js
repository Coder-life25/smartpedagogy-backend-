const express = require("express");
const mongoose = require("mongoose");
const Assignment = require("../models/assignments"); // Assignment schema
const AssignmentFeedback = require("../models/assignmentFeedback"); // AssignmentFeedback schema
const Submission = require("../models/submission");
const User = require("../models/users");
const teacherFeedbackInsightRoute = express.Router();

// GET /api/teacher/:teacherId/feedback-insights
// Retrieves assignment-level feedback insights for all assignments uploaded by a teacher.

const getTeacherFeedbackInsights = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Validate teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid teacher ID format" });
    }

    // Check if the user exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    if (teacher.role !== "teacher") {
      return res
        .status(400)
        .json({ success: false, message: "Requested ID is not a teacher" });
    }

    // 1. Retrieve all assignments created by the teacher
    const assignments = await Assignment.find({ createdBy: teacherId });
    if (!assignments.length) {
      return res.status(200).json({
        success: true,
        message: "No assignments found for this teacher",
        data: {
          teacherId,
          assignments: [],
        },
      });
    }

    const insights = [];

    // Process each assignment sequentially to avoid nested Promise.all issues
    for (const assignment of assignments) {
      // 2. Get all submissions for this assignment, populating student name
      const submissions = await Submission.find({
        assignmentId: assignment._id,
      }).populate("studentId", "name email");

      let submissionDetails = [];

      // Process each submission sequentially
      for (const submission of submissions) {
        // 3. For each submission, fetch the corresponding feedback
        const feedback = await AssignmentFeedback.findOne({
          assignmentId: assignment._id,
          studentId: submission.studentId._id,
        });

        if (feedback && feedback.overallFeedback) {
          const f = feedback.overallFeedback;
          // Convert percentage strings to numbers
          const scores = {
            accuracy: parseFloat(f.accuracy.replace("%", "")),
            completeness: parseFloat(f.completeness.replace("%", "")),
            creativity: parseFloat(f.creativity.replace("%", "")),
            reasoning: parseFloat(f.reasoning.replace("%", "")),
            writing_quality: parseFloat(f.writing_quality.replace("%", "")),
            instruction_following: parseFloat(
              f.instruction_following.replace("%", "")
            ),
          };
          // Calculate overall score as the simple average
          const overallScore =
            (scores.accuracy +
              scores.completeness +
              scores.creativity +
              scores.reasoning +
              scores.writing_quality +
              scores.instruction_following) /
            6;
          submissionDetails.push({
            studentId: submission.studentId._id,
            studentName: submission.studentId.name,
            studentEmail: submission.studentId.email,
            submittedAt: submission.submittedAt,
            fileName: submission.fileName,
            overallScore: overallScore.toFixed(2) + "%",
            scores,
            feedback: f.feedback,
          });
        } else {
          // If no feedback exists, push a default entry
          submissionDetails.push({
            studentId: submission.studentId._id,
            studentName: submission.studentId.name,
            studentEmail: submission.studentId.email,
            submittedAt: submission.submittedAt,
            fileName: submission.fileName,
            overallScore: null,
            scores: null,
            feedback: null,
          });
        }
      }

      // 4. Calculate average scores for the assignment from valid submissions
      let count = 0;
      const avg = {
        accuracy: 0,
        completeness: 0,
        creativity: 0,
        reasoning: 0,
        writing_quality: 0,
        instruction_following: 0,
      };

      submissionDetails.forEach((sd) => {
        if (sd.overallScore !== null) {
          avg.accuracy += parseFloat(sd.scores.accuracy);
          avg.completeness += parseFloat(sd.scores.completeness);
          avg.creativity += parseFloat(sd.scores.creativity);
          avg.reasoning += parseFloat(sd.scores.reasoning);
          avg.writing_quality += parseFloat(sd.scores.writing_quality);
          avg.instruction_following += parseFloat(
            sd.scores.instruction_following
          );
          count++;
        }
      });

      if (count > 0) {
        avg.accuracy = (avg.accuracy / count).toFixed(2) + "%";
        avg.completeness = (avg.completeness / count).toFixed(2) + "%";
        avg.creativity = (avg.creativity / count).toFixed(2) + "%";
        avg.reasoning = (avg.reasoning / count).toFixed(2) + "%";
        avg.writing_quality = (avg.writing_quality / count).toFixed(2) + "%";
        avg.instruction_following =
          (avg.instruction_following / count).toFixed(2) + "%";
      } else {
        // If no submissions have feedback, set avgScores to null
        Object.keys(avg).forEach((key) => (avg[key] = null));
      }

      insights.push({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        submissionsCount: submissionDetails.length,
        avgScores: count > 0 ? avg : null,
        submissions: submissionDetails,
      });
    }

    // Return successful response with formatted data
    return res.status(200).json({
      success: true,
      data: {
        teacherId,
        count: insights.length,
        assignments: insights,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback insights:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching feedback insights",
      error: error.message,
    });
  }
};

teacherFeedbackInsightRoute.get(
  "/feedback-insights/:teacherId",
  getTeacherFeedbackInsights
);

module.exports = teacherFeedbackInsightRoute;
