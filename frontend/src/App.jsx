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
  
  // If the user is not authenticated, send them to launchpad as a guest landing page
  return user ? children : <Navigate to="/launchpad" />;
}

function App() {
  const [defaultLanguage, setDefaultLanguage] = useState('python');
  const { user, loading } = useAuth();

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public launchpad route for guests */}
      <Route path="/" element={<Navigate to={user ? '/learning' : '/launchpad'} replace />} />
      <Route path="launchpad" element={user ? <Navigate to="/learning" replace /> : <LearningContent />} />

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
        <Route path="learning" element={<LearningContent />} />
        <Route path="cpp" element={<LearningContent />} />
        <Route path="java" element={<LearningContent />} />
        <Route path="python" element={<LearningContent />} />
        <Route path="languages" element={<LanguageSelection />} />

        {/* Redirect incomplete routes to user's selected/default language */}
        <Route path="tasks" element={<Navigate to={`/tasks/${defaultLanguage}`} replace />} />

        {/* Actual routes with language parameter */}
        <Route path="tasks/:language" element={<Tasks />} />
        <Route path="task/:taskId" element={<TaskDetail />} />
        <Route path="games" element={<Games />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={user ? '/learning' : '/launchpad'} replace />} />
    </Routes>
  );
}

export default App;
