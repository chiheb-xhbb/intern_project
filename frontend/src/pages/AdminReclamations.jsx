import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Button, Form, Dropdown, Pagination, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axios from "../api/axios";
import { toast } from "react-toastify";

// Mock statuses and data
const STATUS_OPTIONS = [
  "en attente",
  "en cours",
  "résolue",
  "rejetée",
  "clôturée",
];

const MOCK_RECLAMATIONS = Array.from({ length: 32 }, (_, i) => ({
  id: 1000 + i,
  client: `Client ${i % 5 + 1}`,
  type: ["Carte", "Chèque", "Virement", "Prêt"][i % 4],
  statut: STATUS_OPTIONS[i % STATUS_OPTIONS.length],
  date: `2024-07-${(i % 28) + 1}`,
}));

const statusColors = {
  "en attente": "secondary",
  "en cours": "warning",
  résolue: "success",
  rejetée: "danger",
  clôturée: "dark",
};

const PAGE_SIZE = 8;

const AdminReclamations = () => {
  const [search, setSearch] = useState("");
  const [reclamations, setReclamations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [statusStats, setStatusStats] = useState({});
  const navigate = useNavigate();

  // Simulate API fetch
  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/reclamations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Map backend data to table fields
        const data = res.data.data.data.map((r) => ({
          id: r.id,
          client:
            r.client && r.client.personne
              ? `${r.client.personne.nom} ${r.client.personne.prenom}`
              : "-",
          type: r.type_reclamation,
          statut: r.statut,
          date: r.date_reception ? r.date_reception.slice(0, 10) : "",
        }));
        setReclamations(data);
      } catch (err) {
        setReclamations([]);
      }
    };
    fetchReclamations();
  }, []);

  // Filter and sort
  useEffect(() => {
    let data = [...reclamations];
    if (search) {
      data = data.filter(
        (r) =>
          r.id.toString().includes(search) ||
          r.client.toLowerCase().includes(search.toLowerCase()) ||
          r.type.toLowerCase().includes(search.toLowerCase())
      );
    }
    data.sort((a, b) => {
      if (sortBy === "date") {
        return sortDir === "asc"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      } else if (sortBy === "id") {
        return sortDir === "asc" ? a.id - b.id : b.id - a.id;
      } else if (sortBy === "statut") {
        return sortDir === "asc"
          ? a.statut.localeCompare(b.statut)
          : b.statut.localeCompare(a.statut);
      }
      return 0;
    });
    setFiltered(data);
    // Stats
    const stats = {};
    STATUS_OPTIONS.forEach((s) => (stats[s] = 0));
    data.forEach((r) => (stats[r.statut]++));
    setStatusStats(stats);
    setPage(1); // Reset to first page on filter/sort
  }, [search, sortBy, sortDir, reclamations]);

  // Pagination
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Inline status update
  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/reclamations/${id}/statut`,
        { statut: newStatus, commentaire: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch to get updated data
      const res = await axios.get("/reclamations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data.data.map((r) => ({
        id: r.id,
        client:
          r.client && r.client.personne
            ? `${r.client.personne.nom} ${r.client.personne.prenom}`
            : "-",
        type: r.type_reclamation,
        statut: r.statut,
        date: r.date_reception ? r.date_reception.slice(0, 10) : "",
      }));
      setReclamations(data);
      toast.success("Statut mis à jour avec succès");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Sorting handler
  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/reclamations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Réclamation supprimée avec succès");
      // Refetch to get updated data
      const res = await axios.get("/reclamations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data.data.map((r) => ({
        id: r.id,
        client:
          r.client && r.client.personne
            ? `${r.client.personne.nom} ${r.client.personne.prenom}`
            : "-",
        type: r.type_reclamation,
        statut: r.statut,
        date: r.date_reception ? r.date_reception.slice(0, 10) : "",
      }));
      setReclamations(data);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <>
      <AdminSidebar />
      <div className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h2 className="fw-bold mb-0" style={{ color: "#115e8bff" }}>
            Réclamations
          </h2>
          <Button
            variant="primary"
            style={{ background: "#115e8bff", border: "none" }}
            onClick={() => navigate("/admin/reclamations/ajouter")}
          >
            Ajouter une réclamation
          </Button>
        </div>
        <Row className="mb-4 g-3">
          {STATUS_OPTIONS.map((status) => (
            <Col xs={6} md={2} key={status}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <Card.Subtitle
                    className="mb-2"
                    style={{ color: "#115e8bff" }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Card.Subtitle>
                  <span className={`badge bg-${statusColors[status]}`}>{
                    statusStats[status] || 0
                  }</span>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="mb-3">
          <InputGroup>
            <Form.Control
              placeholder="Rechercher par ID, client, type..."
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
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("id")}
                >
                  ID {sortBy === "id" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th>Client</th>
                <th>Type</th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("statut")}
                >
                  Statut {sortBy === "statut" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("date")}
                >
                  Date de réception {sortBy === "date" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Aucune réclamation trouvée.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.client}</td>
                    <td>{r.type}</td>
                    <td>
                      <Dropdown onSelect={(s) => handleStatusChange(r.id, s)}>
                        <Dropdown.Toggle
                          size="sm"
                          variant={statusColors[r.statut] || "secondary"}
                          id={`dropdown-status-${r.id}`}
                        >
                          {r.statut}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {STATUS_OPTIONS.map((s) => (
                            <Dropdown.Item
                              key={s}
                              eventKey={s}
                              active={s === r.statut}
                            >
                              {s}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td>{r.date}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => alert(`View ${r.id}`)}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          handleDelete(r.id)
                        }
                      >
                        Supprimer
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
            Page {page} sur {totalPages}
          </div>
          <Pagination className="mb-0">
            <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
            <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === page}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
          </Pagination>
        </div>
      </div>
    </>
  );
};

export default AdminReclamations; 