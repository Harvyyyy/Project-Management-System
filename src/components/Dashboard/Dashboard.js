import React from 'react';
import { Link, Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: 'linear-gradient(135deg, #1f1f1f, #121212)' }}>
      <Navbar expand="lg" variant="dark" bg="dark" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-white">
            <i className="bi bi-kanban-fill me-2"></i>Klick Inc.
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="dashboard-navbar-nav" />
          <Navbar.Collapse id="dashboard-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={NavLink}
                to="/dashboard/projects"
                className={({ isActive }) => isActive ? 'text-white fw-bold' : 'text-secondary'}
              >
                Projects
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/dashboard/tasks"
                className={({ isActive }) => isActive ? 'text-white fw-bold' : 'text-secondary'}
              >
                Tasks
              </Nav.Link>
            </Nav>

            <Button variant="outline-light" onClick={handleLogout} className="ms-auto">
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid as="main" className="flex-grow-1 my-4">
        <Container className="bg-dark text-white p-4 rounded shadow">
          <Outlet />
        </Container>
      </Container>

      <footer className="text-center text-secondary py-3 mt-auto">
        &copy; {new Date().getFullYear()} Klick Inc. All rights reserved.
      </footer>
    </div>
  );
}

export default Dashboard;
