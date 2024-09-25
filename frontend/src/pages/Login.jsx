import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import senaiLogo from '../assets/senai-logo.png';
import Loading from '../components/Loading';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 
import backgroundPattern from '../assets/background-pattern.png';
const Login = () => {
  const { setAuth, auth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const navigate = useNavigate();

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
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isLoading ? <Loading /> : (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light" style={{ backgroundImage: `url(${backgroundPattern})` }}>
        <div className="bg-white p-4 rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
          <img src={senaiLogo} alt="SENAI Logo" className="mx-auto d-block mb-3" style={{ width: '200px' }} />
          <h2 className="text-center mb-4 text-dark">Login</h2>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="username_and_email" 
              placeholder="E-mail ou Nome de usuário" 
              value={form.username_and_email} 
              onChange={handleChange} 
              required 
              className="form-control mb-3" 
            />
            <div className="position-relative mb-3">
              <input 
                type={passwordIsVisible ? "text" : "password"} 
                name="password" 
                placeholder="Senha" 
                value={form.password} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
              <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                {passwordIsVisible 
                  ? <EyeSlashIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} className="h-5 w-5 text-muted" /> 
                  : <EyeIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} className="h-5 w-5 text-muted" />}
              </div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <Link to="/forgot-password" className="text-primary text-decoration-none">Esqueci minha senha</Link>
              <Link to="/register" className="text-primary text-decoration-none">Novo aqui? (cadastrar)</Link>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-100 mb-3">Entrar</button>
          </form>
        </div>
      </div>
    )
  );
};

export default Login;