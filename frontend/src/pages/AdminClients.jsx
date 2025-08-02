import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axios from "../api/axios";
import { toast } from "react-toastify";

const PAGE_SIZE = 8;

const AdminClients = () => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [totalClients, setTotalClients] = useState(0);
  const navigate = useNavigate();

  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data =
          res.data.data?.map((client) => ({
            id: client.id,
            numeroClient: client.numero_client || "-",
            nom: client.personne?.nom || "-",
            prenom: client.personne?.prenom || "-",
            nomComplet: client.personne
              ? `${client.personne.nom} ${client.personne.prenom}`
              : "-",
            email: client.personne?.email || "-",
            telephone: client.personne?.telephone || "-",
            adresse: client.adresse || "-",
            dateNaissance: client.date_naissance || "-",
            segment: client.segment_client || "-",
          })) || [];

        setClients(data);
        setTotalClients(data.length);
        toast.success("Clients chargés avec succès");
      } catch (err) {
        console.error("Erreur lors du chargement des clients:", err);
        setClients([]);
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    let data = [...clients];

    if (search) {
      data = data.filter(
        (client) =>
          client.id.toString().includes(search) ||
          client.nomComplet.toLowerCase().includes(search.toLowerCase()) ||
          client.email.toLowerCase().includes(search.toLowerCase()) ||
          client.telephone.includes(search)
      );
    }

    data.sort((a, b) => {
      if (sortBy === "id") {
        return sortDir === "asc" ? a.id - b.id : b.id - a.id;
      } else if (sortBy === "nom") {
        return sortDir === "asc"
          ? a.nomComplet.localeCompare(b.nomComplet)
          : b.nomComplet.localeCompare(a.nomComplet);
      } else if (sortBy === "email") {
        return sortDir === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      return 0;
    });

    setFiltered(data);
    setPage(1);
  }, [search, sortBy, sortDir, clients]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortDir === "asc" ? "▲" : "▼";
    }
    return "";
  };

  return (
    <>
      <AdminSidebar />
      <div className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h2 className="fw-bold mb-0" style={{ color: "#115e8bff" }}>
            Clients
          </h2>
        </div>
        {/* SUPERFLUOUS
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Subtitle className="mb-2" style={{ color: "#115e8bff" }}>
                  Total Clients
                </Card.Subtitle>
                <span className="badge bg-primary">{totalClients}</span>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Subtitle className="mb-2" style={{ color: "#115e8bff" }}>
                  Résultats
                </Card.Subtitle>
                <span className="badge bg-secondary">{filtered.length}</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        */}
        <div className="mb-3">
          <InputGroup>
            <Form.Control
              placeholder="Rechercher par ID, nom, prénom, email ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearch("")}
              title="Effacer"
            >
              <span aria-hidden>×</span>
            </Button>
          </InputGroup>
        </div>
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        )}
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  title="Trier par ID"
                >
                  ID {getSortIcon("id")}
                </th>
                <th
                  onClick={() => handleSort("nom")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  title="Trier par nom"
                >
                  Client {getSortIcon("nom")}
                </th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                paginated.map((client) => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.nomComplet}</td>
                    <td>{client.email}</td>
                    <td>{client.telephone}</td>
                    <td>{client.adresse}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewClient(client)}
                      >
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Page {page} sur {totalPages} - {filtered.length} client(s)
          </div>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => setPage(1)}
              disabled={page === 1}
            />
            <Pagination.Prev
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === page}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
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
      </div>

      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#115e8bff" }}>
            Détails du client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient ? (
            <Row>
              <Col md={6}>
                <p>
                  <strong>ID:</strong> {selectedClient.id}
                </p>
                <p>
                  <strong>Nom:</strong> {selectedClient.nom}
                </p>
                <p>
                  <strong>Prénom:</strong> {selectedClient.prenom}
                </p>
                <p>
                  <strong>Email:</strong> {selectedClient.email}
                </p>
                <p>
                  <strong>Téléphone:</strong> {selectedClient.telephone}
                </p>
                <p>
                  <strong>Numéro client:</strong> {selectedClient.numeroClient}
                </p>
                <p>
                  <strong>Adresse:</strong> {selectedClient.adresse}
                </p>
                <p>
                  <strong>Date de naissance:</strong>{" "}
                  {selectedClient.dateNaissance}
                </p>
                <p>
                  <strong>Segment client:</strong> {selectedClient.segment}
                </p>
              </Col>
            </Row>
          ) : (
            <p>Aucun client sélectionné</p>
          )}
        </Modal.Body>
        <Modal.Footer>
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
