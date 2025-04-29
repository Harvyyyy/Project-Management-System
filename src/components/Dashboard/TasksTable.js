import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../App';
import { Modal, Button, Form, Badge, Table } from 'react-bootstrap';

function TaskTable() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_user_id: null,
    due_date: '',
  });

  const taskStatuses = ['pending', 'in progress', 'completed'];
  const taskPriorities = ['low', 'medium', 'high'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
      ]);

      if (!tasksResponse.ok) throw new Error(`Task fetch failed: ${tasksResponse.status}`);
      if (!projectsResponse.ok) throw new Error(`Project fetch failed: ${projectsResponse.status}`);
      if (!usersResponse.ok) throw new Error(`User fetch failed: ${usersResponse.status}`);

      const tasksData = await tasksResponse.json();
      const projectsData = await projectsResponse.json();
      const usersData = await usersResponse.json();

      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (e) {
      console.error('Failed to fetch data:', e);
      setError(`Failed to load data: ${e.message}. Please check API endpoints and CORS.`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShowCreateModal = () => {
    if (projects.length === 0) {
      setError('Please create a project before adding tasks.');
      return;
    }

    setIsEditing(false);
    setCurrentTask(null);
    setFormData({
      project_id: projects[0].id,
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assigned_user_id: '',
      due_date: '',
    });
    setShowModal(true);
  };

  const handleShowEditModal = (task) => {
    setIsEditing(true);
    setCurrentTask(task);
    setFormData({
      project_id: task.project_id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigned_user_id: task.assigned_user_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTask(null);
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
      ? `${API_BASE_URL}/tasks/${currentTask.id}`
      : `${API_BASE_URL}/tasks`;
    const method = isEditing ? 'PUT' : 'POST';

    // Validation
    if (!formData.title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }
    if (!formData.project_id) {
      setError('Please select a project.');
      return;
    }

    // Prepare payload
    const payload = { ...formData };
    payload.assigned_user_id = formData.assigned_user_id === '' ? null : formData.assigned_user_id;
    if (payload.due_date === '') delete payload.due_date;

    console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const messages = errorData.errors
          ? Object.values(errorData.errors).flat().join(' ')
          : (errorData.message || `HTTP error! status: ${response.status}`);
        throw new Error(messages);
      }

      // Refresh and close
      fetchData();
      handleCloseModal();
    } catch (e) {
      console.error('Failed to save task:', e);
      setError(`Failed to save task: ${e.message}`);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok && response.status !== 204) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchData();
      } catch (e) {
        console.error('Failed to delete task:', e);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  // Render
  if (loading) return <div className="text-center text-light">Loading Tasks, Projects, and Users...</div>;
  if (error && !showModal) return <div className="alert alert-danger bg-dark text-light border-0">{error}</div>;

  return (
    <div className="p-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1f1f1f, #121212)' }}>
      <div className="bg-dark p-4 rounded shadow mb-4">
        <h2 className="text-light mb-3">Tasks</h2>
        <Button variant="primary" onClick={handleShowCreateModal} className="mb-3" disabled={projects.length === 0}>
          Create New Task
        </Button>
        {projects.length === 0 && <p className="text-warning">You need to create a project before you can add tasks.</p>}
        {tasks.length === 0 && projects.length > 0 && <p className="text-light">No tasks found. Create one!</p>}

        {tasks.length > 0 && (
          <div className="table-responsive">
            <Table variant="dark" striped hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assignee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.project?.name || 'N/A'}</td>
                    <td><Badge bg={getTaskStatusColor(task.status)}>{task.status}</Badge></td>
                    <td><Badge bg={getTaskPriorityColor(task.priority)}>{task.priority}</Badge></td>
                    <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{task.assigned_user?.name || 'Unassigned'}</td>
                    <td>
                      <Button variant="outline-light" size="sm" onClick={() => handleShowEditModal(task)} className="me-2">Edit</Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(task.id)}>Delete</Button>
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
          <Modal.Title className="text-light">{isEditing ? 'Edit Task' : 'Create New Task'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="bg-dark">
            {error && <div className="alert alert-danger bg-dark text-light border-0">{error}</div>}
            <Form.Group className="mb-3" controlId="taskProjectId">
              <Form.Label className="text-light">Project <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                required
                className="bg-secondary text-white border-0"
              >
                <option value="" disabled>Select a project</option>
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskTitle">
              <Form.Label className="text-light">Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter task title"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskDescription">
              <Form.Label className="text-light">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description (optional)"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskStatus">
              <Form.Label className="text-light">Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
              >
                {taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskPriority">
              <Form.Label className="text-light">Priority</Form.Label>
              <Form.Select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
              >
                {taskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskDueDate">
              <Form.Label className="text-light">Due Date</Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskAssignee">
              <Form.Label className="text-light">Assignee</Form.Label>
              <Form.Select
                name="assigned_user_id"
                value={formData.assigned_user_id}
                onChange={handleInputChange}
                className="bg-secondary text-white border-0"
              >
                <option value="">Unassigned</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-0">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{isEditing ? 'Save Changes' : 'Create Task'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

const getTaskStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'secondary';
    case 'in progress': return 'info';
    case 'completed': return 'success';
    default: return 'light';
  }
};

const getTaskPriorityColor = (priority) => {
  switch (priority) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    default: return 'light';
  }
};

export default TaskTable;
