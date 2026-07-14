const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const JobDescription = require('../models/JobDescription');
const QuestionSet = require('../models/QuestionSet');
const { generateQuestions } = require('../services/llmService');


const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many generation requests, try again later' }
});

router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { companyName, rawText } = req.body;
    if (!companyName || !rawText) {
      return res.status(400).json({ error: 'companyName and rawText required' });
    }
    const jd = await JobDescription.create({ userId: req.userId, companyName, rawText });
    res.status(201).json(jd);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save JD' });
  }
});

router.get('/', async (req, res) => {
  try {
    const jds = await JobDescription.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(jds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch JDs' });
  }
});

router.post('/:id/generate', generateLimiter, async (req, res) => {
  try {
    const jd = await JobDescription.findOne({ _id: req.params.id, userId: req.userId });
    if (!jd) return res.status(404).json({ error: 'JD not found' });

    const counts = req.body.counts; 
    const questions = await generateQuestions({
      companyName: jd.companyName,
      jdText: jd.rawText,
      counts
    });

    const questionSet = await QuestionSet.create({
      jdId: jd._id,
      userId: req.userId,
      questions
    });

    res.status(201).json(questionSet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Question generation failed', details: err.message });
  }
});

module.exports = router;
