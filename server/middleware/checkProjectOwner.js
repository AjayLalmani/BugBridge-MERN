const Project = require('../models/Project');

module.exports = async function(req, res, next) {
  try {
    
    const project = await Project.findById(req.params.id);

    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not Authorized: Only the Project Owner can do this!' });
    }

    
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};