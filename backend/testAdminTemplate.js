const mongoose = require('mongoose');
const AssessmentTemplate = require('./models/assessmentTemplate.model');
mongoose.connect('mongodb+srv://edMarg:kickBash11@cluster0.rdlmzjw.mongodb.net/edmarg_db?appName=Cluster0').then(async () => {
  const users = await mongoose.connection.db.collection('users').find({ role: 'admin' }).toArray();
  const adminId = users[0]._id;
  
  const template = await AssessmentTemplate.create({
    title: 'Test Multiple Questions',
    description: 'Checking if multiple questions work',
    createdBy: adminId,
    questions: [
      { id: 'q1', type: 'text', question: 'Question 1', required: true },
      { id: 'q2', type: 'text', question: 'Question 2', required: true },
      { id: 'q3', type: 'text', question: 'Question 3', required: true }
    ]
  });
  console.log('Created template:', template._id, 'with', template.questions.length, 'questions');
  process.exit(0);
});
