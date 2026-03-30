require('dotenv').config();
const mongoose = require('mongoose');

const checkMentors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
      role: String,
      mentorProfile: {
        approvalStatus: String
      }
    }), 'users');

    const mentors = await User.find({ role: 'mentor' });
    console.log('Total Mentors:', mentors.length);
    mentors.forEach(m => {
      console.log(`- ID: ${m._id}, Status: ${m.mentorProfile?.approvalStatus || 'None'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkMentors();
