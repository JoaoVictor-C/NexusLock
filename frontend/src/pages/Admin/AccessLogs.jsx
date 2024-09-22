import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/AccessLogs');
      setLogs(response.data.logs);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching access logs:', err);
      setError('Failed to load access logs. Please try again.');
      setLoading(false);
    }
  };

  // Note: The AccessLogsController doesn't provide update or delete endpoints,
  // so these functions are not implemented.

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="access-logs">
      <h2 className="mb-4">Access Logs</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Employee</th>
              <th>Room</th>
              <th>Access Time</th>
              <th>Access Granted</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.logId}>
                <td>{log.logId}</td>
                <td>{log.employeeName}</td>
                <td>{log.roomName}</td>
                <td>{new Date(log.accessTime).toLocaleString()}</td>
                <td>{log.accessGranted ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessLogs;
