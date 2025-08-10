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
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaSearch,
  FaChevronUp,
  FaChevronDown,
  FaUserCircle,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaEyeSlash,
  FaExclamationTriangle,
  FaBirthdayCake,
  FaTags,
} from "react-icons/fa";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "./ClientInterface.css";

// ========================================
// CONSTANTES ET CONFIGURATION
// ========================================

/**
 * Configuration des statuts avec leurs couleurs et icônes associées
 */
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

/**
 * Nombre d'éléments par page pour la pagination
 */
const PAGE_SIZE = 6;

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Récupère le nom complet d'un client
 * @param {Object} clientData - Les données du client
 * @returns {string} Le nom complet ou "Client" par défaut
 */
const getFullName = (clientData) => {
  if (!clientData) return "Client";
  const nom = clientData.nom || "";
  const prenom = clientData.prenom || "";
  return `${prenom} ${nom}`.trim() || "Client";
};

/**
 * Transforme les données de l'API en format utilisable
 * @param {Object} apiData - Données brutes de l'API
 * @returns {Object} Données formatées pour l'affichage
 */
const mapReclamationData = (apiData) => ({
  id: apiData.id,
  type: apiData.type_reclamation,
  statut: apiData.statut,
  compte_bancaire: apiData.compte_bancaire?.numero_compte || "-",
  date: apiData.date_reception ? apiData.date_reception.slice(0, 10) : "",
  description: apiData.description || "",
  pieces_jointes: apiData.pieces_jointes || [],
});

/**
 * Formate une date pour l'affichage en français
 * @param {string} dateString - Date au format ISO
 * @returns {string} Date formatée ou message par défaut
 */
