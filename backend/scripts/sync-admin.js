require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const ADMIN_EMAIL = 'admin99@gmail.com';
const ADMIN_CLERK_ID = 'user_3H7ErPZ9e39hM5sPcWgv3KIuuix';

// Define a minimal User schema matching user.model.ts
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  clerkId: { type: String, unique: true, sparse: true, trim: true },
  role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
}, { timestamps: true, strict: false });

const User = mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('🔧 Updating existing user with admin role and Clerk ID');
    existing.clerkId = ADMIN_CLERK_ID;
    existing.role = 'admin';
    await existing.save();
  } else {
    console.log('🚀 Creating new admin user');
    await User.create({
      email: ADMIN_EMAIL,
      clerkId: ADMIN_CLERK_ID,
      role: 'admin',
      name: 'Admin User',
    });
  }
  console.log('✅ Sync complete — admin99@gmail.com is now an admin with clerkId:', ADMIN_CLERK_ID);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error syncing admin user:', err);
  process.exit(1);
});
