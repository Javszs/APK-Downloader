import { FiHeart } from "react-icons/fi";

function getInitials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "A";
}

function getCreatedDate(value) {
  if (!value) return "Date unavailable";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
}

function getHue(id = "") {
  return [...id].reduce((hue, character) => (hue * 31 + character.charCodeAt(0)) % 360, 0);
}

export default function AppRecordCard({ app, index = 0, isFavorite = false, onToggleFavorite, onOpen }) {
  const tags = [
    app.isApp && "App",
    app.isPCWeb && "PC Web",
    app.isMobileWeb && "Mobile Web",
  ].filter(Boolean);

  return (
    <article
      className={`app-record ${onOpen ? "is-clickable" : ""}`}
      style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
      onClick={onOpen ? () => onOpen(app) : undefined}
      onKeyDown={onOpen ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(app);
        }
      } : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `View details for ${app.App}` : undefined}
    >
      <div className="app-record__head">
        <span className="app-record__avatar" style={{ "--record-hue": getHue(app.id) }} aria-hidden="true">
          {getInitials(app.App)}
        </span>
        <div className="app-record__meta">
          <h3 className="app-record__name">{app.App || "Untitled app"}</h3>
          <p className="app-record__type">{app.Type || "Uncategorized"}</p>
        </div>
        <div className="app-record__trailing">
          <time className="app-record__date">{getCreatedDate(app["Date-created"])}</time>
          {onToggleFavorite && (
            <button
              type="button"
              className={`app-record__favorite ${isFavorite ? "is-favorite" : ""}`}
              onClick={(event) => { event.stopPropagation(); onToggleFavorite(app); }}
              aria-label={`${isFavorite ? "Remove" : "Add"} ${app.App} ${isFavorite ? "from" : "to"} favorites`}
              aria-pressed={isFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiHeart aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="app-record__tags">
          {tags.map((tag) => <span className="app-record__tag" key={tag}>{tag}</span>)}
        </div>
      )}

    </article>
  );
}