const formatDate = (dateString) => {
  if (!dateString) return "Date non disponible";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

/**
 * Parse une date pour les comparaisons
 * @param {string} dateString - Date au format string
 * @returns {Date} Objet Date ou date epoch si invalide
 */
const parseDate = (dateString) => {
  if (!dateString) return new Date(0);
  return new Date(dateString);
};

// ========================================
// COMPOSANT : BARRE DE NAVIGATION CLIENT
// ========================================

/**
 * Composant de navigation pour l'interface client
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.clientData - Données du client connecté
 * @param {Function} props.onLogout - Fonction de déconnexion
 * @param {Function} props.onViewProfile - Fonction pour voir le profil
 * @param {Function} props.onChangePassword - Fonction pour changer le mot de passe
 */
const ClientNavbar = ({
  clientData,
  onLogout,
  onViewProfile,
  onChangePassword,
}) => {
  const fullName = getFullName(clientData);

  return (
    <Navbar className="client-navbar" expand="lg">
      <Container fluid>
        {/* Logo de l'application */}
        <Navbar.Brand className="navbar-brand-custom">
          <img src="/IMAGES/logo.png" alt="Logo" className="brand-logo" />
        </Navbar.Brand>

        {/* Titre centré - visible uniquement sur desktop */}
        <div className="navbar-center-title d-none d-lg-block">
          <h4 className="page-title-navbar">BH Réclamations</h4>
        </div>

        {/* Bouton responsive pour mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Menu déroulant utilisateur */}
            <NavDropdown
              title={
                <span className="user-dropdown-title d-flex align-items-center">
                  <FaUser className="me-2" />
                  <span className="user-name">{fullName}</span>
                </span>
              }
              id="user-dropdown"
              align="end"
              className="user-dropdown"
            >
              {/* En-tête du dropdown avec infos utilisateur */}
              <div className="dropdown-header">
                <div className="user-info-header">
                  <FaUserCircle size={32} className="text-primary me-2" />
                  <div className="user-details">
                    <div className="user-name-large">{fullName}</div>
                    <small className="user-email text-muted">
                      {clientData?.email || "Email non disponible"}
                    </small>
                  </div>
                </div>
              </div>

              <NavDropdown.Divider />

              {/* Options du menu */}
              <NavDropdown.Item
                onClick={onViewProfile}
                className="profile-item"
              >
                <FaUserCircle className="dropdown-item-icon" />
                Voir le profil
              </NavDropdown.Item>

              <NavDropdown.Item
                onClick={onChangePassword}
                className="password-item"
              >
                <FaKey className="dropdown-item-icon" />
                Changer le mot de passe
              </NavDropdown.Item>

              <NavDropdown.Divider />

              {/* Déconnexion */}
              <NavDropdown.Item onClick={onLogout} className="logout-item">
                <FaSignOutAlt className="dropdown-item-icon" />
                Déconnexion
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// ========================================
// COMPOSANT : MODAL DE PROFIL
// ========================================

/**
 * Modal d'affichage du profil utilisateur
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.show - État d'affichage de la modal
 * @param {Function} props.onHide - Fonction de fermeture
 * @param {Object} props.clientData - Données du client
 * @param {boolean} props.loading - État de chargement
 */
const ProfileModal = ({ show, onHide, clientData, loading }) => (
  <Modal
    show={show}
    onHide={onHide}
    centered
    size="md"
    className="profile-modal"
  >
    <Modal.Header closeButton className="profile-modal-header">
      <Modal.Title className="profile-modal-title d-flex align-items-center">
        <FaUser className="me-2" />
        Mon Profil
      </Modal.Title>
    </Modal.Header>

    <Modal.Body className="profile-modal-body">
      {loading ? (
        // État de chargement
        <div className="loading-container-small">
          <Spinner animation="border" variant="primary" size="sm" />
          <span className="loading-text-small">
            Chargement des informations...
          </span>
        </div>
      ) : (
        <>
          {/* En-tête client */}
          <div className="client-header">
            <h3 className="client-name">
              {clientData?.nom && clientData?.prenom
                ? `${clientData.prenom} ${clientData.nom}`
                : "Nom non renseigné"}
            </h3>
            <p className="client-email text-muted">
              {clientData?.email || "Email non renseigné"}
            </p>
          </div>

          {/* Section : Informations personnelles */}
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
                <div className="detail-value">
                  {clientData?.nom || "Non renseigné"}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  <FaUser className="me-2" />
                  Prénom
                </label>
                <div className="detail-value">
                  {clientData?.prenom || "Non renseigné"}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  <FaBirthdayCake className="me-2" />
                  Date de naissance
                </label>
                <div className="detail-value">
                  {clientData?.client?.date_naissance
                    ? formatDate(clientData.client.date_naissance)
                    : "Non renseigné"}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  <FaMapMarkerAlt className="me-2" />
                  Adresse
                </label>
                <div className="detail-value">
                  {clientData?.client?.adresse || "Non renseigné"}
                </div>
              </div>
            </div>
          </div>

          {/* Section : Informations de contact */}
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
                <div className="detail-value">
                  {clientData?.email || "Non renseigné"}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  <FaPhone className="me-2" />
                  Téléphone
                </label>
                <div className="detail-value">
                  {clientData?.telephone || "Non renseigné"}
                </div>
              </div>
            </div>
          </div>

          {/* Section : Informations du compte */}
          <div className="detail-section">
            <h5 className="detail-section-title">
              <FaCalendarAlt className="me-2" />
              Informations du compte
            </h5>
            <div className="info-grid">
              <div className="detail-item">
                <label className="detail-label">
                  <FaCalendarAlt className="me-2" />
                  Date de création du compte
                </label>
                <div className="detail-value">
                  {clientData?.created_at
                    ? formatDate(clientData.created_at)
                    : "Non disponible"}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  <FaTags className="me-2" />
                  Segment Client
                </label>
                <div className="detail-value">
                  <Badge bg="light" text="dark" className="segment-badge">
                    {clientData?.client?.segment_client || "Non défini"}
                  </Badge>
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">
                  <FaIdCard className="me-2" />
                  Numéro Client
                </label>
                <div className="detail-value">
                  {clientData?.client?.numero_client || "Non renseigné"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal.Body>

    <Modal.Footer className="profile-modal-footer">
      <Button
        variant="outline-primary"
        onClick={onHide}
        className="close-modal-btn"
      >
        Fermer
      </Button>
    </Modal.Footer>
  </Modal>
);

// ========================================
// COMPOSANT : MODAL DE CHANGEMENT DE MOT DE PASSE
// ========================================

/**
 * Modal pour changer le mot de passe utilisateur
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.show - État d'affichage de la modal
 * @param {Function} props.onHide - Fonction de fermeture
 */
const ChangePasswordModal = ({ show, onHide }) => {
  // États locaux pour la gestion des mots de passe
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // États pour la visibilité des mots de passe
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // États pour la gestion des erreurs et du chargement
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Gère les changements dans les champs mot de passe
   * @param {string} field - Le champ modifié
   * @param {string} value - La nouvelle valeur
   */
  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Nettoie les erreurs lors de la saisie
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Masque l'alerte d'erreur lors de la saisie
    if (showErrorAlert) {
      setShowErrorAlert(false);
      setErrorMessage("");
    }
  };

  /**
   * Bascule la visibilité d'un champ mot de passe
   * @param {string} field - Le champ à basculer
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /**
   * Valide le formulaire de changement de mot de passe
   * @returns {boolean} True si le formulaire est valide
   */
  const validateForm = () => {
    const newErrors = {};

    // Validation du mot de passe actuel
    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est requis";
    }

    // Validation du nouveau mot de passe
    if (!passwords.newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Validation de la confirmation
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Vérification que le nouveau mot de passe est différent
    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit être différent de l'ancien";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumet le formulaire de changement de mot de passe
   * @param {Event} e - Événement de soumission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setShowErrorAlert(false);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/change-password",
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
          new_password_confirmation: passwords.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Affiche le succès
      setShowSuccessAlert(true);
      toast.success("Mot de passe modifié avec succès");

      // Ferme automatiquement la modal après 3 secondes
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors du changement de mot de passe:", err);

      let errorMsg =
        "Une erreur s'est produite lors du changement de mot de passe";

      // Gestion des erreurs spécifiques
      if (err.response?.status === 400 || err.response?.status === 422) {
        if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data?.errors?.current_password) {
          errorMsg = "Le mot de passe actuel est incorrect";
          setErrors({
            currentPassword: "Le mot de passe actuel est incorrect",
          });
        } else if (err.response.data?.errors?.new_password) {
          errorMsg = err.response.data.errors.new_password[0];
        } else {
          errorMsg = "Le mot de passe actuel est incorrect";
          setErrors({
            currentPassword: "Le mot de passe actuel est incorrect",
          });
        }
      } else if (err.response?.status === 401) {
        errorMsg = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.response?.status >= 500) {
        errorMsg = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setErrorMessage(errorMsg);
      setShowErrorAlert(true);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ferme la modal et remet à zéro tous les états
   */
  const handleClose = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setErrors({});
    setLoading(false);
    setShowSuccessAlert(false);
    setShowErrorAlert(false);
    setErrorMessage("");
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="md"
      className="password-modal"
    >
      <Modal.Header closeButton className="password-modal-header">
        <Modal.Title className="password-modal-title">
          <FaKey className="modal-title-icon" />
          Changer le mot de passe
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="password-modal-body">
        {/* Alerte d'erreur */}
        {showErrorAlert && (
          <Alert
            variant="danger"
            className="mb-4"
            dismissible
            onClose={() => {
              setShowErrorAlert(false);
              setErrorMessage("");
            }}
            style={{
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              backgroundColor: "#f8d7da",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex align-items-start">
              <FaExclamationTriangle
                className="me-2 mt-1"
                size={18}
                style={{ color: "#721c24", flexShrink: 0 }}
              />
              <div>
                <Alert.Heading className="h6 mb-1" style={{ color: "#721c24" }}>
                  Erreur de changement de mot de passe
                </Alert.Heading>
                <p className="mb-0" style={{ color: "#721c24" }}>
                  {errorMessage}
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Alerte de succès */}
        {showSuccessAlert && (
          <Alert
            variant="success"
            className="mb-4 text-center"
            style={{
              border: "1px solid #d4edda",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex align-items-center justify-content-center">
              <FaCheckCircle
                className="me-2"
                size={20}
                style={{ color: "#28a745" }}
              />
              <div>
                <Alert.Heading className="h6 mb-1" style={{ color: "#155724" }}>
                  Mot de passe modifié avec succès !
                </Alert.Heading>
                <p className="mb-0 small" style={{ color: "#6c757d" }}>
                  Votre mot de passe a été mis à jour en toute sécurité. Cette
                  fenêtre se fermera automatiquement.
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Formulaire de changement de mot de passe */}
        <Form onSubmit={handleSubmit}>
          <div className="password-field-group">
            {/* Mot de passe actuel */}
            <Form.Group className="mb-3">
              <Form.Label className="password-label">
                <FaLock className="password-icon" />
                Mot de passe actuel
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  isInvalid={!!errors.currentPassword}
                  placeholder="Entrez votre mot de passe actuel"
                  className="password-input"
                  disabled={showSuccessAlert}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => togglePasswordVisibility("current")}
                  className="password-toggle-btn"
                  disabled={showSuccessAlert}
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {errors.currentPassword}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Nouveau mot de passe */}
            <Form.Group className="mb-3">
              <Form.Label className="password-label">
                <FaKey className="password-icon" />
                Nouveau mot de passe
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  isInvalid={!!errors.newPassword}
                  placeholder="Entrez votre nouveau mot de passe"
                  className="password-input"
                  disabled={showSuccessAlert}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => togglePasswordVisibility("new")}
                  className="password-toggle-btn"
                  disabled={showSuccessAlert}
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {errors.newPassword}
              </Form.Control.Feedback>
              <Form.Text className="text-muted password-requirements">
                Le mot de passe doit contenir au moins 8 caractères.
              </Form.Text>
            </Form.Group>

            {/* Confirmation du nouveau mot de passe */}
            <Form.Group className="mb-4">
              <Form.Label className="password-label">
                <FaKey className="password-icon" />
                Confirmer le nouveau mot de passe
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  isInvalid={!!errors.confirmPassword}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="password-input"
                  disabled={showSuccessAlert}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="password-toggle-btn"
                  disabled={showSuccessAlert}
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="password-modal-footer">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={loading && !showSuccessAlert}
        >
          {showSuccessAlert ? "Fermer" : "Annuler"}
        </Button>
        {!showSuccessAlert && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            className="change-password-btn"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Modification...
              </>
            ) : (
              <>
                <FaKey className="btn-icon" />
                Modifier le mot de passe
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// ========================================
// COMPOSANT : SECTION DES FILTRES
// ========================================

/**
 * Section de filtres et de tri pour les réclamations
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.filters - Filtres actuels
 * @param {Function} props.onFiltersChange - Fonction de modification des filtres
 * @param {Function} props.onClearFilters - Fonction de remise à zéro des filtres
 * @param {number} props.filteredCount - Nombre d'éléments filtrés
 * @param {number} props.totalCount - Nombre total d'éléments
 * @param {boolean} props.showFilters - État d'affichage des filtres
 * @param {Function} props.onToggleFilters - Fonction de basculement des filtres
 * @param {Array} props.availableTypes - Types de réclamations disponibles
 */
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
  /**
   * Gère le changement de statut dans les filtres
   * @param {string} status - Le statut à ajouter/retirer
   */
  const handleStatusChange = (status) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  /**
   * Gère le changement de type dans les filtres
   * @param {string} type - Le type à ajouter/retirer
   */
  const handleTypeChange = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    onFiltersChange({ ...filters, types: newTypes });
  };

  /**
   * Gère le changement de tri
   * @param {string} sortBy - Critère de tri
   * @param {string} sortOrder - Ordre de tri (asc/desc)
   */
  const handleSortChange = (sortBy, sortOrder) => {
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  // Vérifie s'il y a des filtres actifs
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
        {/* En-tête des filtres */}
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

          {/* Bouton pour effacer les filtres */}
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

        {/* Contenu collapsible des filtres */}
        <Collapse in={showFilters}>
          <div>
            <Row className="filters-content g-3">
              {/* Filtre par statut */}
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

              {/* Filtre par type de réclamation */}
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

              {/* Filtre par période */}
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

              {/* Options de tri */}
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

            {/* Résumé des résultats */}
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

// ========================================
// COMPOSANT : CARTE DE RÉCLAMATION
// ========================================

/**
 * Composant d'affichage d'une carte de réclamation
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.reclamation - Données de la réclamation
 * @param {Function} props.onViewDetails - Fonction pour voir les détails
 */
const ReclamationCard = ({ reclamation, onViewDetails }) => {
  const config = STATUS_CONFIG[reclamation.statut];
  const IconComponent = config?.icon || FaClock;

  return (
    <Card className="reclamation-card">
      <Card.Body className="reclamation-card-body">
        {/* En-tête de la carte */}
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

        {/* Métadonnées de la réclamation */}
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

        {/* Description tronquée */}
        <p className="card-description">
          {reclamation.description || "Aucune description fournie"}
        </p>

        {/* Pied de carte avec actions */}
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

// ========================================
// COMPOSANT PRINCIPAL : INTERFACE CLIENT
// ========================================

/**
 * Composant principal de l'interface client pour la gestion des réclamations
 */
const ClientInterface = () => {
  // ========================================
  // ÉTATS PRINCIPAUX
  // ========================================

  const [reclamations, setReclamations] = useState([]); // Liste des réclamations
  const [filteredReclamations, setFilteredReclamations] = useState([]); // Réclamations filtrées
  const [page, setPage] = useState(1); // Page courante pour la pagination
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(""); // Message d'erreur
  const [clientData, setClientData] = useState(null); // Données du client connecté

  // ========================================
  // ÉTATS DES FILTRES
  // ========================================

  const [filters, setFilters] = useState({
    statuses: [], // Statuts sélectionnés
    types: [], // Types sélectionnés
    dateFrom: "", // Date de début
    dateTo: "", // Date de fin
    sortBy: "date", // Critère de tri
    sortOrder: "desc", // Ordre de tri
  });
  const [showFilters, setShowFilters] = useState(false); // Affichage des filtres
  const [availableTypes, setAvailableTypes] = useState([]); // Types disponibles

  // ========================================
  // ÉTATS DES MODALS
  // ========================================

  const [selectedReclamation, setSelectedReclamation] = useState(null); // Réclamation sélectionnée
  const [showDetails, setShowDetails] = useState(false); // Affichage détails
  const [showProfile, setShowProfile] = useState(false); // Affichage profil
  const [showChangePassword, setShowChangePassword] = useState(false); // Affichage changement mot de passe

  const navigate = useNavigate();

  // ========================================
  // FONCTIONS DE FILTRAGE ET TRI
  // ========================================

  /**
   * Applique les filtres et le tri sur les données
   * @param {Array} data - Données à filtrer
   * @param {Object} currentFilters - Filtres à appliquer
   * @returns {Array} Données filtrées et triées
   */
  const applyFilters = useCallback((data, currentFilters) => {
    let filtered = [...data];

    // Filtre par statut
    if (currentFilters.statuses.length > 0) {
      filtered = filtered.filter((rec) =>
        currentFilters.statuses.includes(rec.statut)
      );
    }

    // Filtre par type
    if (currentFilters.types.length > 0) {
      filtered = filtered.filter((rec) =>
        currentFilters.types.includes(rec.type)
      );
    }

    // Filtre par date de début
    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      filtered = filtered.filter((rec) => parseDate(rec.date) >= fromDate);
    }

    // Filtre par date de fin
    if (currentFilters.dateTo) {
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Inclut toute la journée
      filtered = filtered.filter((rec) => parseDate(rec.date) <= toDate);
    }

    // Application du tri
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

  // ========================================
  // EFFETS DE MISE À JOUR
  // ========================================

  /**
   * Met à jour les réclamations filtrées lors du changement des filtres ou données
   */
  useEffect(() => {
    const filtered = applyFilters(reclamations, filters);
    setFilteredReclamations(filtered);
    setPage(1); // Remet à la première page lors du filtrage

    // Extrait les types uniques des réclamations
    const uniqueTypes = [
      ...new Set(reclamations.map((rec) => rec.type)),
    ].sort();
    setAvailableTypes(uniqueTypes);
  }, [reclamations, filters, applyFilters]);

  // ========================================
  // FONCTIONS DE RÉCUPÉRATION DES DONNÉES
  // ========================================

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    toast.success("Déconnexion réussie");
    navigate("/login");
  }, [navigate]);

  /**
   * Récupère les données du client connecté
   */
  const fetchClientData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // L'API retourne les données sous response.data.user
      const userData = response.data.user;
      setClientData(userData);
    } catch (err) {
      console.error("Erreur lors du chargement des données client:", err);
      setClientData(null);
    }
  }, []);

  /**
   * Récupère les réclamations du client
   */
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
  }, [handleLogout]);

  /**
   * Charge les données au montage du composant
   */
  useEffect(() => {
    fetchClientData();
    fetchReclamations();
  }, [fetchClientData, fetchReclamations]);

  // ========================================
  // LOGIQUE DE PAGINATION
  // ========================================

  // Calcul des éléments paginés
  const paginated = filteredReclamations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const totalPages = Math.ceil(filteredReclamations.length / PAGE_SIZE);

  // ========================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ========================================

  /**
   * Ouvre la modal de détails pour une réclamation
   * @param {Object} reclamation - Réclamation sélectionnée
   */
  const handleViewDetails = (reclamation) => {
    setSelectedReclamation(reclamation);
    setShowDetails(true);
  };

  /**
   * Ouvre la modal de profil
   */
  const handleViewProfile = () => {
    setShowProfile(true);
  };

  /**
   * Ouvre la modal de changement de mot de passe
   */
  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  /**
   * Met à jour les filtres
   * @param {Object} newFilters - Nouveaux filtres
   */
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  /**
   * Remet à zéro tous les filtres
   */
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

  // ========================================
  // RENDU CONDITIONNEL : ÉTAT DE CHARGEMENT
  // ========================================

  if (loading) {
    return (
      <>
        <ClientNavbar
          clientData={clientData}
          onLogout={handleLogout}
          onViewProfile={handleViewProfile}
          onChangePassword={handleChangePassword}
        />
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

  // ========================================
  // RENDU PRINCIPAL
  // ========================================

  return (
    <>
      {/* Barre de navigation */}
      <ClientNavbar
        clientData={clientData}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
        onChangePassword={handleChangePassword}
      />

      <div className="client-interface">
        <Container className="py-4">
          {/* En-tête de la page */}
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
                onClick={() => navigate("/client/reclamation/creer")}
              >
                <FaPlus className="btn-icon" />
                Créer une réclamation
              </Button>
            </div>
          </div>

          {/* Alerte d'erreur */}
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

          {/* Section des filtres */}
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

          {/* Liste des réclamations */}
          {reclamations.length === 0 ? (
            // État vide - aucune réclamation
            <Card className="empty-state-card">
              <Card.Body className="empty-state-body">
                <div className="empty-state-content">
                  <FaSearch className="empty-state-icon" />
                  <h5 className="empty-state-title">
                    Aucune réclamation trouvée
                  </h5>
                  <p className="empty-state-text">
                    Vous n'avez encore créé aucune réclamation. Commencez par
                    créer votre première réclamation.
                  </p>
                  <Button
                    variant="primary"
                    className="empty-state-btn"
                    onClick={() => navigate("/client/reclamation/creer")}
                  >
                    <FaPlus className="btn-icon" />
                    Créer ma première réclamation
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : filteredReclamations.length === 0 ? (
            // État vide - aucun résultat après filtrage
            <Card className="empty-state-card">
              <Card.Body className="empty-state-body">
                <div className="empty-state-content">
                  <FaSearch className="empty-state-icon" />
                  <h5 className="empty-state-title">Aucun résultat trouvé</h5>
                  <p className="empty-state-text">
                    Aucune réclamation ne correspond aux critères de recherche
                    sélectionnés.
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
            // Grille des réclamations
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
              {/* Informations de pagination */}
              <div className="pagination-info">
                Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
                {Math.min(page * PAGE_SIZE, filteredReclamations.length)} sur{" "}
                {filteredReclamations.length} résultats
              </div>

              {/* Contrôles de pagination */}
              <Pagination className="custom-pagination">
                <Pagination.First
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                />
                <Pagination.Prev
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                />

                {/* Pages numériques (affichage intelligent) */}
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

      {/* ========================================
          MODALS
          ======================================== */}

      {/* Modal de profil */}
      <ProfileModal
        show={showProfile}
        onHide={() => setShowProfile(false)}
        clientData={clientData}
        loading={false}
      />

      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal
        show={showChangePassword}
        onHide={() => setShowChangePassword(false)}
      />

      {/* Modal de détails de réclamation */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        centered
        size="md"
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
              {/* ID de la réclamation */}
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">
                    <FaTag className="label-icon" />
                    ID de la réclamation
                  </label>
                  <div className="detail-value">#{selectedReclamation.id}</div>
                </div>
              </Col>

              {/* Type de réclamation */}
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Type de réclamation</label>
                  <div className="detail-value">
                    <Badge bg="primary">{selectedReclamation.type}</Badge>
                  </div>
                </div>
              </Col>

              {/* Statut actuel */}
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

              {/* Date de réception */}
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

              {/* Numéro de compte */}
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Numéro de compte</label>
                  <div className="detail-value">
                    {selectedReclamation.compte_bancaire}
                  </div>
                </div>
              </Col>

              {/* Description complète */}
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">Description</label>
                  <div className="detail-value description-value">
                    {selectedReclamation.description ||
                      "Aucune description fournie"}
                  </div>
                </div>
              </Col>

              {/* Pièces jointes */}
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