import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RoomGrid from './RoomGrid';
import RoomList from './RoomList';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        setRooms(Array.isArray(response.data.rooms) ? response.data.rooms : []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const filterRooms = () => {
      if (!Array.isArray(rooms)) {
        console.error('Rooms is not an array:', rooms);
        setFilteredRooms([]);
        return;
      }
      const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    };
    filterRooms();
  }, [rooms, searchTerm]);

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