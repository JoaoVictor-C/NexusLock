import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState({
    name: '',
    description: '',
    status: false,
    imageBase64: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/rooms/${id}`);
        setRoom(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar sala:', err);
        setError('Falha ao carregar dados da sala. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoom(prevRoom => ({
      ...prevRoom,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800; // Set your desired max width
          const maxHeight = 600; // Set your desired max height
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality as needed
          const base64String = compressedBase64.split(',')[1];
          setRoom(prevRoom => ({ ...prevRoom, imageBase64: base64String }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/rooms/${id}`, room);
      navigate(`/room/${id}`);
    } catch (err) {
      console.error('Erro ao atualizar sala:', err);
      setError('Falha ao atualizar sala. Por favor, tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
      try {
        await api.delete(`/rooms/${id}`);
        navigate('/');
      } catch (err) {
        console.error('Erro ao excluir sala:', err);
        setError('Falha ao excluir sala. Por favor, tente novamente.');
      }
    }
  };

  const handleBackClick = () => {
    navigate('/rooms');
  };

  if (loading) return <div className="text-center m-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Editar Sala: {room.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={room.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Descrição</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={room.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="status"
            name="status"
            checked={room.status}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="status">Ocupada</label>
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Imagem da Sala</label>
          <input
            type="file"
            className="form-control"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        {room.imageBase64 && (
          <div className="mb-3">
            <img
              src={`data:image/png;base64,${room.imageBase64}`}
              alt="Sala"
              className="img-thumbnail"
              style={{ maxWidth: '200px' }}
            />
          </div>
        )}
        <div className="d-flex justify-content-between gap-4 mb-3">
          <button type="button" className="btn btn-secondary w-100" onClick={handleBackClick}>Voltar</button>
          <button type="submit" className="btn btn-primary w-100">Atualizar Sala</button>
          <button type="button" className="btn btn-danger w-100" onClick={handleDelete}>Excluir Sala</button>
        </div>
      </form>
    </div>
  );
};

export default RoomEdit;