import { NavLink } from "react-router-dom";
import { FiGrid, FiHome, FiSettings } from "react-icons/fi";

export default function BottomTabs() {
  return (
    <nav className="tabbar" aria-label="Primary">
      <NavLink to="/home" className="tabbar__item">
        <span className="tabbar__icon-wrap"><FiHome className="tabbar__icon" aria-hidden="true" /></span>
        <span className="tabbar__label">Home</span>
      </NavLink>

      <NavLink to="/apps" className="tabbar__item">
        <span className="tabbar__icon-wrap"><FiGrid className="tabbar__icon" aria-hidden="true" /></span>
        <span className="tabbar__label">Apps</span>
      </NavLink>

      <NavLink to="/settings" className="tabbar__item">
        <span className="tabbar__icon-wrap"><FiSettings className="tabbar__icon" aria-hidden="true" /></span>
        <span className="tabbar__label">Settings</span>
      </NavLink>
    </nav>
  );
}
