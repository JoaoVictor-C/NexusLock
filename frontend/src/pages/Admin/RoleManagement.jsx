import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, Button, Form, Container, Row, Col, Card, Alert, Pagination } from 'react-bootstrap';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ roleName: '', description: '' });
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  });

  useEffect(() => {
    fetchRoles();
  }, [pagination.pageNumber]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/Roles', {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize
        }
      });
      const { totalCount, pageNumber, pageSize, roles: fetchedRoles } = response.data;
      setRoles(fetchedRoles);
      setPagination({ totalCount, pageNumber, pageSize });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again.');
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setConfirmMessage('Are you sure you want to create this role?');
    setConfirmAction(() => async () => {
      try {
        await api.post('/Roles', newRole);
        setNewRole({ roleName: '', description: '' });
        fetchRoles();
        setShowNewRoleModal(false);
      } catch (err) {
        console.error('Error creating role:', err);
        setError('Failed to create role. Please try again.');
      }
    });
    setShowNewRoleModal(false);
    setShowConfirmModal(true);
  };

  const handleUpdateRole = () => {
    setConfirmMessage('Are you sure you want to update this role?');
    setConfirmAction(() => async () => {
      try {
        await api.put(`/Roles/${editingRole.roleId}`, editingRole);
        setEditingRole(null);
        fetchRoles();
        setShowEditRoleModal(false);
      } catch (err) {
        console.error('Error updating role:', err);
        setError('Failed to update role. Please try again.');
      }
    });
    setShowEditRoleModal(false);
    setShowConfirmModal(true);
  };

  const handleDeleteRole = (id) => {
    setConfirmMessage('Are you sure you want to delete this role?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Roles/${id}`);
        fetchRoles();
      } catch (err) {
        console.error('Error deleting role:', err);
        setError('Failed to delete role. Please try again.');
      }
    });
    setShowConfirmModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({ ...prev, pageNumber }));
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="sr-only"></span></div></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="role-management mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Gerenciamento de Cargos</h2>
        </Col>
        <Col className="text-right">
          <Button variant="success" onClick={() => setShowNewRoleModal(true)}>
            <i className="fas fa-plus mr-2"></i>Criar Nova Cargo
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Nome da Cargo</th>
                  <th>Descrição</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center">Nenhum cargo encontrado</td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.roleId}>
                        <td>{role.roleName}</td>
                        <td>{role.description}</td>
                        <td className="text-center gap-2 d-flex justify-content-center">
                        <Button variant="outline-warning" size="sm" className="mr-2" onClick={() => {
                            setEditingRole(role);
                            setShowEditRoleModal(true);
                        }}>
                            <i className="fas fa-edit mr-1"></i>Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRole(role.roleId)}>
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

      <Modal show={showNewRoleModal} onHide={() => setShowNewRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Novo Cargo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="roleName">Nome do Cargo</Form.Label>
              <Form.Control
                type="text"
                id="roleName"
                placeholder="Digite o nome do cargo"
                value={newRole.roleName}
                onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="roleDescription">Descrição</Form.Label>
              <Form.Control
                as="textarea"
                id="roleDescription"
                rows={3}
                placeholder="Digite a descrição do cargo"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewRoleModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleCreateRole}>
            Criar Cargo
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditRoleModal} onHide={() => setShowEditRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cargo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nome da Cargo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter role name"
                value={editingRole?.roleName || ''}
                onChange={(e) => setEditingRole({ ...editingRole, roleName: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={editingRole?.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditRoleModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateRole}>
            Atualizar Cargo
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

export default RoleManagement;