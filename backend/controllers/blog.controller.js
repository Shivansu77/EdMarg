const blogService = require('../services/blog.service');
const ApiResponse = require('../utils/api.response');

class BlogController {
  async getAllBlogs(req, res, next) {
    try {
      const blogs = await blogService.getAllBlogs();
      return res.json(ApiResponse.success(blogs));
    } catch (error) {
      return next(error);
    }
  }

  async getBlogBySlug(req, res, next) {
    try {
      const blog = await blogService.getBlogBySlug(req.params.slug);
      return res.json(ApiResponse.success(blog));
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new BlogController();
