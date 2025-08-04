import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Form, 
  Dropdown, 
  Pagination, 
  InputGroup,
  Modal,
  Badge,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Alert
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
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
  FaExclamationTriangle
} from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "./AdminReclamations.css";
import { createPortal } from "react-dom";
// Configuration des statuts avec couleurs et icônes
const STATUS_CONFIG = {
  "en attente": {
    label: "En attente",
    variant: "warning",
    color: "#ffc107",
    icon: FaClock,
    bgColor: "#fff3cd"
  },
  "en cours": {
    label: "En cours", 
    variant: "info",
    color: "#17a2b8",
    icon: FaSpinner,
    bgColor: "#d1ecf1"
  },
  "résolue": {
    label: "Résolue",
    variant: "success", 
    color: "#28a745",
    icon: FaCheckCircle,
    bgColor: "#d4edda"
  },
  "rejetée": {
    label: "Rejetée",
    variant: "danger",
    color: "#dc3545", 
    icon: FaTimesCircle,
    bgColor: "#f8d7da"
  },
  "clôturée": {
    label: "Clôturée",
    variant: "secondary",
    color: "#6c757d",
    icon: FaLock,
    bgColor: "#e2e3e5"
  }
};

const STATUS_OPTIONS = Object.keys(STATUS_CONFIG);
const PAGE_SIZE = 8;

// Fonction helper pour mapper les données de l'API
const mapReclamationData = (apiData) => ({
  id: apiData.id,
  client: apiData.client?.personne 
    ? `${apiData.client.personne.nom} ${apiData.client.personne.prenom}`
    : "-",
  type: apiData.type_reclamation,
  statut: apiData.statut,
  compte_bancaire: apiData.compte_bancaire?.numero_compte || "-",
  date: apiData.date_reception ? apiData.date_reception.slice(0, 10) : "",
  description: apiData.description || "",
  pieces_jointes: apiData.pieces_jointes || [],
});

// Fonction helper pour calculer les statistiques
const calculateStatusStats = (reclamations) => {
  const stats = {};
  STATUS_OPTIONS.forEach(status => stats[status] = 0);
  reclamations.forEach(r => {
    if (stats.hasOwnProperty(r.statut)) {
      stats[r.statut]++;
    }
  });
  return stats;
};

// Composant pour les cartes de statistiques
const StatusCard = ({ status, count, onClick }) => {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;
  
  return (
    <Card 
      className="status-overview-card h-100 border-0 shadow-sm"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Card.Body className="p-3 text-center">
        <div 
          className="status-icon-wrapper mx-auto mb-2"
          style={{ backgroundColor: config.bgColor }}
        >
          <IconComponent style={{ color: config.color }} size={20} />
        </div>
        <Card.Subtitle className="status-card-label mb-2">
          {config.label}
        </Card.Subtitle>
        <Badge 
          bg={config.variant} 
          className="status-count-badge"
        >
          {count}
        </Badge>
      </Card.Body>
    </Card>
  );
};

