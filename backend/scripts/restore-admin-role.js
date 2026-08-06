/**
 * Restore an account's role back to `admin`.
 *
 * This fixes accounts that were accidentally downgraded to `mentor`/`student`
 * by going through the profile-completion flow.
 *
 * Usage:
 *   node scripts/restore-admin-role.js <email>
 *   node scripts/restore-admin-role.js shivansubisht77@gmail.com
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const TARGET_EMAIL = (process.argv[2] || 'shivansubisht77@gmail.com').toLowerCase().trim();
const DB_NAME = process.env.DB_NAME || undefined;

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    clerkId: { type: String, unique: true, sparse: true, trim: true },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
  },
  { timestamps: true, strict: false }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI, DB_NAME ? { dbName: DB_NAME } : undefined);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email: TARGET_EMAIL });

  if (!user) {
    console.error(`No user found with email: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const previousRole = user.role;
  user.role = 'admin';

  // Clear the mentor application artefacts so the account is a clean admin.
  if (user.mentorProfile) {
    user.mentorProfile = undefined;
  }

  await user.save();

  console.log(`Role updated for ${TARGET_EMAIL}: ${previousRole} -> admin`);
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error restoring admin role:', err);
  process.exit(1);
});
