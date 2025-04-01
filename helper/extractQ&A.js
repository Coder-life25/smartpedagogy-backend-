const Tesseract = require("tesseract.js");

// Function to extract text from a Base64 image
async function extractText(base64Image) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(
      `data:image/png;base64,${base64Image}`, // Provide Base64 string with MIME type
      "eng"
    );

    // Process text to separate questions and answers
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let output = [];
    let currentQuestion = null;

    lines.forEach((line) => {
      if (line.endsWith("?")) {
        // Identify questions
        if (currentQuestion) {
          output.push(currentQuestion);
        }
        currentQuestion = { question: line, answer: "" };
      } else if (currentQuestion) {
        // Assign answers to questions
        currentQuestion.answer += (currentQuestion.answer ? " " : "") + line;
      }
    });

    if (currentQuestion) {
      output.push(currentQuestion);
    }

    // console.log("Extracted Questions and Answers:", output);
    return output;
  } catch (error) {
    console.error("Error extracting text:", error);
  }
}

// Example Base64 string (Replace this with your actual Base64 string)
// const base64String = "iVBORw0KGgoAAAANSUhEUgAAA..."; // Truncated for example
// extractText(base64String);

module.exports = extractText;
