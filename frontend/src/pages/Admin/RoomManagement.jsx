import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, Button, Form, Container, Row, Col, Card, Alert, Pagination } from 'react-bootstrap';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', status: false });
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  });

  useEffect(() => {
    fetchRooms();
  }, [pagination.pageNumber]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/Rooms', {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize
        }
      });
      const { totalCount, pageNumber, pageSize, rooms: fetchedRooms } = response.data;
      setRooms(fetchedRooms);
      setPagination({ totalCount, pageNumber, pageSize });
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
      setError('Falha ao carregar salas. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    setConfirmMessage('Tem certeza de que deseja criar esta sala?');
    setConfirmAction(() => async () => {
      try {
        await api.post('/Rooms', newRoom);
        setNewRoom({ name: '', description: '', status: false });
        fetchRooms();
        setShowNewRoomModal(false);
      } catch (err) {
        console.error('Erro ao criar sala:', err);
        setError('Falha ao criar sala. Por favor, tente novamente.');
      }
    });
    setShowNewRoomModal(false);
    setShowConfirmModal(true);
  };

  const handleUpdateRoom = () => {
    setConfirmMessage('Tem certeza de que deseja atualizar esta sala?');
    setConfirmAction(() => async () => {
      try {
        await api.put(`/Rooms/${editingRoom.roomId}`, editingRoom);
        setEditingRoom(null);
        fetchRooms();
        setShowEditRoomModal(false);
      } catch (err) {
        console.error('Erro ao atualizar sala:', err);
        setError('Falha ao atualizar sala. Por favor, tente novamente.');
      }
    });
    setShowEditRoomModal(false);
    setShowConfirmModal(true);
  };

  const handleDeleteRoom = (id) => {
    setConfirmMessage('Tem certeza de que deseja excluir esta sala?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.error('Erro ao excluir sala:', err);
        setError('Falha ao excluir sala. Por favor, tente novamente.');
      }
    });
    setShowConfirmModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, pageNumber }));
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="sr-only">Carregando...</span></div></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="room-management mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Gerenciamento de Salas</h2>
        </Col>
        <Col className="text-right">
          <Button variant="success" onClick={() => setShowNewRoomModal(true)}>
            <i className="fas fa-plus mr-2"></i>Criar Nova Sala
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Nome da Sala</th>
                  <th>Descrição</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.roomId}>
                    <td>{room.name}</td>
                    <td>{room.description}</td>
                    <td className="text-center">
                      <span className={`badge ${room.status ? 'bg-danger' : 'bg-success'}`}>
                        {room.status ? 'Ocupada' : 'Disponível'}
                      </span>
                    </td>
                    <td className="text-center gap-2 d-flex justify-content-center">
                      <Button variant="outline-warning" size="sm" className="mr-2" onClick={() => {
                        setEditingRoom(room);
                        setShowEditRoomModal(true);
                      }}>
                        <i className="fas fa-edit mr-1"></i>Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRoom(room.roomId)}>
                        <i className="fas fa-trash-alt mr-1"></i>Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Pagination className="justify-content-center mt-3">
        <Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.pageNumber === 1} />
        <Pagination.Prev onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 1} />
        {[...Array(Math.ceil(pagination.totalCount / pagination.pageSize)).keys()].map((page) => (
          <Pagination.Item
            key={page + 1}
            active={page + 1 === pagination.pageNumber}
            onClick={() => handlePageChange(page + 1)}
          >
            {page + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber === Math.ceil(pagination.totalCount / pagination.pageSize)} />
        <Pagination.Last onClick={() => handlePageChange(Math.ceil(pagination.totalCount / pagination.pageSize))} disabled={pagination.pageNumber === Math.ceil(pagination.totalCount / pagination.pageSize)} />
      </Pagination>

      <Modal show={showNewRoomModal} onHide={() => setShowNewRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Nova Sala</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome da sala"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Digite a descrição da sala"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Sala está ocupada"
                checked={newRoom.status}
                onChange={(e) => setNewRoom({ ...newRoom, status: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewRoomModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleCreateRoom}>
            Criar Sala
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditRoomModal} onHide={() => setShowEditRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Sala</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome da sala"
                value={editingRoom?.name || ''}
                onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Digite a descrição da sala"
                value={editingRoom?.description || ''}
                onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Sala está ocupada"
                checked={editingRoom?.status || false}
                onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditRoomModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleUpdateRoom}>
            Atualizar Sala
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Ação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => {
            confirmAction();
            setShowConfirmModal(false);
          }}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoomManagement;