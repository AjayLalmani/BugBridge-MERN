import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await api.get(`/projects/${id}`);
        setProject(projectRes.data);
        const tasksRes = await api.get(`/tasks/project/${id}`);
        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return alert("Task title zaroori hai!");
    try {
      const res = await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        projectId: id,
        priority: 'Medium'
      });
      setTasks([...tasks, res.data]);
      setTaskTitle('');
      setTaskDesc('');
    } catch (err) {
      alert('Error creating task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert('Could not delete task');
    }
  };

  // --- 🪄 MAGIC: Jab Drag khatam ho toh kya karein ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // 1. Agar user ne card ko wahi chhod diya ya bahar phenk diya
    if (!destination) return;

    // 2. Agar same jagah par hi wapas rakh diya
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 3. UI Update (Turant dikhane ke liye)
    const newStatus = destination.droppableId; // 'Todo', 'In Progress', 'Done'
    
    // Optimistic Update: Backend ka wait mat karo, pehle UI badal do
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    // 4. Backend Update (Chupke se save karo)
    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error("Update failed", err);
      alert("Status update failed!");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Board... ⏳</div>;
  if (!project) return <div className="p-10 text-center text-red-500">Project Not Found ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 mb-4 hover:underline">← Back</button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{project.title}</h1>

        <div className="bg-white p-4 rounded shadow mb-8 border border-gray-200">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input 
              className="border p-2 rounded flex-1 outline-none"
              placeholder="Add New Task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
             <input 
              className="border p-2 rounded flex-1 outline-none"
              placeholder="Description"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Add</button>
          </form>
        </div>

        {/* --- DRAG DROP AREA --- */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <TaskColumn 
              title="Todo" 
              id="Todo" 
              tasks={tasks.filter(t => t.status === 'Todo')} 
              onDelete={handleDeleteTask}
            />
            
            <TaskColumn 
              title="In Progress" 
              id="In Progress" 
              tasks={tasks.filter(t => t.status === 'In Progress')} 
              onDelete={handleDeleteTask}
            />
            
            <TaskColumn 
              title="Done" 
              id="Done" 
              tasks={tasks.filter(t => t.status === 'Done')} 
              onDelete={handleDeleteTask}
            />

          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

// --- COLUMN COMPONENT (Droppable) ---
function TaskColumn({ title, id, tasks, onDelete }) {
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 p-4 rounded-lg min-h-[500px]"
        >
          <h3 className="font-bold mb-4 text-gray-700">{title} ({tasks.length})</h3>
          
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500"
                    style={{ ...provided.draggableProps.style }} // Zaroori hai drag animation ke liye
                  >
                    <div className="flex justify-between">
                      <h4 className="font-bold">{task.title}</h4>
                      <button onClick={() => onDelete(task._id)} className="text-red-400">×</button>
                    </div>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder} {/* Ye space banata hai jab card drag hota hai */}
          </div>
        </div>
      )}
    </Droppable>
  );
}