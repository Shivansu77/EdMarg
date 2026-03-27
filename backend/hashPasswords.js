require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models/user.model');

const hashPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edmarg_db', { 
      dbName: process.env.DB_NAME || 'edmarg_db' 
    });

    const users = await User.find().select('+password');
    let updated = 0;

    for (const user of users) {
      const isHashed =
        typeof user.password === 'string' &&
        (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));
      
      if (!isHashed) {
        user.password = await bcrypt.hash(user.password, 12);
        await user.save();
        updated++;
        console.log(`Hashed password for: ${user.email}`);
      }
    }

    console.log(`\nMigration complete. Updated ${updated} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

hashPasswords();
