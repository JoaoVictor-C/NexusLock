import React, { useState, useEffect, useContext } from 'react';
import '../styles/components/Footer.css';
import { AuthContext } from '../contexts/AuthContext';

const Footer = () => {
  const { auth } = useContext(AuthContext);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    if (auth) {
      setShowFooter(true);
    }
  }, [auth]);
  
  return (
    showFooter && (
      <footer className="container-fluid d-flex justify-content-center align-items-center border-top py-4 mt-3">
        <p>&copy; {new Date().getFullYear()} NexusLock. All rights reserved.</p>
      </footer>
    )
  );
};

export default Footer;