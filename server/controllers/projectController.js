const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = new Project({
      title,
      description,
      owner: req.user.userId,
      members: [req.user.userId] 
    });

    await project.save();
    res.status(201).json(project);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getProjects = async (req, res) => {
  try {

    const projects = await Project.find({ members: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};