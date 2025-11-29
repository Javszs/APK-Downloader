import { NavLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { IoSettingsSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import "./BottomTabs.css";

export default function BottomTabs() {
  return (
    <nav className="bottom-tabs">
      <NavLink to="/" className="tab-item">
        <AiFillHome className="tab-icon" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/profile" className="tab-item">
        <FaUser className="tab-icon" />
        <span>Profile</span>
      </NavLink>

      <NavLink to="/settings" className="tab-item">
        <IoSettingsSharp className="tab-icon" />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
