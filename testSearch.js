require("dotenv").config();
const axios = require("axios");
const parseSearchFilters = require("./utils/searchParser");

const FREE_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3.8-27b:free",
];

const CATEGORIES = [
  "Trending",
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Amazing Pools",
  "Camping",
  "Farms",
  "Arctic",
  "Beachfront",
  "Countryside",
];

async function testSearch() {
  const query = "beach house near mountains under 5000";

  const prompt = `You are a search query parser for a property listing site.
Convert the user's plain-English query into a JSON object with
exactly these three fields: category, priceMax, location.

Valid category values: ${CATEGORIES.join(", ")}
(use one of these exactly, or null if none clearly match)

priceMax: a number, or null if no price limit mentioned
location: a short place name string, or null if not mentioned

Return ONLY the JSON object, nothing else — no explanation, no markdown, no code fences.

Example output: {"category": "Beachfront", "priceMax": 5000, "location": "Goa"}

User query: "${query}"`;

  for (const model of FREE_MODELS) {
    try {
      console.log(`🔵 Trying ${model}...`);
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );

      console.log(`🟢 ${model} responded:`);
      const rawContent = response.data.choices[0]?.message?.content;
      console.log(rawContent);

      const result = parseSearchFilters(rawContent, CATEGORIES);
      console.log("Parsed result:", result);

      return;
    } catch (err) {
      console.log(`🔴 ${model} failed: ${err.message}`);
    }
  }
}

testSearch();
