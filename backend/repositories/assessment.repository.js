const AssessmentTemplate = require('../models/assessmentTemplate.model');
const AssessmentAssignment = require('../models/assessmentAssignment.model');
const AssessmentResponse = require('../models/assessmentResponse.model');

class AssessmentRepository {
  async createTemplate(data) {
    return AssessmentTemplate.create(data);
  }

  async findTemplateById(id) {
    return AssessmentTemplate.findById(id).populate('createdBy', 'name email');
  }

  async findAllTemplates({ isActive } = {}) {
    const filter = isActive !== undefined ? { isActive } : {};
    return AssessmentTemplate.find(filter).populate('createdBy', 'name email').sort({ createdAt: -1 });
  }

  async updateTemplate(id, data) {
    return AssessmentTemplate.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTemplate(id) {
    return AssessmentTemplate.findByIdAndDelete(id);
  }

  async createAssignment(data) {
    return AssessmentAssignment.create(data);
  }

  async findAssignmentById(id) {
    return AssessmentAssignment.findById(id)
      .populate('template')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
  }

  async findAssignmentsByStudent(studentId) {
    console.log('Finding assignments for student:', studentId);
    const assignments = await AssessmentAssignment.find({ assignedTo: studentId, isActive: true })
      .populate('template')
      .sort({ createdAt: -1 });
    console.log('Found assignments:', assignments.length);
    if (assignments.length > 0) {
      console.log('First assignment:', JSON.stringify(assignments[0], null, 2));
    }
    return assignments;
  }

  async findAllAssignments() {
    return AssessmentAssignment.find()
      .populate('template')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async updateAssignment(id, data) {
    return AssessmentAssignment.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteAssignment(id) {
    return AssessmentAssignment.findByIdAndDelete(id);
  }

  async createOrUpdateResponse(assignmentId, studentId, answers, status) {
    const update = { answers, status };
    if (status === 'completed') update.submittedAt = new Date();
    
    return AssessmentResponse.findOneAndUpdate(
      { assignment: assignmentId, student: studentId },
      update,
      { new: true, upsert: true }
    );
  }

  async findResponseByAssignmentAndStudent(assignmentId, studentId) {
    return AssessmentResponse.findOne({ assignment: assignmentId, student: studentId })
      .populate('assignment')
      .populate('student', 'name email');
  }

  async findResponsesByAssignment(assignmentId) {
    return AssessmentResponse.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });
  }

  async findAllResponses() {
    return AssessmentResponse.find()
      .populate('assignment')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });
  }
}

module.exports = new AssessmentRepository();
