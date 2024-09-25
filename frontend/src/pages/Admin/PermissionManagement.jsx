import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, Button, Form, Container, Row, Col, Card, Alert, Pagination } from 'react-bootstrap';

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  const [newPermission, setNewPermission] = useState({ permissionKey: '', description: '' });
  const [showNewPermissionModal, setShowNewPermissionModal] = useState(false);
  const [showEditPermissionModal, setShowEditPermissionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
  });

  useEffect(() => {
    fetchPermissions();
  }, [pagination.pageNumber]);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/Permissions', {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize
        }
      });
      const { totalCount, pageNumber, pageSize, permissions: fetchedPermissions } = response.data;
      setPermissions(Array.isArray(fetchedPermissions) ? fetchedPermissions : []);
      setPagination({ totalCount, pageNumber, pageSize });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions. Please try again.');
      setLoading(false);
    }
  };

  const handleCreatePermission = () => {
    setConfirmMessage('Are you sure you want to create this permission?');
    setConfirmAction(() => async () => {
      try {
        await api.post('/Permissions', newPermission);
        setNewPermission({ permissionKey: '', description: '' });
        fetchPermissions();
        setShowNewPermissionModal(false);
      } catch (err) {
        console.error('Error creating permission:', err);
        setError('Failed to create permission. Please try again.');
      }
    });
    setShowNewPermissionModal(false);
    setShowConfirmModal(true);
  };

  const handleUpdatePermission = () => {
    setConfirmMessage('Are you sure you want to update this permission?');
    setConfirmAction(() => async () => {
      try {
        await api.put(`/Permissions/${editingPermission.permissionId}`, editingPermission);
        setEditingPermission(null);
        fetchPermissions();
        setShowEditPermissionModal(false);
      } catch (err) {
        console.error('Error updating permission:', err);
        setError('Failed to update permission. Please try again.');
      }
    });
    setShowEditPermissionModal(false);
    setShowConfirmModal(true);
  };

  const handleDeletePermission = (id) => {
    setConfirmMessage('Are you sure you want to delete this permission?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Permissions/${id}`);
        fetchPermissions();
      } catch (err) {
        console.error('Error deleting permission:', err);
        setError('Failed to delete permission. Please try again.');
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
    <Container className="permission-management mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Gerenciamento de Permissões</h2>
        </Col>
        <Col className="text-right">
          <Button variant="success" onClick={() => setShowNewPermissionModal(true)}>
            <i className="fas fa-plus mr-2"></i>Criar Nova Permissão
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Chave da Permissão</th>
                  <th>Descrição</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.permissionId}>
                    <td>{permission.permissionKey}</td>
                    <td>{permission.description}</td>
                    <td className="text-center gap-2 d-flex justify-content-center">
                      <Button variant="outline-warning" size="sm" className="mr-2" onClick={() => {
                        setEditingPermission(permission);
                        setShowEditPermissionModal(true);
                      }}>
                        <i className="fas fa-edit mr-1"></i>Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeletePermission(permission.permissionId)}>
                        <i className="fas fa-trash-alt mr-1"></i>Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

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

      <Modal show={showNewPermissionModal} onHide={() => setShowNewPermissionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Nova Permissão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="permissionKey">Chave da Permissão</Form.Label>
              <Form.Control
                type="text"
                id="permissionKey"
                placeholder="Digite a chave da permissão"
                value={newPermission.permissionKey}
                onChange={(e) => setNewPermission({ ...newPermission, permissionKey: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="permissionDescription">Descrição</Form.Label>
              <Form.Control
                type="text"
                id="permissionDescription"
                placeholder="Digite a descrição da permissão"
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewPermissionModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleCreatePermission}>
            Criar Permissão
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditPermissionModal} onHide={() => setShowEditPermissionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Permissão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Chave da Permissão</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter permission key"
                value={editingPermission?.permissionKey || ''}
                onChange={(e) => setEditingPermission({ ...editingPermission, permissionKey: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={editingPermission?.description || ''}
                onChange={(e) => setEditingPermission({ ...editingPermission, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditPermissionModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdatePermission}>
            Atualizar Permissão
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
    </Container>
  );
};

export default PermissionManagement;