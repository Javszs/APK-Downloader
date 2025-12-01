import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../App";
import "./Apk.css";

export default function Apk() {
  const [apks, setApks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");

  // booleans
  const [isApp, setIsApp] = useState(false);
  const [isPCWeb, setIsPCWeb] = useState(false);
  const [isMobileWeb, setIsMobileWeb] = useState(false);

  useEffect(() => {
    async function loadApk() {
      const querySnapshot = await getDocs(collection(db, "apk"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApks(data);
    }
    loadApk();
  }, []);

  // FILTER LOGIC BASED ON BOOLEAN FLAGS
  const filteredApks = apks.filter(apk => {
    if (filter === "all") return true;
    if (filter === "App") return apk.isApp;
    if (filter === "PCweb") return apk.isPCWeb;
    if (filter === "Mobileweb") return apk.isMobileWeb;
    return true;
  });

  // ADD NEW PROJECT
  async function handleAddProject() {
    if (!newName || !newType) {
      alert("Please fill all fields");
      return;
    }

    await addDoc(collection(db, "apk"), {
      App: newName,
      Type: newType,
      isApp,
      isPCWeb,
      isMobileWeb,
      "Date-created": new Date(),
    });

    setShowModal(false);

    // reset fields
    setNewName("");
    setNewType("");
    setIsApp(false);
    setIsPCWeb(false);
    setIsMobileWeb(false);

    // reload list
    const querySnapshot = await getDocs(collection(db, "apk"));
    setApks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header-title">Projects</h1>
      </div>

      <div className="page">
        <h2 className="apk-page-title">Available Project List</h2>

        {/* CATEGORY FILTER */}
        <div className="apk-categories">
          <button
            className={filter === "App" ? "active" : ""}
            onClick={() => setFilter("App")}
          >
            App
          </button>

          <button
            className={filter === "PCweb" ? "active" : ""}
            onClick={() => setFilter("PCweb")}
          >
            PC Web
          </button>

          <button
            className={filter === "Mobileweb" ? "active" : ""}
            onClick={() => setFilter("Mobileweb")}
          >
            Mobile Web
          </button>

          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>

        {/* APK LIST */}
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
              
            </div>
          ))}
        </div>
      </div>

      {/* Floating button */}
      <button className="floating-add-btn" onClick={() => setShowModal(true)}>
        +
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Project</h2>

            <input
              type="text"
              placeholder="Project Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Type (ex. School, Personal)"
              value={newType}
              onChange={e => setNewType(e.target.value)}
            />

            <label className="chk">
              <input
                type="checkbox"
                checked={isApp}
                onChange={(e) => setIsApp(e.target.checked)}
              />
              App
            </label>

            <label className="chk">
              <input
                type="checkbox"
                checked={isPCWeb}
                onChange={(e) => setIsPCWeb(e.target.checked)}
              />
              PC  
            </label>

            <label className="chk">
              <input
                type="checkbox"
                checked={isMobileWeb}
                onChange={(e) => setIsMobileWeb(e.target.checked)}
              />
              Mobile Web
            </label>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleAddProject}>Add Project</button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
