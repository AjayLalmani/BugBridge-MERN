const Task = require('../models/Task');


exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and Project ID required' });
    }

    const newTask = new Task({
      title,
      description,
      project: projectId,
      priority
    });

    const task = await newTask.save();
    res.status(201).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task Deleted Successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    
    // Naya data set karo
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Jo data aaya hai use update karo, purana waisa hi rakho
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status; // <--- Ye sabse zaroori hai (Todo -> Done)
    task.priority = priority || task.priority;

    await task.save();
    res.json(task);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};