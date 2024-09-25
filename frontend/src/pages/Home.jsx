import React, { useState, useEffect } from 'react';
import Rooms from '../components/Rooms';
import api from '../services/api';

const Home = () => {
  const [user, setUser] = useState('');
  const [randomMessage, setRandomMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/Auth/user');
        setUser(response.data.name);
        const messages = [
          `Bem-vindo ao NexusLock, ${response.data.name}!`,
          `Olá, ${response.data.name}!`,
          `Seja bem-vindo, ${response.data.name}!`,
          `É um prazer tê-lo conosco, ${response.data.name}!`,
          `Que bom ver você, ${response.data.name}!`,
          `Pronto para um ótimo dia, ${response.data.name}?`,
          `${response.data.name}, que bom que você chegou!`,
          `Bem-vindo de volta, ${response.data.name}!`,
          `Olá! Esperamos que tenha um excelente dia, ${response.data.name}!`,
          `${response.data.name}, sua presença ilumina nosso dia!`,
          `Ótimo tê-lo aqui, ${response.data.name}!`,
          `Preparado para mais um dia produtivo, ${response.data.name}?`,
          `${response.data.name}, que sua jornada hoje seja incrível!`,
          `Bem-vindo ao seu espaço de trabalho, ${response.data.name}!`,
          `${response.data.name}, estamos felizes em vê-lo novamente!`
        ];
        setRandomMessage(messages[Math.floor(Math.random() * messages.length)]);
      } catch (error) {
        console.error('Error fetching user:', error);
        setRandomMessage('Bem-vindo ao NexusLock!');
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="p-3">
      <section className="py-5 px-3 mb-4 text-center">
        <h1 className="display-4">{randomMessage}</h1>
      </section>
      <Rooms />
    </div>
  );
};

export default Home;