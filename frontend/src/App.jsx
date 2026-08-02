import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadFlow from './pages/UploadFlow';
import DocumentDetail from './pages/DocumentDetail';
import Progress from './pages/Progress';
import Billing from './pages/Billing';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('studymate_theme') || 'light');
  const [dailyUploadsLeft, setDailyUploadsLeft] = useState(3);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studymate_theme', theme);
  }, [theme]);

  useEffect(() => {
    const storedUser = localStorage.getItem('studymate_user');
    const token = localStorage.getItem('studymate_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      localStorage.setItem('studymate_user', JSON.stringify(res.data));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('studymate_token');
      localStorage.removeItem('studymate_user');
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        setUser={setUser}
        theme={theme}
        toggleTheme={toggleTheme}
        dailyUploadsLeft={dailyUploadsLeft}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup setUser={setUser} />} />
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} onRefreshUser={fetchCurrentUser} /> : <Navigate to="/login" />} />
          <Route path="/upload" element={user ? <UploadFlow onRefreshUser={fetchCurrentUser} /> : <Navigate to="/login" />} />
          <Route path="/documents/:id" element={user ? <DocumentDetail /> : <Navigate to="/login" />} />
          <Route path="/progress" element={user ? <Progress /> : <Navigate to="/login" />} />
          <Route path="/billing" element={user ? <Billing user={user} onRefreshUser={fetchCurrentUser} /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} StudyMate AI — Built with FastAPI, React, ChromaDB & Groq LLM.</p>
        </div>
      </footer>
    </div>
  );
}
