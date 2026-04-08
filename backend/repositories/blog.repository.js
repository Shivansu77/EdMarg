const Blog = require('../models/blog.model');

class BlogRepository {
  async findAll() {
    return Blog.find({}).sort({ created_at: -1 }).lean();
  }

  async findBySlug(slug) {
    return Blog.findOne({ slug }).lean();
  }
}

module.exports = new BlogRepository();
