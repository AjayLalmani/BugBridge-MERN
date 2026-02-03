const Task = require('../models/Task');
const Project = require('../models/Project');

// 1. Get Tasks for a Project
exports.getTasks = async (req, res) => {
  try {
    // 1. URL se filters nikalo (search, priority, etc.)
    const { search, priority, assignedTo } = req.query;

    // 2. Default: Project ID toh hona hi chahiye
    let query = { project: req.params.projectId };

    // 3. Agar 'Search' text aaya hai (Title ya Description mein dhoondo)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },       // 'i' matlab case-insensitive (A == a)
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Priority Filter (Agar 'All' nahi hai)
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // 5. Assignee Filter (Agar 'All' nahi hai)
    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    // 6. Database Call (Ab filtered query ke saath)
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email') 
      .sort({ createdAt: -1 });
      
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Create Task
exports.createTask = async (req, res) => {
  const { title, description, projectId, priority, assignedTo } = req.body; // 👈 assignedTo add kiya

  try {
    const newTask = new Task({
      title,
      description,
      project: projectId,
      priority: priority || 'Medium',
      assignedTo: assignedTo || null // 👈 Save kar rahe hain
    });

    const task = await newTask.save();
    
    // Turant populate karke wapas bhejo taaki UI update ho jaye
    await task.populate('assignedTo', 'name email');
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 3. Update Task Status / Details
exports.updateTask = async (req, res) => {
  const { status, title, description, priority, assignedTo } = req.body;

  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Fields update karo (jo aaye hain wahi change honge)
    if (status) task.status = status;
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo; // 👈 Assignee update

    await task.save();
    
    // Updated task with user details
    await task.populate('assignedTo', 'name email');

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 4. Delete Task (SECURE VERSION 🛡️)
exports.deleteTask = async (req, res) => {
  try {
    // 1. Task dhundo
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // 2. Project dhundo (Jiska ye task hai)
    // Humein check karna hai ki is Project ka maalik kaun hai
    const Project = require('../models/Project'); 
    const project = await Project.findById(task.project);

    // 3. SECURITY CHECK:
    // Agar logged-in user (req.user.id) Project ka Owner nahi hai, toh mana kar do
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not Authorized: Only Project Owner can delete tasks' });
    }

    // 4. Sab sahi hai, toh delete karo
    await task.deleteOne();
    res.json({ message: 'Task removed' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};