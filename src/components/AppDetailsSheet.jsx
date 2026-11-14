import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { db } from "../firebase";
import useSheetDrag from "../hooks/useSheetDrag";

export default function AppDetailsSheet({ app, canManage, onClose, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const drag = useSheetDrag(onClose);

  useEffect(() => {
    let active = true;
    if (app?.createdBy && !app.createdByDisplayName) {
      getDoc(doc(db, "publicProfiles", app.createdBy)).then((snapshot) => {
        if (active) setCreatorProfile({ uid: app.createdBy, name: snapshot.data()?.displayName || "" });
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [app]);

  if (!app) return null;

  const tags = [
    app.isApp && "App",
    app.isPCWeb && "PC Web",
    app.isMobileWeb && "Mobile Web",
  ].filter(Boolean);

  return (
    <div className="sheet-layer is-open" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="details-sheet" style={drag.dragStyle} role="dialog" aria-modal="true" aria-labelledby="app-details-title">
        <div className="details-sheet__top" onPointerDown={drag.handlePointerDown} onPointerMove={drag.handlePointerMove} onPointerUp={drag.handlePointerUp} onPointerCancel={drag.handlePointerCancel}>
          <span className="sheet-handle" aria-hidden="true" />
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close app details"><FiX /></button>
        </div>
        <div className="details-sheet__identity">
          <span className="app-record__avatar" style={{ "--record-hue": [...app.id].reduce((hue, character) => (hue * 31 + character.charCodeAt(0)) % 360, 0) }} aria-hidden="true">
            {app.App?.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "A"}
          </span>
          <div>
            <h2 id="app-details-title">{app.App || "Untitled app"}</h2>
            <p>{app.Type || "Uncategorized"}</p>
          </div>
        </div>
        <dl className="details-list">
          <div><dt>Created</dt><dd>{app["Date-created"]?.toDate?.().toLocaleDateString() ?? "Date unavailable"}</dd></div>
          <div><dt>Creator</dt><dd>{app.createdByDisplayName || (creatorProfile?.uid === app.createdBy ? creatorProfile.name : "") || (app.createdBy ? "App creator" : "Legacy app")}</dd></div>
        </dl>
        {tags.length > 0 && <div className="app-record__tags">{tags.map((tag) => <span className="app-record__tag" key={tag}>{tag}</span>)}</div>}
        {canManage && (
          <div className="details-sheet__actions">
            {confirmingDelete ? (
              <div className="delete-confirm" role="group" aria-label="Confirm app deletion">
                <p>Delete this app? This cannot be undone.</p>
                <div>
                  <button type="button" className="secondary-button" onClick={() => setConfirmingDelete(false)}>Cancel</button>
                  <button type="button" className="danger-button" onClick={() => onDelete(app)}><FiTrash2 /> Delete</button>
                </div>
              </div>
            ) : (
              <>
                <button type="button" className="secondary-button" onClick={() => onEdit(app)}><FiEdit2 /> Edit app</button>
                <button type="button" className="danger-button" onClick={() => setConfirmingDelete(true)}><FiTrash2 /> Delete app</button>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}