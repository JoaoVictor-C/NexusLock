import React from 'react';
import '../styles/components/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} NexusLock. All rights reserved.</p>
    </footer>
  );
};

export default Footer;