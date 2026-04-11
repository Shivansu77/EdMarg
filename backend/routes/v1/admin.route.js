const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  getAllUsers,
  getPendingMentors,
  getAssessmentSubmissions,
  approveMentor,
  rejectMentor,
  getPlatformStats,
  getUserDetail,
} = require('../../controllers/admin.controller');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.get('/mentors/pending', getPendingMentors);
router.get('/assessments', getAssessmentSubmissions);
router.put('/mentors/:id/approve', approveMentor);
router.put('/mentors/:id/reject', rejectMentor);
router.get('/stats', getPlatformStats);

module.exports = router;
