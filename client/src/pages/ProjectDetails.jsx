import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [inviteEmail, setInviteEmail] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");

  // Edit & Comments States
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");

  // Comments State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!project) {
          const projectRes = await api.get(`/projects/${id}`);
          setProject(projectRes.data);
        }

        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (filterPriority !== "All") params.append("priority", filterPriority);
        if (filterAssignee !== "All")
          params.append("assignedTo", filterAssignee);

        const tasksRes = await api.get(
          `/tasks/project/${id}?${params.toString()}`
        );

        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [id, searchQuery, filterPriority, filterAssignee]);

  const allMembers = project
    ? [project.user, ...project.members].filter(Boolean)
    : [];

  // 👇👇👇 1. LOGIC ADDED: CHECK IF CURRENT USER IS OWNER 👇👇👇
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner =
    project &&
    project.user &&
    (project.user._id === currentUser.id || project.user === currentUser.id);

  // --- HANDLERS (Create, Delete, Edit, Drag) ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return alert("Task title zaroori hai!");
    try {
      const res = await api.post("/tasks", {
        title: taskTitle,
        description: taskDesc,
        projectId: id,
        priority: priority,
        assignedTo: assignedTo || null,
      });
      setTasks([...tasks, res.data]);
      setTaskTitle("");
      setTaskDesc("");
      setAssignedTo("");
      setPriority("Medium");
    } catch (err) {
      alert("Error creating task");
    }
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      // Agar backend se error aaya (Not Authorized), toh alert dikhao
      alert(err.response?.data?.message || "Could not delete task");
    }
  };

  const openEditModal = async (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditAssignedTo(task.assignedTo?._id || "");
    setEditPriority(task.priority || "Medium");
    try {
      const res = await api.get(`/comments/${task._id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments", err);
    }
  };

  const handleUpdateTask = async () => {
    if (!editTitle) return alert("Title cannot be empty");
    try {
      const res = await api.put(`/tasks/${editingTask._id}`, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        assignedTo: editAssignedTo || null,
      });
      const updatedList = tasks.map((t) =>
        t._id === editingTask._id ? res.data : t
      );
      setTasks(updatedList);
      setEditingTask(null);
    } catch (err) {
      alert("Error updating task");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post("/comments", {
        text: newComment,
        taskId: editingTask._id,
      });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      alert("Error adding comment");
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;
    const updatedTasks = tasks.map((t) =>
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await api.post(`/projects/${id}/members`, { email: inviteEmail });
      alert("Member added successfully! Refresh page.");
      setInviteEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding member");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading Board... ⏳</div>;
  if (!project)
    return (
      <div className="p-10 text-center text-red-500">Project Not Found ❌</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 mb-4 hover:underline"
        >
          ← Back
        </button>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <div className="text-sm text-gray-500">
            Owner:{" "}
            <span className="font-bold text-purple-600">
              {project.user?.email}
            </span>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded shadow mb-6 border border-gray-200 flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2 flex-1">
            <span className="material-symbols-outlined text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              className="flex-1 outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="border p-2 rounded bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">🔥 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>

          <select
            className="border p-2 rounded bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="All">All Members</option>
            {allMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.email}
              </option>
            ))}
          </select>
        </div>

        {/* INVITE SECTION */}
        <div className="bg-white p-4 rounded shadow mb-6 border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-2">Team & Invite</h3>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Invite friend..."
                className="p-2 border rounded text-sm w-64"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <button
                onClick={handleInvite}
                className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
              >
                Invite
              </button>
            </div>
            <div className="flex gap-2 flex-wrap ml-4">
              {project.members?.map((m) => (
                <span
                  key={m._id}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200"
                >
                  👤 {m.email}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ADD TASK FORM */}
        <div className="bg-white p-4 rounded shadow mb-8 border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3">Add New Task</h3>
          <form onSubmit={handleAddTask} className="flex gap-2 flex-wrap">
            <input
              className="border p-2 rounded flex-1 outline-none min-w-[200px]"
              placeholder="Task Title..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              className="border p-2 rounded flex-1 outline-none min-w-[200px]"
              placeholder="Description"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
            <select
              className="border p-2 rounded outline-none bg-white w-28"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low 🟢</option>
              <option value="Medium">Medium 🟡</option>
              <option value="High">High 🔴</option>
            </select>
            <select
              className="border p-2 rounded outline-none bg-white min-w-[150px]"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Assign to...</option>
              {allMembers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.email}
                </option>
              ))}
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
              Add
            </button>
          </form>
        </div>

        {/* KANBAN BOARD */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Todo", "In Progress", "Done"].map((status) => (
              <TaskColumn
                key={status}
                title={status}
                id={status}
                tasks={tasks.filter((t) => t.status === status)}
                onDelete={handleDeleteTask}
                onEdit={openEditModal}
                isOwner={isOwner} // 👈 2. PROP PASSED HERE
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* EDIT & COMMENTS MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Task ✏️</h2>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Title
              </label>
              <input
                className="border p-2 rounded w-full mb-3 outline-none focus:ring-2 focus:ring-blue-200"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="border p-2 rounded w-full mb-3 outline-none focus:ring-2 focus:ring-blue-200"
                rows="3"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="border p-2 rounded w-full bg-white"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="Low">Low 🟢</option>
                    <option value="Medium">Medium 🟡</option>
                    <option value="High">High 🔴</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    className="border p-2 rounded w-full bg-white"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {allMembers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mb-6 border-b pb-4">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                >
                  Save Changes
                </button>
              </div>
              {/* COMMENTS */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500">
                    chat
                  </span>
                  Comments
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto mb-3 space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center italic">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c._id}
                        className="bg-white p-2 rounded shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-blue-600">
                            {c.user?.name || "User"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    className="flex-1 border p-2 rounded text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    ➤
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COLUMN COMPONENT (Updated with isOwner) ---
// 👇 3. PROP RECEIVED HERE
function TaskColumn({ title, id, tasks, onDelete, onEdit, isOwner }) {
  const getPriorityColor = (p) => {
    if (p === "High") return "bg-red-100 text-red-700 border-red-200";
    if (p === "Medium")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 p-4 rounded-lg min-h-[500px]"
        >
          <h3 className="font-bold mb-4 text-gray-700">
            {title} ({tasks.length})
          </h3>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onEdit(task)}
                    className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500 hover:shadow-md transition cursor-pointer group relative"
                    style={{ ...provided.draggableProps.style }}
                  >
                    <span
                      className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <div className="flex justify-between items-start mt-2">
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition pr-6">
                        {task.title}
                      </h4>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      
                      {/* 👇👇👇 4. BUTTON CONDITION ADDED HERE 👇👇👇 */}
                      {isOwner ? (
                        <button
                          onClick={(e) => onDelete(e, task._id)}
                          className="text-gray-300 hover:text-red-500 font-bold text-xl leading-none"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      ) : (
                        <span></span> // Empty span for spacing
                      )}

                      {task.assignedTo && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 flex items-center gap-1">
                          👤 {task.assignedTo.email.split("@")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}