const router = require('express').Router();
const auth = require('../middleware/auth');
const QuestionSet = require('../models/QuestionSet');

router.use(auth);

router.get('/:id', async (req, res) => {
  try {
    const set = await QuestionSet.findOne({ _id: req.params.id, userId: req.userId });
    if (!set) return res.status(404).json({ error: 'Question set not found' });
    res.json(set);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question set' });
  }
});

module.exports = router;
