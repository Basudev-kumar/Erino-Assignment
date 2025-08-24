import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import LeadsList from './pages/LeadsList';
import LeadForm from './pages/LeadForm';
import api from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch {
      setUser(null); // explicitly clear
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/leads" replace /> : <Login setUser={setUser} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/leads" replace /> : <Register setUser={setUser} />} 
          />
          <Route 
            path="/leads" 
            element={user ? <LeadsList user={user} setUser={setUser} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/leads/new" 
            element={user ? <LeadForm /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/leads/:id/edit" 
            element={user ? <LeadForm /> : <Navigate to="/login" replace />} 
          />
          <Route path="/" element={<Navigate to={user ? "/leads" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
