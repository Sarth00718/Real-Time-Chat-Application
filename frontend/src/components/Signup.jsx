import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Signup() {
  const [user, setUser] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await register(user);
    
    setIsLoading(false);

    if (result.success) {
      // Redirect to homepage instead of login
      navigate('/');
    } else {
      // Reset form only on error
      setUser({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
        gender: ''
      });
    }
  };

  const handleRadio = (e) => {
    setUser({ ...user, gender: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/10 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-white/30">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-6">Sign Up</h1>
        <form onSubmit={onSubmitHandler} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-white mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-white mb-1">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-white mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter password"
                className="w-full px-4 py-2 pr-10 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-white mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Re-enter password"
                className="w-full px-4 py-2 pr-10 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={user.confirmPassword}
                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Gender Radio Buttons */}
          <div className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <span>Gender:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="male"
                onChange={handleRadio}
                checked={user.gender === 'male'}
                required
                disabled={isLoading}
              />
              Male
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="female"
                onChange={handleRadio}
                checked={user.gender === 'female'}
                disabled={isLoading}
              />
              Female
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition text-white font-semibold py-2 rounded-lg"
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-center text-white text-sm sm:text-base">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
