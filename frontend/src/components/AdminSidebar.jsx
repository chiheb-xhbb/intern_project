import React from "react";
import { Nav, Navbar, Offcanvas, Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaExclamationTriangle,
  FaUsers,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import "./AdminSidebar.css";

/**
 * Navigation links configuration for the admin sidebar
 * Each link contains the route path, display label, and associated icon
 */
const navLinks = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: FaTachometerAlt,
  },
  {
    to: "/admin/reclamations",
    label: "Réclamations",
    icon: FaExclamationTriangle,
  },
  {
    to: "/admin/clients",
    label: "Clients",
    icon: FaUsers,
  },
];

/**
 * AdminSidebar component - provides navigation for admin users
 * Features a collapsible sidebar with navigation links and logout functionality
 */
const AdminSidebar = () => {
  const navigate = useNavigate();

  /**
   * Handles user logout by clearing local storage and redirecting to login
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Main navbar with toggle button and brand */}
      <Navbar
        bg="white"
        expand={false}
        className="admin-navbar shadow-sm border-bottom"
      >
        <Container fluid className="px-4 d-flex align-items-center">
          {/* Sidebar toggle button */}
          <Navbar.Toggle
            aria-controls="offcanvasNavbar"
            className="me-auto border-0 shadow-none custom-toggle"
          >
            <FaBars size={18} color="#115e8bff" />
          </Navbar.Toggle>
          
          {/* Brand/logo section */}
          <Navbar.Brand className="fw-bold ms-auto admin-brand">
            <img src="/IMAGES/logo.png" alt="Logo" className="brand-logo" />
            Admin Panel
          </Navbar.Brand>
        </Container>

        {/* Collapsible sidebar */}
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="start"
          className="admin-offcanvas"
        >
          {/* Sidebar header with close button */}
          <Offcanvas.Header closeButton className="admin-offcanvas-header">
            <Offcanvas.Title
              id="offcanvasNavbarLabel"
              className="admin-offcanvas-title"
            >
              <img
                src="/IMAGES/logo.png"
                alt="Logo"
                className="offcanvas-logo"
              />
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>

          {/* Sidebar body with navigation links */}
          <Offcanvas.Body className="admin-offcanvas-body">
            <Nav className="flex-column flex-grow-1">
              {/* Main navigation section */}
              <div className="nav-section">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        "admin-nav-link nav-link mb-2 d-flex align-items-center" +
                        (isActive ? " active" : "")
                      }
                    >
                      <IconComponent className="nav-icon me-3" size={16} />
                      <span className="nav-text">{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Logout section at the bottom */}
              <div className="logout-section mt-auto pt-3">
                <div className="logout-divider mb-3"></div>
                <button
                  className="btn logout-btn w-100 d-flex align-items-center justify-content-center"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </>
  );
};

export default AdminSidebar;
