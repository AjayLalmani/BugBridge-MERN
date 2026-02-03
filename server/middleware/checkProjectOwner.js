const Project = require('../models/Project');

module.exports = async function(req, res, next) {
  try {
    // URL se Project ID nikalo (e.g., /api/projects/123)
    const project = await Project.findById(req.params.id);

    // 1. Agar Project hi nahi mila
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // 2. CHECK: Kya User ID aur Project Owner ID match hote hain?
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not Authorized: Only the Project Owner can do this!' });
    }

    // Sab sahi hai? Aage badho
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};