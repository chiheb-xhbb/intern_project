import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Form,
  Pagination,
  InputGroup,
  Modal,
  Badge,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaSearch,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUser,
  FaUsers,
  FaFilter,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard,
  FaTags,
  FaBirthdayCake,
} from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "./AdminClients.css";

const PAGE_SIZE = 8;

// Fonction helper pour obtenir les initiales
const getInitials = (nom, prenom) => {
  const n = nom?.charAt(0) || "";
  const p = prenom?.charAt(0) || "";
  return `${n}${p}`.toUpperCase() || "?";
};

// Fonction helper pour mapper les données de l'API
const mapClientData = (apiData) => ({
  id: apiData.id,
  numeroClient: apiData.numero_client || "-",
  nom: apiData.personne?.nom || "-",
  prenom: apiData.personne?.prenom || "-",
  nomComplet: apiData.personne
    ? `${apiData.personne.nom} ${apiData.personne.prenom}`
    : "-",
  email: apiData.personne?.email || "-",
  telephone: apiData.personne?.telephone || "-",
  adresse: apiData.adresse || "-",
  dateNaissance: apiData.date_naissance || "-",
  segment: apiData.segment_client || "-",
});

// Composant pour les cartes de statistiques
const StatsCard = ({
  title,
  count,
  icon: IconComponent,
  variant = "primary",
}) => {
  return (
    <Card className="stats-overview-card h-100 border-0 shadow-sm">
      <Card.Body className="p-3 text-center">
        <div className="stats-icon-wrapper mx-auto mb-2">
          <IconComponent style={{ color: "white" }} size={20} />
        </div>
        <Card.Subtitle className="stats-card-label mb-2">{title}</Card.Subtitle>
        <Badge bg={variant} className="stats-count-badge">
          {count}
        </Badge>
      </Card.Body>
    </Card>
  );
};

// Composant pour les boutons d'action
const ActionButtons = ({ client, onView }) => (
  <div className="action-buttons d-flex gap-2">
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>Voir les détails</Tooltip>}
    >
      <Button
        variant="outline-primary"
        size="sm"
        className="action-btn view-btn"
        onClick={() => onView(client)}
      >
        <FaEye />
      </Button>
    </OverlayTrigger>
  </div>
);

// Composant pour l'en-tête de colonne triable
const SortableHeader = ({
  column,
  currentSort,
  currentDir,
  onSort,
  children,
}) => (
  <th
    className="sortable-header"
    onClick={() => onSort(column)}
    style={{ cursor: "pointer" }}
  >
    <div className="d-flex align-items-center justify-content-between">
      <span>{children}</span>
      <span className="sort-icon">
        {currentSort === column ? (
          currentDir === "asc" ? (
            <FaSortUp />
          ) : (
            <FaSortDown />
          )
        ) : (
          <FaSort className="text-muted" />
        )}
      </span>
    </div>
  </th>
);

// Composant pour le badge de segment
const SegmentBadge = ({ segment }) => {
  return (
    <Badge bg="light" text="dark" className="segment-badge">
      {segment || "Non défini"}
    </Badge>
  );
};

