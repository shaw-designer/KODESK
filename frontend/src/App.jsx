import React from 'react';
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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const defaultLanguage = 'javascript'; // Set your default language here

  return (
    <Routes>
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

        {/* Redirect incomplete routes to default language */}
        <Route path="tasks" element={<Navigate to={`/tasks/${defaultLanguage}`} replace />} />
        <Route path="learning" element={<Navigate to={`/learning/${defaultLanguage}`} replace />} />

        {/* Actual routes with language parameter */}
        <Route path="tasks/:language" element={<Tasks />} />
        <Route path="task/:taskId" element={<TaskDetail />} />
        <Route path="learning/:language" element={<LearningContent />} />
        <Route path="games" element={<Games />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all route: redirect unknown paths to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
