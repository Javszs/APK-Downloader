import { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import useSheetDrag from "../hooks/useSheetDrag";

export default function Settings({ theme, onThemeChange }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ displayName: "", phoneNumber: "", address: "", gender: "", birthDate: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const profileSheetDrag = useSheetDrag(() => setIsProfileOpen(false));

  // 🔥 Listen for user login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setProfile((current) => ({ ...current, displayName: currentUser.displayName ?? "" }));
        setProfileLoading(true);
        getDoc(doc(db, "users", currentUser.uid)).then((snapshot) => {
          const data = snapshot.data() ?? {};
          setProfile({
            displayName: currentUser.displayName ?? data.displayName ?? "",
            phoneNumber: (data.phoneNumber ?? currentUser.phoneNumber ?? "").replace(/\D/g, "").slice(0, 11),
            address: data.address ?? "",
            gender: data.gender ?? "",
            birthDate: data.birthDate ?? "",
          });
        }).catch(() => {
          setProfileMessage("Your saved profile details could not be loaded.");
        }).finally(() => setProfileLoading(false));
      }
    });
    return unsubscribe;
  }, [auth]);

  function updateField(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: name === "phoneNumber" ? value.replace(/\D/g, "").slice(0, 11) : value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!user) return;
    if (profile.phoneNumber.length !== 11) return;
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const displayName = profile.displayName.trim();
      if (displayName !== (user.displayName ?? "")) await updateProfile(user, { displayName });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email ?? null,
        displayName,
        phoneNumber: profile.phoneNumber.trim(),
        address: profile.address.trim(),
        gender: profile.gender,
        birthDate: profile.birthDate,
        updatedAt: new Date(),
      }, { merge: true });
      await setDoc(doc(db, "publicProfiles", user.uid), { uid: user.uid, displayName, updatedAt: new Date() }, { merge: true });
      setProfileMessage("Profile saved.");
      setIsProfileOpen(false);
    } catch {
      setProfileMessage("Your profile could not be saved. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    if (!isProfileOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsProfileOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileOpen]);

  return (
    <section className="app-page">
      <div className="app-page__heading">
        <h2>Preferences</h2>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-row__copy">
            <strong>Appearance</strong>
            <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          </div>
          <label className="settings-switch" aria-label="Toggle dark mode">
            <input type="checkbox" checked={theme === "dark"} onChange={(event) => onThemeChange(event.target.checked ? "dark" : "light")} />
            <span />
          </label>
        </div>
      </div>

      {user ? (
        <>
          <div className="settings-group">
            <button type="button" className="profile-summary" onClick={() => { setProfileMessage(""); setIsProfileOpen(true); }}>
              <span className="profile-summary__copy"><strong>Personal details</strong><span>{profile.displayName || user.email || "Manage your profile"}</span></span>
              <span className="profile-summary__action">Edit</span>
            </button>
          </div>
          {profileMessage && <p className="profile-message" role="status">{profileMessage}</p>}
          <button className="settings-action" type="button" onClick={handleLogout}>Log out</button>
          {isProfileOpen && (
            <div className="profile-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsProfileOpen(false); }}>
              <button type="button" className="profile-modal__backdrop" onClick={() => setIsProfileOpen(false)} aria-label="Close personal details" />
              <form className="profile-modal" style={profileSheetDrag.dragStyle} onSubmit={saveProfile} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
                <div className="profile-modal__top" onPointerDown={profileSheetDrag.handlePointerDown} onPointerMove={profileSheetDrag.handlePointerMove} onPointerUp={profileSheetDrag.handlePointerUp} onPointerCancel={profileSheetDrag.handlePointerCancel}>
                  <div className="profile-modal__title"><h2 id="profile-modal-title">Personal details</h2><p>Update your account information</p></div>
                  <button type="button" className="profile-modal__close" onClick={() => setIsProfileOpen(false)} aria-label="Close personal details"><FiX /></button>
                </div>
                <label className="form-field" htmlFor="profile-display-name"><span>Display name</span><input id="profile-display-name" name="displayName" placeholder="Your name" value={profile.displayName} onChange={updateField} maxLength={80} required disabled={profileLoading} /></label>
                <label className="form-field" htmlFor="profile-email"><span>Email</span><input id="profile-email" placeholder="Email address" value={user.email ?? ""} readOnly /></label>
                <label className="form-field" htmlFor="profile-phone"><span>Phone number</span><input id="profile-phone" className={profile.phoneNumber.length !== 11 ? "is-invalid" : ""} name="phoneNumber" type="tel" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} placeholder="11-digit phone number" value={profile.phoneNumber} onChange={updateField} disabled={profileLoading} aria-invalid={profile.phoneNumber.length !== 11} aria-describedby="profile-phone-error" /></label>
                {profile.phoneNumber.length !== 11 && <p className="profile-validation" id="profile-phone-error" role="alert">Phone number needs 11 numbers.</p>}
                <label className="form-field" htmlFor="profile-address"><span>Address</span><input id="profile-address" name="address" autoComplete="street-address" placeholder="Street address" value={profile.address} onChange={updateField} disabled={profileLoading} /></label>
                <label className="form-field" htmlFor="profile-gender"><span>Gender</span><select id="profile-gender" name="gender" value={profile.gender} onChange={updateField} disabled={profileLoading}><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></select></label>
                <label className="form-field" htmlFor="profile-birth-date"><span>Birth date</span><input id="profile-birth-date" name="birthDate" type="date" placeholder="Select your birth date" value={profile.birthDate} onChange={updateField} disabled={profileLoading} /></label>
                <div className="profile-modal__actions">
                  <button className="settings-action" type="button" onClick={() => setIsProfileOpen(false)}>Cancel</button>
                  <button className="settings-action settings-action--primary" type="submit" disabled={savingProfile || profileLoading || profile.phoneNumber.length !== 11}>{savingProfile ? "Saving..." : "Save profile"}</button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : <button className="settings-action" onClick={() => navigate("/login")}>Log in</button>}
    </section>
  );
}
