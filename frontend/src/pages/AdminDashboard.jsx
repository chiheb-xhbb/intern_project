import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import axios from "../api/axios";
import AdminSidebar from "../components/AdminSidebar";

const statusLabels = [
  { key: "en attente", label: "En attente" },
  { key: "en cours", label: "En cours" },
  { key: "résolue", label: "Résolue" },
  { key: "rejetée", label: "Rejetée" },
  { key: "clôturée", label: "Clôturée" },
];

// Couleurs pour le graphique
const COLORS = {
  "en attente": "#ffc107",
  "en cours": "#17a2b8",
  résolue: "#28a745",
  rejetée: "#dc3545",
  clôturée: "#6c757d",
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
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
        const response = await axios.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stats = response.data.stats;
        setStats({
          clients: stats.total_clients,
          reclamations: {
            "en attente": stats.pending_count,
            "en cours": stats.in_progress_count,
            résolue: stats.resolved_count,
            rejetée: stats.rejected_count,
            clôturée: stats.closed_count,
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

  // Préparer les données pour le graphique
  const chartData = statusLabels
    .map((status) => ({
      name: status.label,
      value: stats.reclamations[status.key],
      color: COLORS[status.key],
    }))
    .filter((item) => item.value > 0); // Filtrer les valeurs nulles

  // Fonction pour personnaliser le tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border rounded p-2 shadow">
          <p className="mb-1 fw-bold">{data.name}</p>
          <p className="mb-0 text-primary">
            {data.value} réclamation{data.value > 1 ? "s" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <AdminSidebar />
      <div className="container py-4">
        <h2 className="mb-4 fw-bold" style={{ color: "#115e8bff" }}>
          Tableau de bord Admin
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Clients</Card.Title>
                {loading ? (
                  <Skeleton height={30} width={60} />
                ) : (
                  <h3>{stats.clients}</h3>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Réclamations (Total)</Card.Title>
                {loading ? (
                  <Skeleton height={30} width={60} />
                ) : (
                  <h3>
                    {Object.values(stats.reclamations).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </h3>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {statusLabels.map((status) => (
            <Col md={2} xs={6} className="mb-3" key={status.key}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Subtitle
                    className="mb-2"
                    style={{ color: "#115e8bff" }}
                  >
                    {status.label}
                  </Card.Subtitle>
                  {loading ? (
                    <Skeleton height={24} width={40} />
                  ) : (
                    <span className="fw-bold">
                      {stats.reclamations[status.key]}
                    </span>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Section graphique */}
        <div className="mt-5">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0 fw-bold" style={{ color: "#115e8bff" }}>
                Répartition des réclamations par statut
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "400px" }}
                >
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </Spinner>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>Aucune réclamation à afficher</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
