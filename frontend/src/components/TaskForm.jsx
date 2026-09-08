import { useState, useEffect } from "react";

const PRIORITIES = ["Low", "Med", "High"];
const TAGS = ["School", "Personal", "Others"];

function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function TaskForm({ onSubmit, editingTask, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [tag, setTag] = useState("Personal");
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDueDate(toDatetimeLocal(editingTask.due_date));
      setPriority(editingTask.priority);
      setTag(editingTask.tag);
    } else {
      resetForm();
    }
    setFormError(null);
  }, [editingTask]);

  function resetForm() {
    setTitle("");
    setDueDate("");
    setPriority("Low");
    setTag("Personal");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !dueDate) {
      setFormError("Title and due date are required.");
      return;
    }

    setFormError(null);
    onSubmit({
      title: title.trim(),
      due_date: new Date(dueDate).toISOString(),
      priority,
      tag,
    });

    if (!editingTask) resetForm();
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="form-error" role="alert" aria-live="polite">{formError}</p>
      )}

      <label className="visually-hidden" htmlFor="task-title">Task title</label>
      <input
        id="task-title"
        type="text"
        name="title"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="visually-hidden" htmlFor="task-due-date">Due date and time</label>
      <input
        id="task-due-date"
        type="datetime-local"
        name="due_date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <label className="visually-hidden" htmlFor="task-priority">Priority</label>
      <select id="task-priority" name="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <label className="visually-hidden" htmlFor="task-tag">Tag</label>
      <select id="task-tag" name="tag" value={tag} onChange={(e) => setTag(e.target.value)}>
        {TAGS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <button type="submit">{editingTask ? "Update Task" : "Add Task"}</button>
      {editingTask && (
        <button type="button" onClick={onCancelEdit}>Cancel</button>
      )}
    </form>
  );
}

export default TaskForm;