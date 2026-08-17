import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Sidebar } from "lucide-react";

const Login2 = ({ setUserName }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = function (e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validForm = function () {
    const { email, password } = form;

    if (!email || !password) {
      setError("Please enter all the fields.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("The email address is not valid.");
      return false;
    }

    return true;
  };

  const handleLogin = async function () {
    // if (!validForm()) return;

    try {
      const response = await axios.post(
        "https://localhost:7232/api/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      // localStorage.setItem("accessToken", response.data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      // Not a good way
      if (err.message.includes("401")) {
        setError("Invalid email or password");
      }
      console.error("Something went wrong: ", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to continue
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition"
        >
          <LogIn size={16} />
          Login
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "https://localhost:7232/api/auth/google-login";
          }}
          className="w-full mt-3 flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-md transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.2 36 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.7-6.6 7.3l6.3 5.2C39.3 36.6 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "https://localhost:7232/api/auth/github-login";
          }}
          className="w-full mt-3 flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-md transition"
        >
          {/* GitHub SVG Icon - Dark version */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="w-5 h-5"
            fill="currentColor"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Continue with GitHub
        </button>

        {error && (
          <div className="flex items-center gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?
          <button
            onClick={() => navigate("/register")}
            className="text-gray-800 font-medium hover:underline ml-1"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login2;
