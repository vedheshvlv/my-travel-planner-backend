import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" }); // ✅ load env file

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { destination, days } = req.body;
    console.log("🟢 Incoming request:", { destination, days });

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY in env");
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    // ✅ Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ Use correct model name (latest version)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // ✅ Construct a structured prompt
    const prompt = `
      You are an expert Indian travel planner.
      Create a ${days}-day travel itinerary for ${destination}.
      Respond ONLY in valid JSON (no markdown, no explanations).
      Structure:
      {
        "days": [
          {
            "day": 1,
            "title": "string",
            "activities": [
              {
                "time": "string",
                "title": "string",
                "description": "string",
                "icon": "food | camera | coffee | transport",
                "duration": "string"
              }
            ]
          }
        ]
      }
    `;

    console.log("🧠 Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);

    // ✅ Extract and clean text
    const text = result.response.text().trim();
    console.log("✅ Gemini raw output:", text);

    // ✅ Safe JSON parse (handles cases where Gemini wraps response)
    let itineraryData;
    try {
      itineraryData = JSON.parse(text);
    } catch {
      const cleaned = text.match(/\{[\s\S]*\}/); // extract JSON block if present
      itineraryData = cleaned ? JSON.parse(cleaned[0]) : { days: [] };
    }

    // ✅ Send structured JSON response
    res.json(itineraryData);
  } catch (error) {
    console.error("❌ Error generating itinerary:", error);
    res.status(500).json({
      error: "Failed to generate itinerary",
      details: error.message,
    });
  }
});

export default router;
