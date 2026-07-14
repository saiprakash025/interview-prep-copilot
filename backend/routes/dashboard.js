const router = require('express').Router();
const auth = require('../middleware/auth');
const QuestionSet = require('../models/QuestionSet');
const Attempt = require('../models/Attempt');
const JobDescription = require('../models/JobDescription');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const questionSets = await QuestionSet.find({ userId: req.userId }).populate('jdId');
    const attempts = await Attempt.find({ userId: req.userId });

    const attemptsBySet = {};
    attempts.forEach((a) => {
      const key = a.questionSetId.toString();
      if (!attemptsBySet[key]) attemptsBySet[key] = [];
      attemptsBySet[key].push(a);
    });

    const summary = questionSets.map((set) => {
      const setAttempts = attemptsBySet[set._id.toString()] || [];
      const answeredCount = setAttempts.filter((a) => a.status === 'answered').length;
      const total = set.questions.length;

      // Weak categories: categories with lowest answered ratio
      const categoryTotals = {};
      set.questions.forEach((q, idx) => {
        categoryTotals[q.category] = categoryTotals[q.category] || { total: 0, answered: 0 };
        categoryTotals[q.category].total += 1;
        const attempt = setAttempts.find((a) => a.questionIndex === idx);
        if (attempt && attempt.status === 'answered') {
          categoryTotals[q.category].answered += 1;
        }
      });

      return {
        questionSetId: set._id,
        companyName: set.jdId?.companyName || 'Unknown',
        progressPercent: total ? Math.round((answeredCount / total) * 100) : 0,
        categoryTotals
      };
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to build dashboard' });
  }
});

module.exports = router;
