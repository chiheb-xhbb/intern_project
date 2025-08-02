import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ClientHome from "./pages/ClientHome.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // ← fusion des imports
import AdminReclamations from "./pages/AdminReclamations";
import AjouterReclamation from "./pages/AjouterReclamation";
import AdminClients from "./pages/AdminClients";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client-home" element={<ClientHome />} />
        <Route path="/dashboard" element={<AdminDashboard />} />{" "}
        {/* ← route fusionnée */}
        <Route path="/admin/reclamations" element={<AdminReclamations />} />
        <Route
          path="/admin/reclamations/ajouter"
          element={<AjouterReclamation />}
        />
        <Route path="/admin/clients" element={<AdminClients />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
