const mongoose = require('mongoose');

const assessmentAssignmentSchema = new mongoose.Schema({
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentTemplate', required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AssessmentAssignment', assessmentAssignmentSchema);
