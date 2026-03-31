require('dotenv').config();
const mongoose = require('mongoose');
const AssessmentTemplate = require('../models/assessmentTemplate.model');
const AssessmentAssignment = require('../models/assessmentAssignment.model');
const { User } = require('../models/user.model');

async function fixAssignment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get first student
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('No student found');
      process.exit(1);
    }
    console.log(`Found student: ${student.name} (${student._id})`);

    // Get first template
    const template = await AssessmentTemplate.findOne();
    if (!template) {
      console.log('No template found');
      process.exit(1);
    }
    console.log(`Found template: ${template.title} (${template._id})`);

    // Get admin
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found');
      process.exit(1);
    }

    // Delete old assignments
    await AssessmentAssignment.deleteMany({});
    console.log('Deleted old assignments');

    // Create new assignment
    const assignment = await AssessmentAssignment.create({
      template: template._id,
      assignedTo: [student._id],
      assignedBy: admin._id,
      isActive: true
    });

    console.log(`\n✅ Created assignment:`);
    console.log(`   ID: ${assignment._id}`);
    console.log(`   Template: ${template.title}`);
    console.log(`   Assigned to: ${student.name}`);
    console.log(`   Active: ${assignment.isActive}`);

    // Verify
    const check = await AssessmentAssignment.findById(assignment._id).populate('template').populate('assignedTo', 'name email');
    console.log(`\n✅ Verification:`);
    console.log(`   Students assigned: ${check.assignedTo.length}`);
    check.assignedTo.forEach(s => {
      console.log(`   - ${s.name} (${s.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAssignment();
