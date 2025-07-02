import db from "../config/db.js";

class MealPlan {
  // ADD recipe to meal plan
  static async create(userId, mealData) {
    const { recipe_id, planned_date, meal_date, meal_type } = mealData;

    const date = planned_date || meal_date;

    const result = await db.query(
      `INSERT INTO meal_plans (user_id, recipe_id, meal_date, meal_type)
             VALUES ($1, $2, $3::date, $4) ON CONFLICT (user_id, recipe_id, meal_type) DO  UPDATE SET  recipe_id = $2 RETURNING *`,
      [userId, recipe_id, date, meal_type]
    );
    return result.rows[0];
  }

  // GET meal plan with date range
  static async findByDateRange(userId, startDate, endDate) {
    const result = await db.query(
      `SELECT mp.id, mp.user_id, mp.recipe_id, mp.meal_date::text as meal_date, mp.meal_type, mp.created_at, mp.updated_at,
            r.name as recipe_name, r.image_url, r.prep_time, r.cook_time FROM meal_plans mp
             JOIN recipes r ON mp.recipe_id = r.id
             WHERE mp.user_id = $1 AND mp.meal_date >= $2 AND mp.meal_date <= $3
             ORDER BY mp.meal_date ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  // Get weekly meal plan
  static async getWeeklyPlan(userId, weekStart) {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    return await this.findByDateRange(userId, weekStart, endDate);
  }

  // UPCOMING meals (next 7 days)
  static async getUpcoming(userId, limit = 5) {
    const result = await db.query(
      `SELECT mp.*, r.name as recipe_name, r.image_url FROM meal_plans mp 
                JOIN recipes r ON mp.recipe_id = r.id
                WHERE mp.user_id = $1 AND mp.meal_date >= CURRENT_DATE  ORDER BY mp.meal_date ASC CASE
                WHEN mp.meal_type = 'breakfast' THEN 1
                WHEN mp.meal_type = 'lunch' THEN 2
                WHEN mp.meal_type = 'dinner' THEN 3
                END LiMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // DELETE meal from plan entry
  static async delete(id, userId) {
    const result = await db.query(
      `DELETE FROM meal_plans WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }

  // GET meal plan stats
  static async getStats(userId) {
    const result = await db.query(
      `SELECT
            COUNT(*) as total_meals,
            COUNT(*) FILTER(WHERE  meal_date>= CURRENT_DATE) + INTERVAL '7 days'  as this_week_count,
            FROM meal_plans
            WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }
}

export default MealPlan;
