const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  questionSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionIndex: { type: Number, required: true },
  status: { type: String, enum: ['answered', 'skipped', 'flagged'], required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });


attemptSchema.index({ questionSetId: 1, userId: 1, questionIndex: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
