const express = require("express");
const assignmentRoutes = express.Router();
const Assignment = require("../models/assignments");
const { AuthUser } = require("../middlewares/Auth"); // Ensure authentication

{
  /** students Routes */
}

// get all the assignments from the all teachers
assignmentRoutes.get("/students", AuthUser, async (req, res) => {
  try {
    const assignments = await Assignment.find(); // Fetch all assignments
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error });
  }
});

// Create Assignment
assignmentRoutes.post("/", AuthUser, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      createdBy: req.user._id,
    });

    await newAssignment.save();
    res
      .status(201)
      .json({ message: "Assignment created successfully", newAssignment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Get All Assignments
assignmentRoutes.get("/", AuthUser, async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get assignment by Id

assignmentRoutes.get("/:id", AuthUser, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Update Assignment
assignmentRoutes.patch("/:id", AuthUser, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate },
      { new: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment updated successfully", updatedAssignment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Delete Assignment
assignmentRoutes.delete("/:id", AuthUser, async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = assignmentRoutes;
