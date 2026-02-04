import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MoviesTab from '../Components/Admin/MoviesTab'
import UsersTab from '../Components/Admin/UsersTab'
import { Users } from 'lucide-react'

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalBookings: 0, totalMovies: 0, revenue: 0 });
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
            fetchBookings();
        }
    }, [activeTab]);

    // ---------------------------------------------------------
    // Session Inactivity Logic (Polling Method - Robust)
    // ---------------------------------------------------------
    const navigate = useNavigate();
    // Refs for state to avoid closure staleness in interval
    const stateRef = React.useRef({
        lastActivity: Date.now()
    });

    useEffect(() => {
        const TIMEOUT_MS = 1 * 60 * 1000; // 1 Minute Total

        // --- Audio Logic Removed ---

        const logoutUser = () => {
            toast.dismiss();
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('adminSessionExpiry');
            window.location.href = '/admin/login';
        };

        // --- Polling Loop (Every 1s) ---
        const checkInactivity = setInterval(() => {
            const now = Date.now();
            const elapsed = now - stateRef.current.lastActivity;

            if (elapsed > TIMEOUT_MS) {
                logoutUser();
            }
        }, 1000);

        // --- Event Listeners ---
        const updateActivity = () => {
            stateRef.current.lastActivity = Date.now();
        };

        const events = ['mousemove', 'keypress', 'click', 'scroll'];
        events.forEach(event => document.addEventListener(event, updateActivity));

        return () => {
            clearInterval(checkInactivity);
            events.forEach(event => document.removeEventListener(event, updateActivity));
        };
    }, []);
    // ---------------------------------------------------------

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/bookings');
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleDeleteBooking = async (id) => {
        if (window.confirm("Are you sure you want to delete this old booking?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    fetchBookings(); // Refresh list
                    fetchStats(); // Update stats
                } else {
                    console.error("Failed to delete booking");
                }
            } catch (error) {
                console.error("Error deleting booking:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0c15] text-white flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#15161c] border-r border-gray-800 p-6 flex flex-col fixed h-full z-10">
                <h1 className="text-xl font-bold text-[#ff3366] mb-10 tracking-wider">Hii Vishakha and Manasvi</h1>

                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#ff3366]/10 text-[#ff3366]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('movies')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'movies' ? 'bg-[#ff3366]/10 text-[#ff3366]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        Movies
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-[#ff3366]/10 text-[#ff3366]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        Users
                    </button>
                </nav>
            </div>

            {/* Content with margin for fixed sidebar */}
            <div className="flex-1 p-10 ml-64">

                {activeTab === 'dashboard' && (
                    <>
                        <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#15161c] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gray-400 mb-2">Total Bookings</h3>
                                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                            </div>
                            <div className="bg-[#15161c] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gray-400 mb-2">Total Movies</h3>
                                <p className="text-3xl font-bold">{stats.totalMovies}</p>
                            </div>
                            <div className="bg-[#15161c] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-gray-400 mb-2">Revenue</h3>
                                <p className="text-3xl font-bold text-[#ff3366]">₹{stats.revenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* New UI: Recent Bookings Grid */}
                        <div className="mt-12">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#ff3366] rounded-full"></span>
                                Recent Bookings
                            </h3>

                            {bookings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bookings.map((booking) => (
                                        <div key={booking._id} className="bg-[#15161c] rounded-xl border border-gray-800 p-5 hover:border-[#ff3366]/50 transition duration-300 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-[#ff3366]/10 group-hover:text-[#ff3366] transition">
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{booking.user?.name || 'Guest User'}</p>
                                                        <p className="text-xs text-gray-500">{booking.user?.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="space-y-3 border-t border-gray-800 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Movie</span>
                                                    <span className="font-medium text-white">{booking.show?.movie?.title}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400 text-sm">Time</span>
                                                    <span className="font-medium text-white flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff3366]"></div>
                                                        {booking.show?.showDateTime ? new Date(booking.show.showDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-gray-400 text-sm">Seats</span>
                                                    <span className="font-mono text-sm text-[#ff3366] text-right max-w-[150px] break-words">
                                                        {booking.bookedSeats?.join(', ')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-gray-400 text-sm">Amount</span>
                                                    <span className="text-lg font-bold text-white">₹{booking.amount}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center text-xs text-gray-600">
                                                <span>ID: {booking.transactionId?.slice(-6).toUpperCase()}</span>
                                                <span>{booking.show?.showDateTime ? new Date(booking.show.showDateTime).toLocaleDateString() : 'Today'}</span>
                                            </div>

                                            {/* Delete Button for Old Bookings (> 5 days) */}
                                            {booking.show?.showDateTime && (new Date() - new Date(booking.show.showDateTime) > 5 * 24 * 60 * 60 * 1000) && (
                                                <button
                                                    onClick={() => handleDeleteBooking(booking._id)}
                                                    className="w-full mt-3 bg-red-500/10 text-red-500 text-xs py-2 rounded border border-red-500/20 hover:bg-red-500/20 transition"
                                                >
                                                    Delete Function (Old Booking)
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[#15161c] rounded-xl border border-dashed border-gray-800 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                        <Users size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">No Bookings Yet</h3>
                                    <p className="text-gray-500 text-sm">There are no bookings scheduled for today.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'movies' && <MoviesTab />}
                {activeTab === 'users' && <UsersTab />}


            </div>
        </div>
    )
}

export default AdminDashboard
