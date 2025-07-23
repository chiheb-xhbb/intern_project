import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
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
      console.log("Login success:", response.data);
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");// redirect to dashboard or home page
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Échec de connexion");
    }

  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default Login;
