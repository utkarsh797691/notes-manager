import { useState, useEffect } from "react";

import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";
import LoginForm from "./components/LoginForm";

import {
  loginUser,
  logoutUser,
  setAuthToken,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./services/notesApi";

export default function App() {

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================

  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Notes
  const [notes, setNotes] = useState([]);

  // Search and filtering
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);


  // ==========================================
  // 2. FETCH NOTES AFTER LOGIN
  // ==========================================

  useEffect(() => {

    // Do not fetch notes before login
    if (!isAuthenticated) return;

    const controller = new AbortController();

    async function loadNotes() {
      setLoading(true);
      setError("");

      try {
        const data = await getNotes(controller.signal);

        if (!controller.signal.aborted) {
          setNotes(data);
        }

      } catch (err) {

        if (!controller.signal.aborted) {
          setError(
            `Could not load notes: ${err.message}`
          );
        }

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false);
        }

      }
    }

    loadNotes();

    return () => controller.abort();

  }, [isAuthenticated]);


  // ==========================================
  // 3. LOGIN
  // ==========================================

  async function handleLogin(username, password) {
    setError("");

    try {
      const data = await loginUser(username, password);

      // Store token in memory
      setAuthToken(data.token);

      // Update authentication state
      setIsAuthenticated(true);

      return true;

    } catch (err) {

      setError(
        `Sign in failed: ${err.message}`
      );

      return false;
    }
  }


  // ==========================================
  // 4. LOGOUT
  // ==========================================

  async function handleLogout() {

    setError("");

    try {
      // Revoke token on Django backend
      await logoutUser();

      // Remove authentication token
      setAuthToken(null);

      // Update authentication state
      setIsAuthenticated(false);

      // Clear private data from React
      setNotes([]);
      setSearch("");
      setFavoritesOnly(false);
      setBusyId(null);
      setLoading(true);

    } catch (err) {

      setError(
        `Logout could not be confirmed: ${err.message}`
      );

    }
  }


  // ==========================================
  // 5. CREATE NOTE
  // ==========================================

  async function handleAddNote(noteData) {
    setError("");
    setIsSaving(true);

    try {
      // Send note to Django API
      const savedNote = await createNote(noteData);

      // Update state using the saved record
      setNotes((previousNotes) => [
        savedNote,
        ...previousNotes,
      ]);

      return true;

    } catch (err) {

      setError(
        `Could not save note: ${err.message}`
      );

      return false;

    } finally {
      setIsSaving(false);
    }
  }


  // ==========================================
  // 6. UPDATE FAVORITE STATUS
  // ==========================================

  async function handleToggleFavorite(id) {

    const selectedNote = notes.find(
      (note) => note.id === id
    );

    if (!selectedNote) return;

    setBusyId(id);
    setError("");

    try {

      const updatedNote = await updateNote(id, {
        is_favorite: !selectedNote.is_favorite,
      });

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === id ? updatedNote : note
        )
      );

    } catch (err) {

      setError(
        `Could not update note: ${err.message}`
      );

    } finally {
      setBusyId(null);
    }
  }


  // ==========================================
  // 7. DELETE NOTE
  // ==========================================

  async function handleDelete(id) {

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setBusyId(id);
    setError("");

    try {

      await deleteNote(id);

      setNotes((previousNotes) =>
        previousNotes.filter(
          (note) => note.id !== id
        )
      );

    } catch (err) {

      setError(
        `Could not delete note: ${err.message}`
      );

    } finally {
      setBusyId(null);
    }
  }


  // ==========================================
  // 8. SEARCH AND FILTER
  // ==========================================

  const query = search.trim().toLowerCase();

  const visibleNotes = notes.filter((note) => {

    const matchesSearch =
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);

    const matchesFavorite =
      !favoritesOnly || note.is_favorite;

    return matchesSearch && matchesFavorite;
  });


  // ==========================================
  // 9. FAVORITE COUNT
  // ==========================================

  const favoriteCount = notes.filter(
    (note) => note.is_favorite
  ).length;


  // ==========================================
  // 10. SHOW LOGIN PAGE IF NOT AUTHENTICATED
  // ==========================================

  if (!isAuthenticated) {
    return (
      <div className="app-container">

        <header className="app-header">
          <h1>Notes Manager</h1>
          <p>Sign in to manage your notes.</p>
        </header>

        <LoginForm onLogin={handleLogin} />

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

      </div>
    );
  }


  // ==========================================
  // 11. MAIN NOTES MANAGER UI
  // ==========================================

  return (
    <div className="app-container">

      {/* HEADER */}

      <header className="app-header">

        <h1>My Notes</h1>

        <p>
          Organize your ideas and learning journey.
        </p>

        <p>
          Total: {notes.length} |
          Favorites: {favoriteCount}
        </p>

        <button
          type="button"
          className="filter-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>


      {/* CREATE NOTE FORM */}

      <NoteForm
        onAddNote={handleAddNote}
        isSaving={isSaving}
      />


      {/* ERROR MESSAGE */}

      {error && (
        <p
          className="error"
          role="alert"
        >
          {error}
        </p>
      )}


      {/* SEARCH AND FILTER */}

      <div className="toolbar">

        <input
          type="search"
          aria-label="Search notes"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          className="filter-button"
          aria-pressed={favoritesOnly}
          onClick={() =>
            setFavoritesOnly(!favoritesOnly)
          }
        >
          {favoritesOnly
            ? "All Notes"
            : "★ Favorites"}
        </button>

      </div>


      {/* NOTES SECTION */}

      <section aria-label="Your notes">

        <h2 className="section-heading">
          Your Notes ({visibleNotes.length})
        </h2>

        {loading ? (

          <p role="status">
            Loading notes...
          </p>

        ) : visibleNotes.length === 0 ? (

          <p className="empty-message">
            No matching notes to display.
          </p>

        ) : (

          <div className="notes-grid">

            {visibleNotes.map((note) => (

              <NoteCard
                key={note.id}
                note={note}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                isBusy={busyId !== null}
              />

            ))}

          </div>

        )}

      </section>

    </div>
  );
}