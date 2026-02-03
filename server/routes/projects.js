const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkProjectOwner = require('../middleware/checkProjectOwner');

const { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject, 
  addMember 
} = require('../controllers/projectController');

// 1. Get all projects (GET /api/projects)
router.get('/', auth, getProjects);

// 2. Create a project (POST /api/projects)
router.post('/', auth, createProject);

// 3. Get single project (GET /api/projects/:id)
router.get('/:id', auth, getProject);

// 4. Update project (PUT /api/projects/:id)
router.put('/:id', auth, checkProjectOwner, updateProject);

// 5. Delete project (DELETE /api/projects/:id)
router.delete('/:id', auth,checkProjectOwner, deleteProject);

// 6. Add Member (POST /api/projects/:id/members)
router.post('/:id/members', auth, checkProjectOwner, addMember);

module.exports = router;