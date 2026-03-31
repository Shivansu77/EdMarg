const assessmentRepository = require('../repositories/assessment.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');

class AssessmentService {
  async createTemplate(adminId, { title, description, questions }) {
    if (!title || !questions || questions.length === 0) {
      throw new ValidationError('Title and questions are required');
    }
    return assessmentRepository.createTemplate({ title, description, questions, createdBy: adminId });
  }

  async getTemplate(id) {
    const template = await assessmentRepository.findTemplateById(id);
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  async getAllTemplates(filters) {
    return assessmentRepository.findAllTemplates(filters);
  }

  async updateTemplate(id, data) {
    const template = await assessmentRepository.updateTemplate(id, data);
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  async deleteTemplate(id) {
    const template = await assessmentRepository.deleteTemplate(id);
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  async createAssignment(adminId, { templateId, studentIds, dueDate }) {
    const template = await assessmentRepository.findTemplateById(templateId);
    if (!template) throw new NotFoundError('Template not found');
    
    return assessmentRepository.createAssignment({
      template: templateId,
      assignedTo: studentIds,
      assignedBy: adminId,
      dueDate
    });
  }

  async getAssignmentsByStudent(studentId) {
    return assessmentRepository.findAssignmentsByStudent(studentId);
  }

  async getAllAssignments() {
    return assessmentRepository.findAllAssignments();
  }

  async updateAssignment(id, data) {
    const assignment = await assessmentRepository.updateAssignment(id, data);
    if (!assignment) throw new NotFoundError('Assignment not found');
    return assignment;
  }

  async deleteAssignment(id) {
    const assignment = await assessmentRepository.deleteAssignment(id);
    if (!assignment) throw new NotFoundError('Assignment not found');
    return assignment;
  }

  async saveResponse(assignmentId, studentId, answers, isSubmit = false) {
    const assignment = await assessmentRepository.findAssignmentById(assignmentId);
    if (!assignment) throw new NotFoundError('Assignment not found');
    
    const status = isSubmit ? 'completed' : 'pending';
    return assessmentRepository.createOrUpdateResponse(assignmentId, studentId, answers, status);
  }

  async getResponse(assignmentId, studentId) {
    return assessmentRepository.findResponseByAssignmentAndStudent(assignmentId, studentId);
  }

  async getResponsesByAssignment(assignmentId) {
    return assessmentRepository.findResponsesByAssignment(assignmentId);
  }

  async getAllResponses() {
    return assessmentRepository.findAllResponses();
  }
}

module.exports = new AssessmentService();
