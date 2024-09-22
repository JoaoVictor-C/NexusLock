import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import RoomDetails from './pages/Room/RoomDetails';
import NotFound from './pages/NotFound'; 
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/global.css';
import React, { useContext, useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import RoomHistory from './pages/Room/RoomHistory';
import RoomPermission from './pages/Room/RoomPermission';
import RoomEdit from './pages/Room/RoomEdit';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="content">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:id"
              element={
                <ProtectedRoute>
                  <RoomDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:id/history"
              element={
                <ProtectedRoute>
                  <RoomHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:id/permission"
              element={
                <ProtectedRoute>
                  <RoomPermission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:id/edit"
              element={
                <ProtectedRoute>
                  <RoomEdit />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;