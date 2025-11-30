import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../App";
import "./Apk.css";

export default function Apk() {
  const [apks, setApks] = useState([]);

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

  return (
    <>
      <div className="page-header">
        <h1 className="page-header-title">APKs</h1>
      </div>

      <div className="page">
        <h2 className="apk-page-title">Available apks</h2>

        <div className="apk-list">
          {apks.map((apk) => (
            <div key={apk.id} className="apk-card">
              <h3>{apk.App}</h3>
              <p><strong>Type:</strong> {apk.Type}</p>
              <p><strong>Date Created:</strong>{" "}{apk["Date-created"]?.toDate().toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
