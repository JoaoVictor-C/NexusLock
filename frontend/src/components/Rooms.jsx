import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RoomGrid from './RoomGrid';
import RoomList from './RoomList';
import { useNavigate } from 'react-router-dom';
import { Container, Form, InputGroup, ButtonGroup, ToggleButton, Dropdown } from 'react-bootstrap';
import { BsGrid, BsList, BsFilter } from 'react-icons/bs';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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
    let filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === (statusFilter === 'occupied'));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        return a.status === b.status ? 0 : a.status ? -1 : 1;
      }
      return 0;
    });

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, statusFilter, sortBy]);  

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
        <div className="d-flex">
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-filter">
              <BsFilter /> Filtrar
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setStatusFilter('all')}>Todas as salas</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('available')}>Disponíveis</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('occupied')}>Ocupadas</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort">
              Ordenar por
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortBy('name')}>Nome</Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy('status')}>Status</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
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
      </div>

      {filteredRooms.length > 0 ? (
        isMobile || view === 'grid' ? (
          <RoomGrid rooms={filteredRooms} handleAccess={handleAccess} />
        ) : (
          <RoomList rooms={filteredRooms} handleAccess={handleAccess} />
        )
      ) : (
        <p className="text-center">Nenhuma sala encontrada.</p>
      )}
    </Container>
  );
};

export default Rooms;