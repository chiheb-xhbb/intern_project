import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Card,
  OverlayTrigger,
  Tooltip,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaUser,
  FaFileAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaGlobe,
  FaTimes,
  FaCloudUploadAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import axios from "../api/axios";
import "./CreerReclamation.css";

// =============================================
// CONSTANTES ET CONFIGURATIONS
// =============================================

/**
 * Options de types de réclamations disponibles
 */
const TYPE_OPTIONS = [
  { value: "Carte bloquée", label: "Carte bloquée"},
  { value: "Erreur de virement", label: "Erreur de virement"},
  { value: "Retard crédit", label: "Retard crédit"},
  { value: "Chèque rejeté", label: "Chèque rejeté"},
  { value: "Autre", label: "Autre"},
];

/**
 * Options de canaux de communication
 */
const CANAL_OPTIONS = [
  { value: "email", label: "Email", icon: FaEnvelope },
  { value: "téléphone", label: "Téléphone", icon: FaPhone },
  { value: "agence", label: "En personne", icon: FaBuilding },
  { value: "application_web", label: "Application web", icon: FaGlobe },
];

/**
 * Contraintes pour l'upload de fichiers
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

/**
 * Retourne l'icône appropriée selon le type de fichier
 * @param {string} fileType - Type MIME du fichier
 * @returns {React.Component} - Composant d'icône
 */
const getFileIcon = (fileType) => {
  if (fileType.includes("pdf")) return FaFilePdf;
  if (fileType.includes("image")) return FaFileImage;
  if (fileType.includes("word")) return FaFileWord;
  return FaFileAlt;
};

/**
 * Retourne la couleur appropriée pour l'icône selon le type de fichier
 * @param {string} fileType - Type MIME du fichier
 * @returns {string} - Code couleur hexadécimal
 */
const getFileIconColor = (fileType) => {
  if (fileType.includes("pdf")) return "#dc3545";
  if (fileType.includes("image")) return "#28a745";
  if (fileType.includes("word")) return "#007bff";
  return "#6c757d";
};

// =============================================
// COMPOSANT PRINCIPAL
// =============================================

/**
 * Composant pour créer une nouvelle réclamation
 * @param {boolean} show - État d'affichage du modal
 * @param {function} onHide - Callback de fermeture du modal
 * @param {string} clientId - ID du client (optionnel)
 */
