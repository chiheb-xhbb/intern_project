import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ClientHome from "./pages/ClientHome.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client-home" element={<ClientHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
