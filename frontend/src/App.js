import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminReclamations from "./pages/AdminReclamations";
import AjouterReclamation from "./pages/AjouterReclamation";
import AdminClients from "./pages/AdminClients";
import ClientInterface from "./pages/ClientInterface";
import CreerReclamation from "./pages/CreerReclamation";

/**
 * Main App component that handles routing for the application
 * Routes are organized by user type (admin vs client) and functionality
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Client Routes */}
        <Route path="/ClientInterface" element={<ClientInterface />} />
        <Route
          path="/client/reclamation/creer"
          element={<CreerReclamation />}
        />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={<AdminDashboard />} />
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
