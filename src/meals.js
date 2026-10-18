export const mealKey = (date, slot) => `${date}:${slot}`;

export function monthDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from({length: Math.ceil((offset + count) / 7) * 7}, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > count ? null : `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

export function setMeal(meals, date, slot, text) {
  const remaining = meals.filter(meal => mealKey(meal.date, meal.slot) !== mealKey(date, slot));
  return text.trim() ? [...remaining, {date, slot, text: text.trim()}] : remaining;
}

export function transferMeal(meals, source, date, slot, move) {
  const current = meals.find(meal => mealKey(meal.date, meal.slot) === mealKey(source.date, source.slot));
  if (!current || mealKey(source.date, source.slot) === mealKey(date, slot)) return meals;
  const remaining = move ? setMeal(meals, source.date, source.slot, '') : meals;
  return setMeal(remaining, date, slot, current.text);
}

export async function syncMeals(client, householdId, before, after) {
  const old = new Map(before.map(meal => [mealKey(meal.date, meal.slot), meal]));
  const next = new Map(after.map(meal => [mealKey(meal.date, meal.slot), meal]));
  // Write destinations before removing sources so a failed move preserves the original.
  for (const [key, meal] of next) {
    if (old.get(key)?.text === meal.text) continue;
    const {error} = await client.from('meal_plans').upsert({household_id: householdId, ...meal}, {onConflict: 'household_id,date,slot'});
    if (error) throw error;
  }
  for (const [key, meal] of old) {
    if (next.has(key)) continue;
    const {error} = await client.from('meal_plans').delete().eq('household_id', householdId).eq('date', meal.date).eq('slot', meal.slot);
    if (error) throw error;
  }
}
