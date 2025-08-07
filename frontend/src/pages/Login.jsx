import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login", {
        email,
        password: motDePasse,
      });
      const user = response.data.user;
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.admin) {
        navigate("/dashboard"); // page admin
      } else if (user.client) {
        navigate("/ClientInterface"); // page client
      } else {
        setError("Aucun rôle associé.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Échec de connexion");
    }
  };

  return (
    <section
      className="vh-100"
      style={{ backgroundColor: "#4e4949ff" }}
      id="login-section"
    >
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div
              className="card shadow-2-strong"
              style={{ borderRadius: "1rem" }}
            >
              <div className="card-body p-5 text-center">
                <img
                  src="IMAGES/logo.png"
                  alt="Company Logo"
                  style={{
                    width: "45%",
                    objectFit: "contain",
                    marginBottom: "2rem",
                  }}
                />
                <form onSubmit={handleLogin}>
                  <div className="form-floating mb-4">
                    <input
                      type="email"
                      id="typeEmailX-2"
                      className="form-control form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder=" "
                    />
                    <label htmlFor="typeEmailX-2">Email</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      id="typePasswordX-2"
                      className="form-control form-control"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      placeholder=" "
                    />
                    <label htmlFor="typePasswordX-2">Password</label>
                  </div>
                  <div className="form-check d-flex justify-content-start mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkb1"
                    />
                    <label className="form-check-label ms-2" htmlFor="checkb1">
                      Remember password
                    </label>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button
                    style={{ backgroundColor: "#ce1313ff" }}
                    className="btn btn-primary btn-lg btn-block w-100"
                    type="submit"
                  >
                    Login
                  </button>
                  <hr className="my-4" />
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
