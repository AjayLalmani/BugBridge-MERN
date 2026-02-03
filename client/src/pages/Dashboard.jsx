import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const navigate = useNavigate();

  // 👇 1. Current User nikalo (Jo abhi login hai)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle) return alert("Project title is required!");

    try {
      const res = await api.post("/projects", {
        title: newTitle,
        description: newDesc,
      });
      setProjects([res.data, ...projects]);
      setNewTitle("");
      setNewDesc("");
    } catch (err) {
      alert("Error creating project");
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      // Agar backend se 403 (Forbidden) aaye toh alert dikhao
      alert(err.response?.data?.msg || "Error deleting project");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          My Dashboard 🚀
        </h1>

        {/* --- CREATE PROJECT FORM --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Create New Project
          </h2>
          <form onSubmit={handleCreateProject} className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Project Title (e.g. BugBridge)"
              className="border p-2 rounded flex-1 focus:ring-2 focus:ring-blue-300 outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              className="border p-2 rounded flex-1 focus:ring-2 focus:ring-blue-300 outline-none"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition"
            >
              + Create
            </button>
          </form>
        </div>

        {/* --- PROJECTS LIST --- */}
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Projects</h2>

        {projects.length === 0 ? (
          <p className="text-gray-500">
            No projects yet. Create one above! 👆
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              // 👇 2. Check: Kya main Owner hoon?
              // Kabhi project.user string ID hoti hai, kabhi object. Dono handle kiye.
              const isOwner =
                project.user === user.id || project.user?._id === user.id;

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200 relative group"
                >
                  {/* 👇 3. Delete Button (Sirf Owner ko dikhega) */}
                  {isOwner && (
                    <button
                      onClick={(e) => handleDeleteProject(e, project._id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Project"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}

                  <h3 className="text-xl font-bold text-gray-800 mb-2 pr-8">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description || "No description"}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {project.members?.length > 0
                        ? "Team Project"
                        : "Solo Project"}
                    </span>
                    <span className="text-blue-600 text-sm hover:underline">
                      View Board →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}