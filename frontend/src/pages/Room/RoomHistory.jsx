import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const RoomHistory = () => {
  const { roomId } = useParams();
  const [accessLogs, setAccessLogs] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomAndHistory = async () => {
      try {
        const [roomResponse, logsResponse] = await Promise.all([
          api.get(`/rooms/${roomId}`),
          api.get(`/accesslogs/room/${roomId}?pageSize=50`)
        ]);
        setRoom(roomResponse.data);
        setAccessLogs(logsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching room history:', err);
        setError('Failed to load room history. Please try again later.');
        setLoading(false);
      }
    };

    fetchRoomAndHistory();
  }, [roomId]);

  if (loading) return <div className="text-center m-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!room) return <div className="alert alert-warning m-3">Room not found.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Room History: {room.name}</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Room Details</h5>
          <p className="card-text"><strong>Description:</strong> {room.description}</p>
          <p className="card-text"><strong>Status:</strong> 
            <span className={`badge ${room.status ? 'bg-danger' : 'bg-success'} ms-2`}>
              {room.status ? 'Occupied' : 'Available'}
            </span>
          </p>
          {room.occupiedByEmployeeName && (
            <p className="card-text"><strong>Occupied By:</strong> {room.occupiedByEmployeeName}</p>
          )}
        </div>
      </div>

      <h3 className="mb-3">Access Logs</h3>
      {accessLogs.length === 0 ? (
        <p>No access logs found for this room.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Access Time</th>
                <th>Access Granted</th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.map((log) => (
                <tr key={log.logId}>
                  <td>{log.employeeName}</td>
                  <td>{new Date(log.accessTime).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${log.accessGranted ? 'bg-success' : 'bg-danger'}`}>
                      {log.accessGranted ? 'Granted' : 'Denied'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomHistory;