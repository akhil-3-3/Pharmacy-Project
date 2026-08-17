import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register2 = () => {
    const [form, setForm] = useState({ 
        name: "", 
        email: "", 
        password: "" 
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleInputChange = function (e) {
        setForm({ 
            ...form, 
            [e.target.name]: e.target.value 
        });
        setError("");
    }

    const validForm = function () {
        const { name, email, password } = form;

        if (!name || !email || !password) {
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
    }

    const handleAccountCreation = async function () {
        if (!validForm()) return;

        try {
            await axios.post("https://localhost:7232/api/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
            });
            window.alert("Account created successfully. Please Login");
            navigate("/login");
        } catch (err) {
            // Not a good way
            if (err.message.includes('409')) {
                setError('Email already exists');
            }
            console.error('Something went wrong: ', err.message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm">

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800">Create account</h1>
                    <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
                        />
                    </div>

                    <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

                {error && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                        <AlertCircle size={14} className="shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleAccountCreation}
z                    className="mt-5 w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                    <UserPlus size={15} />
                    Create account
                </button>

                <p className="text-center text-sm text-gray-500 mt-5">
                    Already have an account?
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-800 font-medium hover:underline ml-1"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register2;