import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError({ type: 'validation', messages: ['Passwords do not match.'] });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.access_token);
      } else {
        if (data.errors) {
          setError({ type: 'validation', messages: Object.values(data.errors).flat() });
        } else {
          setError({ type: 'login', message: data.message || 'Registration failed. Please check your input.' });
        }
      }
    } catch {
      setError({ type: 'network', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1f1f1f, #121212)' }}
    >
      <div className="p-5 rounded shadow-lg bg-dark text-white border-0" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Register</h2>

        {error && (
          <Alert className="border-0" variant={error.type === 'network' ? 'danger' : error.type === 'validation' ? 'warning' : 'danger'}>
            {error.type === 'validation' ? (
              <ul className="mb-0 ps-3">
                {error.messages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            ) : (
              error.message
            )}
          </Alert>
        )}

        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label className="text-light">Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-secondary text-white border-0"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="text-light">Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary text-white border-0"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="text-light">Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary text-white border-0"
              />
              <Button
                variant="outline-light"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ border: 'none' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPasswordConfirmation">
            <Form.Label className="text-light">Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                className="bg-secondary text-white border-0"
              />
              <Button
                variant="outline-light"
                onClick={() => setShowConfirm((prev) => !prev)}
                style={{ border: 'none' }}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 mb-3 shadow-sm" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <div className="text-center">
            <small className="text-light">
              Already have an account?{' '}
              <Link to="/login" className="text-info text-decoration-none">
                Login here
              </Link>
            </small>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default RegisterPage;
