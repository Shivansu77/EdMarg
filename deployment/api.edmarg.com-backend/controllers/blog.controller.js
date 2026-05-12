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

  async getBlogById(req, res, next) {
    try {
      const blog = await blogService.getBlogById(req.params.id);
      return res.json(ApiResponse.success(blog));
    } catch (error) {
      return next(error);
    }
  }

  async createBlog(req, res, next) {
    try {
      const blog = await blogService.createBlog(req.body);
      return res.status(201).json(ApiResponse.success(blog, 'Blog created successfully', 201));
    } catch (error) {
      return next(error);
    }
  }

  async updateBlog(req, res, next) {
    try {
      const blog = await blogService.updateBlog(req.params.id, req.body);
      return res.json(ApiResponse.success(blog, 'Blog updated successfully'));
    } catch (error) {
      return next(error);
    }
  }

  async deleteBlog(req, res, next) {
    try {
      await blogService.deleteBlog(req.params.id);
      return res.json(ApiResponse.success(null, 'Blog deleted successfully'));
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new BlogController();
