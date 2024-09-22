import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal, Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/Employees');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setConfirmMessage('Are you sure you want to create this user?');
    setConfirmAction(() => async () => {
      try {
        await api.post('/Employees', newUser);
        setNewUser({ name: '', email: '', password: '' });
        fetchUsers();
        setShowNewUserModal(false);
      } catch (err) {
        console.error('Error creating user:', err);
        setError('Failed to create user. Please try again.');
      }
    });
    setShowNewUserModal(false);
    setShowConfirmModal(true);
  };

  const handleUpdateUser = () => {
    setConfirmMessage('Are you sure you want to update this user?');
    setConfirmAction(() => async () => {
      try {
        await api.put(`/Employees/${editingUser.employeeId}`, editingUser);
        setEditingUser(null);
        fetchUsers();
        setShowEditUserModal(false);
      } catch (err) {
        console.error('Error updating user:', err);
        setError('Failed to update user. Please try again.');
      }
    });
    setShowEditUserModal(false);
    setShowConfirmModal(true);
  };

  const handleDeleteUser = (id) => {
    setConfirmMessage('Are you sure you want to delete this user?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/Employees/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    });
    setShowConfirmModal(true);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="user-management mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">User Management</h2>
        </Col>
        <Col className="text-right">
          <Button variant="success" onClick={() => setShowNewUserModal(true)}>
            <i className="fas fa-plus mr-2"></i>Create New User
          </Button>
        </Col>
      </Row>
      
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Pin Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.employeeId}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.pinCode}</td>
                    <td>
                      <Button variant="outline-warning" size="sm" className="mr-2" onClick={() => {
                        setEditingUser(user);
                        setShowEditUserModal(true);
                      }}>
                        <i className="fas fa-edit mr-1"></i>Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.employeeId)}>
                        <i className="fas fa-trash-alt mr-1"></i>Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showNewUserModal} onHide={() => setShowNewUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewUserModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            Create User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pin Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter pin code"
                value={editingUser?.pinCode || ''}
                onChange={(e) => setEditingUser({ ...editingUser, pinCode: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Update User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            confirmAction();
            setShowConfirmModal(false);
          }}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;