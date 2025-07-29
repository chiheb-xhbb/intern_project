import React from "react";
import { Nav, Navbar, Offcanvas, Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/comptes", label: "Comptes Bancaires" },
  { to: "/admin/reclamations", label: "Réclamations" },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="light" expand={false} className="mb-4 shadow-sm">
        <Container fluid className="px-3 d-flex align-items-center">
          <Navbar.Toggle aria-controls="offcanvasNavbar" className="me-auto" />
          <Navbar.Brand className="fw-bold ms-auto" href="#" style={{ color: '#ce1313ff' }}>
            Admin Panel
          </Navbar.Brand>
        </Container>
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "nav-link mb-2" + (isActive ? " active fw-bold" : "")
                  }
                  style={({ isActive }) => isActive ? { color: '#ce1313ff' } : {}}
                >
                  {link.label}
                </NavLink>
              ))}
              <hr />
              <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                Logout
              </button>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </>
  );
};

export default AdminSidebar; 