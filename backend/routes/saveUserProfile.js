import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, goal, weight, calorieTarget } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    user.goal = goal;
    user.weight = weight;
    user.calorieTarget = calorieTarget;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save user profile" });
  }
});

export default router;
