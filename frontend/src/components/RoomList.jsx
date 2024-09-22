import React from 'react';
import RoomCard from './RoomCard';

const RoomList = ({ rooms, handleAccess }) => {
	return (
		<div className="list-group">
			{rooms.map(room => (
				<RoomCard key={room.roomId} room={room} view="list" handleAccess={handleAccess} />
			))}
		</div>
	);
};

export default RoomList;
