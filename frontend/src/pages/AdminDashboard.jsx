import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
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
import {
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaChartPie,
} from "react-icons/fa";
import axios from "../api/axios";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminDashboard.css";

// Configuration des statuts avec icônes et couleurs
const statusConfig = [
  {
    key: "en attente",
    label: "En attente",
    icon: FaClock,
    color: "#ffc107",
    bgColor: "#fff3cd",
    textColor: "#856404",
  },
  {
    key: "en cours",
    label: "En cours",
    icon: FaSpinner,
    color: "#17a2b8",
    bgColor: "#d1ecf1",
    textColor: "#0c5460",
  },
  {
    key: "résolue",
    label: "Résolue",
    icon: FaCheckCircle,
    color: "#28a745",
    bgColor: "#d4edda",
    textColor: "#155724",
  },
  {
    key: "rejetée",
    label: "Rejetée",
    icon: FaTimesCircle,
    color: "#dc3545",
    bgColor: "#f8d7da",
    textColor: "#721c24",
  },
  {
    key: "clôturée",
    label: "Clôturée",
    icon: FaLock,
    color: "#6c757d",
    bgColor: "#e2e3e5",
    textColor: "#383d41",
  },
];

// Composant pour les cartes de statistiques
const StatCard = ({
  title,
  value,
  icon: Icon,
  loading,
  color = "#115e8bff",
  bgGradient,
}) => (
  <Card className="stat-card h-100 border-0 shadow-sm">
    <Card.Body className="d-flex align-items-center p-4">
      <div
        className="stat-icon-wrapper me-3"
        style={{
          background:
            bgGradient || `linear-gradient(135deg, ${color}15, ${color}25)`,
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
      <div className="flex-grow-1">
        <Card.Title className="stat-title mb-1">{title}</Card.Title>
        {loading ? (
          <Skeleton height={32} width={80} />
        ) : (
          <div className="stat-value" style={{ color: color }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
        )}
      </div>
    </Card.Body>
  </Card>
);

// Composant pour les cartes de statut
const StatusCard = ({ status, value, loading }) => {
  const { label, icon: Icon, color, bgColor, textColor } = status;

  return (
    <Card className="status-card h-100 border-0 shadow-sm">
      <Card.Body className="text-center p-3">
        <div
          className="status-icon-wrapper mx-auto mb-2"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={20} style={{ color: color }} />
        </div>
        <Card.Subtitle
          className="status-label mb-2"
          style={{ color: textColor }}
        >
          {label}
        </Card.Subtitle>
        {loading ? (
          <Skeleton height={28} width={40} />
        ) : (
          <div className="status-value" style={{ color: color }}>
            {value}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Composant pour le spinner de chargement
const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <Spinner animation="border" variant="primary" />
    <p className="mt-3 text-muted">Chargement des données...</p>
  </div>
);

// Composant pour le tooltip personnalisé
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="custom-tooltip">
        <div
          className="tooltip-header"
          style={{ borderColor: data.payload.color }}
        >
          <strong>{data.name}</strong>
        </div>
        <div className="tooltip-content">
          <span className="tooltip-value">{data.value}</span>
          <span className="tooltip-text">
            réclamation{data.value > 1 ? "s" : ""}
          </span>
          <div className="tooltip-percentage">
            ({((data.value / data.payload.total) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>
    );
  }
  return null;
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
      setError("");

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
        console.error("Erreur lors du chargement des statistiques:", err);
        setError(
          "Erreur lors du chargement des statistiques. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    } else {
      setError("Token d'authentification manquant.");
      setLoading(false);
    }
  }, [token]);

  // Calculer le total des réclamations
  const totalReclamations = Object.values(stats.reclamations).reduce(
    (a, b) => a + b,
    0
  );

  // Préparer les données pour le graphique
  const chartData = statusConfig
    .map((status) => ({
      name: status.label,
      value: stats.reclamations[status.key],
      color: status.color,
      total: totalReclamations,
    }))
    .filter((item) => item.value > 0);

  return (
    <>
      <AdminSidebar />
      <div className="admin-dashboard">
        <div className="container-fluid py-4">
          {/* Header */}
          <div className="dashboard-header mb-4">
            <h1 className="dashboard-title">
              <FaChartPie className="me-3" />
              Tableau de bord Admin
            </h1>
            <p className="dashboard-subtitle">
              Vue d'ensemble des statistiques et métriques clés
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              className="mb-4"
              dismissible
              onClose={() => setError("")}
            >
              <Alert.Heading>Erreur</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          )}

          {/* Main Statistics Cards */}
          <Row className="mb-5">
            <Col lg={4} md={6} className="mb-4">
              <StatCard
                title="Total Clients"
                value={stats.clients}
                icon={FaUsers}
                loading={loading}
                color="#115e8bff"
                bgGradient="linear-gradient(135deg, #115e8b15, #115e8b25)"
              />
            </Col>
            <Col lg={4} md={6} className="mb-4">
              <StatCard
                title="Total Réclamations"
                value={totalReclamations}
                icon={FaExclamationTriangle}
                loading={loading}
                color="#e74c3c"
                bgGradient="linear-gradient(135deg, #e74c3c15, #e74c3c25)"
              />
            </Col>
            <Col lg={4} md={12} className="mb-4">
              <StatCard
                title="Taux de Résolution"
                value={
                  totalReclamations > 0
                    ? `${(
                        (stats.reclamations.résolue / totalReclamations) *
                        100
                      ).toFixed(1)}%`
                    : "0%"
                }
                icon={FaCheckCircle}
                loading={loading}
                color="#27ae60"
                bgGradient="linear-gradient(135deg, #27ae6015, #27ae6025)"
              />
            </Col>
          </Row>

          {/* Status Cards */}
          <div className="section-header mb-4">
            <h3 className="section-title">Répartition par Statut</h3>
            <p className="section-subtitle">
              Détail des réclamations selon leur état actuel
            </p>
          </div>

          <Row className="mb-5">
            {statusConfig.map((status) => (
              <Col lg={2} md={4} sm={6} className="mb-3" key={status.key}>
                <StatusCard
                  status={status}
                  value={stats.reclamations[status.key]}
                  loading={loading}
                />
              </Col>
            ))}
          </Row>

          {/* Chart Section */}
          <div className="section-header mb-4">
            <h3 className="section-title">Analyse Graphique</h3>
            <p className="section-subtitle">
              Visualisation de la répartition des réclamations
            </p>
          </div>

          <Card className="chart-card border-0 shadow-sm">
            <Card.Header className="chart-header">
              <div className="d-flex align-items-center">
                <FaChartPie className="me-2" style={{ color: "#115e8bff" }} />
                <h5 className="mb-0">
                  Répartition des réclamations par statut
                </h5>
              </div>
            </Card.Header>
            <Card.Body className="chart-body">
              {loading ? (
                <LoadingSpinner />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontWeight: 500 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <FaExclamationTriangle size={48} className="mb-3" />
                  <h5>Aucune donnée disponible</h5>
                  <p className="text-muted">
                    Aucune réclamation n'a été trouvée pour générer le
                    graphique.
                  </p>
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
