import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../App';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';

function ProjectTable() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Not Started',
  });

  const projectStatuses = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setProjects(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleShowCreateModal = () => {
    setIsEditing(false);
    setCurrentProject(null);
    setFormData({ name: '', description: '', start_date: '', end_date: '', status: 'Not Started' });
    setShowModal(true);
  };

  const handleShowEditModal = (project) => {
    setIsEditing(true);
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      status: project.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProject(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const url = isEditing
      ? `${API_BASE_URL}/projects/${currentProject.id}`
      : `${API_BASE_URL}/projects`;
    const method = isEditing ? 'PUT' : 'POST';

    if (!formData.name.trim()) {
      setError('Project name cannot be empty.');
      return;
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error: ${response.status}`);
      }
      fetchProjects();
      handleCloseModal();
    } catch (e) {
      console.error(e);
      setError(`Failed to save project: ${e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!response.ok && response.status !== 204) throw new Error(`HTTP error: ${response.status}`);
      fetchProjects();
    } catch (e) {
      console.error(e);
      setError('Failed to delete project. Please try again.');
    }
  };

  if (loading) return <div className="text-center text-light">Loading Projects...</div>;
  if (error && !showModal) return <div className="alert alert-danger bg-dark text-light border-0">{error}</div>;

  return (
    <div
      className="p-4"
      style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1f1f1f, #121212)' }}
    >
      <div className="bg-dark p-4 rounded shadow mb-4">
        <h2 className="text-light mb-3">Projects</h2>
        <Button variant="primary" onClick={handleShowCreateModal} className="mb-3">
          Create New Project
        </Button>

        {projects.length === 0 && <p className="text-light">No projects found. Create one!</p>}

        {projects.length > 0 && (
          <div className="table-responsive">
            <Table variant="dark" striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(proj => (
                  <tr key={proj.id}>
                    <td>{proj.name}</td>
                    <td>
                      {proj.description?.substring(0, 50)}
                      {proj.description?.length > 50 ? '...' : ''}
                    </td>
                    <td>
                      <Badge bg={getStatusColor(proj.status)}>
                        {proj.status}
                      </Badge>
                    </td>
                    <td>{proj.start_date ? new Date(proj.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{proj.end_date ? new Date(proj.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => handleShowEditModal(proj)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(proj.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton closeVariant="white" className="bg-dark border-0">
          <Modal.Title className="text-light">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="bg-dark">
            {error && <div className="alert alert-danger bg-dark text-light border-0">{error}</div>}
            <Form.Group className="mb-3" controlId="projectName">
              <Form.Label className="text-light">Project Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="bg-secondary text-white border-0"
                placeholder="Enter project name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectDescription">
              <Form.Label className="text-light">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
                placeholder="Enter project description (optional)"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectStatus">
              <Form.Label className="text-light">Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
              >
                {projectStatuses.map(status => (
                  <option key={status} value={status} className="bg-secondary text-white">{status}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectStartDate">
              <Form.Label className="text-light">Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectEndDate">
              <Form.Label className="text-light">End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={formData.start_date || undefined}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-0">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{isEditing ? 'Save Changes' : 'Create Project'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Not Started': return 'secondary';
    case 'In Progress': return 'primary';
    case 'On Hold': return 'warning';
    case 'Completed': return 'success';
    default: return 'light';
  }
};

export default ProjectTable;