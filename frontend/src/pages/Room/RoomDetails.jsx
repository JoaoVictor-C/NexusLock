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

  const handleReserveClick = () => {
    api
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
    <div className="room-details">
      <h2>{room.name}</h2>
      <div className="room-actions top">
        <button onClick={handleHistoryClick}>Histórico de uso</button>
        <button onClick={handlePermissionClick}>Controle de permissão</button>
        <button onClick={handleEditClick}>Editar sala</button>
      </div>
      <img src={imageSrc} alt={room.name} />
      <div className="room-actions bottom">
        <button className="back-button" onClick={handleBackClick}>Voltar</button>
        <button className="reserve-button" onClick={handleReserveClick} disabled={room.status}>
          {room.status ? 'Sala Ocupada' : 'Reservar'}
        </button>
      </div>
    </div>
  );
};

export default RoomDetails;