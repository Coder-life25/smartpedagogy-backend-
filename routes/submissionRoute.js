const express = require("express");
const { AuthUser } = require("../middlewares/Auth");
const Submission = require("../models/submission");
const Assignment = require("../models/assignments");
const submissionRoute = express.Router();

submissionRoute.post("/upload", AuthUser, async (req, res) => {
  try {
    const { assignmentId, createdBy, file } = req.body;
    const studentId = req.user.id; // Get studentId from AuthUser middleware

    if (!assignmentId || !createdBy || !file) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Extract filename from Base64 (metadata)
    const fileName = `assignment_${assignmentId}_${Date.now()}`;

    // Save submission details in MongoDB (without storing file)
    const newSubmission = new Submission({
      assignmentId,
      studentId,
      fileName,
      file,
      createdBy,
      submittedAt: new Date(),
    });

    await newSubmission.save();

    res.status(201).json({
      message: "Assignment submitted successfully.",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

submissionRoute.get("/submitted", AuthUser, async (req, res) => {
  try {
    const studentId = req.user.id; // Get student ID from auth
    const submittedAssignments = await Submission.find({ studentId }).populate(
      "assignmentId"
    );

    res.status(200).json(submittedAssignments.map((sub) => sub.assignmentId));
  } catch (error) {
    console.error("Error fetching submitted assignments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get pending assignments
submissionRoute.get("/pending", AuthUser, async (req, res) => {
  try {
    const studentId = req.user.id; // Get student ID from auth
    const allAssignments = await Assignment.find(); // Get all assignments
    // const submittedAssignments = await Submission.find({ studentId }).distinct(
    //   "assignmentId"
    // );

    const submittedAssignments = await Submission.find({ studentId });
    // console.log(submittedAssignments);

    const submittedAssignmentIds = submittedAssignments.map((sub) =>
      sub.assignmentId.toString()
    );

    // console.log(allAssignments.length);
    // console.log(submittedAssignmentIds);

    // Filter out assignments that were already submitted
    const pendingAssignments = allAssignments.filter((assign) => {
      // console.log(assign._id.toString());
      return !submittedAssignmentIds.includes(assign._id.toString());
    });

    // console.log(pendingAssignments.length);

    res.status(200).json(pendingAssignments);
  } catch (error) {
    console.error("Error fetching pending assignments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = submissionRoute;
