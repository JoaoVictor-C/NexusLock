import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/pages/RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    axios.get(`/api/rooms/${id}`)
      .then(response => setRoom(response.data))
      .catch(error => console.error('Error fetching room details:', error));
  }, [id]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div className="room-details">
      <h2>{room.name}</h2>
      <img src={room.imageUrl} alt={room.name} />
      <div className="room-actions">
        <button>Histórico de uso</button>
        <button>Controle de permissão</button>
        <button>Editar sala</button>
      </div>
      <button className="reserve-button">Reservar</button>
    </div>
  );
};

export default RoomDetails;