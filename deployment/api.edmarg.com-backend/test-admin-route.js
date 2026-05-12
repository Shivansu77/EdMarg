const mongoose = require('mongoose');
require('dotenv').config();
const { User } = require('./models/user.model');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ role: 'admin' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  try {
    const res = await axios.get('http://localhost:5000/api/v1/admin/recordings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
  process.exit(0);
}
run();
