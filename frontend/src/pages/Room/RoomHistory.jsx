import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Pagination, Button } from 'react-bootstrap';

const RoomHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accessLogs, setAccessLogs] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  });

  useEffect(() => {
    const fetchRoomAndHistory = async () => {
      try {
        const [roomResponse, logsResponse] = await Promise.all([
          api.get(`/rooms/${id}`),
          api.get(`/accesslogs/room/${id}`, {
            params: {
              pageNumber: pagination.pageNumber,
              pageSize: pagination.pageSize
            }
          })
        ]);
        setRoom(roomResponse.data);
        console.log(logsResponse.data);
        setAccessLogs(logsResponse.data.logs);
        setPagination({
          totalCount: logsResponse.data.totalCount,
          pageNumber: logsResponse.data.pageNumber,
          pageSize: logsResponse.data.pageSize
        });
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar histórico da sala:', err);
        setError('Falha ao carregar o histórico da sala. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchRoomAndHistory();
  }, [id, pagination.pageNumber]);

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, pageNumber }));
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) return <div className="text-center m-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!room) return <div className="alert alert-warning m-3">Sala não encontrada.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Histórico da Sala: {room.name}</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Detalhes da Sala</h5>
          <p className="card-text"><strong>Descrição:</strong> {room.description}</p>
          <p className="card-text"><strong>Status:</strong> 
            <span className={`badge ${room.status ? 'bg-danger' : 'bg-success'} ms-2`}>
              {room.status ? 'Ocupada' : 'Disponível'}
            </span>
          </p>
          {room.occupiedByEmployeeName && (
            <p className="card-text"><strong>Ocupada por:</strong> {room.occupiedByEmployeeName}</p>
          )}
        </div>
      </div>

      <h3 className="mb-3">Registros de Acesso</h3>
      {accessLogs.length === 0 ? (
        <p>Nenhum registro de acesso encontrado para esta sala.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Horário de Acesso</th>
                  <th>Acesso Concedido</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.map((log) => (
                  <tr key={log.logId}>
                    <td>{log.employeeName}</td>
                    <td>{new Date(log.accessTime).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${log.accessGranted ? 'bg-success' : 'bg-danger'}`}>
                        {log.accessGranted ? 'Concedido' : 'Negado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination className="justify-content-center mt-3">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.pageNumber === 1} />
            <Pagination.Prev onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 1} />
            {[...Array(Math.ceil(pagination.totalCount / pagination.pageSize)).keys()].map((page) => (
              <Pagination.Item
                key={page + 1}
                active={page + 1 === pagination.pageNumber}
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber === Math.ceil(pagination.totalCount / pagination.pageSize)} />
            <Pagination.Last onClick={() => handlePageChange(Math.ceil(pagination.totalCount / pagination.pageSize))} disabled={pagination.pageNumber === Math.ceil(pagination.totalCount / pagination.pageSize)} />
          </Pagination>
        </>
      )}
      <Button variant="secondary" onClick={handleBackClick} className="mt-3">Voltar</Button>
    </div>
  );
};

export default RoomHistory;