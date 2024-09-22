import React from 'react';
import RoomCard from './RoomCard';

const RoomGrid = ({ rooms, handleAccess }) => {
  return (
    <div className="row row-cols-1 row-cols-md-3 g-4">
      {rooms.map(room => (
        <div className="col" key={room.roomId}>
          <RoomCard room={room} view="grid" handleAccess={handleAccess} />
        </div>
      ))}
    </div>
  );
};

export default RoomGrid;
