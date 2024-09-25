import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import senaiLogo from '../assets/senai-logo.png';
import Loading from '../components/Loading';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 
import backgroundPattern from '../assets/background-pattern.png';
import { Form, Alert, Button } from 'react-bootstrap';

const Login = () => {
  const { setAuth, auth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth) {
      navigate('/');
    }
  }, [auth, navigate]);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = e => {
    if (e.target.name === 'username_and_email') {
      setForm({ ...form, username: e.target.value, email: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/Auth/login', form, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setAuth(response.data);
      localStorage.setItem('auth', JSON.stringify(response.data));
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login falhou. Por favor, verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light" style={{ backgroundImage: `url(${backgroundPattern})` }}>
      <div className="bg-white p-4 rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <img src={senaiLogo} alt="SENAI Logo" className="mx-auto d-block mb-3" style={{ width: '200px' }} />
        <h2 className="text-center mb-4 text-dark">Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="username_and_email">E-mail ou Nome de usuário</Form.Label>
            <Form.Control
              type="text"
              id="username_and_email"
              name="username_and_email"
              value={form.username_and_email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="password">Senha</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={passwordIsVisible ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Button
                variant="link"
                className="position-absolute top-50 end-0 translate-middle-y"
                onClick={() => setPasswordIsVisible(!passwordIsVisible)}
              >
                {passwordIsVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </Button>
            </div>
          </Form.Group>
          <div className="d-flex justify-content-between mb-3">
            <Link to="/forgot-password" className="text-primary text-decoration-none">Esqueci minha senha</Link>
            <Link to="/register" className="text-primary text-decoration-none">Novo aqui? (cadastrar)</Link>
          </div>
          <Button type="submit" variant="primary" className="w-100 mb-3" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;