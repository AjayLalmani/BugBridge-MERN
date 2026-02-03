const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User'); // Populate ke liye

// 1. ADD COMMENT (POST /api/comments)
router.post('/', auth, async (req, res) => {
  try {
    const { text, taskId } = req.body;
    
    const newComment = new Comment({
      text,
      task: taskId,
      user: req.user.id
    });

    await newComment.save();

    // User details ke saath wapas bhejo (taaki naam turant dikhe)
    await newComment.populate('user', 'name email');

    res.json(newComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET COMMENTS FOR A TASK (GET /api/comments/:taskId)
router.get('/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email') // User ka naam bhi lao
      .sort({ createdAt: 1 }); // Purane comments pehle

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;