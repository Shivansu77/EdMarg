const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  getAllUsers,
  getPendingMentors,
  approveMentor,
  rejectMentor,
  getPlatformStats,
} = require('../../controllers/admin.controller');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/mentors/pending', getPendingMentors);
router.put('/mentors/:id/approve', approveMentor);
router.put('/mentors/:id/reject', rejectMentor);
router.get('/stats', getPlatformStats);

module.exports = router;
