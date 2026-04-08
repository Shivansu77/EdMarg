const express = require('express');
const blogController = require('../controllers/blog.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', blogController.getAllBlogs);
router.get('/id/:id', protect, authorize('admin'), blogController.getBlogById);
router.get('/:slug', blogController.getBlogBySlug);
router.post('/', protect, authorize('admin'), blogController.createBlog);
router.put('/:id', protect, authorize('admin'), blogController.updateBlog);
router.delete('/:id', protect, authorize('admin'), blogController.deleteBlog);

module.exports = router;
