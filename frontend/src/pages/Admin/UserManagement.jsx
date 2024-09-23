import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, Button, Form, Container, Row, Col, Card, Alert, Pagination } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.pageNumber]); 

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/Employees', {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize
        }
      }); 
      console.log(response.data);
      const { totalCount, pageNumber, pageSize, employees: fetchedUsers } = response.data;
      console.log(fetchedUsers);
      setUsers(fetchedUsers);
      setPagination({ totalCount, pageNumber, pageSize });
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Falha ao carregar usuários. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setConfirmMessage('Tem certeza de que deseja criar este usuário?');
    setConfirmAction(() => async () => {
      try {
        await api.post('/Employees', newUser);
        setNewUser({ name: '', email: '', password: '' });
        fetchUsers();
        setShowNewUserModal(false);
      } catch (err) {
        console.error('Erro ao criar usuário:', err);
        setError('Falha ao criar usuário. Por favor, tente novamente.');
      }
    });
    setShowNewUserModal(false);
    setShowConfirmModal(true);
  };

  const handleUpdateUser = () => {
    setConfirmMessage('Tem certeza de que deseja atualizar este usuário?');
    setConfirmAction(() => async () => {
      try {
        await api.put(`/Employees/${editingUser.employeeId}`, editingUser);
        setEditingUser(null);
        fetchUsers();
        setShowEditUserModal(false);
      } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        setError('Falha ao atualizar usuário. Por favor, tente novamente.');
      }
    });
    setShowEditUserModal(false);
    setShowConfirmModal(true);
  };

  const handleDeleteUser = (id) => {
    setConfirmMessage('Tem certeza de que deseja excluir este usuário?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Employees/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        setError('Falha ao excluir usuário. Por favor, tente novamente.');
      }
    });
    setShowConfirmModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, pageNumber }));
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="sr-only">Carregando...</span></div></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="user-management mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Gerenciamento de Usuários</h2>
        </Col>
        <Col className="text-right">
          <Button variant="success" onClick={() => setShowNewUserModal(true)}>
            <i className="fas fa-plus mr-2"></i>Criar Novo Usuário
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Código PIN</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">Nenhum usuário encontrado</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.employeeId}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.pinCode}</td>
                      <td className="text-center gap-2 d-flex justify-content-center">
                        <Button variant="outline-warning" size="sm" className="mr-2" onClick={() => {
                          setEditingUser(user);
                          setShowEditUserModal(true);
                        }}>
                          <i className="fas fa-edit mr-1"></i>Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.employeeId)}>
                          <i className="fas fa-trash-alt mr-1"></i>Excluir
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showNewUserModal} onHide={() => setShowNewUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Novo Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Digite o email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Digite a senha"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewUserModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            Criar Usuário
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Digite o email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Código PIN</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o código PIN"
                value={editingUser?.pinCode || ''}
                onChange={(e) => setEditingUser({ ...editingUser, pinCode: e.target.value })}
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Atualizar Usuário
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Ação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => {
            confirmAction();
            setShowConfirmModal(false);
          }}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

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
    </Container>
  );
};

export default UserManagement;