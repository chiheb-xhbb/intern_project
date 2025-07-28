import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ClientHome from "./pages/ClientHome.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // ← fusion des imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client-home" element={<ClientHome />} />
        <Route path="/dashboard" element={<AdminDashboard />} />{" "}
        {/* ← route fusionnée */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
