const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const schema = Schema({
  cellAddress: String,
  entryId: {
    type: ObjectId,
    required: true,
    ref: 'Entry',
  },
  cellNumber: Number,
}, { timestamps: true });

module.exports = mongoose.model('cell', schema);
