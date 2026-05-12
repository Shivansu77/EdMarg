const blogRepository = require('../repositories/blog.repository');
const { Types } = require('mongoose');
const { NotFoundError, ValidationError } = require('../utils/errors');

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

  async getBlogById(id) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid blog ID');
    }

    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    return blog;
  }

  async createBlog(payload) {
    const { title, slug, content } = payload;

    if (!title || !slug || !content) {
      throw new ValidationError('title, slug, and content are required');
    }

    const existing = await blogRepository.findBySlug(String(slug).trim().toLowerCase());
    if (existing) {
      throw new ValidationError('Slug already exists');
    }

    return blogRepository.create({
      title: String(title).trim(),
      slug: String(slug).trim().toLowerCase(),
      description: payload.description ? String(payload.description).trim() : '',
      content: String(content),
      image: payload.image ? String(payload.image).trim() : '',
      author: payload.author ? String(payload.author).trim() : 'Admin',
    });
  }

  async updateBlog(id, payload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid blog ID');
    }

    const currentBlog = await blogRepository.findById(id);
    if (!currentBlog) {
      throw new NotFoundError('Blog not found');
    }

    const updateData = {
      ...(payload.title !== undefined && { title: String(payload.title).trim() }),
      ...(payload.slug !== undefined && { slug: String(payload.slug).trim().toLowerCase() }),
      ...(payload.description !== undefined && { description: String(payload.description).trim() }),
      ...(payload.content !== undefined && { content: String(payload.content) }),
      ...(payload.image !== undefined && { image: String(payload.image).trim() }),
      ...(payload.author !== undefined && { author: String(payload.author).trim() }),
    };

    if (updateData.slug && updateData.slug !== currentBlog.slug) {
      const duplicate = await blogRepository.findBySlug(updateData.slug);
      if (duplicate) {
        throw new ValidationError('Slug already exists');
      }
    }

    const updated = await blogRepository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError('Blog not found');
    }

    return updated;
  }

  async deleteBlog(id) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid blog ID');
    }

    const deleted = await blogRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('Blog not found');
    }

    return deleted;
  }
}

module.exports = new BlogService();
