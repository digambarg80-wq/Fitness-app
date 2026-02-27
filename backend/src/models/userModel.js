const db = require('../config/database');

class User {
  // Create new user
  static async create(userData) {
    const { email, username, firebase_uid, age, height_cm, weight_kg } = userData;
    
    let bmi = null;
    if (height_cm && weight_kg) {
      const heightInM = height_cm / 100;
      bmi = (weight_kg / (heightInM * heightInM)).toFixed(1);
    }
    
    const query = `
      INSERT INTO users (email, username, firebase_uid, age, height_cm, weight_kg, bmi)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, username, age, height_cm, weight_kg, bmi, created_at
    `;
    
    const values = [email, username, firebase_uid, age, height_cm, weight_kg, bmi];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, email, username, age, height_cm, weight_kg, bmi, fitness_level, workout_type, goals, profile_image, settings, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Update user profile
  static async update(id, updates) {
    const { username, age, height_cm, weight_kg, fitness_level, workout_type, goals } = updates;
    
    let bmi = null;
    if (height_cm && weight_kg) {
      const heightInM = height_cm / 100;
      bmi = (weight_kg / (heightInM * heightInM)).toFixed(1);
    }
    
    const query = `
      UPDATE users 
      SET username = COALESCE($1, username),
          age = COALESCE($2, age),
          height_cm = COALESCE($3, height_cm),
          weight_kg = COALESCE($4, weight_kg),
          bmi = COALESCE($5, bmi),
          fitness_level = COALESCE($6, fitness_level),
          workout_type = COALESCE($7, workout_type),
          goals = COALESCE($8, goals)
      WHERE id = $9
      RETURNING id, email, username, age, height_cm, weight_kg, bmi, fitness_level, workout_type, goals
    `;
    
    const values = [username, age, height_cm, weight_kg, bmi, fitness_level, workout_type, goals, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;