const blogRepository = require('../repositories/blog.repository');
const { NotFoundError } = require('../utils/errors');

class BlogService {
  async getAllBlogs() {
    return blogRepository.findAll();
  }

  async getBlogBySlug(slug) {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }
    return blog;
  }
}

module.exports = new BlogService();
