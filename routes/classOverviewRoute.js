const express = require("express");
const classOverviewRoute = express.Router();
const Submission = require("../models/submission");
const Assignment = require("../models/assignments");
const { AuthUser } = require("../middlewares/Auth");

// Get all submitted assignments for a teacher's class
classOverviewRoute.get("/class-overview", AuthUser, async (req, res) => {
  try {
    const teacherId = req.user._id; // Get teacher ID from authenticated user

    // Find assignments created by this teacher
    const assignments = await Assignment.find({ createdBy: teacherId });
    const assignmentIds = assignments.map((assignment) => assignment._id);

    // Find submissions for these assignments
    const submissions = await Submission.find({
      assignmentId: { $in: assignmentIds },
    })
      .populate("studentId", "name") // Get student name
      .populate("assignmentId", "title"); // Get assignment title

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching class overview:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = classOverviewRoute;
