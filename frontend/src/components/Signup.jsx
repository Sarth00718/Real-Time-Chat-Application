import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { BASE_URL } from '../main'

function Signup() {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: ""
  });

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("User Data:", user);

    try {
      console.log("Submitting signup form...");
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, user, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (res.data.success) {
        navigate("/Login");
        toast.success(res.data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Something went wrong!";
      toast.error(message);
      console.log("Error:", error);
    }


    //  Reset form after submission
    setUser({
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      gender: ""
    });
  };

  const handleRadio = (e) => {
    setUser({ ...user, gender: e.target.value });
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-xl backdrop-blur-lg bg-white/10 border border-white/30 shadow-lg">
        <h1 className="font-bold text-3xl text-center text-white mb-6">Sign Up</h1>
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="block text-white mb-1" htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white mb-1" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white mb-1" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter password"
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={user.confirmPassword}
              onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
            />
          </div>
          <div className="text-white">
            <span className="mr-4">Gender:</span>
            <label className="mr-4">
              <input
                type="radio"
                name="gender"
                value="male"
                className="mr-1"
                onChange={handleRadio}
                checked={user.gender === "male"}
              /> Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                className="mr-1"
                onChange={handleRadio}
                checked={user.gender === "female"}
              /> Female
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-white">
          Already have an account?{" "}
          <Link to="/Login" className="text-pink-200 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
