const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    author: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ created_at: -1 });

module.exports = mongoose.model('Blog', blogSchema);
