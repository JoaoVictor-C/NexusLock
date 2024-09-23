import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';
import RoomManagement from './RoomManagement';
import AccessLogs from './AccessLogs';
import api from '../../services/api';
import { useNavigate, Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchIsAdmin = async () => {
      const response = await api.get('/Employees/isAdmin');
      if (response.status === 200) {
        setIsAdmin(true);
      } else {
        navigate('/');
      }
    };

    fetchIsAdmin();
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement />;
      case 'permissions':
        return <PermissionManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'logs':
        return <AccessLogs />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel container mt-4">
      <h1 className="mb-4">Painel de Administração</h1>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Usuários</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Cargos</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>Permissões</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Salas</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Logs de Acesso</button>
        </li>
      </ul>
      {renderActiveTab()}
    </div>
  );
};

export default AdminPanel;