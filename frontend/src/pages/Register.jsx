import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/pages/Register.css';
import senaiLogo from '../assets/senai-logo.png';
import Loading from '../components/Loading';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const { setAuth, auth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [confirmPasswordIsVisible, setConfirmPasswordIsVisible] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    if (auth) {
      navigate('/');
    }
  }, [auth, navigate]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordsMatch(name === 'password' 
        ? value === form.confirmPassword 
        : value === form.password);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('As senhas não são iguais');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/Auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setAuth({
        token: response.data.Token,
        refreshToken: response.data.RefreshToken,
      });
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Cadastro falhou. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isLoading ? <Loading /> : (
      <div className="register-container">
        <div className="register-form">
          <img src={senaiLogo} alt="SENAI Logo" className="logo" />
          <h2>Cadastro</h2>
          <p className="form-subtitle">Preencha os campos</p>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="name" 
              placeholder="Nome completo" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
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
                style={{ borderColor: form.password && !passwordsMatch ? 'red' : '' }}
              />
              {passwordIsVisible 
                ? <EyeSlashIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} /> 
                : <EyeIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} />}
            </div>
            <div className="password-input">
              <input 
                type={confirmPasswordIsVisible ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirme a senha" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
                style={{ borderColor: form.confirmPassword && !passwordsMatch ? 'red' : '' }}
              />
              {confirmPasswordIsVisible 
                ? <EyeSlashIcon onClick={() => setConfirmPasswordIsVisible(!confirmPasswordIsVisible)} /> 
                : <EyeIcon onClick={() => setConfirmPasswordIsVisible(!confirmPasswordIsVisible)} />}
            </div>
            {form.confirmPassword && !passwordsMatch && (
              <p style={{ color: 'red', marginTop: '-10px', marginBottom: '10px' }}>
                As senhas não são iguais
              </p>
            )}
            <button type="submit">Cadastrar</button>
            <p className="form-subtitle">
              Já possui uma conta? <Link to="/login" style={{ color: 'blue', textDecoration: 'none' }}>Entrar</Link>
            </p>
          </form>
        </div>
      </div>
    )
  );
};

export default Register;