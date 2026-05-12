const Blog = require('../models/blog.model');

class BlogRepository {
  async findAll() {
    return Blog.find({}).sort({ created_at: -1 }).lean();
  }

  async findBySlug(slug) {
    return Blog.findOne({ slug }).lean();
  }

  async findById(id) {
    return Blog.findById(id).lean();
  }

  async create(data) {
    const blog = await Blog.create(data);
    return blog.toObject();
  }

  async updateById(id, data) {
    return Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  }

  async deleteById(id) {
    return Blog.findByIdAndDelete(id).lean();
  }
}

module.exports = new BlogRepository();
