const router = require('express').Router();
const auth = require('../middleware/auth');
const Attempt = require('../models/Attempt');

router.use(auth);

router.patch('/:questionSetId/:questionIndex', async (req, res) => {
  try {
    const { questionSetId, questionIndex } = req.params;
    const { status, notes } = req.body;

    if (!['answered', 'skipped', 'flagged'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const attempt = await Attempt.findOneAndUpdate(
      { questionSetId, userId: req.userId, questionIndex: Number(questionIndex) },
      { status, notes: notes || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update attempt' });
  }
});

module.exports = router;
