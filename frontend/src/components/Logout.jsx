import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import '../styles/components/Logout.css';

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
      setAuth(null);
      navigate('/login');
    }
  };

  return (
    <button onClick={handleLogout} className='logout-button'>
      <FaSignOutAlt /> Sair
    </button>
  );
};

export default Logout;