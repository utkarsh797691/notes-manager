export default function NoteCard({
  note,
  onToggleFavorite,
  onDelete,
  isBusy,
}) {
  return (
    <article className="note-card">
      <div className="note-top">
        <h3>{note.title}</h3>

        <button
          type="button"
          className="favorite-button"
          disabled={isBusy}
          aria-label={
            note.is_favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          aria-pressed={note.is_favorite}
          onClick={() => onToggleFavorite(note.id)}
        >
          {note.is_favorite ? "★" : "☆"}
        </button>
      </div>

      <p>{note.content || "No content yet."}</p>

      <button
        type="button"
        className="delete-button"
        disabled={isBusy}
        onClick={() => onDelete(note.id)}
      >
        {isBusy ? "Please wait..." : "Delete"}
      </button>
    </article>
  );
}