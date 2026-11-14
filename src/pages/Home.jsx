import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { FiLogIn, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import AppRecordCard from "../components/AppRecordCard";
import AppDetailsSheet from "../components/AppDetailsSheet";
import useUserFavorites from "../hooks/useUserFavorites";
import useSheetDrag from "../hooks/useSheetDrag";

export default function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [homeView, setHomeView] = useState("mine");
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [isApp, setIsApp] = useState(true);
  const [isPCWeb, setIsPCWeb] = useState(false);
  const [isMobileWeb, setIsMobileWeb] = useState(false);
  const navigate = useNavigate();
  const { user, favorites, loading: authLoading, error: favoriteError, toggleFavorite } = useUserFavorites();
  const createSheetDrag = useSheetDrag(closeCreateSheet);

  async function loadApps({ refresh = false } = {}) {
    if (refresh) setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "apk"));
      setApps(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      setError("");
    } catch {
      setError("Apps could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadApps(); }, []);

  useEffect(() => {
    const handleRefresh = (event) => {
      loadApps({ refresh: true }).finally(() => event.detail?.done?.());
    };
    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, []);

  const favoriteApps = useMemo(() => [...apps].filter((app) => favorites.has(app.id)).sort((first, second) => {
    const firstDate = first["Date-created"]?.toMillis?.() ?? new Date(first["Date-created"] ?? 0).getTime();
    const secondDate = second["Date-created"]?.toMillis?.() ?? new Date(second["Date-created"] ?? 0).getTime();
    return secondDate - firstDate;
  }), [apps, favorites]);
  const myApps = useMemo(() => [...apps]
    .filter((app) => app.createdBy === user?.uid)
    .sort((first, second) => {
      const firstDate = first["Date-created"]?.toMillis?.() ?? new Date(first["Date-created"] ?? 0).getTime();
      const secondDate = second["Date-created"]?.toMillis?.() ?? new Date(second["Date-created"] ?? 0).getTime();
      return secondDate - firstDate;
    }), [apps, user]);
  const visibleApps = homeView === "mine" ? myApps : favoriteApps;

  function openCreateSheet() {
    setIsSheetOpen(true);
  }

  function handleFavoriteClick(app) {
    if (!user) {
      navigate("/login", { state: { from: "/home" } });
      return;
    }
    toggleFavorite(app.id);
  }

  function showAppDetails(app) {
    setSelectedApp(app);
    setIsDetailsOpen(true);
  }

  function handleEditApp(app) {
    if (!user || app.createdBy !== user.uid) return;
    setSelectedApp(app);
    setName(app.App || "");
    setType(app.Type || "");
    setIsApp(Boolean(app.isApp));
    setIsPCWeb(Boolean(app.isPCWeb));
    setIsMobileWeb(Boolean(app.isMobileWeb));
    setIsSheetOpen(true);
    setIsDetailsOpen(false);
  }

  async function handleDeleteApp(app) {
    if (!user || app.createdBy !== user.uid) return;
    try {
      await deleteDoc(doc(db, "apk", app.id));
      setApps((current) => current.filter((entry) => entry.id !== app.id));
      setIsDetailsOpen(false);
      setSelectedApp(null);
    } catch {
      setError("This app could not be deleted. Only its creator can delete it.");
    }
  }

  function closeCreateSheet() {
    setIsSheetOpen(false);
    setName("");
    setType("");
    setIsApp(true);
    setIsPCWeb(false);
    setIsMobileWeb(false);
    setSelectedApp(null);
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!name.trim() || !type.trim()) return;
    setIsSaving(true);
    try {
      const appData = {
        App: name.trim(),
        Type: type.trim(),
        isApp,
        isPCWeb,
        isMobileWeb,
      };
      if (selectedApp) {
        if (!user || selectedApp.createdBy !== user.uid) return;
        await updateDoc(doc(db, "apk", selectedApp.id), appData);
      } else {
        await addDoc(collection(db, "apk"), {
          ...appData,
          createdBy: user.uid,
          createdByDisplayName: user.displayName ?? "",
          "Date-created": new Date(),
        });
      }
      closeCreateSheet();
      await loadApps();
    } catch {
      setError("The app could not be created. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="app-page">
        <div className="app-page__heading">
          <div className="home-view-tabs" role="tablist" aria-label="Your apps">
            <button type="button" className={`home-view-tab ${homeView === "mine" ? "is-active" : ""}`} role="tab" aria-selected={homeView === "mine"} onClick={() => setHomeView("mine")}>My Apps</button>
            <button type="button" className={`home-view-tab ${homeView === "favorites" ? "is-active" : ""}`} role="tab" aria-selected={homeView === "favorites"} onClick={() => setHomeView("favorites")}>My Favorites</button>
          </div>
          <span>{loading || authLoading ? "Loading" : `${visibleApps.length} ${homeView === "mine" ? "apps" : "saved"}`}</span>
        </div>

        {(error || favoriteError) && <p className="app-error" role="alert">{error || favoriteError}</p>}
        {loading ? (
          <p className="app-empty">Loading your apps...</p>
        ) : visibleApps.length ? (
          <div className="app-record-list">
            {visibleApps.map((app, index) => (
              <AppRecordCard key={app.id} app={app} index={index} isFavorite={favorites.has(app.id)} onToggleFavorite={handleFavoriteClick} onOpen={showAppDetails} />
            ))}
          </div>
        ) : !user && !authLoading ? (
          <p className="app-empty">{homeView === "mine" ? "Log in to create and manage your apps." : "Log in to save and see your favorite apps here."}</p>
        ) : (
          <p className="app-empty">{homeView === "mine" ? "You have not created any apps yet." : "No favorites yet. Tap a heart in Apps to save an app here."}</p>
        )}
      </section>

      {!authLoading && (user ? (
        <button type="button" className="app-fab" onClick={openCreateSheet} aria-label="Create a new app">
          <FiPlus aria-hidden="true" />
        </button>
      ) : (
        <button type="button" className="app-fab-login" onClick={() => navigate("/login", { state: { from: "/home" } })}>
          <FiLogIn aria-hidden="true" />
          <span>Log in</span>
        </button>
      ))}

      <AppDetailsSheet
        app={isDetailsOpen ? selectedApp : null}
        canManage={Boolean(user && selectedApp?.createdBy === user.uid)}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditApp}
        onDelete={handleDeleteApp}
      />

      <div className={`app-sheet-layer ${isSheetOpen ? "is-open" : ""}`} aria-hidden={!isSheetOpen}>
        <button type="button" className="app-sheet-backdrop" onClick={closeCreateSheet} tabIndex={isSheetOpen ? 0 : -1} aria-label="Close create app form" />
        <form className="app-sheet" style={createSheetDrag.dragStyle} onSubmit={handleCreate} role="dialog" aria-modal={isSheetOpen} aria-labelledby="app-sheet-title">
          <div className="app-sheet__drag-handle" onPointerDown={createSheetDrag.handlePointerDown} onPointerMove={createSheetDrag.handlePointerMove} onPointerUp={createSheetDrag.handlePointerUp} onPointerCancel={createSheetDrag.handlePointerCancel}>
            <span className="app-sheet__handle" aria-hidden="true" />
          </div>
          <h2 id="app-sheet-title">{selectedApp ? "Edit app" : "Create an app"}</h2>
          <p className="app-sheet__hint">{selectedApp ? "Update your app details." : "Add it to your app library."}</p>

          <div className="app-sheet__field">
            <label htmlFor="new-app-name">App name</label>
            <input id="new-app-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="App Name" maxLength={60} required autoComplete="off" />
          </div>
          <div className="app-sheet__field">
            <label htmlFor="new-app-type">Type</label>
            <input id="new-app-type" value={type} onChange={(event) => setType(event.target.value)} placeholder="School, Personal, etc." required />
          </div>
          <div className="app-sheet__options" aria-label="App categories">
            <label className="app-sheet__option"><input type="checkbox" checked={isApp} onChange={(event) => setIsApp(event.target.checked)} /> App</label>
            <label className="app-sheet__option"><input type="checkbox" checked={isPCWeb} onChange={(event) => setIsPCWeb(event.target.checked)} /> PC Web</label>
            <label className="app-sheet__option"><input type="checkbox" checked={isMobileWeb} onChange={(event) => setIsMobileWeb(event.target.checked)} /> Mobile Web</label>
          </div>

          <div className="app-sheet__actions">
            <button type="button" className="app-sheet__button" onClick={closeCreateSheet}>Cancel</button>
            <button type="submit" className="app-sheet__button app-sheet__button--primary" disabled={isSaving || !name.trim() || !type.trim()}>
              {isSaving ? "Saving..." : selectedApp ? "Save changes" : "Create app"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
