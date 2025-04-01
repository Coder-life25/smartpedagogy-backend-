const pdfParse = require("pdf-parse");

// Function to extract text from a Base64 PDF
async function extractTextFromPDF(base64PDF) {
  try {
    // Convert Base64 to Buffer
    const pdfBuffer = Buffer.from(base64PDF, "base64");

    // Parse PDF content
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

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

    return output;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return [];
  }
}

module.exports = extractTextFromPDF;
