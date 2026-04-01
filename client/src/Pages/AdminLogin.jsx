import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
    const [formData, setFormData] = useState({ username: '', password: '', otp: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/login`, {
                username: formData.username,
                password: formData.password
            });
            if (res.data.success) {
                toast.success('OTP Sent to Email!');
                setStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const verifyRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/verify-otp`, {
                otp: formData.otp
            });

            if (verifyRes.data.success) {
                toast.success('Welcome Back!');
                localStorage.setItem('adminAuth', 'true');
                // 7 Hours Session Limit
                const sevenHours = 7 * 60 * 60 * 1000;
                localStorage.setItem('adminSessionExpiry', Date.now() + sevenHours);
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0c15] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#15161c] p-8 rounded-2xl border border-gray-800 shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-[#ff3366] mb-8">Admin Verification</h2>

                {step === 1 ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-[#0b0c15] border border-gray-800 rounded-lg p-3 text-white focus:border-[#ff3366] outline-none transition"
                                placeholder="Enter Username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#0b0c15] border border-gray-800 rounded-lg p-3 text-white focus:border-[#ff3366] outline-none transition"
                                placeholder="Enter Password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3366] hover:bg-[#ff3366]/90 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Next Step'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-400">Enter the OTP sent to your email</p>
                            <p className="text-sm text-[#ff3366]">{formData.email}</p>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">OTP Code</label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                className="w-full bg-[#0b0c15] border border-gray-800 rounded-lg p-3 text-white text-center text-2xl tracking-widest focus:border-[#ff3366] outline-none transition"
                                maxLength="6"
                                placeholder="000000"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3366] hover:bg-[#ff3366]/90 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminLogin;