const CreerReclamation = ({ show, onHide, clientId: propClientId }) => {
  // =============================================
  // ÉTAT DU COMPOSANT
  // =============================================

  /**
   * État du formulaire principal
   */
  const [form, setForm] = useState({
    type: "",
    canal: "",
    compte: "",
    description: "",
    date: new Date().toISOString().slice(0, 10), // Date du jour par défaut
    statut: "en cours", // Statut par défaut
  });

  /**
   * Liste des fichiers sélectionnés
   */
  const [files, setFiles] = useState([]);

  /**
   * Erreurs de validation du formulaire
   */
  const [errors, setErrors] = useState({});

  /**
   * État de soumission du formulaire
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * Liste des comptes bancaires du client
   */
  const [comptes, setComptes] = useState([]);

  /**
   * État de chargement des comptes
   */
  const [loadingComptes, setLoadingComptes] = useState(false);

  /**
   * Erreur générale du backend
   */
  const [backendError, setBackendError] = useState("");

  // =============================================
  // RÉFÉRENCES ET NAVIGATION
  // =============================================

  const fileInputRef = useRef();
  const navigate = useNavigate();

  // =============================================
  // EFFETS ET CHARGEMENT INITIAL
  // =============================================

  /**
   * Charge les comptes du client à l'ouverture du modal
   */
  useEffect(() => {
    if (show !== false) {
      loadClientComptes();
    }
  }, [show]);

  // =============================================
  // FONCTIONS DE CHARGEMENT DES DONNÉES
  // =============================================

  /**
   * Charge la liste des comptes bancaires du client connecté
   */
  const loadClientComptes = async () => {
    setLoadingComptes(true);

    try {
      const token = localStorage.getItem("token");
      let clientId = propClientId;

      // Si aucun ID client fourni en prop, récupérer depuis l'utilisateur connecté
      if (!clientId) {
        try {
          const userRes = await axios.get("/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });

          const userData = userRes.data.user;

          if (userData?.client?.id) {
            clientId = userData.client.id;
          } else {
            throw new Error(
              "Données client introuvables dans la réponse utilisateur"
            );
          }
        } catch (userErr) {
          console.error(
            "Erreur lors de la récupération des données utilisateur:",
            userErr
          );
          throw new Error("Impossible de récupérer l'ID du client");
        }
      }

      if (!clientId) {
        throw new Error("ID client introuvable");
      }

      // Récupération des comptes via l'API
      const res = await axios.get(`/clients/${clientId}/comptes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Traitement de la réponse paginée
      let comptesArray = [];
      if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        comptesArray = res.data.data.data;
      } else if (Array.isArray(res.data?.data)) {
        comptesArray = res.data.data;
      } else if (Array.isArray(res.data)) {
        comptesArray = res.data;
      }

      setComptes(comptesArray);

      // Notifications utilisateur
      if (comptesArray.length === 0) {
        toast.warn("Aucun compte trouvé pour votre profil.");
      } else {
        toast.success(`${comptesArray.length} comptes chargés avec succès`);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des comptes:", err);
      setComptes([]);

      // Gestion des différents types d'erreurs
      if (err.response?.status === 404) {
        toast.error("Aucun compte trouvé pour ce client.");
      } else if (err.response?.status === 401) {
        toast.error("Token d'authentification invalide.");
      } else {
        toast.error(
          `Erreur lors du chargement de vos comptes: ${
            err.message || "Erreur inconnue"
          }`
        );
      }
    } finally {
      setLoadingComptes(false);
    }
  };

  // =============================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // =============================================

  /**
   * Gère les changements dans les champs du formulaire
   * @param {Event} e - Événement de changement
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mise à jour du formulaire
    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    // Effacement de l'erreur correspondante si elle existe
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  /**
   * Gère la sélection de fichiers
   * @param {Event} e - Événement de changement du champ fichier
   */
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    let valid = true;
    let errorMsg = "";

    // Validation des fichiers sélectionnés
    newFiles.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        valid = false;
        errorMsg = `Type de fichier non supporté: ${file.name}`;
      } else if (file.size > MAX_FILE_SIZE) {
        valid = false;
        errorMsg = `Fichier trop volumineux (>5MB): ${file.name}`;
      }
    });

    if (!valid) {
      toast.error(errorMsg);
      return;
    }

    // Ajout des fichiers valides à la liste
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    // Réinitialisation du champ fichier
    fileInputRef.current.value = "";
  };

  /**
   * Supprime un fichier de la liste
   * @param {number} index - Index du fichier à supprimer
   */
  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // =============================================
  // VALIDATION ET SOUMISSION
  // =============================================

  /**
   * Valide les données du formulaire
   * @returns {Object} - Objet contenant les erreurs de validation
   */
  const validate = () => {
    const errs = {};

    if (!form.compte) errs.compte = "Compte bancaire requis";
    if (!form.type) errs.type = "Type requis";
    if (!form.description?.trim()) errs.description = "Description requise";
    if (!form.date) errs.date = "Date requise";

    return errs;
  };

  /**
   * Gère la soumission du formulaire
   * @param {Event} e - Événement de soumission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    // Validation du formulaire
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Préparation des données à envoyer
      formData.append("compte_bancaire_id", form.compte);
      formData.append("type_reclamation", form.type);
      formData.append("canal", "application_web"); // Canal fixe pour l'application web
      formData.append("description", form.description);
      formData.append("date_reception", form.date);
      formData.append("statut", form.statut);

      // Ajout des fichiers
      files.forEach((file) => {
        formData.append("pieces_jointes[]", file);
      });

      // Envoi de la requête
      await axios.post("/reclamations", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Succès
      toast.success("Réclamation créée avec succès !");
      handleClose();
    } catch (err) {
      // Gestion des erreurs
      let errorMessage = "Erreur lors de la création de la réclamation";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === "string") {
        errorMessage = err.response.data;
      }

      setBackendError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Ferme le modal et redirige si nécessaire
   */
  const handleClose = () => {
    if (onHide) {
      onHide();
    } else {
      navigate("/ClientInterface");
    }
  };

  // =============================================
  // RENDU DU COMPOSANT
  // =============================================

  return (
    <Modal
      show={show !== false}
      onHide={handleClose}
      centered
      size="xl"
      backdrop="static"
      className="creer-reclamation-modal"
    >
      <div className="modal-overlay">
        {/* En-tête du modal */}
        <Modal.Header className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            <div className="title-icon-wrapper">
              <FaPlus />
            </div>
            <div>
              <h4 className="mb-0">Créer une Réclamation</h4>
            </div>
          </Modal.Title>
        </Modal.Header>

        {/* Formulaire principal */}
        <Form onSubmit={handleSubmit} autoComplete="off" className="h-100">
          <Modal.Body className="modal-body-custom">
            {/* Alerte d'erreur backend */}
            {backendError && (
              <Alert
                variant="danger"
                className="custom-alert mb-4"
                dismissible
                onClose={() => setBackendError("")}
              >
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="me-2" />
                  {backendError}
                </div>
              </Alert>
            )}

            <div className="form-sections">
              {/* Section 1: Sélection du compte bancaire */}
              <Card className="form-section-card">
                <Card.Header className="form-section-header">
                  <FaUser className="me-2" />
                  Compte Concerné
                </Card.Header>
                <Card.Body>
                  <Row className="g-4">
                    <Col md={12}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          Compte bancaire concerné *
                        </Form.Label>
                        <Form.Select
                          name="compte"
                          value={form.compte}
                          onChange={handleChange}
                          disabled={
                            loadingComptes || comptes.length === 0 || submitting
                          }
                          className={`form-control-custom ${
                            errors.compte ? "is-invalid" : ""
                          }`}
                        >
                          <option value="">Sélectionner un compte</option>
                          {Array.isArray(comptes) &&
                            comptes.map((compte) => (
                              <option key={compte.id} value={compte.id}>
                                {compte.numero_compte} - {compte.type_compte}
                              </option>
                            ))}
                        </Form.Select>
                        {errors.compte && (
                          <div className="invalid-feedback-custom">
                            {errors.compte}
                          </div>
                        )}
                        {loadingComptes && (
                          <div className="loading-indicator">
                            <Spinner
                              size="sm"
                              animation="border"
                              className="me-2"
                            />
                            Chargement de vos comptes...
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Section 2: Détails de la réclamation */}
              <Card className="form-section-card">
                <Card.Header className="form-section-header">
                  <FaFileAlt className="me-2" />
                  Détails de la Réclamation
                </Card.Header>
                <Card.Body>
                  <Row className="g-4">
                    {/* Type de réclamation */}
                    <Col md={6}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          Type de réclamation *
                        </Form.Label>
                        <Form.Select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className={`form-control-custom ${
                            errors.type ? "is-invalid" : ""
                          }`}
                          disabled={submitting}
                        >
                          <option value="">Sélectionner un type</option>
                          {TYPE_OPTIONS.map((type) => (
                            <option key={type.value} value={type.value}>
                               {type.label}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.type && (
                          <div className="invalid-feedback-custom">
                            {errors.type}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Date de réception */}
                    <Col md={6}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          <FaCalendarAlt className="me-2" />
                          Date de réception *
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          className={`form-control-custom ${
                            errors.date ? "is-invalid" : ""
                          }`}
                          disabled={submitting}
                        />
                        {errors.date && (
                          <div className="invalid-feedback-custom">
                            {errors.date}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Description */}
                    <Col md={12}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          Description *
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Décrivez en détail votre réclamation..."
                          className={`form-control-custom textarea-custom ${
                            errors.description ? "is-invalid" : ""
                          }`}
                          disabled={submitting}
                        />
                        {errors.description && (
                          <div className="invalid-feedback-custom">
                            {errors.description}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Section 3: Upload des pièces jointes */}
              <Card className="form-section-card">
                <Card.Header className="form-section-header">
                  <FaCloudUploadAlt className="me-2" />
                  Pièces Jointes
                </Card.Header>
                <Card.Body>
                  <Form.Group className="form-group-custom">
                    <Form.Label className="form-label-custom">
                      Documents (PDF, PNG, JPEG, DOCX - max 5MB/fichier)
                    </Form.Label>

                    {/* Zone de drop des fichiers */}
                    <div
                      className="file-upload-area"
                      onClick={() =>
                        !submitting && fileInputRef.current?.click()
                      }
                    >
                      <FaCloudUploadAlt size={32} className="upload-icon" />
                      <h6>Cliquez pour sélectionner des fichiers</h6>
                      <p className="text-muted mb-0">
                        ou glissez-déposez vos documents ici
                      </p>
                      <Form.Control
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpeg,.jpg,.docx,application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        disabled={submitting}
                      />
                    </div>

                    {/* Aperçu des fichiers sélectionnés */}
                    {files.length > 0 && (
                      <div className="files-preview mt-3">
                        <h6 className="files-title mb-3">
                          <FaFileAlt className="me-2" />
                          Fichiers sélectionnés ({files.length})
                        </h6>
                        <div className="files-grid">
                          {files.map((file, index) => {
                            const IconComponent = getFileIcon(file.type);
                            const iconColor = getFileIconColor(file.type);

                            return (
                              <div key={index} className="file-preview-card">
                                <div
                                  className="file-icon"
                                  style={{ color: iconColor }}
                                >
                                  <IconComponent size={24} />
                                </div>
                                <div className="file-info">
                                  <div className="file-name" title={file.name}>
                                    {file.name.length > 20
                                      ? `${file.name.substring(0, 20)}...`
                                      : file.name}
                                  </div>
                                  <div className="file-size">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>Supprimer le fichier</Tooltip>
                                  }
                                >
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="file-remove-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFile(index);
                                    }}
                                    disabled={submitting}
                                  >
                                    <FaTimes />
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            </div>
          </Modal.Body>

          {/* Pied de page avec boutons d'action */}
          <Modal.Footer className="modal-footer-custom">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              disabled={submitting}
              className="btn-cancel"
            >
              <FaArrowLeft className="me-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="btn-submit"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Créer la réclamation
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </div>
    </Modal>
  );
};

export default CreerReclamation;
