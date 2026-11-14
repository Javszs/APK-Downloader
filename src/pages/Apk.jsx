import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import AppRecordCard from "../components/AppRecordCard";
import AppDetailsSheet from "../components/AppDetailsSheet";
import useUserFavorites from "../hooks/useUserFavorites";

export default function Apk() {
  const [apks, setApks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedApk, setSelectedApk] = useState(null);

  const navigate = useNavigate();
  const { user, favorites, error: favoriteError, toggleFavorite } = useUserFavorites();

  const loadApk = useCallback(async (refresh = false) => {
    if (refresh) setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "apk"));
      setApks(querySnapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      setLoadError("");
    } catch {
      setLoadError("Apps could not be loaded. Pull down to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApk();
  }, [loadApk]);

  useEffect(() => {
    const handleRefresh = (event) => {
      loadApk(true).finally(() => event.detail?.done?.());
    };
    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, [loadApk]);

  const filteredApks = apks.filter(apk => {
    if (filter === "all") return true;
    if (filter === "App") return apk.isApp;
    if (filter === "PCweb") return apk.isPCWeb;
    if (filter === "Mobileweb") return apk.isMobileWeb;
    return true;
  });

  function handleFavoriteClick(app) {
    if (!user) {
      navigate("/login", { state: { from: "/apps" } });
      return;
    }
    toggleFavorite(app.id);
  }

  return (
    <>
      <section className="app-page">
        <div className="app-page__heading">
          <h2>All apps</h2>
          <span>{loading ? "Loading" : `${filteredApks.length} apps`}</span>
        </div>

        {(loadError || favoriteError) && <p className="app-error" role="alert">{loadError || favoriteError}</p>}

        <div className="app-filterbar" aria-label="Filter apps">
          <button className={`app-filter ${filter === "all" ? "is-active" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`app-filter ${filter === "App" ? "is-active" : ""}`} onClick={() => setFilter("App")}>App</button>
          <button className={`app-filter ${filter === "PCweb" ? "is-active" : ""}`} onClick={() => setFilter("PCweb")}>PC Web</button>
          <button className={`app-filter ${filter === "Mobileweb" ? "is-active" : ""}`} onClick={() => setFilter("Mobileweb")}>Mobile Web</button>
        </div>

        {loading ? (
          <div className="app-record-list" aria-busy="true">
            {[0, 1, 2].map((index) => <div key={index} className="app-record" aria-hidden="true"><div className="skeleton skeleton-text lg" /></div>)}
          </div>
        ) : (
          <div className="app-record-list">
            {filteredApks.map((apk, index) => (
              <AppRecordCard
                key={apk.id}
                app={apk}
                index={index}
                isFavorite={favorites.has(apk.id)}
                onToggleFavorite={handleFavoriteClick}
                onOpen={setSelectedApk}
              />
            ))}
          </div>
        )}

        {!loading && filteredApks.length === 0 && (
          <p className="app-empty">No apps found in this category.</p>
        )}
      </section>
      <AppDetailsSheet app={selectedApk} canManage={false} onClose={() => setSelectedApk(null)} />
    </>
  );
}
