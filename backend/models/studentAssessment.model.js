const mongoose = require('mongoose');

// Stores a student's assessment submission (answers selected during the assessment flow).
// We keep `answers` as a flexible object because the assessment UI can evolve over time.
const studentAssessmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const StudentAssessment = mongoose.model('StudentAssessment', studentAssessmentSchema);

module.exports = { StudentAssessment };

