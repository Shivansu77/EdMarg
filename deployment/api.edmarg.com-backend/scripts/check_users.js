const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { User } = require('../models/user.model');

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    const dbName = process.env.DB_NAME || 'edmarg_db';
    
    console.log(`Connecting to ${mongoUri.split('@')[1].split('/')[0]}...`);
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connected!');

    const users = await User.find().select('+password');
    console.log(`Found ${users.length} users:`);
    
    users.forEach(user => {
      const isHashed =
        typeof user.password === 'string' &&
        (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
      console.log(`- ${user.email} (Role: ${user.role}, Password Hashed: ${isHashed})`);
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
