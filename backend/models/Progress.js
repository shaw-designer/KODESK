const pool = require('./database');

class Progress {
  static async getOrCreate(userId, language) {
    const query = `
      INSERT INTO user_progress (user_id, language, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, language) 
      DO UPDATE SET updated_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, language]);
    return result.rows[0];
  }

  static async getProgress(userId, language) {
    const query = `
      SELECT * FROM user_progress 
      WHERE user_id = $1 AND language = $2
    `;
    const result = await pool.query(query, [userId, language]);
    return result.rows[0];
  }

  static async updateProgress(userId, language, updates) {
    const { total_score, total_xp, completed_tasks_count, current_level } = updates;
    
    const query = `
      UPDATE user_progress 
      SET 
        total_score = COALESCE($3, total_score),
        total_xp = COALESCE($4, total_xp),
        completed_tasks_count = COALESCE($5, completed_tasks_count),
        current_level = COALESCE($6, current_level),
        updated_at = NOW()
      WHERE user_id = $1 AND language = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      userId,
      language,
      total_score,
      total_xp,
      completed_tasks_count,
      current_level
    ]);
    
    return result.rows[0];
  }

  static async recordTaskCompletion(userId, taskId, language, score, xp) {
    // Record task completion
    const taskQuery = `
      INSERT INTO user_task_progress (user_id, task_id, language, status, score, xp_earned, completed_at)
      VALUES ($1, $2, $3, 'completed', $4, $5, NOW())
      ON CONFLICT (user_id, task_id) 
      DO UPDATE SET 
        status = 'completed',
        score = $4,
        xp_earned = $5,
        completed_at = NOW()
      RETURNING *
    `;
    
    await pool.query(taskQuery, [userId, taskId, language, score, xp]);
    
    // Update overall progress
    const progress = await this.getProgress(userId, language);
    const newScore = (progress?.total_score || 0) + score;
    const newXP = (progress?.total_xp || 0) + xp;
    const newCount = (progress?.completed_tasks_count || 0) + 1;
    
    await this.updateProgress(userId, language, {
      total_score: newScore,
      total_xp: newXP,
      completed_tasks_count: newCount
    });
  }

  static async getTaskSubmissions(userId, taskId) {
    const query = `
      SELECT * FROM code_submissions 
      WHERE user_id = $1 AND task_id = $2 
      ORDER BY submitted_at DESC
    `;
    const result = await pool.query(query, [userId, taskId]);
    return result.rows;
  }

  static async saveSubmission(userId, taskId, language, code, verdict, output, errors) {
    const query = `
      INSERT INTO code_submissions (
        user_id, task_id, language, code, verdict, output, errors, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      userId,
      taskId,
      language,
      code,
      verdict,
      output,
      errors
    ]);
    
    return result.rows[0];
  }

  static async unlockGamesForTask(userId, taskId, language) {
    try {
      // Get games linked to this task
      const query = `
        SELECT g.* FROM games g
        JOIN game_tasks gt ON g.id = gt.game_id
        WHERE gt.task_id = $1
      `;
      
      const gamesResult = await pool.query(query, [taskId]);
      const games = gamesResult.rows;

      // Unlock each game by creating a record in user_game_progress
      for (const game of games) {
        const insertQuery = `
          INSERT INTO user_game_progress (user_id, game_id, created_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id, game_id) DO NOTHING
          RETURNING *
        `;
        await pool.query(insertQuery, [userId, game.id]);
        console.log(`[DEBUG] Unlocked game ${game.id} for user ${userId}`);
      }

      return games;
    } catch (error) {
      console.error('[DEBUG] Error unlocking games:', error);
      return [];
    }
  }
}

module.exports = Progress;

