import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';

const Logout = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!auth) return;

    try {
      await api.post('/Auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth');
      setAuth(null);
      navigate('/login');
    }
  };

  return (
    <Button variant="danger" onClick={handleLogout} className="d-flex align-items-center">
      <FaSignOutAlt className="me-2" /> Sair
    </Button>
  );
};

export default Logout;