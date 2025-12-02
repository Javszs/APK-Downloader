import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./ToggleSwitch.css"; 

export default function Settings() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [user, setUser] = useState(null); // 🔥 store the logged-in user

  const auth = getAuth();
  const navigate = useNavigate();

  // 🔥 Listen for user login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-header-title">Settings</h1>
      </div>

      <div className="page">
        <div className="appearance-row">
          <h2>Appearance</h2>

          <div className="toggle-container">
            <span>{darkMode ? "Dark" : "Light"}</span>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={handleToggle} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {user && (
          <div className="logout-section">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
