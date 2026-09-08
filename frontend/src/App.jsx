import { useState, useEffect } from "react";
import { getTasks, createTask, updateTask, deleteTask, restoreTask } from "./api/tasks";
import TaskForm from "./components/TaskForm";
import TaskControls from "./components/TaskControls";
import TaskList from "./components/TaskList";
import "./App.css";

const PRIORITY_ORDER = { High: 0, Med: 1, Low: 2 };
const TAG_ORDER = { Personal: 0, School: 1, Others: 2 };

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [undoData, setUndoData] = useState(null);
  const [showDone, setShowDone] = useState(false);

  // Filter/sort state
  const [sortBy, setSortBy] = useState("created_at");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterTag, setFilterTag] = useState("All");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(taskData) {
    try {
      const newTask = await createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      setError(null);
    } catch (err) {
      setError("Failed to add task.");
    }
  }

  async function handleUpdate(taskId, updates) {
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      setEditingTask(null);
      setError(null);
    } catch (err) {
      setError("Failed to update task.");
    }
  }

  function handleToggleDone(task) {
    handleUpdate(task.id, { is_done: !task.is_done });
  }

  async function handleDelete(taskId) {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);

      const timeoutId = setTimeout(() => {
        setUndoData(null);
      }, 15000);

      setUndoData({ task: taskToDelete, timeoutId });
      setError(null);
    } catch (err) {
      setError("Failed to delete task.");
    }
  }

  async function handleUndo() {
    if (!undoData) return;

    try {
      clearTimeout(undoData.timeoutId);
      const restoredTask = await restoreTask(undoData.task.id);
      setTasks((prev) => [restoredTask, ...prev]);
      setUndoData(null);
    } catch (err) {
      setError("Failed to restore task.");
    }
  }

  // Apply filters first
  let visibleTasks = tasks.filter((t) => {
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (filterTag !== "All" && t.tag !== filterTag) return false;
    if (!showDone && t.is_done) return false;
    return true;
  });

  // sort done tasks always sink to the bottom regardless of sort key,
  visibleTasks = [...visibleTasks].sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;

    switch (sortBy) {
      case "due_date":
        return new Date(a.due_date) - new Date(b.due_date);
      case "priority":
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "tag":
        return TAG_ORDER[a.tag] - TAG_ORDER[b.tag];
      case "created_at":
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <div className="page">
      <div className="app">
        <header className="app-header">
          <h1>To-Do List</h1>
        </header>

        {error && <div className="error-banner" role="alert" aria-live="polite">{error}</div>}

        <TaskForm
          onSubmit={editingTask ? (data) => handleUpdate(editingTask.id, data) : handleAdd}
          editingTask={editingTask}
          onCancelEdit={() => setEditingTask(null)}
        />

        <TaskControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          filterTag={filterTag}
          onFilterTagChange={setFilterTag}
          showDone={showDone}
          onShowDoneChange={setShowDone}
        />

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <TaskList
            tasks={visibleTasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onToggleDone={handleToggleDone}
          />
        )}
      </div>

      {undoData && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span>Task "{undoData.task.title}" deleted.</span>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}
    </div>
  );
}

export default App;