// Composant pour le badge de statut avec positionnement dynamique
const StatusBadge = ({
  status,
  onStatusChange,
  disabled = false,
  rowIndex = 0,
}) => {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle dropdown toggle and row z-index
  const handleToggle = (isOpening) => {
    setIsOpen(isOpening);

    // Add/remove class to parent row for z-index management
    const tableRow = dropdownRef.current?.closest(".table-row");
    if (tableRow) {
      if (isOpening) {
        tableRow.classList.add("dropdown-open");
      } else {
        tableRow.classList.remove("dropdown-open");
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const tableRow = dropdownRef.current?.closest(".table-row");
      if (tableRow) {
        tableRow.classList.remove("dropdown-open");
      }
    };
  }, []);

  return (
    <div className="status-dropdown-container" ref={dropdownRef}>
      <Dropdown
        onSelect={onStatusChange}
        disabled={disabled}
        autoClose="outside"
        show={isOpen}
        onToggle={handleToggle}
      >
        <Dropdown.Toggle
          variant={config.variant}
          size="sm"
          className="status-dropdown-toggle d-flex align-items-center"
          disabled={disabled}
        >
          <IconComponent className="me-1" size={12} />
          {config.label}
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="status-dropdown-menu"
          popperConfig={{
            strategy: "fixed", // Use fixed positioning
            modifiers: [
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport",
                  padding: 8,
                },
              },
              {
                name: "flip",
                options: {
                  fallbackPlacements: [
                    "bottom",
                    "top",
                    "bottom-start",
                    "top-start",
                  ],
                },
              },
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
            ],
          }}
          renderOnMount={true}
          flip={true}
        >
          {STATUS_OPTIONS.map((statusKey) => {
            const statusConfig = STATUS_CONFIG[statusKey];
            const StatusIcon = statusConfig.icon;
            return (
              <Dropdown.Item
                key={statusKey}
                eventKey={statusKey}
                active={statusKey === status}
                className="d-flex align-items-center"
              >
                <StatusIcon
                  className="me-2"
                  size={12}
                  style={{ color: statusConfig.color }}
                />
                {statusConfig.label}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

// Composant pour les boutons d'action
const ActionButtons = ({ reclamation, onView, onDelete }) => (
  <div className="action-buttons d-flex gap-2">
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>Voir les détails</Tooltip>}
    >
      <Button
        variant="outline-primary"
        size="sm"
        className="action-btn view-btn"
        onClick={() => onView(reclamation)}
      >
        <FaEye />
      </Button>
    </OverlayTrigger>
    
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>Supprimer la réclamation</Tooltip>}
    >
      <Button
        variant="outline-danger"
        size="sm"
        className="action-btn delete-btn"
        onClick={() => onDelete(reclamation.id)}
      >
        <FaTrash />
      </Button>
    </OverlayTrigger>
  </div>
);

// Composant pour l'en-tête de colonne triable
const SortableHeader = ({ column, currentSort, currentDir, onSort, children }) => (
  <th
    className="sortable-header"
    onClick={() => onSort(column)}
    style={{ cursor: "pointer" }}
  >
    <div className="d-flex align-items-center justify-content-between">
      <span>{children}</span>
      <span className="sort-icon">
        {currentSort === column ? (
          currentDir === "asc" ? <FaSortUp /> : <FaSortDown />
        ) : (
          <FaSort className="text-muted" />
        )}
      </span>
    </div>
  </th>
);

// Modal de confirmation
const ConfirmationModal = ({ show, onHide, onConfirm, title, message, variant = "danger" }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton className="border-0">
      <Modal.Title className="d-flex align-items-center">
        <FaExclamationTriangle className="me-2" style={{ color: variant === "danger" ? "#dc3545" : "#ffc107" }} />
        {title}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="px-4 pb-4">
      <p className="mb-0">{message}</p>
    </Modal.Body>
    <Modal.Footer className="border-0 pt-0">
      <Button variant="outline-secondary" onClick={onHide}>
        Annuler
      </Button>
      <Button variant={variant} onClick={onConfirm}>
        Confirmer
      </Button>
    </Modal.Footer>
  </Modal>
);

const AdminReclamations = () => {
  // États principaux
  const [search, setSearch] = useState("");
  const [reclamations, setReclamations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [statusStats, setStatusStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // États pour les modals
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const navigate = useNavigate();

  // Fonction pour récupérer les données
  const fetchReclamations = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      
      const response = await axios.get("/reclamations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = response.data.data.data.map(mapReclamationData);
      setReclamations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réclamations:", err);
      setError("Erreur lors du chargement des réclamations");
      setReclamations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour charger les données
  useEffect(() => {
    fetchReclamations();
  }, [fetchReclamations]);

  // Effet pour filtrer et trier
  useEffect(() => {
    let data = [...reclamations];
    
    // Filtrage
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(r =>
        r.id.toString().includes(search) ||
        r.client.toLowerCase().includes(searchLower) ||
        r.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Tri
    data.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = a.date.localeCompare(b.date);
          break;
        case "id":
          comparison = a.id - b.id;
          break;
        case "statut":
          comparison = a.statut.localeCompare(b.statut);
          break;
        case "client":
          comparison = a.client.localeCompare(b.client);
          break;
        default:
          return 0;
      }
      
      return sortDir === "asc" ? comparison : -comparison;
    });
    
    setFiltered(data);
    setStatusStats(calculateStatusStats(data));
    setPage(1);
  }, [search, sortBy, sortDir, reclamations]);

  // Pagination
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Gestionnaires d'événements
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(dir => dir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPendingAction({ type: 'status', id, newStatus });
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingAction) return;
    
    const { id, newStatus } = pendingAction;
    const token = localStorage.getItem("token");
    
    try {
      await axios.put(
        `/reclamations/${id}/statut`,
        { statut: newStatus, commentaire: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchReclamations();
      toast.success("Statut mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setShowStatusConfirm(false);
      setPendingAction(null);
    }
  };

  const handleDelete = (id) => {
    setPendingAction({ type: 'delete', id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingAction) return;
    
    const { id } = pendingAction;
    const token = localStorage.getItem("token");
    
    try {
      await axios.delete(`/reclamations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      await fetchReclamations();
      toast.success("Réclamation supprimée avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      toast.error("Erreur lors de la suppression");
    } finally {
      setShowDeleteConfirm(false);
      setPendingAction(null);
    }
  };

  const handleViewDetails = (reclamation) => {
    setSelectedReclamation(reclamation);
    setShowDetails(true);
  };

  const clearSearch = () => {
    setSearch("");
  };

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <div className="container py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des réclamations...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminSidebar />
      <div className="admin-reclamations">
        <div className="container-fluid py-4">
          {/* Header */}
          <div className="page-header mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h1 className="page-title mb-1">
                  <FaFileAlt className="me-3" />
                  Gestion des Réclamations
                </h1>
                <p className="page-subtitle mb-0">
                  Consultez et gérez toutes les réclamations clients
                </p>
              </div>
              <Button
                variant="primary"
                className="add-btn d-flex align-items-center"
                onClick={() => navigate("/admin/reclamations/ajouter")}
              >
                <FaPlus className="me-2" />
                Ajouter une réclamation
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Row className="mb-4 g-3">
            {STATUS_OPTIONS.map(status => (
              <Col xs={6} lg={2} key={status}>
                <StatusCard
                  status={status}
                  count={statusStats[status] || 0}
                />
              </Col>
            ))}
          </Row>

          {/* Search Bar */}
          <Card className="search-card mb-4 border-0 shadow-sm">
            <Card.Body>
              <InputGroup className="search-input-group">
                <InputGroup.Text className="search-icon">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher par ID, client, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    className="clear-search-btn"
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Card.Body>
          </Card>

          {/* Table */}
          <Card className="table-card border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="reclamations-table mb-0">
                  <thead className="table-header">
                    <tr>
                      <SortableHeader column="id" currentSort={sortBy} currentDir={sortDir} onSort={handleSort}>
                        ID
                      </SortableHeader>
                      <SortableHeader column="client" currentSort={sortBy} currentDir={sortDir} onSort={handleSort}>
                        Client
                      </SortableHeader>
                      <th>Type</th>
                      <SortableHeader column="statut" currentSort={sortBy} currentDir={sortDir} onSort={handleSort}>
                        Statut
                      </SortableHeader>
                      <SortableHeader column="date" currentSort={sortBy} currentDir={sortDir} onSort={handleSort}>
                        Date de réception
                      </SortableHeader>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div className="empty-state">
                            <FaFileAlt size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">Aucune réclamation trouvée</h5>
                            <p className="text-muted mb-0">
                              {search ? "Essayez de modifier vos critères de recherche" : "Aucune réclamation n'a été créée"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((reclamation, index) => (
                        <tr key={reclamation.id} className="table-row">
                          <td className="fw-bold text-primary">#{reclamation.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaUser className="me-2 text-muted" size={14} />
                              {reclamation.client}
                            </div>
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="type-badge">
                              {reclamation.type}
                            </Badge>
                          </td>
                          <td>
                            <StatusBadge
                              status={reclamation.statut}
                              onStatusChange={(newStatus) => handleStatusChange(reclamation.id, newStatus)}
                              rowIndex={index}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="me-2 text-muted" size={14} />
                              {reclamation.date || "-"}
                            </div>
                          </td>
                          <td className="text-center">
                            <ActionButtons
                              reclamation={reclamation}
                              onView={handleViewDetails}
                              onDelete={handleDelete}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="pagination-info text-muted">
                Affichage de {(page - 1) * PAGE_SIZE + 1} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} résultats
              </div>
              <Pagination className="mb-0 custom-pagination">
                <Pagination.First
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                />
                <Pagination.Prev
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
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
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                />
                <Pagination.Last
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        centered
        size="lg"
        className="details-modal"
      >
        <Modal.Header closeButton className="details-modal-header">
          <Modal.Title className="d-flex align-items-center">
            <FaFileAlt className="me-2" />
            Détails de la réclamation #{selectedReclamation?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="details-modal-body">
          {selectedReclamation && (
            <Row className="g-4">
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaTag className="me-2" />
                    ID de la réclamation
                  </label>
                  <div className="detail-value">#{selectedReclamation.id}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaUser className="me-2" />
                    Client
                  </label>
                  <div className="detail-value">{selectedReclamation.client}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    Type de réclamation
                  </label>
                  <div className="detail-value">
                    <Badge bg="primary">{selectedReclamation.type}</Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    Statut actuel
                  </label>
                  <div className="detail-value">
                    <Badge bg={STATUS_CONFIG[selectedReclamation.statut]?.variant}>
                      {STATUS_CONFIG[selectedReclamation.statut]?.label}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    Numéro de compte
                  </label>
                  <div className="detail-value">{selectedReclamation.compte_bancaire}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaCalendarAlt className="me-2" />
                    Date de réception
                  </label>
                  <div className="detail-value">{selectedReclamation.date || "-"}</div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">
                    Description
                  </label>
                  <div className="detail-value description-text">
                    {selectedReclamation.description || "Aucune description fournie"}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaFileAlt className="me-2" />
                    Pièces jointes
                  </label>
                  <div className="detail-value">
                    {selectedReclamation.pieces_jointes?.length > 0 ? (
                      <div className="attachments-list">
                        {selectedReclamation.pieces_jointes.map((pj, index) => (
                          <div key={index} className="attachment-item">
                            <FaDownload className="me-2" />
                            <a
                              href={`http://localhost:8000/api/pieces/download/${pj.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="attachment-link"
                            >
                              {pj.description || `Fichier ${index + 1}`}
                            </a>
                            <small className="text-muted ms-2">
                              ({pj.type_fichier}, {Math.round(pj.taille_fichier / 1024)} Ko)
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">Aucune pièce jointe</span>
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
          >
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible."
        variant="danger"
      />

      {/* Modal de confirmation de changement de statut */}
      <ConfirmationModal
        show={showStatusConfirm}
        onHide={() => setShowStatusConfirm(false)}
        onConfirm={confirmStatusChange}
        title="Confirmer le changement de statut"
        message={`Êtes-vous sûr de vouloir changer le statut vers "${STATUS_CONFIG[pendingAction?.newStatus]?.label}" ?`}
        variant="warning"
      />
    </>
  );
};

export default AdminReclamations;