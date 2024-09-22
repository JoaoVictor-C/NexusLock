import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ roleName: '', description: '' });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/Roles');
      setRoles(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again.');
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      await api.post('/Roles', newRole);
      setNewRole({ roleName: '', description: '' });
      fetchRoles();
    } catch (err) {
      console.error('Error creating role:', err);
      setError('Failed to create role. Please try again.');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await api.put(`/Roles/${editingRole.roleId}`, editingRole);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role. Please try again.');
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await api.delete(`/Roles/${id}`);
      fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Failed to delete role. Please try again.');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="role-management">
      <h2 className="mb-4">Roles</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.roleId}>
                <td>{role.roleName}</td>
                <td>{role.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;