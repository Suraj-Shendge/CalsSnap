
/**
 * Simple health‑score algorithm (0‑100).
 * @param {{calories:number, protein:number, carbs:number, fat:number}}
 */
export function calculateHealthScore({ calories, protein, carbs, fat }) {
  let score = 100;
  if (calories > 800) score -= 20;
  if (fat > 40) score -= 15;
  if (protein > 30) score += 10;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return Math.round(score);
}
