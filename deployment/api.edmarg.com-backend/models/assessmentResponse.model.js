const mongoose = require('mongoose');

const assessmentResponseSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentAssignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: Map, of: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  submittedAt: Date
}, { timestamps: true });

assessmentResponseSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentResponse', assessmentResponseSchema);
