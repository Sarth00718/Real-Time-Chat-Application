import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../redux/userSlice.js';
import { BASE_URL } from '../main';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

function Login() {
  const [user, setUser] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      navigate('/');
      dispatch(setAuthUser(res.data));
      toast.success("Login successful!");
    } catch (error) {
      console.log("Error:", error);
      toast.error(error?.response?.data?.message || "Login failed. Please try again.");
    } 
    setUser({
      username: "",
      password: ""
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/30 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-4"
          >
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
              <FiUser className="text-gray-500" />
            </div>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="w-full px-4 py-3 pl-10 rounded-lg bg-white/10 text-white placeholder-gray-500 border border-white/20 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiLock className="text-gray-500" />
            </div>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="w-full px-4 py-3 pl-10 rounded-lg bg-white/10 text-white placeholder-gray-500 border border-white/20 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 
              text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
                <FiLogIn /> Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <Link to="/Signup" className="text-purple-300 hover:text-white transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
