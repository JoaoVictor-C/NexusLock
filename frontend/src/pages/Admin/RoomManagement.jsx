import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', status: false });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/Rooms');
      setRooms(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again.');
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      await api.post('/Rooms', newRoom);
      setNewRoom({ name: '', description: '', status: false });
      fetchRooms();
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    }
  };

  const handleUpdateRoom = async () => {
    try {
      await api.put(`/Rooms/${editingRoom.roomId}`, editingRoom);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      console.error('Error updating room:', err);
      setError('Failed to update room. Please try again.');
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await api.delete(`/Rooms/${id}`);
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      setError('Failed to delete room. Please try again.');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="room-management">
      <h2 className="mb-4">Rooms</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.roomId}>
                <td>{room.name}</td>
                <td>{room.description}</td>
                <td>
                  <span className={`badge ${room.status ? 'bg-danger' : 'bg-success'}`}>
                    {room.status ? 'Occupied' : 'Available'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManagement;