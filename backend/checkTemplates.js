const mongoose = require('mongoose');
const AssessmentTemplate = require('./models/assessmentTemplate.model');

mongoose.connect('mongodb+srv://edMarg:kickBash11@cluster0.rdlmzjw.mongodb.net/edmarg_db?appName=Cluster0').then(async () => {
  const templates = await AssessmentTemplate.find();
  templates.forEach(t => {
    console.log(`Template: \${t.title}, Questions length: \${t.questions?.length}`);
    if (t.questions && t.questions.length > 0) {
      console.log('  Q1:', t.questions[0].question);
    }
  });
  mongoose.disconnect();
}).catch(console.error);
