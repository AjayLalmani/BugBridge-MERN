const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User'); 


router.post('/', auth, async (req, res) => {
  try {
    const { text, taskId } = req.body;
    
    const newComment = new Comment({
      text,
      task: taskId,
      user: req.user.id
    });

    await newComment.save();

    
    await newComment.populate('user', 'name email');

    res.json(newComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email') 
      .sort({ createdAt: 1 }); 

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;