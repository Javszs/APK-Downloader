import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { FiMoon, FiRefreshCw, FiSun } from "react-icons/fi";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Apk from "./pages/Apk";
import Login from "./pages/login";
import BottomTabs from "./components/BottomTabs";
import "./styles/AppShell.css";

function initialTheme() {
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme !== null) return savedTheme === "true" ? "dark" : "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function AppRoutes() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState(initialTheme);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const isLogin = pathname === "/login";
  const title = pathname === "/apps" ? "Apps" : pathname === "/settings" ? "Settings" : isLogin ? "Sign in" : "Home";

  useEffect(() => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("darkMode", String(isDark));
  }, [theme]);

  function handleTouchStart(event) {
    if (event.target.closest?.('[aria-modal="true"]') || document.querySelector('[aria-modal="true"]')) {
      touchStartY.current = null;
      setPullDistance(0);
      return;
    }
    if (["/home", "/apps"].includes(pathname) && event.currentTarget.scrollTop === 0) {
      touchStartY.current = event.touches[0].clientY;
    }
  }

  function handleTouchMove(event) {
    if (event.target.closest?.('[aria-modal="true"]') || document.querySelector('[aria-modal="true"]')) {
      touchStartY.current = null;
      setPullDistance(0);
      return;
    }
    if (touchStartY.current === null || event.currentTarget.scrollTop > 0) return;
    setPullDistance(Math.min(96, Math.max(0, event.touches[0].clientY - touchStartY.current)));
  }

  function handleTouchEnd() {
    const shouldRefresh = touchStartY.current !== null && !document.querySelector('[aria-modal="true"]') && pullDistance >= 68 && !refreshing;
    touchStartY.current = null;
    if (shouldRefresh) {
      setRefreshing(true);
      window.dispatchEvent(new CustomEvent("app:refresh", {
        detail: { done: () => setRefreshing(false) },
      }));
    }
    setPullDistance(0);
  }

  return (
    <div className="app-stage" data-theme={theme}>
      <div className="app-device">
        <header className="app-bar">
          <div className="app-bar__identity">
            <span className="app-bar__mark" aria-hidden="true" />
            <div className="app-bar__titles">
              <h1>{title}</h1>
              <p>{title === "Home" ? "Your saved apps, at a glance" : title === "Apps" ? "Browse your full collection" : title === "Settings" ? "Make the app yours" : "APK Downloader"}</p>
            </div>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-pressed={theme === "dark"}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <span className="theme-toggle__icons">
              <FiSun className={`theme-toggle__icon ${theme === "light" ? "is-active" : ""}`} />
              <FiMoon className={`theme-toggle__icon ${theme === "dark" ? "is-active" : ""}`} />
            </span>
          </button>
        </header>

        <main
          className="app-content"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {(["/home", "/apps"].includes(pathname) && (pullDistance > 0 || refreshing)) && (
            <div className={`pull-indicator ${refreshing ? "is-refreshing" : ""}`} style={{ "--pull-offset": `${refreshing ? 50 : Math.min(pullDistance, 68)}px` }} role="status" aria-live="polite">
              <FiRefreshCw aria-hidden="true" />
              <span>{refreshing ? "Refreshing" : pullDistance >= 68 ? "Release to refresh" : "Pull to refresh"}</span>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/apps" element={<Apk />} />
            <Route path="/settings" element={<Settings theme={theme} onThemeChange={setTheme} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/apk" element={<Navigate to="/apps" replace />} />
            <Route path="/mobile" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>

        {!isLogin && <BottomTabs />}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
