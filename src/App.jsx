import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Apk from "./pages/Apk";
import BottomTabs from "./components/BottomTabs";

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
