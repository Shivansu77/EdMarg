const assessmentService = require('../services/assessment.service');
const ApiResponse = require('../utils/api.response');

class AssessmentController {
  async createTemplate(req, res, next) {
    try {
      console.log('createTemplate called, user:', req.user);
      const template = await assessmentService.createTemplate(req.user._id, req.body);
      res.status(201).json(ApiResponse.success(template, 'Template created successfully'));
    } catch (error) {
      console.error('Error in createTemplate:', error);
      next(error);
    }
  }

  async getTemplate(req, res, next) {
    try {
      console.log('getTemplate called for id:', req.params.id);
      const template = await assessmentService.getTemplate(req.params.id);
      res.json(ApiResponse.success(template));
    } catch (error) {
      console.error('Error in getTemplate:', error);
      next(error);
    }
  }

  async getAllTemplates(req, res, next) {
    try {
      console.log('getAllTemplates called, query:', req.query);
      const templates = await assessmentService.getAllTemplates(req.query);
      console.log('Templates found:', templates.length);
      res.json(ApiResponse.success(templates));
    } catch (error) {
      console.error('Error in getAllTemplates:', error);
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const template = await assessmentService.updateTemplate(req.params.id, req.body);
      res.json(ApiResponse.success(template, 'Template updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      await assessmentService.deleteTemplate(req.params.id);
      res.json(ApiResponse.success(null, 'Template deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async createAssignment(req, res, next) {
    try {
      const assignment = await assessmentService.createAssignment(req.user._id, req.body);
      res.status(201).json(ApiResponse.success(assignment, 'Assignment created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getMyAssignments(req, res, next) {
    try {
      console.log('getMyAssignments called for user:', req.user._id, 'role:', req.user.role);
      const assignments = await assessmentService.getAssignmentsByStudent(req.user._id);
      console.log('Assignments found for student:', assignments.length);
      res.json(ApiResponse.success(assignments));
    } catch (error) {
      console.error('Error in getMyAssignments:', error);
      next(error);
    }
  }

  async getAllAssignments(req, res, next) {
    try {
      const assignments = await assessmentService.getAllAssignments();
      res.json(ApiResponse.success(assignments));
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req, res, next) {
    try {
      const assignment = await assessmentService.updateAssignment(req.params.id, req.body);
      res.json(ApiResponse.success(assignment, 'Assignment updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteAssignment(req, res, next) {
    try {
      await assessmentService.deleteAssignment(req.params.id);
      res.json(ApiResponse.success(null, 'Assignment deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async saveResponse(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const { answers, submit } = req.body;
      const response = await assessmentService.saveResponse(assignmentId, req.user._id, answers, submit);
      res.json(ApiResponse.success(response, submit ? 'Assessment submitted successfully' : 'Progress saved'));
    } catch (error) {
      next(error);
    }
  }

  async getMyResponse(req, res, next) {
    try {
      const response = await assessmentService.getResponse(req.params.assignmentId, req.user._id);
      res.json(ApiResponse.success(response));
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentResponses(req, res, next) {
    try {
      const responses = await assessmentService.getResponsesByAssignment(req.params.assignmentId);
      res.json(ApiResponse.success(responses));
    } catch (error) {
      next(error);
    }
  }

  async getAllResponses(req, res, next) {
    try {
      const responses = await assessmentService.getAllResponses();
      res.json(ApiResponse.success(responses));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentController();
