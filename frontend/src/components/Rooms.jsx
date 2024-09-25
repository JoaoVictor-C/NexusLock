import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RoomGrid from './RoomGrid';
import RoomList from './RoomList';
import { useNavigate } from 'react-router-dom';
import { Container, Form, InputGroup, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { BsGrid, BsList } from 'react-icons/bs';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        setRooms(Array.isArray(response.data.rooms) ? response.data.rooms : []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
      }
    };
    fetchRooms();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!Array.isArray(rooms)) {
      console.error('Rooms is not an array:', rooms);
      setFilteredRooms([]);
      return;
    }
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [rooms, searchTerm]);  

  const handleAccess = (room) => {
    navigate(`/room/${room.roomId}`);
  };

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <Form className={`w-${isMobile ? '100' : '50'} mb-2 mb-md-0`}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Form>
        {!isMobile && (
          <ButtonGroup>
            <ToggleButton
              type="radio"
              variant="outline-primary"
              name="view"
              value="grid"
              checked={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <BsGrid />
            </ToggleButton>
            <ToggleButton
              type="radio"
              variant="outline-primary"
              name="view"
              value="list"
              checked={view === 'list'}
              onClick={() => setView('list')}
            >
              <BsList />
            </ToggleButton>
          </ButtonGroup>
        )}
      </div>

      {filteredRooms.length > 0 ? (
        isMobile || view === 'grid' ? (
          <RoomGrid rooms={filteredRooms} handleAccess={handleAccess} />
        ) : (
          <RoomList rooms={filteredRooms} handleAccess={handleAccess} />
        )
      ) : (
        <p className="text-center">No rooms found.</p>
      )}
    </Container>
  );
};

export default Rooms;