const AdminClients = () => {
  // États principaux
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // États pour le modal
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();

  // Fonction pour récupérer les données
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get("/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data?.map(mapClientData) || [];
      setClients(data);
      toast.success("Clients chargés avec succès");
    } catch (err) {
      console.error("Erreur lors du chargement des clients:", err);
      setError("Erreur lors du chargement des clients");
      setClients([]);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour charger les données
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Effet pour filtrer et trier
  useEffect(() => {
    let data = [...clients];

    // Filtrage
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (client) =>
          client.id.toString().includes(search) ||
          client.nomComplet.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.telephone.includes(search) ||
          client.numeroClient.includes(search)
      );
    }

    // Tri
    data.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "id":
          comparison = a.id - b.id;
          break;
        case "nom":
          comparison = a.nomComplet.localeCompare(b.nomComplet);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "segment":
          comparison = a.segment.localeCompare(b.segment);
          break;
        default:
          return 0;
      }

      return sortDir === "asc" ? comparison : -comparison;
    });

    setFiltered(data);
    setPage(1);
  }, [search, sortBy, sortDir, clients]);

  // Pagination
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Gestionnaires d'événements
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const clearSearch = () => {
    setSearch("");
  };

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <div className="admin-clients">
          <div className="container-fluid py-4">
            <div className="loading-overlay">
              <div className="text-center">
                <Spinner
                  animation="border"
                  variant="primary"
                  className="loading-spinner"
                />
                <p className="mt-3 text-muted">Chargement des clients...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminSidebar />
      <div className="admin-clients">
        <div className="container-fluid py-4">
          {/* Header */}
          <div className="page-header mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h1 className="page-title mb-1">
                  <FaUsers className="me-3" />
                  Gestion des Clients
                </h1>
                <p className="page-subtitle mb-0">
                  Consultez et gérez la base de données clients
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="mb-4"
            >
              {error}
            </Alert>
          )}

          {/* Stats Cards 
          <Row className="mb-4 g-3">
            <Col xs={6} lg={6}>
              <StatsCard
                title="Total Clients"
                count={clients.length}
                icon={FaUsers}
                variant="primary"
              />
            </Col>
            <Col xs={6} lg={6}>
              <StatsCard
                title="Résultats"
                count={filtered.length}
                icon={FaFilter}
                variant="info"
              />
            </Col>
          </Row>*/}

          {/* Search Bar */}
          <Card className="search-card mb-4 border-0 shadow-sm">
            <Card.Body>
              <InputGroup className="search-input-group">
                <InputGroup.Text className="search-icon">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher par ID, nom, prénom, email, téléphone ou numéro client..."
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
                <Table hover className="clients-table mb-0">
                  <thead className="table-header">
                    <tr>
                      <SortableHeader
                        column="id"
                        currentSort={sortBy}
                        currentDir={sortDir}
                        onSort={handleSort}
                      >
                        ID
                      </SortableHeader>
                      <SortableHeader
                        column="nom"
                        currentSort={sortBy}
                        currentDir={sortDir}
                        onSort={handleSort}
                      >
                        Client
                      </SortableHeader>
                      <SortableHeader
                        column="email"
                        currentSort={sortBy}
                        currentDir={sortDir}
                        onSort={handleSort}
                      >
                        Email
                      </SortableHeader>
                      <th>Téléphone</th>
                      <th>Adresse</th>
                      <SortableHeader
                        column="segment"
                        currentSort={sortBy}
                        currentDir={sortDir}
                        onSort={handleSort}
                      >
                        Segment
                      </SortableHeader>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div className="empty-state">
                            <FaUsers size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun client trouvé</h5>
                            <p className="text-muted mb-0">
                              {search
                                ? "Essayez de modifier vos critères de recherche"
                                : "Aucun client n'est enregistré"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((client) => (
                        <tr key={client.id} className="table-row">
                          <td className="fw-bold text-primary">#{client.id}</td>
                          <td>
                            <div className="client-info">
                              <div className="client-avatar">
                                {getInitials(client.nom, client.prenom)}
                              </div>
                              <div className="client-details">
                                <h6 className="mb-0">{client.nomComplet}</h6>
                                <small className="text-muted">
                                  N° {client.numeroClient}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaEnvelope
                                className="me-2 text-muted"
                                size={14}
                              />
                              {client.email}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaPhone className="me-2 text-muted" size={14} />
                              {client.telephone}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt
                                className="me-2 text-muted"
                                size={14}
                              />
                              <span
                                className="text-truncate"
                                style={{ maxWidth: "150px" }}
                              >
                                {client.adresse}
                              </span>
                            </div>
                          </td>
                          <td>
                            <SegmentBadge segment={client.segment} />
                          </td>
                          <td className="text-center">
                            <ActionButtons
                              client={client}
                              onView={handleViewClient}
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
                Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
                {Math.min(page * PAGE_SIZE, filtered.length)} sur{" "}
                {filtered.length} résultats
              </div>
              <Pagination className="mb-0 custom-pagination">
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
            <FaUser className="me-2" />
            Détails du client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="details-modal-body">
          {selectedClient && (
            <>
              {/* Client Header */}
              <div className="client-header">
                <div className="client-avatar-large">
                  {getInitials(selectedClient.nom, selectedClient.prenom)}
                </div>
                <h3 className="client-name">{selectedClient.nomComplet}</h3>
                <p className="client-id text-muted">
                  ID Client: #{selectedClient.id}
                </p>
              </div>

              {/* Informations personnelles */}
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <FaIdCard className="me-2" />
                  Informations personnelles
                </h5>
                <div className="info-grid">
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaUser className="me-2" />
                      Nom
                    </label>
                    <div className="detail-value">{selectedClient.nom}</div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaUser className="me-2" />
                      Prénom
                    </label>
                    <div className="detail-value">{selectedClient.prenom}</div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaBirthdayCake className="me-2" />
                      Date de naissance
                    </label>
                    <div className="detail-value">
                      {selectedClient.dateNaissance}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaMapMarkerAlt className="me-2" />
                      Adresse
                    </label>
                    <div className="detail-value">{selectedClient.adresse}</div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaIdCard className="me-2" />
                      Numéro client
                    </label>
                    <div className="detail-value">
                      {selectedClient.numeroClient}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaTags className="me-2" />
                      Segment client
                    </label>
                    <div className="detail-value">
                      <SegmentBadge segment={selectedClient.segment} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <FaEnvelope className="me-2" />
                  Informations de contact
                </h5>
                <div className="info-grid">
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaEnvelope className="me-2" />
                      Email
                    </label>
                    <div className="detail-value">{selectedClient.email}</div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaPhone className="me-2" />
                      Téléphone
                    </label>
                    <div className="detail-value">
                      {selectedClient.telephone}
                    </div>
                  </div>
                </div>
              </div>
            </>
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
    </>
  );
};

export default AdminClients;
