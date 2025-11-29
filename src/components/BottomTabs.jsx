import { NavLink } from "react-router-dom";

export default function BottomTabs() {
  return (
    <nav className="bottom-tabs">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/settings">Settings</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </nav>
  );
}
