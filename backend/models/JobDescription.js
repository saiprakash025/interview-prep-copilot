const mongoose = require('mongoose');

const jdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyName: { type: String, required: true },
  rawText: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('JobDescription', jdSchema);
