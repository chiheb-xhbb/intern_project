import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

const Login = () => {
  // ===== ÉTATS DU COMPOSANT =====
  const [email, setEmail] = useState(""); // Email de l'utilisateur
  const [motDePasse, setMotDePasse] = useState(""); // Mot de passe de l'utilisateur
  const [error, setError] = useState(""); // Message d'erreur
  const [isLoading, setIsLoading] = useState(false); // État de chargement
  const [showPassword, setShowPassword] = useState(false); // Visibilité du mot de passe
  const navigate = useNavigate(); // Hook pour la navigation

  // ===== GESTIONNAIRE DE CONNEXION =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Démarrer le chargement
    setError(""); // Réinitialiser les erreurs

    try {
      // Envoi de la requête de connexion
      const response = await axios.post("/login", {
        email,
        password: motDePasse,
      });

      const user = response.data.user;

      // Stockage des données utilisateur et du token
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirection selon le rôle de l'utilisateur
      if (user.admin) {
        navigate("/dashboard"); // Page administrateur
      } else if (user.client) {
        navigate("/ClientInterface"); // Page client
      } else {
        setError("Aucun rôle associé à ce compte.");
      }
    } catch (err) {
      // Gestion des erreurs de connexion
      setError(err.response?.data?.message || "Échec de la connexion");
    } finally {
      setIsLoading(false); // Arrêter le chargement
    }
  };

  // ===== BASCULEMENT DE LA VISIBILITÉ DU MOT DE PASSE =====
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ===== RENDU DU COMPOSANT =====
  return (
    <section className="vh-100 login-section" id="login-section">
      <div className="container login-container">
        <div className="row login-row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 login-col">
            {/* Carte principale de connexion */}
            <div className="card shadow-2-strong login-card">
              <div className="card-body login-card-body">
                {/* Logo de l'entreprise */}
                <div className="logo-container">
                  <img
                    src="IMAGES/logo.png"
                    alt="Company Logo"
                    className="company-logo"
                    loading="lazy"
                  />
                </div>

                {/* Formulaire de connexion */}
                <form onSubmit={handleLogin}>
                  {/* Champ Email */}
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

                  {/* Champ Mot de passe */}
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

                    {/* Bouton de basculement de visibilité du mot de passe */}
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
                      {/* Icône œil barré (mot de passe visible) */}
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
                        // Icône œil (mot de passe masqué)
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

                  {/* Options du formulaire */}
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

                  {/* Affichage des erreurs */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Bouton de connexion */}
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
