import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Clock, Trash } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users:", error.response ? error.response.data : error.message);
            toast.error(`Failed to load users: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
            toast.success("User deleted successfully");
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete user");
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-[#ff3366] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1c29] p-6 rounded-2xl shadow-xl border border-gray-800 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <User className="text-[#ff3366]" /> Users
                <span className="text-sm font-normal text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                    {users.length} Total
                </span>
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="p-4">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Last Active</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-800 hover:bg-white/5 transition">
                                <td className="p-4 flex items-center gap-3">
                                    <img
                                        src={user.imageUrl}
                                        alt={user.fullName}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-700"
                                    />
                                    <span className="font-semibold">{user.fullName}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-500" />
                                        {user.email}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {user.lastSignInAt ? (
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-blue-500" />
                                            {new Date(user.lastSignInAt).toLocaleString()}
                                        </div>
                                    ) : (
                                        <span className="text-gray-600">Never</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-green-500" />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">

                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
                                            title="Delete User"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersTab;
