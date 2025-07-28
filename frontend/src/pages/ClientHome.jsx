import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loading-skeleton/dist/skeleton.css";

const ClientHome = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/reclamations/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReclamations(data.data); // ✅ use data.data
      } catch (err) {
        setError(err.response?.data?.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const statusColor = {
    "en attente": "secondary",
    "en cours": "warning",
    résolue: "success",
    rejetée: "danger",
    clôturée: "dark",
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Mes Réclamations</h2>
        <Button
          variant="primary"
          onClick={() => navigate("/nouvelle-reclamation")} // ✅ enable button
        >
          Créer Réclamation
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Col key={i}>
              <Card className="h-100 shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Skeleton height={20} width={80} className="mb-2" />
                  <Skeleton height={18} width="70%" className="mb-2" />
                  <Skeleton count={2} height={14} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : reclamations.length === 0 ? (
        <p className="text-center text-muted">Aucune réclamation trouvée.</p>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {reclamations.map((r) => (
            <Col key={r.id}>
              <Card className="h-100 shadow-sm border-0 rounded-4 hover-lift">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={statusColor[r.statut]}>{r.statut}</Badge>
                    <small className="text-muted">
                      {new Date(r.date_reception).toLocaleDateString("fr-FR")}
                    </small>
                  </div>

                  <Card.Title className="fs-6 fw-bold text-primary mb-1">
                    {r.type_reclamation}
                  </Card.Title>

                  <Card.Text className="text-muted small flex-grow-1">
                    {r.description}
                  </Card.Text>

                  <div className="d-flex justify-content-between mt-auto">
                    <small className="text-muted">
                      Compte&nbsp;:{" "}
                      <strong>
                        {r.compte?.numero_compte
                          ? r.compte.numero_compte.slice(-4)
                          : "N/A"}
                      </strong>
                    </small>
                    {r.date_resolution && (
                      <small className="text-success">
                        Résolue&nbsp;:{" "}
                        {new Date(r.date_resolution).toLocaleDateString(
                          "fr-FR"
                        )}
                      </small>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Animation on hover */}
      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1.25rem rgba(0,87,255,0.12);
        }
      `}</style>
    </div>
  );
};

export default ClientHome;
