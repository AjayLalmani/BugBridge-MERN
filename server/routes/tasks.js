const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth'); 

router.post('/', auth, taskController.createTask);

router.get('/project/:projectId', auth, taskController.getTasks);

router.delete('/:id', auth, taskController.deleteTask);

router.put('/:id', auth, taskController.updateTask);

module.exports = router;