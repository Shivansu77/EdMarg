/**
 * Seed default availability for all approved mentors.
 * Gives each mentor Mon-Fri slots from 9:00 AM to 5:15 PM (45-min sessions).
 *
 * Usage: node scripts/seedAvailability.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/user.model');
const { Availability } = require('../models/availability.model');

const SESSION_DURATION = 45; // minutes
const START_HOUR = 9;
const END_HOUR = 17;

function generateSlots(startHour, endHour, durationMinutes) {
  const slots = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;

    const endTotalMinutes = currentMinutes + durationMinutes;
    const endH = Math.floor(endTotalMinutes / 60);
    const endM = endTotalMinutes % 60;

    slots.push({
      startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
      endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
    });

    // 15-minute gap between sessions
    currentMinutes = endTotalMinutes + 15;
  }

  return slots;
}

async function seed() {
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edmarg_db';
  const dbName = process.env.DB_NAME || 'edmarg_db';

  await mongoose.connect(dbUri, { dbName });
  console.log('Connected to MongoDB');

  const mentors = await User.find({
    role: 'mentor',
    $or: [
      { 'mentorProfile.approvalStatus': 'approved' },
      { 'mentorProfile.approvalStatus': { $exists: false } },
    ],
  }).select('_id name');

  console.log(`Found ${mentors.length} mentor(s)`);

  const slots = generateSlots(START_HOUR, END_HOUR, SESSION_DURATION);
  console.log(`Generated ${slots.length} slot(s) per day: ${slots.map((s) => s.startTime).join(', ')}`);

  // Mon (1) through Fri (5)
  const weekdays = [1, 2, 3, 4, 5];

  let createdCount = 0;

  for (const mentor of mentors) {
    const ops = weekdays.map((dayOfWeek) => ({
      updateOne: {
        filter: { mentor: mentor._id, dayOfWeek },
        update: { mentor: mentor._id, dayOfWeek, slots },
        upsert: true,
      },
    }));

    await Availability.bulkWrite(ops);
    createdCount += weekdays.length;
    console.log(`  ✓ ${mentor.name} — ${weekdays.length} day(s) seeded`);
  }

  console.log(`\nDone! Created/updated ${createdCount} availability record(s).`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
