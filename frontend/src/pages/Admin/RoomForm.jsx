// frontend/src/components/RoomForm.jsx
import React, { useState } from 'react';

const RoomForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [occupiedByEmployeeId, setOccupiedByEmployeeId] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, status, imageBase64, occupiedByEmployeeId });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Room Name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Room Description"
      ></textarea>
      <label>
        Status:
        <input
          type="checkbox"
          checked={status}
          onChange={(e) => setStatus(e.target.checked)}
        />
      </label>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {/* Add fields for OccupiedByEmployeeId as needed */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default RoomForm;