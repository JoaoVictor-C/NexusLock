import React from 'react';
import defaultImage from '../assets/default-image.png';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';

const RoomCard = ({ room, view, handleAccess }) => {
  const { name, status, imageBase64, description, occupiedByEmployeeName } = room;
  const imageSrc = imageBase64 ? `data:image/png;base64,${imageBase64}` : defaultImage;

  if (view === 'list') {
    return (
      <tr>
        <td className='text-center'>
          <img
            src={imageSrc}
            alt={name}
            style={{ objectFit: 'cover', height: '60px', width: '60px', borderRadius: '4px' }}
          />
        </td>
        <td className='text-center'>{name}</td>
        <td>{description}</td>
        <td className='text-center'>
          <Badge bg={status ? 'danger' : 'success'}>
            {status ? 'Ocupado' : 'Disponível'}
          </Badge>
        </td>
        <td className='text-center'>{occupiedByEmployeeName || 'Disponível'}</td>
        <td className='text-center'>
          <Button variant="primary" onClick={() => handleAccess(room)}>
            Acessar
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <Card className={`h-100 ${view === 'list' ? 'flex-row align-items-center w-100' : ''}`}>
      <Card.Img
        variant="top"
        src={imageSrc}
        alt={name}
        className={view === 'list' ? 'w-25' : ''}
        style={{
          objectFit: 'cover',
          height: view === 'grid' ? '300px' : 'auto',
          maxWidth: view === 'grid' ? '100%' : '400px'
        }}
      />
      <Card.Body className={`${view === 'list' ? 'w-100' : 'd-flex flex-column justify-content-between'}`}>
        <Card.Title
          className={
            view === 'grid'
              ? `position-absolute top-0 start-50 translate-middle-x bg-white p-2 px-4 mt-3 border-bottom border-3 shadow-sm border-${status ? 'danger' : 'success'}`
              : ''
          }
        >
          {name}
        </Card.Title>
        {view === 'list' && (
          <>
            <Card.Text>{description}</Card.Text>
            <Row className="align-items-center w-100">
              <Col xs={3}>
                <Badge bg={status ? 'danger' : 'success'}>
                  {status ? 'Ocupado' : 'Disponível'}
                </Badge>
              </Col>
              <Col xs={3}>
                <Card.Text>{occupiedByEmployeeName || 'Disponível'}</Card.Text>
              </Col>
              <Col xs={3}>
                <Button variant="primary" onClick={() => handleAccess(room)}>
                  Acessar
                </Button>
              </Col>
            </Row>
          </>
        )}
        {view === 'grid' && (
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <Badge bg={status ? 'danger' : 'success'}>
              {status ? 'Ocupado' : 'Disponível'}
            </Badge>
            <Button variant="primary" onClick={() => handleAccess(room)}>
              Acessar
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RoomCard;