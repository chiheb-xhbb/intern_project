import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

/**
 * Login component - handles user authentication
 * Supports both admin and client user types with role-based redirection
 */
const Login = () => {
  // ===== STATE MANAGEMENT =====
  const [email, setEmail] = useState(""); // User email input
  const [motDePasse, setMotDePasse] = useState(""); // User password input
  const [error, setError] = useState(""); // Error message display
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const navigate = useNavigate(); // Navigation hook

  // ===== AUTHENTICATION HANDLER =====
  /**
   * Handles the login form submission
   * Authenticates user and redirects based on role
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Send login request to API
      const response = await axios.post("/login", {
        email,
        password: motDePasse,
      });

      const user = response.data.user;

      // Store user data and token in localStorage
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on user role
      if (user.admin) {
        navigate("/dashboard"); // Admin dashboard
      } else if (user.client) {
        navigate("/ClientInterface"); // Client interface
      } else {
        setError("Aucun rôle associé à ce compte.");
      }
    } catch (err) {
      // Handle login errors
      setError(err.response?.data?.message || "Échec de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== PASSWORD VISIBILITY TOGGLE =====
  /**
   * Toggles password field visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ===== COMPONENT RENDER =====
  return (
    <section className="vh-100 login-section" id="login-section">
      <div className="container login-container">
        <div className="row login-row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 login-col">
            {/* Main login card */}
            <div className="card shadow-2-strong login-card">
              <div className="card-body login-card-body">
                {/* Company logo */}
                <div className="logo-container">
                  <img
                    src="IMAGES/logo.png"
                    alt="Company Logo"
                    className="company-logo"
                    loading="lazy"
                  />
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin}>
                  {/* Email input field */}
                  <div className="form-floating mb-4">
                    <input
                      type="email"
                      id="typeEmailX-2"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder=" "
                    />
                    <label htmlFor="typeEmailX-2">Email</label>
                  </div>

                  {/* Password input field with visibility toggle */}
                  <div className="form-floating mb-4 password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="typePasswordX-2"
                      className="form-control"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      placeholder=" "
                    />
                    <label htmlFor="typePasswordX-2">Mot de passe</label>

                    {/* Password visibility toggle button */}
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {/* Eye icon (password hidden) */}
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        // Eye slash icon (password visible)
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Form options */}
                  <div className="form-options">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Se souvenir du mot de passe
                      </label>
                    </div>
                  </div>

                  {/* Error message display */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    className={`login-button ${isLoading ? "loading" : ""}`}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        Connexion en cours...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
