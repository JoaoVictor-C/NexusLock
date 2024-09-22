import React, { useState, useEffect } from 'react';
import RoomList from '../components/RoomList';
import '../styles/pages/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/Auth/user').then(response => setUser(response.data));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to NexusLock</h1>
        <p>Your gateway to exclusive rooms and experiences.</p>
      </section>
      <RoomList />
    </div>
  );
};

export default Home;