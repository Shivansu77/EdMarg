const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../lib/db');
const mongoose = require('mongoose');

async function verifyRootFix() {
  console.log('--- ROOT LEVEL FIX VERIFICATION ---');
  
  try {
    console.log('1. Testing first connection...');
    const conn1 = await connectDB();
    console.log('   Status:', mongoose.connection.readyState === 1 ? 'CONNECTED' : 'FAILED');
    
    console.log('2. Testing second connection (should be cached)...');
    const conn2 = await connectDB();
    
    const isSameConnection = conn1 === conn2;
    console.log('   Is Cached:', isSameConnection ? 'YES ✅' : 'NO ❌');
    
    if (!isSameConnection) {
      throw new Error('Connection was not cached! Singleton pattern failed.');
    }

    console.log('3. Testing database reachability...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Found ${collections.length} collections.`);
    
    console.log('\n--- VERIFICATION SUCCESSFUL ✅ ---');
    process.exit(0);
  } catch (error) {
    console.error('\n--- VERIFICATION FAILED ❌ ---');
    console.error(error.message);
    process.exit(1);
  }
}

verifyRootFix();
