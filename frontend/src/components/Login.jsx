import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
  const [user, setUser] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(user);
    
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/30 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-4">
            <FiUser className="text-white text-3xl" />
          </div>
          <h1 className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Welcome Back
          </h1>
          <p className="text-gray-300 mt-2">Sign in to continue to ChatApp</p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiUser className="text-white/70" />
            </div>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="w-full px-4 py-3 pl-10 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/20 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiLock className="text-white/70" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              className="w-full px-4 py-3 pl-10 pr-10 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/20 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed
              text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-300 hover:text-white transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
