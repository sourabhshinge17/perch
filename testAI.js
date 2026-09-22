require("dotenv").config();

async function testCall() {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it:free",
        messages: [
          {
            role: "user",
            content:
              "Write ONE short Airbnb-style listing description, 2-3 sentences, plain text only. No markdown, no headers, no multiple options — just the final description text",
          },
        ],
      }),
    },
  );

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testCall();
