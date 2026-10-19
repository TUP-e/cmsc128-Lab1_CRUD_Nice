const API_URL = import.meta.env.VITE_API_URL;

function authHeaders(token, json = false) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}

export async function getTasks(token) {
  const res = await fetch(`${API_URL}/tasks/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(task, token) {
  const res = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(taskId, updates, token) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: authHeaders(token, true),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(taskId, token) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}

export async function restoreTask(taskId, token) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/restore`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to restore task");
  return res.json();
}
