import React from 'react';
import RoomCard from './RoomCard';
import { Table } from 'react-bootstrap';

const RoomList = ({ rooms, handleAccess }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th className='text-center'>Image</th>
          <th className='text-center'>Name</th>
          <th>Description</th>
          <th className='text-center'>Status</th>
          <th className='text-center'>Occupied By</th>
          <th className='text-center'>Action</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map(room => (
          <RoomCard key={room.roomId} room={room} view="list" handleAccess={handleAccess} />
        ))}
      </tbody>
    </Table>
  );
};

export default RoomList;