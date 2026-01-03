import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import { Toaster } from 'react-hot-toast';
import { api } from './api/axios';
import { useEffect } from 'react';
import { setAccessToken } from './utils/tokenService';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    api.post("/refreshToken")
      .then(res => {
        setAccessToken(res.data);
        navigate("/dashboard")
      })
      .catch(() => {
        setAccessToken(null)
      })
  }, [])
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/game/:category" element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
