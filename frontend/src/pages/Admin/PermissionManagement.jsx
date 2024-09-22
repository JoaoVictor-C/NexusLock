import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  const [newPermission, setNewPermission] = useState({ permissionKey: '', description: '' });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/Permissions');
      setPermissions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions. Please try again.');
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      await api.post('/Permissions', newPermission);
      setNewPermission({ permissionKey: '', description: '' });
      fetchPermissions();
    } catch (err) {
      console.error('Error creating permission:', err);
      setError('Failed to create permission. Please try again.');
    }
  };

  const handleUpdatePermission = async () => {
    try {
      await api.put(`/Permissions/${editingPermission.permissionId}`, editingPermission);
      setEditingPermission(null);
      fetchPermissions();
    } catch (err) {
      console.error('Error updating permission:', err);
      setError('Failed to update permission. Please try again.');
    }
  };

  const handleDeletePermission = async (id) => {
    try {
      await api.delete(`/Permissions/${id}`);
      fetchPermissions();
    } catch (err) {
      console.error('Error deleting permission:', err);
      setError('Failed to delete permission. Please try again.');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="permission-management">
      <h2 className="mb-4">Permissions</h2>
      <button className="btn btn-primary mb-3" onClick={handleCreatePermission}>Create New Permission</button>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Permission Key</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.permissionId}>
                <td>{permission.permissionKey}</td>
                <td>{permission.description}</td>
                <td>
                  <button className="btn btn-sm btn-warning mr-2" onClick={() => handleUpdatePermission()}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeletePermission(permission.permissionId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionManagement;