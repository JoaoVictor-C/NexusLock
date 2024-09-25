import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import defaultImage from '../../assets/default-image.png';
import { Modal, Button, Table } from 'react-bootstrap';
import { FaUsers, FaWifi, FaChalkboard, FaUser } from 'react-icons/fa';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [canAccessRoom, setCanAccessRoom] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/rooms/${id}`);
        setRoom(response.data);
        console.log(response.data);
        // Assuming the API returns equipment information
        setEquipment(response.data.equipment || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room details:', error);
        setError('Failed to load room details. Please try again.');
        setLoading(false);
      }
    };

    const checkRoomAccess = async () => {
      try {
        const response = await api.post(`/rooms/${id}/can-book`);
        setCanAccessRoom(response.data.hasAccess);
      } catch (error) {
        console.error('Error checking room access:', error);
        setCanAccessRoom(false);
      }
    };

    fetchRoomDetails();
    checkRoomAccess();
  }, [id]);

  const fetchIsAdmin = async () => {
    setIsAdmin(false);
    try {
      const response = await api.get('/Employees/isAdmin');
      if (response.status === 200) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  useEffect(() => {
    fetchIsAdmin();
  }, []);

  const handleHistoryClick = () => {
    navigate(`/room/${id}/history`);
  };

  const handlePermissionClick = () => {
    navigate(`/room/${id}/permissions`);
  };

  const handleEditClick = () => {
    navigate(`/room/${id}/edit`);
  };

  const handleReserveClick = () => {
    setShowModal(true);
  };

  const handleConfirmReserve = async () => {
    try {
      const response = await api.post(`/Rooms/${id}/book`);
      if (response.status === 200) {
        setRoom({ ...room, status: !room.status });
      } else {
        alert('Você não tem permissão para reservar esta sala.');
      }
    } catch (error) {
      console.error('Error reserving room:', error);
      alert('Falha ao reservar sala. Por favor, tente novamente.');
    } finally {
      setShowModal(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center my-5">{error}</div>;
  }

  if (!room) {
    return <div className="alert alert-warning text-center my-5">Room not found</div>;
  }

  const imageSrc = room.imageBase64 ? `data:image/png;base64,${room.imageBase64}` : defaultImage;

  return (
    <div className="container py-4 d-flex flex-column align-items-center">
      <h2 className="text-center mb-4">{room.name}</h2>
      <div className="room-actions top d-flex justify-content-center gap-2 mb-4">
        <button className="btn btn-secondary" onClick={handleHistoryClick}>Histórico de uso</button>
        {isAdmin && (
          <button className="btn btn-secondary" onClick={handlePermissionClick}>Controle de permissão</button>
        )}
        {isAdmin && (
          <button className="btn btn-secondary" onClick={handleEditClick}>Editar sala</button>
        )}
      </div>

      <div className="row">
        <div className="col-md-6">
          <img src={imageSrc} alt={room.name} className="img-fluid rounded mb-4" style={{ width: '100%', maxHeight: '400px' }}/>
        </div>
        <div className="col-md-6">
          <Table striped bordered hover>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{room.roomId}</td>
              </tr>
              <tr>
                <th>Nome</th>
                <td>{room.name}</td>
              </tr>
              <tr>
                <th>Descrição</th>
                <td>{room.description}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  <span className={`badge bg-${room.status ? 'danger' : 'success'}`}>
                    {room.status ? 'Ocupada' : 'Disponível'}
                  </span>
                </td>
              </tr>
              {room.status && (
                <tr>
                  <th>Ocupada por</th>
                  <td><FaUser /> {room.occupiedByEmployeeName}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="room-actions bottom d-flex justify-content-between mt-4 gap-3">
        <button className="btn btn-secondary" onClick={handleBackClick}>Voltar</button>
        <button 
          className={`btn ${room.status ? 'btn-danger' : 'btn-success'}`} 
          onClick={handleReserveClick}
          disabled={!canAccessRoom}
        >
          {room.status ? 'Liberar Sala' : 'Reservar'}
        </button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {room.status 
            ? "Tem certeza que deseja liberar esta sala?"
            : "Tem certeza que deseja reservar esta sala?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmReserve}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoomDetails;