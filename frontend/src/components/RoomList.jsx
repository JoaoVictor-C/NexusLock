import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RoomCard from './RoomCard';
import '../styles/components/RoomList.css';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState('grid');

  useEffect(() => {
    api.get('/rooms')
      .then(response => setRooms(response.data))
      .catch(error => console.error('Error fetching rooms:', error));
      console.log(rooms);
  }, []);

  return (
    <div className="room-list">
      <div className="room-list-header">
        <input type="text" placeholder="Pesquisar..." />
        <div className="view-controls">
          <button onClick={() => setView('grid')}>Grid</button>
          <button onClick={() => setView('list')}>List</button>
        </div>
      </div>
      <div className={`room-list-content ${view}`}>
        {rooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomList;