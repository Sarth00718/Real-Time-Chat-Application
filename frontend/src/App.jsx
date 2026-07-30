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
      <div 
        className="min-h-screen w-full bg-blue-900/40 flex items-center justify-center"
        style={{
          backgroundImage: `url('/bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner text-white loading-lg"></span>
          <div className="text-white text-xl font-semibold">Loading...</div>
        </div>
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
