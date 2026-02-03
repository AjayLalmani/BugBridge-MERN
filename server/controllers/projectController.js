const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// --- 1. Get All Projects ---
exports.getProjects = async (req, res) => {
  try {
    // Safety: Agar req.user gayab hai toh crash mat karo
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
    
    const myId = req.user.id || req.user.userId;

    const projects = await Project.find({ 
      $or: [
        { user: myId }, 
        { members: myId }
      ]
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err.message);
    res.status(500).send('Server Error');
  }
};

// --- 2. Get Single Project (UPDATED FOR OWNER EMAIL) ---
exports.getProject = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
    const myId = req.user.id || req.user.userId;

    // 👇 CHANGE: 'user' (Owner) aur 'members' dono ka data maanga
    const project = await Project.findById(req.params.id)
      .populate('user', 'name email') 
      .populate('members', 'name email');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 👇 CHANGE: Ab 'project.user' ek object ban gaya hai, toh ._id se check karenge
    // (?.) lagaya taaki agar owner delete ho gaya ho toh crash na ho
    const ownerId = project.user?._id.toString(); 

    const isOwner = ownerId === myId;
    const isMember = project.members.some(m => m && m._id && m._id.toString() === myId);

    if (!isOwner && !isMember) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error("GET PROJECT ERROR:", err);
    if(err.kind === 'ObjectId') return res.status(404).json({ message: 'Project not found' });
    res.status(500).send('Server Error');
  }
};

// --- 3. Create Project ---
exports.createProject = async (req, res) => {
  const { title, description } = req.body;
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
    const myId = req.user.id || req.user.userId;

    const newProject = new Project({
      title,
      description,
      user: myId 
    });
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err.message);
    res.status(500).send('Server Error');
  }
};

// --- 4. Update Project ---
exports.updateProject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const myId = req.user.id || req.user.userId;
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.user.toString() !== myId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    project.title = title || project.title;
    project.description = description || project.description;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).send('Server Error');
  }
};

// --- 5. Delete Project ---
exports.deleteProject = async (req, res) => {
  try {
    const myId = req.user.id || req.user.userId;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.user.toString() !== myId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).send('Server Error');
  }
};

// --- 6. Add Member (SAFE & SMART) ---
exports.addMember = async (req, res) => {
  const { email } = req.body;
  try {
    const myId = req.user.id || req.user.userId;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 🛡️ SAFETY CHECK: Agar project ka maalik (user) gayab hai
    if (!project.user) {
      console.log("❌ Error: This project has no owner defined in DB.");
      return res.status(500).json({ message: 'Project data corrupted: No owner found' });
    }

    // Ab safe hai .toString() lagana
    if (project.user.toString() !== myId) {
      return res.status(401).json({ message: 'Only owner can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Check duplication
    // Yahan bhi safety lagayi hai (?.) taaki crash na ho
    if (project.members.includes(userToAdd._id) || project.user.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ message: 'User already in project' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.json(project);
  } catch (err) {
    console.error("ADD MEMBER ERROR:", err);
    res.status(500).send('Server Error');
  }
};