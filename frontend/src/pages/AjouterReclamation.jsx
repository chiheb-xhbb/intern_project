import React, { useState, useRef } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axios";

const TYPE_OPTIONS = [
  "Carte bloquée",
  "Erreur de virement",
  "Retard crédit",
  "Chèque rejeté",
  "Autre",
];
const CANAL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "téléphone", label: "Téléphone" },
  { value: "agence", label: "En personne" },
  { value: "application_web", label: "Application web" }
];
const MOCK_COMPTES = [
  { id: 1, numero: "1234567890" },
  { id: 2, numero: "9876543210" },
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const AjouterReclamation = ({ show, onHide }) => {
  const [form, setForm] = useState({
    type: "",
    canal: "",
    compte: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    statut: "en cours",
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState("");
  const [comptes, setComptes] = useState([]);
  const [loadingComptes, setLoadingComptes] = useState(false);
  const [backendError, setBackendError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    let valid = true;
    let errorMsg = "";
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
    setFiles((prev) => [...prev, ...newFiles]);
    fileInputRef.current.value = "";
  };

  const handleRemoveFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClientIdChange = async (e) => {
    const value = e.target.value;
    setClientId(value);
    setForm((f) => ({ ...f, compte: "" }));
    setComptes([]);
    if (!value) return;
    setLoadingComptes(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/clients/${value}/comptes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let comptesArray = [];
      if (Array.isArray(res.data.data)) {
        comptesArray = res.data.data;
      } else if (res.data.data && Array.isArray(res.data.data.data)) {
        comptesArray = res.data.data.data;
      }
      setComptes(comptesArray);
      if (comptesArray.length === 0) toast.warn("Aucun compte trouvé pour ce client.");
    } catch (err) {
      setComptes([]);
      toast.error("Client introuvable ou erreur lors du chargement des comptes.");
    } finally {
      setLoadingComptes(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!clientId) errs.clientId = "ID du client requis";
    if (!form.compte) errs.compte = "Compte bancaire requis";
    if (!form.type) errs.type = "Type requis";
    if (!form.canal) errs.canal = "Canal requis";
    if (!form.description) errs.description = "Description requise";
    if (!form.date) errs.date = "Date requise";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("client_id", clientId);
      formData.append("compte_bancaire_id", form.compte);
      formData.append("type_reclamation", form.type);
      formData.append("canal", form.canal);
      formData.append("description", form.description);
      formData.append("date_reception", form.date);
      formData.append("statut", form.statut);

      // Ajouter les fichiers
      files.forEach((file) => {
        formData.append("pieces_jointes[]", file);
      });

      await axios.post("/reclamations", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Réclamation ajoutée avec succès !");
      if (onHide) onHide();
      else navigate("/admin/reclamations");
    } catch (err) {
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


  return (
    <Modal show={show !== false} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une réclamation</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} autoComplete="off">
        {backendError && (
          <div className="alert alert-danger mb-3">{backendError}</div>
        )}
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>ID du client *</Form.Label>
                <Form.Control
                  type="number"
                  value={clientId}
                  onChange={handleClientIdChange}
                  placeholder="Entrer l'ID du client"
                  required
                  isInvalid={!!errors.clientId}
                />
                <Form.Control.Feedback type="invalid">{errors.clientId}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Type de réclamation *</Form.Label>
                <Form.Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  isInvalid={!!errors.type}
                >
                  <option value="">Sélectionner...</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Canal de réception *</Form.Label>
                <Form.Select
                  name="canal"
                  value={form.canal}
                  onChange={handleChange}
                  isInvalid={!!errors.canal}
                >
                  <option value="">Sélectionner...</option>
                  {CANAL_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.canal}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Compte bancaire concerné</Form.Label>
                <Form.Select
                  name="compte"
                  value={form.compte}
                  onChange={handleChange}
                  disabled={!clientId || loadingComptes || comptes.length === 0}
                  isInvalid={!!errors.compte}
                >
                  <option value="">Aucun</option>
                  {Array.isArray(comptes) && comptes.map((c) => (
                    <option key={c.id} value={c.id}>{c.numero_compte}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.compte}</Form.Control.Feedback>
                {loadingComptes && <div className="small text-muted">Chargement...</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Date de réception *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  isInvalid={!!errors.date}
                />
                <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label>Pièces jointes (PDF, PNG, JPEG, DOCX, max 5MB/fichier)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpeg,.jpg,.docx,application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <div className="mt-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-1 bg-light rounded px-2 py-1">
                      <span className="me-2">
                        {file.type.includes("pdf") && <i className="bi bi-file-earmark-pdf"></i>}
                        {file.type.includes("image") && <i className="bi bi-file-earmark-image"></i>}
                        {file.type.includes("word") && <i className="bi bi-file-earmark-word"></i>}
                      </span>
                      <span className="flex-grow-1 small">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleRemoveFile(idx)}
                        tabIndex={-1}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide || (() => navigate("/admin/reclamations"))} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" style={{ background: "#115e8bff", border: "none" }} disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : "Soumettre"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AjouterReclamation; 