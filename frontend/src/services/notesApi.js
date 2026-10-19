const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,

    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData = null;

    try {
      errorData = await response.json();
    } catch {
      // The error response may not contain JSON.
    }

    const message =
      errorData?.title?.[0] ||
      errorData?.detail ||
      `Request failed with status ${response.status}`;

    throw new Error(String(message));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// GET all notes
export function getNotes(signal) {
  return request("/api/notes/", { signal });
}

// POST a new note
export function createNote(noteData) {
  return request("/api/notes/", {
    method: "POST",
    body: JSON.stringify(noteData),
  });
}

// PATCH an existing note
export function updateNote(id, changes) {
  return request(`/api/notes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

// DELETE a note
export function deleteNote(id) {
  return request(`/api/notes/${id}/`, {
    method: "DELETE",
  });
}

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function loginUser(username, password) {
  return request("/api/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutUser() {
  return request("/api/logout/", {
    method: "POST",
  });
}