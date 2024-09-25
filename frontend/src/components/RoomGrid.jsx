import React from 'react';
import RoomCard from './RoomCard';
import { Row, Col } from 'react-bootstrap';

const RoomGrid = ({ rooms, handleAccess }) => {
  return (
    <Row xs={1} md={3} className="g-4">
      {rooms.map(room => (
        <Col key={room.roomId}>
          <RoomCard room={room} view="grid" handleAccess={handleAccess} />
        </Col>
      ))}
    </Row>
  );
};

export default RoomGrid;