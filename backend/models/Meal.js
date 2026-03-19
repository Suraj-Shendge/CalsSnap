import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    }
  ],
  totalCalories: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Meal", mealSchema);
