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


router.get('/', auth, getProjects);


router.post('/', auth, createProject);


router.get('/:id', auth, getProject);


router.put('/:id', auth, checkProjectOwner, updateProject);


router.delete('/:id', auth,checkProjectOwner, deleteProject);


router.post('/:id/members', auth, checkProjectOwner, addMember);

module.exports = router;