import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Header.css';
import senaiLogo from '../assets/senai-logo.png';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import api from '../services/api';
import Logout from './Logout';

const Header = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const menuToggleRef = useRef(null);
  const navLinksRef = useRef(null);

  const fetchUser = async () => {
    console.log(auth);
    setIsAdmin(false);
    const response = await api.get('/Employees/isAdmin');
    console.log(`Response status: ${response.status}`);
    if (response.status === 200) {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    fetchUser();

    if (auth) {
      setShowHeader(true);
    } else {
      setShowHeader(false);
      return;
    }
    const menuToggle = menuToggleRef.current;
    const navLinks = navLinksRef.current;

    if (menuToggle && navLinks) {
      const handleToggle = () => {
        navLinks.classList.toggle('active');
      };

      menuToggle.addEventListener('click', handleToggle);
    }

    return () => {
      if (menuToggle && navLinks) {
        menuToggle.removeEventListener('click', handleToggle);
      }
    };
  }, [auth]);



  return (
    showHeader && (
      <header className="header">
        <div className="logo-header">
          <Link to="/">
            <img src={senaiLogo} alt="SENAI Logo" className="senai-logo-header" />
          </Link>
        </div>
        <button className="menu-toggle" id="menu-toggle" ref={menuToggleRef}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav>
          <ul className="nav-links" id="nav-links" ref={navLinksRef}>
            <li>
              <Link to="/"><FaUser /> Página Inicial</Link>
            </li>
            <li>
              <Link to="/settings"><FaCog /> Configurações</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin"><FaUser /> Painel de administração</Link>
              </li>
            )}
            {auth ? (
              <li>
                <Logout />
              </li>
            ) : (
              <li>
                <Link to="/login"><FaUser /> Entrar</Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
    )
  );
};

export default Header;