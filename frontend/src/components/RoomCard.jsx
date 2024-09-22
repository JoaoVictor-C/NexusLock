import React from 'react';

const RoomCard = ({ room }) => {
  const { name, description, status, imageBase64, occupiedByEmployeeName } = room;
  const imageSrc = imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : 'default-image.jpg';

  return (
    <div className="room-card">
      <img src={imageSrc} alt={name} />
      <h3>{name}</h3>
      <p>{description}</p>
      <p>Status: {status ? 'Occupied' : 'Available'}</p>
      {occupiedByEmployeeName && (
        <p>Occupied by: {occupiedByEmployeeName}</p>
      )}
    </div>
  );
};

export default RoomCard;
