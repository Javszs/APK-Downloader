import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../App";
import "./Apk.css";

export default function Apk() {
  const [apks, setApks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // NEW: actions modal
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedApk, setSelectedApk] = useState(null);

  // form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");

  // booleans
  const [isApp, setIsApp] = useState(false);
  const [isPCWeb, setIsPCWeb] = useState(false);
  const [isMobileWeb, setIsMobileWeb] = useState(false);

  // edit mode
  const [editId, setEditId] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();

  async function loadApk() {
    const querySnapshot = await getDocs(collection(db, "apk"));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setApks(data);
  }

  useEffect(() => {
    loadApk();
  }, []);

  const filteredApks = apks.filter(apk => {
    if (filter === "all") return true;
    if (filter === "App") return apk.isApp;
    if (filter === "PCweb") return apk.isPCWeb;
    if (filter === "Mobileweb") return apk.isMobileWeb;
    return true;
  });

  // OPEN EDIT MODAL
  function openEdit(apk) {
    setEditId(apk.id);
    setNewName(apk.App);
    setNewType(apk.Type);

    setIsApp(apk.isApp);
    setIsPCWeb(apk.isPCWeb);
    setIsMobileWeb(apk.isMobileWeb);

    setShowModal(true);
  }

  async function handleSave() {
    if (!newName || !newType) {
      alert("Please fill all fields");
      return;
    }

    // UPDATE
    if (editId) {
      await updateDoc(doc(db, "apk", editId), {
        App: newName,
        Type: newType,
        isApp,
        isPCWeb,
        isMobileWeb,
      });
    } 
    else {
      // ADD
      await addDoc(collection(db, "apk"), {
        App: newName,
        Type: newType,
        isApp,
        isPCWeb,
        isMobileWeb,
        "Date-created": new Date(),
      });
    }

    closeModal();
    loadApk();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this project?")) return;
    await deleteDoc(doc(db, "apk", id));
    loadApk();
  }

  function closeModal() {
    setShowModal(false);
    setEditId(null);
    setNewName("");
    setNewType("");
    setIsApp(false);
    setIsPCWeb(false);
    setIsMobileWeb(false);
  }

  function closeActionsModal() {
    setShowActionsModal(false);
    setSelectedApk(null);
  }

  const handleActionsClick = (project) => {
  const user = auth.currentUser;

  if (!user) {
    navigate("/login");
    return;
  }

  setSelectedApk(project);
  setShowActionsModal(true);
};

const handleAddClick = () => {
  const user = auth.currentUser;

  if (!user) {
    navigate("/login");
    return;
  }

  setShowModal(true);
};

  return (
    <>
      <div className="page-header">
        <h1 className="page-header-title">Projects</h1>
      </div>

      <div className="page">
        <h2 className="apk-page-title">Available Project List</h2>

        <div className="apk-categories">
          <button className={filter === "App" ? "active" : ""} onClick={() => setFilter("App")}>App</button>
          <button className={filter === "PCweb" ? "active" : ""} onClick={() => setFilter("PCweb")}>PC Web</button>
          <button className={filter === "Mobileweb" ? "active" : ""} onClick={() => setFilter("Mobileweb")}>Mobile Web</button>
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        </div>

        <div className="apk-list">
          {filteredApks.map(apk => (
            <div key={apk.id} className="apk-card">
              <h3>{apk.App}</h3>

              <p><strong>Type:</strong> {apk.Type}</p>
              <p><strong>Date Created:</strong> {apk["Date-created"]?.toDate().toLocaleDateString()}</p>

              <div className="tag-box">
                {apk.isApp && <span className="tag">App</span>}
                {apk.isPCWeb && <span className="tag">PC Web</span>}
                {apk.isMobileWeb && <span className="tag">Mobile Web</span>}
              </div>

              {/* ACTIONS BUTTON */}
              <button className="action-btn" onClick={() => handleActionsClick(apk)}>
                Actions
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ADD BUTTON */}
      <button className="floating-add-btn" onClick={handleAddClick}>+</button>

      {/* EDIT / ADD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editId ? "Edit Project" : "Add New Project"}</h2>

            <input
              type="text"
              placeholder="Project Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Type (ex. School, Personal)"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />

            <label className="chk">
              <input type="checkbox" checked={isApp} onChange={(e) => setIsApp(e.target.checked)} />
              App
            </label>

            <label className="chk">
              <input type="checkbox" checked={isPCWeb} onChange={(e) => setIsPCWeb(e.target.checked)} />
              PC Web
            </label>

            <label className="chk">
              <input type="checkbox" checked={isMobileWeb} onChange={(e) => setIsMobileWeb(e.target.checked)} />
              Mobile Web
            </label>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>
                {editId ? "Save Changes" : "Add Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIONS MODAL */}
      {showActionsModal && selectedApk && (
        <div className="modal-overlay" onClick={closeActionsModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Project Details</h2>

            <p><strong>Name:</strong> {selectedApk.App}</p>
            <p><strong>Type:</strong> {selectedApk.Type}</p>

            <p><strong>Tags:</strong> 
              {selectedApk.isApp && " App "}
              {selectedApk.isPCWeb && " PC Web "}
              {selectedApk.isMobileWeb && " Mobile Web "}
            </p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => {closeActionsModal();}}>Close</button>

              <button
                className="edit-btn"
                onClick={() => {
                  closeActionsModal();
                  openEdit(selectedApk);
                }}
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => {
                  handleDelete(selectedApk.id);
                  closeActionsModal();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
