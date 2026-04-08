const express = require('express');
const blogController = require('../controllers/blog.controller');

const router = express.Router();

router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

module.exports = router;
