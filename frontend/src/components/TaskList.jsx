import TaskItem from "./TaskItem";

function TaskList({ tasks, onEdit, onDelete, onToggleDone }) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add one above to get started.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleDone={onToggleDone}
        />
      ))}
    </ul>
  );
}

export default TaskList;