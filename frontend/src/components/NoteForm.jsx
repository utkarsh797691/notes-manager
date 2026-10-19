import { useState } from "react";

export default function NoteForm({
  onAddNote,
  isSaving
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (cleanTitle.length < 3) {
      setError(
        "Title must contain at least 3 characters."
      );
      return;
    }

    setError("");

    const success = await onAddNote({
      title: cleanTitle,
      content: content.trim(),
    });

    if (success) {
      setTitle("");
      setContent("");
    }
  }

  return (
    <form
      className="note-form"
      onSubmit={handleSubmit}
    >
      <h2>Create a Note</h2>

      <label htmlFor="note-title">Title</label>
      <input
        id="note-title"
        type="text"
        value={title}
        maxLength={150}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label htmlFor="note-content">Content</label>
      <textarea
        id="note-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      {error && <p className="error" role="alert">{error}</p>}

      <button
        className="primary-button"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Add Note"}
      </button>
    </form>
  );
}