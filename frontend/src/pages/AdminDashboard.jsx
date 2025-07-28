import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axios from "../api/axios";
import AdminSidebar from "../components/AdminSidebar";

const statusLabels = [
  { key: "en attente", label: "En attente" },
  { key: "en cours", label: "En cours" },
  { key: "résolue", label: "Résolue" },
  { key: "rejetée", label: "Rejetée" },
  { key: "clôturée", label: "Clôturée" },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
    comptes: 0,
    reclamations: {
      "en attente": 0,
      "en cours": 0,
      résolue: 0,
      rejetée: 0,
      clôturée: 0,
    },
  });
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        const stats = response.data.stats;
        setStats({
          clients: stats.total_clients,
          comptes: 0, // Not provided by backend, set to 0 or fetch separately if needed
          reclamations: {
            "en attente": stats.pending_count,
            "en cours": stats.in_progress_count,
            résolue: stats.resolved_today,
            rejetée: 0, // Not provided by backend
            clôturée: 0, // Not provided by backend
          },
        });
      } catch (err) {
        setError("Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <>
      <AdminSidebar />
      <div className="container py-4">
        <h2 className="mb-4 fw-bold text-primary">Tableau de bord Admin</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Clients</Card.Title>
                {loading ? <Skeleton height={30} width={60} /> : <h3>{stats.clients}</h3>}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Réclamations (Total)</Card.Title>
                {loading ? <Skeleton height={30} width={60} /> : <h3>{Object.values(stats.reclamations).reduce((a, b) => a + b, 0)}</h3>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          {statusLabels.map((status) => (
            <Col md={2} xs={6} className="mb-3" key={status.key}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Subtitle className="mb-2 text-muted">{status.label}</Card.Subtitle>
                  {loading ? <Skeleton height={24} width={40} /> : <span className="fw-bold">{stats.reclamations[status.key]}</span>}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {/* Placeholder for future charts */}
        <div className="mt-5">
          <Card className="p-4 text-center">
            <span className="text-muted">[Graphiques/statistiques à venir]</span>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard; 