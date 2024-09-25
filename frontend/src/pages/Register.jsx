import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import senaiLogo from '../assets/senai-logo.png';
import Loading from '../components/Loading';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import backgroundPattern from '../assets/background-pattern.png';
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
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light" style={{ backgroundImage: `url(${backgroundPattern})` }}>
        <div className="bg-white p-4 rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
          <img src={senaiLogo} alt="SENAI Logo" className="mx-auto d-block mb-3" style={{ width: '200px' }} />
          <h2 className="text-center mb-4 text-dark">Cadastro</h2>
          <p className="text-center text-muted mb-4">Preencha os campos</p>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="name" 
              placeholder="Nome completo" 
              value={form.name} 
              onChange={handleChange} 
              required 
              className="form-control mb-3" 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="E-mail" 
              value={form.email} 
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
                className={`form-control ${form.password && !passwordsMatch ? 'is-invalid' : ''}`}
              />
              <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                {passwordIsVisible 
                  ? <EyeSlashIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} className="h-5 w-5 text-muted" /> 
                  : <EyeIcon onClick={() => setPasswordIsVisible(!passwordIsVisible)} className="h-5 w-5 text-muted" />}
              </div>
              {form.password && !passwordsMatch && (
                <div className="invalid-feedback">
                  As senhas não são iguais
                </div>
              )}
            </div>
            <div className="position-relative mb-3">
              <input 
                type={confirmPasswordIsVisible ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirme a senha" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
                className={`form-control ${form.confirmPassword && !passwordsMatch ? 'is-invalid' : ''}`}
              />
              <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                {confirmPasswordIsVisible 
                  ? <EyeSlashIcon onClick={() => setConfirmPasswordIsVisible(!confirmPasswordIsVisible)} className="h-5 w-5 text-muted" /> 
                  : <EyeIcon onClick={() => setConfirmPasswordIsVisible(!confirmPasswordIsVisible)} className="h-5 w-5 text-muted" />}
              </div>
              {form.confirmPassword && !passwordsMatch && (
                <div className="invalid-feedback">
                  As senhas não são iguais
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3">Cadastrar</button>
            <p className="text-center text-muted">
              Já possui uma conta? <Link to="/login" className="text-primary text-decoration-none">Entrar</Link>
            </p>
          </form>
        </div>
      </div>
    )
  );
};

export default Register;