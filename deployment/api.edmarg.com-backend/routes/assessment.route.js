const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { cacheResponse } = require('../middlewares/cache.middleware');

// Template routes (Admin only)
router.post('/templates', protect, authorize('admin'), assessmentController.createTemplate);
router.get('/templates', protect, cacheResponse({ ttlSeconds: 60 }), assessmentController.getAllTemplates);
router.get('/templates/:id', protect, cacheResponse({ ttlSeconds: 60 }), assessmentController.getTemplate);
router.put('/templates/:id', protect, authorize('admin'), assessmentController.updateTemplate);
router.delete('/templates/:id', protect, authorize('admin'), assessmentController.deleteTemplate);

// Assignment routes
router.post('/assignments', protect, authorize('admin'), assessmentController.createAssignment);
router.get('/assignments', protect, authorize('admin', 'mentor'), cacheResponse({ ttlSeconds: 20 }), assessmentController.getAllAssignments);
router.get('/assignments/my', protect, authorize('student'), cacheResponse({ ttlSeconds: 30 }), assessmentController.getMyAssignments);
router.get('/assignments/:id/student', protect, authorize('student'), cacheResponse({ ttlSeconds: 30 }), assessmentController.getStudentAssignment);
router.put('/assignments/:id', protect, authorize('admin'), assessmentController.updateAssignment);
router.delete('/assignments/:id', protect, authorize('admin'), assessmentController.deleteAssignment);

// Response routes
router.post('/responses/:assignmentId', protect, authorize('student'), assessmentController.saveResponse);
router.get('/responses/my/:assignmentId', protect, authorize('student'), cacheResponse({ ttlSeconds: 30 }), assessmentController.getMyResponse);
router.get('/responses/assignment/:assignmentId', protect, authorize('admin', 'mentor'), cacheResponse({ ttlSeconds: 20 }), assessmentController.getAssignmentResponses);
router.get('/responses', protect, authorize('admin', 'mentor'), cacheResponse({ ttlSeconds: 20 }), assessmentController.getAllResponses);

module.exports = router;
