const SORT_OPTIONS = [
  { value: "created_at", label: "Date Added" },
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "tag", label: "Tag" },
];

const PRIORITY_FILTERS = ["All", "Low", "Med", "High"];
const TAG_FILTERS = ["All", "School", "Personal", "Others"];

function TaskControls({
  sortBy, onSortChange,
  filterPriority, onFilterPriorityChange,
  filterTag, onFilterTagChange,
  showDone, onShowDoneChange,
}) {
  return (
    <div className="task-controls">
      <div className="control-group">
        <label htmlFor="sort-select">Sort by</label>
        <select id="sort-select" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="priority-filter">Priority</label>
        <select id="priority-filter" value={filterPriority} onChange={(e) => onFilterPriorityChange(e.target.value)}>
          {PRIORITY_FILTERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="tag-filter">Tag</label>
        <select id="tag-filter" value={filterTag} onChange={(e) => onFilterTagChange(e.target.value)}>
          {TAG_FILTERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <label className="toggle-control">
        <input
          type="checkbox"
          checked={showDone}
          onChange={(e) => onShowDoneChange(e.target.checked)}
        />
        <span>Show completed</span>
      </label>
    </div>
  );
}

export default TaskControls;