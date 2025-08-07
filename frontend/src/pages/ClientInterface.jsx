import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Navbar,
  Nav,
  NavDropdown,
  Pagination,
  Modal,
  Badge,
  Spinner,
  Alert,
  Container,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaPlus,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaFileAlt,
  FaDownload,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaSignOutAlt,
  FaUniversity,
} from "react-icons/fa";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "./ClientInterface.css";

// Status configuration with colors and icons
const STATUS_CONFIG = {
  "en attente": {
    label: "En attente",
    variant: "warning",
    icon: FaClock,
  },
  "en cours": {
    label: "En cours",
    variant: "info",
    icon: FaSpinner,
  },
  résolue: {
    label: "Résolue",
    variant: "success",
    icon: FaCheckCircle,
  },
  rejetée: {
    label: "Rejetée",
    variant: "danger",
    icon: FaTimesCircle,
  },
  clôturée: {
    label: "Clôturée",
    variant: "secondary",
    icon: FaLock,
  },
};

const PAGE_SIZE = 6;

// Helper function to map API data
const mapReclamationData = (apiData) => ({
  id: apiData.id,
  type: apiData.type_reclamation,
  statut: apiData.statut,
  compte_bancaire: apiData.compte_bancaire?.numero_compte || "-",
  date: apiData.date_reception ? apiData.date_reception.slice(0, 10) : "",
  description: apiData.description || "",
  pieces_jointes: apiData.pieces_jointes || [],
});

