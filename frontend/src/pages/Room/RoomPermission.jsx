import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RoomPermission = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeesWithAccess, setEmployeesWithAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomAndEmployees = async () => {
      try {
        const [roomResponse, employeesResponse, accessResponse] = await Promise.all([
          api.get(`/rooms/${id}`),
          api.get('/employees'),
          api.get(`/rooms/${id}/employees`)
        ]);
        setRoom(roomResponse.data);
        setEmployees(employeesResponse.data.employees);
        setEmployeesWithAccess(accessResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar sala e funcionários:', err);
        setError('Falha ao carregar permissões da sala. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchRoomAndEmployees();
  }, [id]);

  const handleToggleAccess = async (employeeId) => {
    try {
      const hasAccess = employeesWithAccess.some(e => e.employeeId === employeeId);
      if (hasAccess) {
        await api.delete(`/EmployeeRoomAccess/${room.roomId}/${employeeId}`);
        setEmployeesWithAccess(employeesWithAccess.filter(e => e.employeeId !== employeeId));
      } else {
        const response = await api.post('/EmployeeRoomAccess', { employeeId, roomId: room.roomId });
        setEmployeesWithAccess([...employeesWithAccess, response.data]);
      }
    } catch (err) {
      console.error('Erro ao alternar acesso:', err);
      setError('Falha ao atualizar acesso. Por favor, tente novamente.');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center m-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!room) return <div className="alert alert-warning m-3">Sala não encontrada.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Permissões da Sala: {room.name}</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Detalhes da Sala</h5>
          <p className="card-text"><strong>Descrição:</strong> {room.description}</p>
          <p className="card-text">
            <strong>Status:</strong> 
            <span className={`badge ${room.status ? 'bg-danger' : 'bg-success'} ms-2`}>
              {room.status ? 'Ocupada' : 'Disponível'}
            </span>
          </p>
        </div>
      </div>

      <h3 className="mb-3">Acesso de Funcionários</h3>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Pesquisar funcionários..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nome do Funcionário</th>
              <th>Acesso</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.employeeId}>
                <td>{employee.name}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`access-${employee.employeeId}`}
                      checked={employeesWithAccess.some(e => e.employeeId === employee.employeeId)}
                      onChange={() => handleToggleAccess(employee.employeeId)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label" htmlFor={`access-${employee.employeeId}`}>
                      {employeesWithAccess.some(e => e.employeeId === employee.employeeId) ? 'Concedido' : 'Não Concedido'}
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-primary" onClick={handleBackClick}>Voltar</button>
      </div>
    </div>
  );
};

export default RoomPermission;