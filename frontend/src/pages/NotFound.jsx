import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: '80vh', textAlign: 'center' }}
    >
      <h1 className="display-4 mb-3">404 - Página Não Encontrada</h1>
      <p className="h5 mb-4">A página que você está procurando não existe.</p>
      <Link to="/" className="btn btn-primary">
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;