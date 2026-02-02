import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err.response?.data);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/'); 
        }
      }
    };

    fetchProjects();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Projects 🚀</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} onClick={() => navigate(`/project/${project._id}`)} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-blue-600 mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Team: {project.members.length} members</span>
                <span>📅 {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <p className="text-gray-500 col-span-3 text-center">No projects found. Create one via API first!</p>
          )}
        </div>
      </div>
    </div>
  );
}