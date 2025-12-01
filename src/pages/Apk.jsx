import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../App";
import "./Apk.css";

export default function Apk() {
  const [apks, setApks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function displayApk() {
      const querySnapshot = await getDocs(collection(db, "apk"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApks(data);
    }

    displayApk();
  }, []);

  const filteredApks =
    filter === "all" ? apks : apks.filter((apk) => apk.Type === filter);

  return (
    <>
      <div className="page-header">
        <h1 className="page-header-title">APKs</h1>
      </div>

      <div className="page">
        <h2 className="apk-page-title">Available APKs</h2>

        {/* CATEGORY FILTER */}
        <div className="apk-categories">
          <button
            className={filter === "App" ? "active" : ""}
            onClick={() => setFilter("App")}
          >
            App
          </button>

          <button
            className={filter === "PC web" ? "active" : ""}
            onClick={() => setFilter("PC web")}
          >
            PC Web
          </button>

          <button
            className={filter === "Mobile web" ? "active" : ""}
            onClick={() => setFilter("Mobile web")}
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

        <div className="apk-list">
          {filteredApks.map((apk) => (
            <div key={apk.id} className="apk-card">
              <h3>{apk.App}</h3>
              <p>
                <strong>Type:</strong> {apk.Type}
              </p>
              <p>
                <strong>Date Created:</strong>{" "}
                {apk["Date-created"]?.toDate().toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
