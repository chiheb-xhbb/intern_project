import React, { useState, useRef } from "react";
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
import "./AjouterReclamation.css";

// Configuration constants for complaint types
const TYPE_OPTIONS = [
  { value: "Carte bloquée", label: "Carte bloquée", icon: "🔒" },
  { value: "Erreur de virement", label: "Erreur de virement", icon: "💸" },
  { value: "Retard crédit", label: "Retard crédit", icon: "⏰" },
  { value: "Chèque rejeté", label: "Chèque rejeté", icon: "❌" },
  { value: "Autre", label: "Autre", icon: "❓" },
];

// Configuration constants for communication channels
const CANAL_OPTIONS = [
  { value: "email", label: "Email", icon: FaEnvelope },
  { value: "téléphone", label: "Téléphone", icon: FaPhone },
  { value: "agence", label: "En personne", icon: FaBuilding },
  { value: "application_web", label: "Application web", icon: FaGlobe },
];

// File upload constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Returns the appropriate icon component based on file type
 * @param {string} fileType - The MIME type of the file
 * @returns {React.Component} - The corresponding icon component
 */
const getFileIcon = (fileType) => {
  if (fileType.includes("pdf")) return FaFilePdf;
  if (fileType.includes("image")) return FaFileImage;
  if (fileType.includes("word")) return FaFileWord;
  return FaFileAlt;
};

/**
 * Returns the appropriate color for file type icon
 * @param {string} fileType - The MIME type of the file
 * @returns {string} - The color code for the icon
 */
const getFileIconColor = (fileType) => {
  if (fileType.includes("pdf")) return "#dc3545";
  if (fileType.includes("image")) return "#28a745";
  if (fileType.includes("word")) return "#007bff";
  return "#6c757d";
};

/**
 * AjouterReclamation - Component for creating new complaints
 * @param {boolean} show - Controls modal visibility
 * @param {function} onHide - Callback function when modal is closed
 */
