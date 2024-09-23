import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Container, Row, Col, Card, Form, Button, Alert, Pagination } from 'react-bootstrap';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    employeeName: '',
    roomName: '',
    startDate: '',
    endDate: '',
    accessGranted: ''
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  });
  const [filterIsActive, setFilterIsActive] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [pagination.pageNumber]);

  useEffect(() => {
    filterLogs(logs);
    console.log(logs);
  }, [logs]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/AccessLogs', {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize
        }
      });
      const { totalCount, pageNumber, pageSize, logs: fetchedLogs } = response.data;
      setLogs(fetchedLogs);
      setPagination({ totalCount, pageNumber, pageSize });
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar logs de acesso:', err);
      setError('Falha ao carregar logs de acesso. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const filterLogs = (fetchedLogs) => {
    let filteredLogs = fetchedLogs;

    if (filters.employeeName) {
      filteredLogs = filteredLogs.filter(log => log.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase()));
    }

    if (filters.roomName) {
      filteredLogs = filteredLogs.filter(log => log.roomName.toLowerCase().includes(filters.roomName.toLowerCase()));
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filteredLogs = filteredLogs.filter(log => new Date(log.accessTime) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredLogs = filteredLogs.filter(log => new Date(log.accessTime) <= endDate);
    }

    if (filters.accessGranted !== '') {
      filteredLogs = filteredLogs.filter(log => log.accessGranted === (filters.accessGranted === 'true'));
    }

    setLogs(filteredLogs);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    
    if (hasActiveFilters && !filterIsActive) {
      setFilterIsActive(true);
      filterLogs(logs);
    } else if (filterIsActive) {
      setFilterIsActive(false);
      setFilters({
        employeeName: '',
        roomName: '',
        startDate: '',
        endDate: '',
        accessGranted: ''
      });
      fetchLogs();
    }
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, pageNumber }));
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="sr-only"></span></div></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  return (
    <Container className="access-logs mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Logs de Acesso</h2>
        </Col>
      </Row>
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Nome do Funcionário</Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeName"
                    value={filters.employeeName}
                    onChange={handleFilterChange}
                    placeholder="Digite o nome do funcionário"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Nome da Sala</Form.Label>
                  <Form.Control
                    type="text"
                    name="roomName"
                    value={filters.roomName}
                    onChange={handleFilterChange}
                    placeholder="Digite o nome da sala"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Data de Início</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Data de Fim</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Acesso Concedido</Form.Label>
                  <Form.Control
                    as="select"
                    name="accessGranted"
                    value={filters.accessGranted}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className='gap-2 justify-content-evenly'>
              <Button variant='primary' type="submit" onClick={handleFilterSubmit} style={{width: `${filterIsActive ? '49' : '100'}%`}}>
                Aplicar Filtros
              </Button>
              {filterIsActive && (
                <Button variant='outline-primary' type="submit" onClick={handleFilterSubmit} style={{width: '49%'}}>
                  Remover Filtros
                </Button>
              )}
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>ID do Log</th>
                  <th>Funcionário</th>
                  <th>Sala</th>
                  <th>Hora de Acesso</th>
                  <th className="text-center">Acesso Concedido</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.logId}>
                    <td>{log.logId}</td>
                    <td>{log.employeeName}</td>
                    <td>{log.roomName}</td>
                    <td>{new Date(log.accessTime).toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`badge ${log.accessGranted ? 'bg-success' : 'bg-danger'} fs-6 px-2 py-1`}>
                        {log.accessGranted ? 'Sim' : 'Não'}
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccessLogs;
