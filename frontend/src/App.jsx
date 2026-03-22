import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Homepage from './components/Homepage.jsx';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { authUser, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route 
          index 
          element={authUser ? <Homepage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="login" 
          element={authUser ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="signup" 
          element={authUser ? <Navigate to="/" replace /> : <Signup />} 
        />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;
