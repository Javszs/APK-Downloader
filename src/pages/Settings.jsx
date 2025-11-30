import { useState, useEffect } from "react";
import "./ToggleSwitch.css"; 

export default function Settings() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

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
      </div>
    </>
  );
}
