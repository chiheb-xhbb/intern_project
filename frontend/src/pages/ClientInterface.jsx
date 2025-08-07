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
  Form,
  InputGroup,
  Dropdown,
  ButtonGroup,
  Collapse,
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
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaSearch,
  FaChevronUp,
  FaChevronDown,
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

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return "Date non disponible";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

// Helper function to parse date for comparison
const parseDate = (dateString) => {
  if (!dateString) return new Date(0);
  return new Date(dateString);
};

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

// Filters Component
const FiltersSection = ({
  filters,
  onFiltersChange,
  onClearFilters,
  filteredCount,
  totalCount,
  showFilters,
  onToggleFilters,
  availableTypes,
}) => {
  const handleStatusChange = (status) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handleTypeChange = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleSortChange = (sortBy, sortOrder) => {
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sortBy !== "date" ||
    filters.sortOrder !== "desc";

  return (
    <Card className="filters-card">
      <Card.Body className="filters-body">
        <div className="filters-header">
          <Button
            variant="link"
            onClick={onToggleFilters}
            className="filters-toggle-btn"
          >
            <h6 className="filters-title">
              <FaFilter className="filters-icon" />
              Filtres et tri
              {showFilters ? (
                <FaChevronUp className="toggle-icon" />
              ) : (
                <FaChevronDown className="toggle-icon" />
              )}
            </h6>
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onClearFilters}
              className="clear-filters-btn"
            >
              <FaTimes className="btn-icon" />
              Effacer
            </Button>
          )}
        </div>

        <Collapse in={showFilters}>
          <div>
            <Row className="filters-content g-3">
              {/* Status Filter */}
              <Col lg={3} md={6}>
                <Form.Label className="filter-label">Statut</Form.Label>
                <div className="status-checkboxes">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <Form.Check
                      key={key}
                      type="checkbox"
                      id={`status-${key}`}
                      label={config.label}
                      checked={filters.statuses.includes(key)}
                      onChange={() => handleStatusChange(key)}
                      className="status-checkbox"
                    />
                  ))}
                </div>
              </Col>

              {/* Type Filter */}
              <Col lg={3} md={6}>
                <Form.Label className="filter-label">
                  Type de réclamation
                </Form.Label>
                <div className="type-checkboxes">
                  {availableTypes.map((type) => (
                    <Form.Check
                      key={type}
                      type="checkbox"
                      id={`type-${type}`}
                      label={type}
                      checked={filters.types.includes(type)}
                      onChange={() => handleTypeChange(type)}
                      className="type-checkbox"
                    />
                  ))}
                  {availableTypes.length === 0 && (
                    <small className="text-muted">Aucun type disponible</small>
                  )}
                </div>
              </Col>

              {/* Date Range Filter */}
              <Col lg={3} md={6}>
                <Form.Label className="filter-label">Période</Form.Label>
                <div className="date-inputs">
                  <Form.Control
                    type="date"
                    size="sm"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, dateFrom: e.target.value })
                    }
                    placeholder="Date de début"
                    className="date-input"
                  />
                  <Form.Control
                    type="date"
                    size="sm"
                    value={filters.dateTo}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, dateTo: e.target.value })
                    }
                    placeholder="Date de fin"
                    className="date-input"
                  />
                </div>
              </Col>

              {/* Sort Options */}
              <Col lg={3} md={6}>
                <Form.Label className="filter-label">Trier par</Form.Label>
                <div className="sort-controls">
                  <Dropdown as={ButtonGroup} className="sort-dropdown">
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      {filters.sortBy === "date" ? "Date" : "Statut"}
                      {filters.sortOrder === "desc" ? (
                        <FaSortAmountDown className="sort-icon" />
                      ) : (
                        <FaSortAmountUp className="sort-icon" />
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => handleSortChange("date", "desc")}
                        active={
                          filters.sortBy === "date" &&
                          filters.sortOrder === "desc"
                        }
                      >
                        <FaSortAmountDown className="dropdown-icon" />
                        Date (récent d'abord)
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleSortChange("date", "asc")}
                        active={
                          filters.sortBy === "date" &&
                          filters.sortOrder === "asc"
                        }
                      >
                        <FaSortAmountUp className="dropdown-icon" />
                        Date (ancien d'abord)
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleSortChange("status", "asc")}
                        active={
                          filters.sortBy === "status" &&
                          filters.sortOrder === "asc"
                        }
                      >
                        <FaSortAmountUp className="dropdown-icon" />
                        Statut (A-Z)
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleSortChange("status", "desc")}
                        active={
                          filters.sortBy === "status" &&
                          filters.sortOrder === "desc"
                        }
                      >
                        <FaSortAmountDown className="dropdown-icon" />
                        Statut (Z-A)
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Col>
            </Row>

            {/* Results Summary */}
            <div className="filters-summary">
              <small className="text-muted">
                <FaSearch className="summary-icon" />
                Affichage de {filteredCount} résultat(s) sur {totalCount}{" "}
                réclamation(s)
                {hasActiveFilters && (
                  <Badge bg="primary" className="active-filters-badge">
                    Filtres actifs
                  </Badge>
                )}
              </small>
            </div>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

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
            {formatDate(reclamation.date)}
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
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    statuses: [],
    types: [],
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableTypes, setAvailableTypes] = useState([]);

  // Modal states
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();

  // Apply filters and sorting
  const applyFilters = useCallback((data, currentFilters) => {
    let filtered = [...data];

    // Status filter
    if (currentFilters.statuses.length > 0) {
      filtered = filtered.filter((rec) =>
        currentFilters.statuses.includes(rec.statut)
      );
    }

    // Type filter
    if (currentFilters.types.length > 0) {
      filtered = filtered.filter((rec) =>
        currentFilters.types.includes(rec.type)
      );
    }

    // Date range filter
    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      filtered = filtered.filter((rec) => parseDate(rec.date) >= fromDate);
    }

    if (currentFilters.dateTo) {
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter((rec) => parseDate(rec.date) <= toDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (currentFilters.sortBy === "date") {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        comparison = dateA - dateB;
      } else if (currentFilters.sortBy === "status") {
        comparison = a.statut.localeCompare(b.statut);
      }

      return currentFilters.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, []);

  // Update filtered reclamations when filters or data change
  useEffect(() => {
    const filtered = applyFilters(reclamations, filters);
    setFilteredReclamations(filtered);
    setPage(1); // Reset to first page when filtering

    // Extract unique types from reclamations
    const uniqueTypes = [
      ...new Set(reclamations.map((rec) => rec.type)),
    ].sort();
    setAvailableTypes(uniqueTypes);
  }, [reclamations, filters, applyFilters]);

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
  const paginated = filteredReclamations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const totalPages = Math.ceil(filteredReclamations.length / PAGE_SIZE);

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

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      statuses: [],
      types: [],
      dateFrom: "",
      dateTo: "",
      sortBy: "date",
      sortOrder: "desc",
    });
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

          {/* Filters Section */}
          {reclamations.length > 0 && (
            <FiltersSection
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              filteredCount={filteredReclamations.length}
              totalCount={reclamations.length}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              availableTypes={availableTypes}
            />
          )}

          {/* Reclamations List */}
          {reclamations.length === 0 ? (
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
          ) : filteredReclamations.length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="empty-state-body">
                <div className="empty-state-content">
                  <FaSearch className="empty-state-icon" />
                  <h5 className="empty-state-title">Aucun résultat trouvé</h5>
                  <p className="empty-state-text">
                    Aucune réclamation ne correspond aux critères de recherche
                  </p>
                  <Button
                    variant="outline-primary"
                    className="empty-state-btn"
                    onClick={handleClearFilters}
                  >
                    <FaTimes className="btn-icon" />
                    Effacer les filtres
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
                {Math.min(page * PAGE_SIZE, filteredReclamations.length)} sur{" "}
                {filteredReclamations.length} résultats
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
                    {formatDate(selectedReclamation.date)}
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
