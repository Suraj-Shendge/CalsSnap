// backend/services/llamaService.js

export async function generateHealthAdvice(text) {
  return {
    advice: `Based on your food (${text}), try to balance protein, carbs, and fats.`,
    items: [
      {
        name: text,
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 5,
      },
    ],
    total_calories: 200,
  };
}
