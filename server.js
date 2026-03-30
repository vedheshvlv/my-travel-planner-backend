// 📄 server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import hotelRoutes from "./routes/hotelRoutes.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import placesRoutes from "./routes/placesRoutes.js";

// Load environment variables
dotenv.config({ path: "./.env.local" });

const app = express();

/* ==========================
   ✅ CORS CONFIGURATION
========================== */

// Allowed origins list
const allowedOrigins = [
  "https://main.d15nuea3wj0u9n.amplifyapp.com", // your Amplify production domain (NO trailing slash)
  "https://saarthi-coral.vercel.app", // optional - old Vercel deploy
  "http://localhost:5173", // local dev (Vite)
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies / auth headers
  optionsSuccessStatus: 200, // legacy browser support
};

// Apply CORS middleware
app.use(cors(corsOptions));

/* ==========================
   ✅ EXPRESS SETUP
========================== */
app.use(express.json());

// Mount routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/places", placesRoutes);

/* ==========================
   ✅ SERVER START
========================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
