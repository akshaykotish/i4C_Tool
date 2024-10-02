const { OpenAIApi } = require("openai");

// Directly set the API key in the OpenAIApi instance
const openai = new OpenAIApi({
  apiKey: "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",
});

async function askGPT(prompt) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: [
        { role: "user", content: prompt },
      ],
    });

    // Extract and return the assistant's reply
    const answer = response.data.choices[0].message.content;
    console.log(answer);
  } catch (error) {
    console.error("Error: ", error.response ? error.response.data : error.message);
  }
}

// Example usage
askGPT("How do I connect to a MySQL database using Node.js?");
