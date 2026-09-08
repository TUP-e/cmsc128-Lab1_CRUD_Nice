function TaskItem({ task, onEdit, onDelete, onToggleDone }) {
  function handleDeleteClick() {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone after a few seconds.`);
    if (confirmed) {
      onDelete(task.id);
    }
  }

  const dueDate = new Date(task.due_date);
  const formattedDueDate = dueDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li
      className={`task-item priority-${task.priority.toLowerCase()} tag-${task.tag.toLowerCase()} ${task.is_done ? "done" : ""}`}
    >
      <label className="task-main">
        <input
          type="checkbox"
          checked={task.is_done}
          onChange={() => onToggleDone(task)}
          aria-label={`Mark "${task.title}" as ${task.is_done ? "not done" : "done"}`}
        />
        <div className="task-details">
          <span className="task-title">{task.title}</span>
          <div className="task-meta">
            <span className="task-due">{formattedDueDate}</span>
            <span>
              <span className="dot priority-dot" aria-hidden="true"></span>
              {task.priority}
            </span>
            <span>
              <span className="dot tag-dot" aria-hidden="true"></span>
              {task.tag}
            </span>
          </div>
        </div>
      </label>
      <div className="task-actions">
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={handleDeleteClick}>Delete</button>
      </div>
    </li>
  );
}

export default TaskItem;