import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

router.get("/riders", async (req, res) => {
  try {
    const riders = await User.find({ role: "RIDER" });

    res.json(riders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch riders",
      error: error.message,
    });
  }
});

export default router;