const Task = require('../models/Task');
const Project = require('../models/Project');


exports.getTasks = async (req, res) => {
  try {
    
    const { search, priority, assignedTo } = req.query;

    
    let query = { project: req.params.projectId };

    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },       
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    
    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email') 
      .sort({ createdAt: -1 });
      
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.createTask = async (req, res) => {
  const { title, description, projectId, priority, assignedTo } = req.body; 

  try {
    const newTask = new Task({
      title,
      description,
      project: projectId,
      priority: priority || 'Medium',
      assignedTo: assignedTo || null 
    });

    const task = await newTask.save();
    
    
    await task.populate('assignedTo', 'name email');
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.updateTask = async (req, res) => {
  const { status, title, description, priority, assignedTo } = req.body;

  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    
    if (status) task.status = status;
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo; 

    await task.save();
    
    
    await task.populate('assignedTo', 'name email');

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.deleteTask = async (req, res) => {
  try {
    
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    
    
    const Project = require('../models/Project'); 
    const project = await Project.findById(task.project);

    
    
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not Authorized: Only Project Owner can delete tasks' });
    }

    
    await task.deleteOne();
    res.json({ message: 'Task removed' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};