import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const { auth } = useContext(AuthContext);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    if (auth) {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  }, [auth]);

  return (
    showFooter && (
      <footer className="bg-white text-dark py-3 shadow-sm">
        <Container className="text-center">
          &copy; {new Date().getFullYear()} NexusLock. All rights reserved.
        </Container>
      </footer>
    )
  );
};

export default Footer;