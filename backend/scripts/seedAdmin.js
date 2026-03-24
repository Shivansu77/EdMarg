require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'edmarg_db';

const ADMIN_NAME = process.env.ADMIN_NAME || 'admin99';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin99@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin99password';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '';

async function seedAdmin() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required in backend/.env');
  }

  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });

  let admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!admin) {
    admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phoneNumber: ADMIN_PHONE,
      role: 'admin',
      isVerified: true,
    });

    await admin.save();
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  } else {
    admin.name = ADMIN_NAME;
    admin.role = 'admin';
    admin.isVerified = true;

    if (ADMIN_PHONE) {
      admin.phoneNumber = ADMIN_PHONE;
    }

    if (process.env.ADMIN_PASSWORD) {
      admin.password = ADMIN_PASSWORD;
    }

    await admin.save();
    console.log(`Admin updated: ${ADMIN_EMAIL}`);
  }

  console.log(`Database: ${DB_NAME}`);
  console.log('Done.');
}

seedAdmin()
  .catch((error) => {
    console.error('Failed to seed admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
