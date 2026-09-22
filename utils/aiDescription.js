const axios = require("axios");

const FREE_MODELS = [
  "openrouter/free", // ← safest first choice (auto-routes to any available free model)
  "nvidia/nemotron-3-ultra-550b-a55b:free", // currently the strongest free model
  "nvidia/nemotron-3.5-lightning:free", // fast + high usage
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free", // keep the one you already tried
  "qwen/qwen3.8-27b:free",
  "inclusionai/ling-3.0-flash-fin:free",
];

module.exports.generateListingDescription = async ({
  title,
  category,
  location,
}) => {
  const prompt = `Write ONE short, appealing property listing description,
2-3 sentences, plain text only. No markdown, no headers, no multiple options.

You MUST naturally mention the title, category, and location given below —
work them directly into the sentences. Do not invent amenities, room types,
or features that aren't mentioned in the input; only describe what's given.

Title: ${title}
Category: ${category}
Location: ${location}`;
  let lastError;

  for (const model of FREE_MODELS) {
    try {
      console.log(`🔵 Trying ${model}...`);
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages: [{ role: "user", content: prompt }] },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );

      const description = response.data.choices[0]?.message?.content;
      if (description) {
        console.log(`🟢 ${model} responded`);
        return description;
      }
    } catch (err) {
      console.log(`🔴 ${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw (
    lastError || new Error("All AI models failed to generate a description")
  );
};
