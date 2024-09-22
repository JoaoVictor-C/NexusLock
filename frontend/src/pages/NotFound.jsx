import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404 - Página Não Encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <Link to="/">Voltar para a página inicial</Link>
    </div>
  );
};

export default NotFound;