import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Apk from "./pages/Apk";
import BottomTabs from "./components/BottomTabs";

const firebaseConfig = {
  apiKey: "AIzaSyD9WM_KlPUwYHwh1H9C3AszDWqdW6qObXM",
  authDomain: "javs-apk-listings.firebaseapp.com",
  projectId: "javs-apk-listings",
  storageBucket: "javs-apk-listings.firebasestorage.app",
  messagingSenderId: "518761758332",
  appId: "1:518761758332:web:67dc8eafb6bb274af0d3f9",
  measurementId: "G-5N93N8NGVF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/apk" element={<Apk />} />
        </Routes>

        <BottomTabs />
      </div>
    </BrowserRouter>
  );
}

export default App;
