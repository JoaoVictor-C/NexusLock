import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RoomGrid from './RoomGrid';
import RoomList from './RoomList';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/rooms')
      .then(response => setRooms(response.data))
      .catch(error => console.error('Error fetching rooms:', error));
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAccess = (room) => {
    navigate(`/room/${room.roomId}`);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control w-50"
        />
        <div className="btn-group" role="group" aria-label="View controls">
          <button
            onClick={() => setView('grid')}
            className={`btn btn-outline-primary ${view === 'grid' ? 'active' : ''}`}
            aria-label="Grid View"
          >
            🟩
          </button>
          <button
            onClick={() => setView('list')}
            className={`btn btn-outline-primary ${view === 'list' ? 'active' : ''}`}
            aria-label="List View"
          >
            📝
          </button>
        </div>
      </div>

      {filteredRooms.length > 0 ? (
        view === 'grid' ? (
          <RoomGrid rooms={filteredRooms} handleAccess={handleAccess} />
        ) : (
          <RoomList rooms={filteredRooms} handleAccess={handleAccess} />
        )
      ) : (
        <p>No rooms found.</p>
      )}
    </div>
  );
};

export default Rooms;