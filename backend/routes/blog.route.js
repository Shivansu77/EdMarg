const express = require('express');
const blogController = require('../controllers/blog.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { cacheResponse } = require('../middlewares/cache.middleware');

const router = express.Router();

router.get('/', cacheResponse({ ttlSeconds: 180 }), blogController.getAllBlogs);
router.get('/id/:id', protect, authorize('admin'), blogController.getBlogById);
router.get('/:slug', cacheResponse({ ttlSeconds: 180 }), blogController.getBlogBySlug);
router.post('/', protect, authorize('admin'), blogController.createBlog);
router.put('/:id', protect, authorize('admin'), blogController.updateBlog);
router.delete('/:id', protect, authorize('admin'), blogController.deleteBlog);

module.exports = router;