// Client Navbar Component
const ClientNavbar = ({ clientName, onLogout }) => (
  <Navbar className="client-navbar" expand="lg">
    <Container fluid>
      <Navbar.Brand className="navbar-brand-custom">
        <FaUniversity className="brand-icon" />
        <span className="brand-text">Banque de l'Habitat</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />

      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <NavDropdown
            title={
              <span className="user-dropdown-title">
                <FaUser className="user-icon" />
                {clientName || "Client"}
              </span>
            }
            id="user-dropdown"
            align="end"
            className="user-dropdown"
          >
            <NavDropdown.Item onClick={onLogout} className="logout-item">
              <FaSignOutAlt className="logout-icon" />
              Déconnexion
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

// Reclamation Card Component
const ReclamationCard = ({ reclamation, onViewDetails }) => {
  const config = STATUS_CONFIG[reclamation.statut];
  const IconComponent = config?.icon || FaClock;

  return (
    <Card className="reclamation-card">
      <Card.Body className="reclamation-card-body">
        <div className="card-header-section">
          <div className="card-id-section">
            <h6 className="card-id">Réclamation #{reclamation.id}</h6>
            <Badge bg="light" text="dark" className="type-badge">
              {reclamation.type}
            </Badge>
          </div>
          <Badge bg={config?.variant || "secondary"} className="status-badge">
            <IconComponent className="status-icon" />
            {config?.label || reclamation.statut}
          </Badge>
        </div>

        <div className="card-meta-section">
          <small className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            {reclamation.date || "Date non disponible"}
          </small>
          <small className="meta-item">
            <FaTag className="meta-icon" />
            Compte: {reclamation.compte_bancaire}
          </small>
        </div>

        <p className="card-description">
          {reclamation.description || "Aucune description fournie"}
        </p>

        <div className="card-footer-section">
          <small className="attachments-count">
            {reclamation.pieces_jointes?.length || 0} pièce(s) jointe(s)
          </small>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onViewDetails(reclamation)}
            className="details-btn"
          >
            <FaEye className="btn-icon" />
            Détails
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const ClientInterface = () => {
  // Main states
  const [reclamations, setReclamations] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");

  // Modal states
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();

  // Fetch client data
  const fetchClientData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.data;
      setClientName(
        `${userData.personne?.nom || ""} ${
          userData.personne?.prenom || ""
        }`.trim()
      );
    } catch (err) {
      console.error("Erreur lors du chargement des données client:", err);
      setClientName("Client");
    }
  }, []);

  // Fetch reclamations
  const fetchReclamations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get("/reclamations/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data.data.map(mapReclamationData);
      setReclamations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réclamations:", err);
      if (err.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        handleLogout();
      } else {
        setError("Erreur lors du chargement de vos réclamations");
      }
      setReclamations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchClientData();
    fetchReclamations();
  }, [fetchClientData, fetchReclamations]);

  // Pagination
  const paginated = reclamations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const totalPages = Math.ceil(reclamations.length / PAGE_SIZE);

  // Event handlers
  const handleViewDetails = (reclamation) => {
    setSelectedReclamation(reclamation);
    setShowDetails(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Déconnexion réussie");
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <ClientNavbar clientName={clientName} onLogout={handleLogout} />
        <div className="client-interface">
          <Container className="py-4">
            <div className="loading-container">
              <div className="loading-content">
                <Spinner animation="border" variant="primary" />
                <p className="loading-text">
                  Chargement de vos réclamations...
                </p>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <ClientNavbar clientName={clientName} onLogout={handleLogout} />

      <div className="client-interface">
        <Container className="py-4">
          {/* Header */}
          <div className="page-header-client">
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title-client">
                  <FaFileAlt className="title-icon" />
                  Mes Réclamations
                </h1>
                <p className="page-subtitle-client">
                  Consultez et suivez l'état de vos réclamations
                </p>
              </div>
              <Button
                variant="primary"
                className="create-btn"
                onClick={() => navigate("/client/reclamations/nouvelle")}
              >
                <FaPlus className="btn-icon" />
                Créer une réclamation
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="error-alert"
            >
              {error}
            </Alert>
          )}

          {/* Reclamations List */}
          {paginated.length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="empty-state-body">
                <div className="empty-state-content">
                  <FaFileAlt className="empty-state-icon" />
                  <h5 className="empty-state-title">
                    Aucune réclamation trouvée
                  </h5>
                  <p className="empty-state-text">
                    Vous n'avez pas encore créé de réclamation
                  </p>
                  <Button
                    variant="primary"
                    className="empty-state-btn"
                    onClick={() => navigate("/client/reclamations/nouvelle")}
                  >
                    <FaPlus className="btn-icon" />
                    Créer ma première réclamation
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <div className="reclamations-grid">
              <Row className="g-4">
                {paginated.map((reclamation) => (
                  <Col key={reclamation.id} md={6} lg={4}>
                    <ReclamationCard
                      reclamation={reclamation}
                      onViewDetails={handleViewDetails}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
                {Math.min(page * PAGE_SIZE, reclamations.length)} sur{" "}
                {reclamations.length} résultats
              </div>
              <Pagination className="custom-pagination">
                <Pagination.First
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                />
                <Pagination.Prev
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === page}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                />
                <Pagination.Last
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Container>
      </div>

      {/* Details Modal */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        centered
        size="lg"
        className="details-modal"
      >
        <Modal.Header closeButton className="details-modal-header">
          <Modal.Title className="details-modal-title">
            <FaFileAlt className="modal-title-icon" />
            Détails de la réclamation #{selectedReclamation?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="details-modal-body">
          {selectedReclamation && (
            <Row className="details-content g-4">
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaTag className="label-icon" />
                    ID de la réclamation
                  </label>
                  <div className="detail-value">#{selectedReclamation.id}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Type de réclamation</label>
                  <div className="detail-value">
                    <Badge bg="primary">{selectedReclamation.type}</Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Statut actuel</label>
                  <div className="detail-value">
                    <Badge
                      bg={STATUS_CONFIG[selectedReclamation.statut]?.variant}
                    >
                      {STATUS_CONFIG[selectedReclamation.statut]?.label}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaCalendarAlt className="label-icon" />
                    Date de réception
                  </label>
                  <div className="detail-value">
                    {selectedReclamation.date || "Date non disponible"}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Numéro de compte</label>
                  <div className="detail-value">
                    {selectedReclamation.compte_bancaire}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">Description</label>
                  <div className="detail-value description-value">
                    {selectedReclamation.description ||
                      "Aucune description fournie"}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaFileAlt className="label-icon" />
                    Pièces jointes
                  </label>
                  <div className="detail-value">
                    {selectedReclamation.pieces_jointes?.length > 0 ? (
                      <div className="attachments-container">
                        {selectedReclamation.pieces_jointes.map((pj, index) => (
                          <div key={index} className="attachment-item">
                            <FaDownload className="attachment-icon" />
                            <a
                              href={`http://localhost:8000/api/pieces/download/${pj.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="attachment-link"
                            >
                              {pj.description || `Fichier ${index + 1}`}
                            </a>
                            <small className="attachment-info">
                              ({pj.type_fichier},{" "}
                              {Math.round(pj.taille_fichier / 1024)} Ko)
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="no-attachments">
                        Aucune pièce jointe
                      </span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="details-modal-footer">
          <Button
            variant="outline-primary"
            onClick={() => setShowDetails(false)}
            className="close-modal-btn"
          >
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ClientInterface;
