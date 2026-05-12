const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);
const adminService = require('./services/admin.service');

adminService.getAllRecordings().then(res => {
  console.log("Success:", res.recordings.length);
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
