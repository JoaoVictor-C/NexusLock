    // Start of Selection
    import React, { useContext, useEffect, useState } from 'react';
    import { Navbar, Nav, Container } from 'react-bootstrap';
    import { Link } from 'react-router-dom';
    import senaiLogo from '../assets/senai-logo.png';
    import { AuthContext } from '../contexts/AuthContext';
    import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
    import api from '../services/api';
    import Logout from './Logout';
    
    const Header = () => {
      const { auth } = useContext(AuthContext);
      const [isAdmin, setIsAdmin] = useState(false);
      const [showHeader, setShowHeader] = useState(false);
    
      const fetchUser = async () => {
        setIsAdmin(false);
        try {
          const response = await api.get('/Employees/isAdmin');
          if (response.status === 200) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error fetching admin status:', error);
        }
      };
    
      useEffect(() => {
        fetchUser();
        setShowHeader(!!auth);
      }, [auth]);
    
      return (
        showHeader && (
          <>
            <style>
              {`
                .nav-link-custom:hover {
                  color: #e30613 !important;
                }
                .navbar-toggler:click {
                  color: #e30613 !important;
                }
              `}
            </style>
            <Navbar bg="light" expand="lg" className="shadow-sm">
              <Container>
                <Navbar.Brand as={Link} to="/">
                  <img
                    src={senaiLogo}
                    alt="SENAI Logo"
                    height="50"
                    className="d-inline-block align-top"
                  />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="ms-auto gap-2">
                    <Nav.Link as={Link} to="/" className="nav-link-custom"><FaUser className="mb-1"/> Página Inicial</Nav.Link>
                    <Nav.Link as={Link} to="/settings" className="nav-link-custom"><FaCog className="mb-1"/> Configurações</Nav.Link>
                    {isAdmin && (
                      <Nav.Link as={Link} to="/admin" className="nav-link-custom"><FaUser className="mb-1"/> Painel de Administração</Nav.Link>
                    )}
                    {auth ? (
                      <Nav.Item>
                        <Logout />
                      </Nav.Item>
                    ) : (
                      <Nav.Link as={Link} to="/login" className="nav-link-custom"><FaUser className="mb-1"/> Entrar</Nav.Link>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </>
        )
      );
    };
    
    export default Header;