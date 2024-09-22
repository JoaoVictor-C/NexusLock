import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/pages/Login.css';
import senaiLogo from '../assets/senai-logo.png';
import Loading from '../components/Loading';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 

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
    email: '',
    password: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/Auth/login', form);
      setAuth({
        token: response.data.Token,
      });
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isLoading ? <Loading /> : (
      <div className="login-container">
        <div className="login-form">
          <img src={senaiLogo} alt="SENAI Logo" className="logo" />
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              name="email" 
              placeholder="E-mail" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
            <div className="password-input">
              <input 
                type={passwordIsVisible ? "text" : "password"} 
                name="password" 
                placeholder="Senha" 
                value={form.password} 
                onChange={handleChange} 
                required 
              />
              {passwordIsVisible 
                ? <EyeSlashIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} /> 
                : <EyeIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} />}
            </div>
            <div className="form-links">
              <Link to="/forgot-password">Esqueci minha senha</Link>
              <Link to="/register">Novo aqui? (cadastrar)</Link>
            </div>
            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
    )
  );
};

export default Login;