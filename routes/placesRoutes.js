import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { destination } = req.query;
    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    console.log(`🟢 Fetching coordinates for: ${destination}`);

    // 🌍 Map of states → key cities
    const normalizedDestinations = {
      kerala: "Kochi",
      rajasthan: "Jaipur",
      goa: "Panaji",
      tamilnadu: "Chennai",
      gujarat: "Ahmedabad",
      maharashtra: "Mumbai",
      karnataka: "Bengaluru",
      punjab: "Amritsar",
      delhi: "New Delhi",
      up: "Varanasi",
      uttarakhand: "Dehradun",
      himachal: "Shimla",
    };

    let queryName = destination.trim();
    if (normalizedDestinations[destination.toLowerCase()]) {
      console.log(
        `⚙️ Substituting region ${destination} → ${
          normalizedDestinations[destination.toLowerCase()]
        }`
      );
      queryName = normalizedDestinations[destination.toLowerCase()];
    }

    // ✅ Step 1: Get coordinates
    const geoRes = await axios.get(
      "https://api.opentripmap.com/0.1/en/places/geoname",
      {
        params: {
          name: queryName,
          lang: "en",
          country: "IN",
          apikey: process.env.OPENTRIPMAP_KEY,
        },
      }
    );

    if (!geoRes.data?.lat || !geoRes.data?.lon) {
      console.log(`⚠️ No coordinates found for ${queryName}`);
      return res.status(404).json({ error: "Coordinates not found" });
    }

    const { lat, lon } = geoRes.data;
    console.log(`📍 ${queryName} => lat:${lat}, lon:${lon}`);

    // ✅ Step 2: Fetch nearby attractions using the official API
    console.log(
      `📞 Calling Official OpenTripMap autosuggest API for: ${queryName}`
    );

    const suggestRes = await axios.get(
      "https://api.opentripmap.com/0.1/en/places/autosuggest",
      {
        params: {
          name: queryName,
          lat,
          lon,
          radius: 5000, // ✅ required
          limit: 10,
          format: "json",
          kinds: "interesting_places,tourist_facilities,cultural,foods,natural",
          apikey: process.env.OPENTRIPMAP_KEY,
        },
      }
    );

    if (!Array.isArray(suggestRes.data) || suggestRes.data.length === 0) {
      console.log(`⚠️ No attractions found near ${queryName}`);
      return res.status(404).json({ error: "No attractions found" });
    }

    // ✅ Step 3: Enrich data with random ratings and images
    const places = suggestRes.data.map((p, i) => ({
      id: p.xid || i,
      name: p.name || "Unnamed Place",
      image: `https://source.unsplash.com/600x400/?${encodeURIComponent(
        p.name || queryName
      )}`,
      description:
        p.kinds?.split(",").slice(0, 2).join(", ").replace(/_/g, " ") ||
        "Tourist attraction",
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      category: p.kinds?.split(",")[0] || "General",
      bestTime: ["Morning", "Afternoon", "Evening"][
        Math.floor(Math.random() * 3)
      ],
    }));

    console.log(`✅ Found ${places.length} places for ${queryName}`);
    res.json(places);
  } catch (error) {
    console.error("❌ Error fetching places:");
    console.error("Data:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    res
      .status(500)
      .json({ error: "Failed to fetch places from OpenTripMap API" });
  }
});

export default router;
