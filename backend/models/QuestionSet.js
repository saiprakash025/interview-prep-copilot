const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, enum: ['aptitude', 'technical', 'hr'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true }
}, { _id: false });

const questionSetSchema = new mongoose.Schema({
  jdId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questions: { type: [questionSchema], required: true }
}, { timestamps: true });

module.exports = mongoose.model('QuestionSet', questionSetSchema);
