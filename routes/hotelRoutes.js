import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" }); // Load environment variables

const router = express.Router();

/**
 * Route: GET /api/hotels
 * Query Params: hotel_id (required), adults, children_age, room_qty, currency_code, etc.
 * Example: /api/hotels?hotel_id=191605&adults=2&currency_code=USD
 */
router.get("/", async (req, res) => {
  try {
    const {
      hotel_id = "191605", // default example
      adults = "1",
      children_age = "1,17",
      room_qty = "1",
      units = "metric",
      temperature_unit = "c",
      languagecode = "en-us",
      currency_code = "INR",
    } = req.query;

    // ✅ Check for API key
    if (!process.env.RAPIDAPI_KEY) {
      console.error("❌ Missing RAPIDAPI_KEY in .env.local");
      return res.status(500).json({ error: "RapidAPI key missing" });
    }

    // ✅ Request configuration
    const options = {
      method: "GET",
      url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails",
      params: {
        hotel_id,
        adults,
        children_age,
        room_qty,
        units,
        temperature_unit,
        languagecode,
        currency_code,
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
      },
    };

    console.log("🟢 Fetching hotel details from RapidAPI:", hotel_id);

    const response = await axios.request(options);

    console.log("✅ Hotel details fetched successfully");
    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Error fetching hotel data:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to fetch data from RapidAPI",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
