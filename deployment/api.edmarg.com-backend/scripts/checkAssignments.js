require('dotenv').config();
const mongoose = require('mongoose');
const AssessmentTemplate = require('../models/assessmentTemplate.model');
const AssessmentAssignment = require('../models/assessmentAssignment.model');
const { User } = require('../models/user.model');

async function checkAssignments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log('\n=== STUDENTS ===');
    students.forEach(s => {
      console.log(`ID: ${s._id}, Name: ${s.name}, Email: ${s.email}`);
    });

    // Get all assignments
    const assignments = await AssessmentAssignment.find().populate('template').populate('assignedTo', 'name email');
    console.log('\n=== ASSIGNMENTS ===');
    console.log(`Total assignments: ${assignments.length}`);
    
    assignments.forEach(a => {
      console.log(`\nAssignment ID: ${a._id}`);
      console.log(`Template: ${a.template?.title || 'N/A'}`);
      console.log(`Assigned to ${a.assignedTo.length} students:`);
      a.assignedTo.forEach(s => {
        console.log(`  - ${s.name} (${s.email})`);
      });
      console.log(`Active: ${a.isActive}`);
      console.log(`Due Date: ${a.dueDate || 'None'}`);
    });

    // Check for each student
    console.log('\n=== CHECKING EACH STUDENT ===');
    for (const student of students) {
      const studentAssignments = await AssessmentAssignment.find({ 
        assignedTo: student._id, 
        isActive: true 
      }).populate('template');
      
      console.log(`\nStudent: ${student.name} (${student._id})`);
      console.log(`Assignments found: ${studentAssignments.length}`);
      studentAssignments.forEach(a => {
        console.log(`  - ${a.template?.title || 'N/A'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAssignments();
