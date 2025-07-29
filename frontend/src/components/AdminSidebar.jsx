import React from "react";
import { Nav, Navbar, Offcanvas, Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/admin/reclamations", label: "Réclamations" },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/comptes", label: "Comptes Bancaires" },
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
          <Navbar.Brand
            className="fw-bold ms-auto"
            style={{ color: "#115e8bff" }}
          >
            <img
              src="/IMAGES/logo.png"
              alt="Logo"
              style={{ height: 32, marginRight: 8, verticalAlign: "middle" }}
            />
            Admin Panel
          </Navbar.Brand>
        </Container>
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "admin-nav-link nav-link mb-2" + (isActive ? " active fw-bold" : "")
                  }
                  style={({ isActive }) =>
                    isActive ? { color: "#115e8bff" } : {}
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr />
              <button
                className="btn btn-outline-danger w-100"
                onClick={handleLogout}
              >
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