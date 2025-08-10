import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
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
import {
  FaEye,
  FaSearch,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUser,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaTags,
  FaBirthdayCake,
} from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "./AdminClients.css";

// Configuration constants
const PAGE_SIZE = 8;

/**
 * Helper function to generate initials from first and last name
 * @param {string} nom - Last name
 * @param {string} prenom - First name
 * @returns {string} Uppercased initials or "?" if no names provided
 */
const getInitials = (nom, prenom) => {
  const n = nom?.charAt(0) || "";
  const p = prenom?.charAt(0) || "";
  return `${n}${p}`.toUpperCase() || "?";
};

/**
 * Helper function to map API response data to client object structure
 * @param {Object} apiData - Raw data from API
 * @returns {Object} Mapped client data object
 */
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

/**
 * Component for displaying action buttons in table rows
 * @param {Object} props - Component props
 * @param {Object} props.client - Client data object
 * @param {Function} props.onView - Handler function for view action
 */
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

/**
 * Component for sortable table column headers
 * @param {Object} props - Component props
 * @param {string} props.column - Column identifier for sorting
 * @param {string} props.currentSort - Currently active sort column
 * @param {string} props.currentDir - Current sort direction ('asc' | 'desc')
 * @param {Function} props.onSort - Handler function for sort action
 * @param {React.ReactNode} props.children - Header content
 */
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

/**
 * Component for displaying client segment badge
 * @param {Object} props - Component props
 * @param {string} props.segment - Client segment value
 */
const SegmentBadge = ({ segment }) => {
  return (
    <Badge bg="light" text="dark" className="segment-badge">
      {segment || "Non défini"}
    </Badge>
  );
};

/**
 * Main AdminClients component for managing client data
 * Provides functionality for viewing, searching, sorting, and paginating clients
 */
const AdminClients = () => {
  // Main state variables
  const [search, setSearch] = useState(""); // Search query string
  const [clients, setClients] = useState([]); // Original client data from API
  const [filtered, setFiltered] = useState([]); // Filtered and sorted client data
  const [page, setPage] = useState(1); // Current page number
  const [sortBy, setSortBy] = useState("id"); // Current sort column
  const [sortDir, setSortDir] = useState("asc"); // Current sort direction
  const [loading, setLoading] = useState(true); // Loading state indicator
  const [error, setError] = useState(""); // Error message state

  // Modal state variables
  const [selectedClient, setSelectedClient] = useState(null); // Currently selected client for details
  const [showDetails, setShowDetails] = useState(false); // Details modal visibility

  /**
   * Fetch clients data from API
   * Handles authentication, API calls, data mapping, and error handling
   */
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Check for authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      // Make API request with authentication header
      const response = await axios.get("/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Map API response data and update state
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

  // Effect to load data on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /**
   * Effect to handle filtering and sorting of client data
   * Runs whenever search, sort parameters, or client data changes
   */
  useEffect(() => {
    let data = [...clients];

    // Apply search filtering
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

    // Apply sorting
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

    // Update filtered data and reset to first page
    setFiltered(data);
    setPage(1);
  }, [search, sortBy, sortDir, clients]);

  // Calculate pagination data
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  /**
   * Handle column header click for sorting
   * @param {string} column - Column identifier to sort by
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort direction if same column clicked
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      // Set new sort column with ascending direction
      setSortBy(column);
      setSortDir("asc");
    }
  };

  /**
   * Handle view client details action
   * @param {Object} client - Client data to view
   */
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  /**
   * Clear search input and reset filtering
   */
  const clearSearch = () => {
    setSearch("");
  };

  // Loading state render
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

  // Main component render
  return (
    <>
      <AdminSidebar />
      <div className="admin-clients">
        <div className="container-fluid py-4">
          {/* Page Header Section */}
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

          {/* Error Alert Display */}
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

          {/* Search Bar Section */}
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

          {/* Main Data Table */}
          <Card className="table-card border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="clients-table mb-0">
                  {/* Table Header with Sortable Columns */}
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
                    {/* Empty State Display */}
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
                      /* Client Data Rows */
                      paginated.map((client) => (
                        <tr key={client.id} className="table-row">
                          {/* Client ID */}
                          <td className="fw-bold text-primary">#{client.id}</td>
                          {/* Client Info with Avatar */}
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
                          {/* Email with Icon */}
                          <td>
                            <div className="d-flex align-items-center">
                              <FaEnvelope
                                className="me-2 text-muted"
                                size={14}
                              />
                              {client.email}
                            </div>
                          </td>
                          {/* Phone with Icon */}
                          <td>
                            <div className="d-flex align-items-center">
                              <FaPhone className="me-2 text-muted" size={14} />
                              {client.telephone}
                            </div>
                          </td>
                          {/* Address with Icon and Truncation */}
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
                          {/* Segment Badge */}
                          <td>
                            <SegmentBadge segment={client.segment} />
                          </td>
                          {/* Action Buttons */}
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

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              {/* Pagination Info */}
              <div className="pagination-info text-muted">
                Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
                {Math.min(page * PAGE_SIZE, filtered.length)} sur{" "}
                {filtered.length} résultats
              </div>
              {/* Pagination Controls */}
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

      {/* Client Details Modal */}
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
              {/* Client Header in Modal */}
              <div className="client-header">
                <div className="client-avatar-large">
                  {getInitials(selectedClient.nom, selectedClient.prenom)}
                </div>
                <h3 className="client-name">{selectedClient.nomComplet}</h3>
                <p className="client-id text-muted">
                  ID Client: #{selectedClient.id}
                </p>
              </div>

              {/* Personal Information Section */}
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

              {/* Contact Information Section */}
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
