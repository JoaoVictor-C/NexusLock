import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Form, Button, Container, Alert } from 'react-bootstrap';

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
          const maxWidth = 800;
          const maxHeight = 600;
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

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
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
    navigate(-1);
  };

  if (loading) return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <Alert variant="danger" className="text-center my-5">{error}</Alert>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Editar Sala: {room.name}</h2>
      <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={room.name}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={room.description}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group className="mb-3 form-check">
          <Form.Check
            type="checkbox"
            label="Ocupada"
            name="status"
            checked={room.status}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Imagem da Sala</Form.Label>
          <Form.Control
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
        </Form.Group>
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
          <Button variant="secondary" onClick={handleBackClick} className="w-100">Voltar</Button>
          <Button variant="primary" type="submit" className="w-100">Atualizar Sala</Button>
          <Button variant="danger" onClick={handleDelete} className="w-100">Excluir Sala</Button>
        </div>
      </Form>
    </Container>
  );
};

export default RoomEdit;