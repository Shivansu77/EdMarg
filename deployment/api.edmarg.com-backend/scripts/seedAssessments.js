require('dotenv').config();
const mongoose = require('mongoose');
const AssessmentTemplate = require('../models/assessmentTemplate.model');
const { User } = require('../models/user.model');

const sampleQuestions = [
  {
    id: 'interests',
    type: 'checkbox',
    question: 'What are your primary areas of interest?',
    options: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Arts', 'Business', 'Healthcare', 'Education'],
    required: true
  },
  {
    id: 'experience',
    type: 'multipleChoice',
    question: 'What is your current experience level?',
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  {
    id: 'goals',
    type: 'text',
    question: 'What are your learning goals for this semester?',
    required: true
  },
  {
    id: 'learningStyle',
    type: 'multipleChoice',
    question: 'What is your preferred learning style?',
    options: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'],
    required: false
  },
  {
    id: 'availability',
    type: 'checkbox',
    question: 'When are you typically available for mentoring sessions?',
    options: ['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings'],
    required: false
  },
  {
    id: 'confidence',
    type: 'rating',
    question: 'How confident do you feel about your current skills? (1-5)',
    required: false
  }
];

async function seedAssessments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Please run seedAdmin.js first');
      process.exit(1);
    }

    await AssessmentTemplate.deleteMany({});
    console.log('Cleared existing templates');

    const template = await AssessmentTemplate.create({
      title: 'Student Interest & Skills Assessment',
      description: 'This assessment helps us understand your interests, skills, experience level, goals, and learning preferences to match you with the right mentor.',
      questions: sampleQuestions,
      createdBy: admin._id,
      isActive: true
    });

    console.log('✅ Assessment template created:', template.title);
    console.log('Template ID:', template._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding assessments:', error);
    process.exit(1);
  }
}

seedAssessments();
