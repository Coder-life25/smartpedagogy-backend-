const mongoose = require("mongoose");
const express = require("express");
const performanceRoute = express.Router();
const AssignmentFeedback = require("../models/assignmentFeedback");

performanceRoute.get("/student/:id", async (req, res) => {
  const studentId = req.params.id;
  try {
    const result = await AssignmentFeedback.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: "$studentId",
          avgAccuracy: {
            $avg: {
              $toDouble: {
                $replaceOne: {
                  input: "$overallFeedback.accuracy",
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
          avgCompleteness: {
            $avg: {
              $toDouble: {
                $replaceOne: {
                  input: "$overallFeedback.completeness",
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
          avgCreativity: {
            $avg: {
              $toDouble: {
                $replaceOne: {
                  input: "$overallFeedback.creativity",
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
          avgReasoning: {
            $avg: {
              $toDouble: {
                $replaceOne: {
                  input: "$overallFeedback.reasoning",
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
          avgWritingQuality: {
            $avg: {
              $toDouble: {
                $replaceOne: {
                  input: "$overallFeedback.writing_quality",
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
          avgInstructionFollowing: {
            $avg: {
              $toDouble: {
                $replaceOne: {
                  input: "$overallFeedback.instruction_following",
                  find: "%",
                  replacement: "",
                },
              },
            },
          },
        },
      },
    ]);
    res.json(result[0]);
  } catch (error) {
    console.error("Error in aggregation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = performanceRoute;
