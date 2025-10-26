const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/messages?user=<userId>
router.get('/', async (req, res) => {
  try {
    const user = req.query.user;
    if (!user) return res.json([]);
    const msgs = await Message.find({ $or: [{ from: req.user?.id }, { to: user }] }).sort('createdAt');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
