const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  uuid: String,
  name: String,
  gDriveId: String,
  filepath: String,
  csvFilePath: String,
  dpsLink: String,
  logDate: Date,
  boss: String,
  time: String,
  isVisible: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('entry', schema);
