import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LanguageSelection from './pages/LanguageSelection';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import LearningContent from './pages/LearningContent';
import Profile from './pages/Profile';
import Games from './pages/Games';
import api from './services/api';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If the user is not authenticated, send them to learning as a guest landing page
  return user ? children : <Navigate to="/learning/python" />;
}

function App() {
  const [defaultLanguage, setDefaultLanguage] = useState('python');
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetchSelected = async () => {
      if (user) {
        try {
          const res = await api.get('/languages/user/selected');
          if (mounted && res.data.selectedLanguage) {
            setDefaultLanguage(res.data.selectedLanguage.id);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    fetchSelected();
    return () => { mounted = false; };
  }, [user]);

  return (
    <Routes>
      {/* Public learning routes (guests can access learning content) */}
      <Route path="/" element={<Navigate to="/learning/python" replace />} />
      <Route path="learning" element={<Navigate to={`/learning/${defaultLanguage}`} replace />} />
      <Route path="learning/:language" element={<LearningContent />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="languages" element={<LanguageSelection />} />

        {/* Redirect incomplete routes to user's selected/default language */}
        <Route path="tasks" element={<Navigate to={`/tasks/${defaultLanguage}`} replace />} />

        {/* Actual routes with language parameter */}
        <Route path="tasks/:language" element={<Tasks />} />
        <Route path="task/:taskId" element={<TaskDetail />} />
        <Route path="games" element={<Games />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all route: redirect unknown paths to learning */}
      <Route path="*" element={<Navigate to="/learning/python" replace />} />
    </Routes>
  );
}

export default App;
