import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages/RoomDetails.css';
import defaultImage from '../../assets/default-image.png';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/rooms/${id}`);
        setRoom(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room details:', error);
        setError('Failed to load room details. Please try again.');
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  const handleHistoryClick = () => {
    navigate(`/room/${id}/history`);
  };

  const handlePermissionClick = () => {
    navigate(`/room/${id}/permissions`);
  };

  const handleEditClick = () => {
    navigate(`/room/${id}/edit`);
  };

  const handleReserveClick = async () => {
    const response = await api.post(`/Rooms/${id}/book`);
    if (response.status === 200) {
      setRoom({ ...room, status: !room.status });
    } else if (response.status === 403) {
      alert('Você não tem permissão para reservar esta sala.');
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!room) {
    return <div className="not-found">Room not found</div>;
  }

  const imageSrc = room.imageBase64 ? `data:image/png;base64,${room.imageBase64}` : defaultImage;

  return (
    <div className="room-details container py-4">
      <h2 className="text-center mb-4">{room.name}</h2>
      <div className="room-actions top d-flex justify-content-center gap-2 mb-4">
        <button className="btn btn-secondary" onClick={handleHistoryClick}>Histórico de uso</button>
        <button className="btn btn-secondary" onClick={handlePermissionClick}>Controle de permissão</button>
        <button className="btn btn-secondary" onClick={handleEditClick}>Editar sala</button>
      </div>
      <img src={imageSrc} alt={room.name} className="img-fluid rounded mb-4" />
      <div className="room-actions bottom d-flex justify-content-between w-100">
        <button className="btn btn-secondary" onClick={handleBackClick}>Voltar</button>
        <button 
          className={`btn ${room.status ? 'btn-danger' : 'btn-success'}`} 
          onClick={handleReserveClick}
        >
          {room.status ? 'Sala Ocupada' : 'Reservar'}
        </button>
      </div>
    </div>
  );
};

export default RoomDetails;