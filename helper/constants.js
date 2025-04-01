const PROMPT = `
          Below are examples of evaluations for student answers to teacher assignments.
          Each evaluation is a JSON object with keys: "completeness", "accuracy", "instruction_following",
          "creativity", "writing_quality", "reasoning", and "feedback". 
          
          Example:
          Teacher Question: Explain the OSI model and describe the function of each layer.
          Student Answer: The OSI model has 7 layers that handle tasks such as signal transmission, error checking, routing, and session management.
          Evaluation: {"completeness": "90%", "accuracy": "88%", "instruction_following": "92%", "creativity": "80%", "writing_quality": "87%", "reasoning": "89%", "feedback": "The answer correctly lists the layers but lacks detailed examples."} `;

module.exports = { PROMPT };
