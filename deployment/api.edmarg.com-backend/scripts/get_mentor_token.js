const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// The models export both User and TokenBlacklist.
const { User } = require('../models/user.model');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edmarg_db', { dbName: process.env.DB_NAME || 'edmarg_db' });
    const mentor = await User.findOne({ role: 'mentor' });
    if (!mentor) {
      console.log("No mentor found");
      process.exit(1);
    }
    
    // Check auth.middleware.js for the exact payload required. Usually just id.
    const token = jwt.sign({ userId: mentor._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });
    
    console.log(token);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