const AjouterReclamation = ({ show, onHide }) => {
  // Form state management
  const [form, setForm] = useState({
    type: "",
    canal: "",
    compte: "",
    description: "",
    date: new Date().toISOString().slice(0, 10), // Current date as default
    statut: "en cours", // Default status
  });

  // File management state
  const [files, setFiles] = useState([]);

  // Error handling state
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [loadingComptes, setLoadingComptes] = useState(false);

  // Client and accounts management
  const [clientId, setClientId] = useState("");
  const [comptes, setComptes] = useState([]);

  // Refs and navigation
  const fileInputRef = useRef();
  const navigate = useNavigate();

  /**
   * Handles form field changes
   * @param {Event} e - The change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Handles file selection and validation
   * @param {Event} e - The file input change event
   */
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    let valid = true;
    let errorMsg = "";

    // Validate each selected file
    newFiles.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        valid = false;
        errorMsg = `Type de fichier non supporté: ${file.name}`;
      } else if (file.size > MAX_FILE_SIZE) {
        valid = false;
        errorMsg = `Fichier trop volumineux (>5MB): ${file.name}`;
      }
    });

    // Show error if validation failed
    if (!valid) {
      toast.error(errorMsg);
      return;
    }

    // Add valid files to the list
    setFiles((prev) => [...prev, ...newFiles]);
    fileInputRef.current.value = ""; // Clear input for future selections
  };

  /**
   * Removes a file from the selected files list
   * @param {number} idx - Index of the file to remove
   */
  const handleRemoveFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  /**
   * Handles client ID change and loads associated bank accounts
   * @param {Event} e - The input change event
   */
  const handleClientIdChange = async (e) => {
    const value = e.target.value;
    setClientId(value);
    setForm((f) => ({ ...f, compte: "" })); // Reset selected account
    setComptes([]); // Clear accounts list

    // Clear client ID error
    if (errors.clientId) {
      setErrors((prev) => ({ ...prev, clientId: "" }));
    }

    if (!value) return;

    setLoadingComptes(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/clients/${value}/comptes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle different response data structures
      let comptesArray = [];
      if (Array.isArray(res.data.data)) {
        comptesArray = res.data.data;
      } else if (res.data.data && Array.isArray(res.data.data.data)) {
        comptesArray = res.data.data.data;
      }

      setComptes(comptesArray);

      // Show warning if no accounts found
      if (comptesArray.length === 0) {
        toast.warn("Aucun compte trouvé pour ce client.");
      }
    } catch (err) {
      setComptes([]);
      toast.error(
        "Client introuvable ou erreur lors du chargement des comptes."
      );
    } finally {
      setLoadingComptes(false);
    }
  };

  /**
   * Validates the form data
   * @returns {Object} - Object containing validation errors
   */
  const validate = () => {
    const errs = {};
    if (!clientId) errs.clientId = "ID du client requis";
    if (!form.compte) errs.compte = "Compte bancaire requis";
    if (!form.type) errs.type = "Type requis";
    if (!form.canal) errs.canal = "Canal requis";
    if (!form.description?.trim()) errs.description = "Description requise";
    if (!form.date) errs.date = "Date requise";
    return errs;
  };

  /**
   * Handles form submission
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    // Validate form data
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append form data
      formData.append("client_id", clientId);
      formData.append("compte_bancaire_id", form.compte);
      formData.append("type_reclamation", form.type);
      formData.append("canal", form.canal);
      formData.append("description", form.description);
      formData.append("date_reception", form.date);
      formData.append("statut", form.statut);

      // Append files
      files.forEach((file) => {
        formData.append("pieces_jointes[]", file);
      });

      // Submit the complaint
      await axios.post("/reclamations", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Réclamation ajoutée avec succès !");

      // Close modal or navigate back
      if (onHide) onHide();
      else navigate("/admin/reclamations");
    } catch (err) {
      // Handle error responses
      let msg = "Erreur lors de l'ajout de la réclamation";
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (typeof err.response?.data === "string") {
        msg = err.response.data;
      }
      setBackendError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handles modal close
   */
  const handleClose = () => {
    if (onHide) onHide();
    else navigate("/admin/reclamations");
  };

  return (
    <Modal
      show={show !== false}
      onHide={handleClose}
      centered
      size="xl"
      backdrop="static"
      className="ajouter-reclamation-modal"
    >
      <div className="modal-overlay">
        {/* Modal Header */}
        <Modal.Header className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            <div className="title-icon-wrapper">
              <FaPlus />
            </div>
            <div>
              <h4 className="mb-0">Nouvelle Réclamation</h4>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit} autoComplete="off" className="h-100">
          <Modal.Body className="modal-body-custom">
            {/* Backend Error Alert */}
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
              {/* Section 1: Client Information */}
              <Card className="form-section-card">
                <Card.Header className="form-section-header">
                  <FaUser className="me-2" />
                  Informations Client
                </Card.Header>
                <Card.Body>
                  <Row className="g-4">
                    {/* Client ID Input */}
                    <Col md={6}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          <FaUser className="me-2" />
                          ID du client *
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={clientId}
                          onChange={handleClientIdChange}
                          placeholder="Entrer l'ID du client"
                          className={`form-control-custom ${
                            errors.clientId ? "is-invalid" : ""
                          }`}
                          disabled={submitting}
                        />
                        {errors.clientId && (
                          <div className="invalid-feedback-custom">
                            {errors.clientId}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Bank Account Selection */}
                    <Col md={6}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          Compte bancaire concerné *
                        </Form.Label>
                        <Form.Select
                          name="compte"
                          value={form.compte}
                          onChange={handleChange}
                          disabled={
                            !clientId ||
                            loadingComptes ||
                            comptes.length === 0 ||
                            submitting
                          }
                          className={`form-control-custom ${
                            errors.compte ? "is-invalid" : ""
                          }`}
                        >
                          <option value="">Sélectionner un compte</option>
                          {Array.isArray(comptes) &&
                            comptes.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.numero_compte}
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
                            Chargement des comptes...
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Section 2: Complaint Details */}
              <Card className="form-section-card">
                <Card.Header className="form-section-header">
                  <FaFileAlt className="me-2" />
                  Détails de la Réclamation
                </Card.Header>
                <Card.Body>
                  <Row className="g-4">
                    {/* Complaint Type Selection */}
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
                              {type.icon} {type.label}
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

                    {/* Communication Channel Selection */}
                    <Col md={6}>
                      <Form.Group className="form-group-custom">
                        <Form.Label className="form-label-custom">
                          Canal de réception *
                        </Form.Label>
                        <Form.Select
                          name="canal"
                          value={form.canal}
                          onChange={handleChange}
                          className={`form-control-custom ${
                            errors.canal ? "is-invalid" : ""
                          }`}
                          disabled={submitting}
                        >
                          <option value="">Sélectionner un canal</option>
                          {CANAL_OPTIONS.map((canal) => (
                            <option key={canal.value} value={canal.value}>
                              {canal.label}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.canal && (
                          <div className="invalid-feedback-custom">
                            {errors.canal}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Reception Date Input */}
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

                    {/* Description Textarea */}
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
                          placeholder="Décrivez en détail la réclamation du client..."
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

              {/* Section 3: File Attachments */}
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

                    {/* File Upload Area */}
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

                    {/* File Preview Section */}
                    {files.length > 0 && (
                      <div className="files-preview mt-3">
                        <h6 className="files-title mb-3">
                          <FaFileAlt className="me-2" />
                          Fichiers sélectionnés ({files.length})
                        </h6>
                        <div className="files-grid">
                          {files.map((file, idx) => {
                            const IconComponent = getFileIcon(file.type);
                            const iconColor = getFileIconColor(file.type);

                            return (
                              <div key={idx} className="file-preview-card">
                                {/* File Icon */}
                                <div
                                  className="file-icon"
                                  style={{ color: iconColor }}
                                >
                                  <IconComponent size={24} />
                                </div>

                                {/* File Information */}
                                <div className="file-info">
                                  <div className="file-name" title={file.name}>
                                    {file.name.length > 20
                                      ? file.name.substring(0, 20) + "..."
                                      : file.name}
                                  </div>
                                  <div className="file-size">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>

                                {/* Remove File Button */}
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
                                      handleRemoveFile(idx);
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

          {/* Modal Footer with Action Buttons */}
          <Modal.Footer className="modal-footer-custom">
            {/* Cancel Button */}
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              disabled={submitting}
              className="btn-cancel"
            >
              <FaArrowLeft className="me-2" />
              Annuler
            </Button>

            {/* Submit Button */}
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

export default AjouterReclamation;
