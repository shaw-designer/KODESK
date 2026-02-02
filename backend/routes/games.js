const express = require('express');
const { authenticate } = require('../middleware/auth');
const Progress = require('../models/Progress');
const pool = require('../models/database');

const router = express.Router();

// Get unlocked games for user
router.get('/unlocked', authenticate, async (req, res) => {
  try {
    const { language } = req.query;
    
    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language parameter is required'
      });
    }

    // Get completed tasks for the language
    const query = `
      SELECT task_id FROM user_task_progress 
      WHERE user_id = $1 AND language = $2 AND status = 'completed'
    `;
    const result = await pool.query(query, [req.user.id, language]);
    const completedTaskIds = new Set(result.rows.map(row => row.task_id));

    // Get games linked to completed tasks
    const gamesQuery = `
      SELECT g.*, gt.task_id 
      FROM games g
      JOIN game_tasks gt ON g.id = gt.game_id
      WHERE gt.task_id = ANY($1::int[])
      ORDER BY g.level_number
    `;
    const gamesResult = await pool.query(gamesQuery, [Array.from(completedTaskIds)]);
    
    res.json({
      success: true,
      games: gamesResult.rows
    });
  } catch (error) {
    console.error('Error fetching unlocked games:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Record game completion
router.post('/:gameId/complete', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { score, timeSpent } = req.body;

    // Record game completion
    const query = `
      INSERT INTO user_game_progress (user_id, game_id, score, time_spent, completed_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, game_id) 
      DO UPDATE SET 
        score = GREATEST(user_game_progress.score, $3),
        time_spent = $4,
        completed_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [req.user.id, gameId, score || 0, timeSpent || 0]);
    
    res.json({
      success: true,
      message: 'Game completion recorded',
      gameProgress: result.rows[0]
    });
  } catch (error) {
    console.error('Error recording game completion:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

