import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setError({ type: 'validation', messages: errorMessages });
        } else {
          setError({ type: 'login', message: data.message || 'Login failed. Please check your credentials.' });
        }
      }
    } catch (err) {
      setError({ type: 'network', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f1f1f, #121212)',
      }}
    >
      <div
        className="p-5 rounded shadow-lg bg-dark text-white border-0"
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <h2 className="text-center mb-4">Login</h2>

        {error && (
          <Alert
            className="border-0"
            variant={
              error.type === 'network'
                ? 'danger'
                : error.type === 'validation'
                ? 'warning'
                : 'danger'
            }
          >
            {error.type === 'validation' ? (
              <ul className="mb-0 ps-3">
                {error.messages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            ) : (
              error.message
            )}
          </Alert>
        )}

        <Form onSubmit={handleLogin}>
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
                placeholder="Password"
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

          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              id="remember"
              label={<span className="text-light">Remember me</span>}
              className="border-0"
            />
            <Link to="/forgot" className="text-info text-decoration-none">
              Forgot Password?
            </Link>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mb-3 shadow-sm"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center">
            <small className="text-light">
              Don't have an account?{' '}
              <Link to="/register" className="text-info text-decoration-none">
                Register here
              </Link>
            </small>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default LoginPage;
