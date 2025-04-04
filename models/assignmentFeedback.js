const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the Student collection
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Assignment", // Reference to the Assignment collection
    },
    individualFeedback: [
      {
        completeness: { type: String, required: true },
        accuracy: { type: String, required: true },
        instruction_following: { type: String, required: true },
        creativity: { type: String, required: true },
        writing_quality: { type: String, required: true },
        reasoning: { type: String, required: true },
        feedback: { type: String, required: true },
      },
    ],
    overallFeedback: {
      accuracy: { type: String, required: true },
      completeness: { type: String, required: true },
      instruction_following: { type: String, required: true },
      creativity: { type: String, required: true },
      writing_quality: { type: String, required: true },
      reasoning: { type: String, required: true },
      feedback: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const AssignmentFeedback = mongoose.model("AssignmentFeedback", feedbackSchema);
module.exports = AssignmentFeedback;
