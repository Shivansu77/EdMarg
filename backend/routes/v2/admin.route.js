const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const {
  getAllUsers,
  approveMentor,
  rejectMentor,
  getPlatformStats,
} = require('../../controllers/admin.controller');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', cacheResponse({ ttlSeconds: 20 }), getAllUsers);
router.put('/mentors/:id/approve', approveMentor);
router.put('/mentors/:id/reject', rejectMentor);
router.get('/stats', cacheResponse({ ttlSeconds: 30 }), getPlatformStats);

module.exports = router;
