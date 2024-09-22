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
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} NexusLock. All rights reserved.</p>
      </footer>
    )
  );
};

export default Footer;