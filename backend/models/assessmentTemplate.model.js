const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'multipleChoice', 'checkbox', 'rating', 'dropdown'], required: true },
  question: { type: String, required: true },
  options: [String],
  required: { type: Boolean, default: false }
}, { _id: false });

const assessmentTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AssessmentTemplate', assessmentTemplateSchema);
