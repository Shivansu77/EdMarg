const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  linkSession,
  getProgress,
} = require('../../controllers/goal.controller');

const router = express.Router();

// All goal routes require authentication + student role
router.use(protect, authorize('student'));

router.post('/', createGoal);
router.get('/', cacheResponse({ ttlSeconds: 15 }), getGoals);
router.get('/progress', cacheResponse({ ttlSeconds: 15 }), getProgress);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.put('/:id/link-session', linkSession);

module.exports = router;
