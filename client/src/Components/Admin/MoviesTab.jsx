import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X, Star, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MoviesTab = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState([]);

    // TMDB Standard IDs for consistency
    const GENRE_OPTIONS = [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 878, name: "Science Fiction" },
        { id: 14, name: "Fantasy" },
        { id: 27, name: "Horror" },
        { id: 9648, name: "Mystery" },
        { id: 10751, name: "Family" },
        { id: 35, "name": "Comedy" },
        { id: 80, name: "Crime" },
        { id: 53, name: "Thriller" }
    ];

    // Form State
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        overview: "",
        poster_path: "",
        backdrop_path: "",
        release_date: "",
        runtime: "",
        original_language: "en",
        vote_average: 0,
        budget: "",
        revenue: ""
    });

    // Cast State
    const [castList, setCastList] = useState([]);
    const [newCast, setNewCast] = useState({ name: "", profile_path: "" });

    // Fetch Movies
    const fetchMovies = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/movies');
            const data = await res.json();
            if (res.ok) {
                setMovies(data);
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            toast.error("Failed to load movies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Genre Selection
    const toggleGenre = (genre) => {
        if (selectedGenres.some(g => g.id === genre.id)) {
            setSelectedGenres(selectedGenres.filter(g => g.id !== genre.id));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    // Handle File Upload
    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (res.ok) {
                // Prepend Server URL so frontend (port 5173) can access server (port 5000) image
                const fullUrl = `http://localhost:5000${data.imageUrl}`;
                setFormData(prev => ({ ...prev, [field]: fullUrl }));
                toast.success(`${field === 'poster_path' ? 'Poster' : 'Backdrop'} uploaded!`);
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error uploading image");
        }
    };

    // Handle Cast Image Upload
    const handleCastUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();
            if (res.ok) {
                const fullUrl = `http://localhost:5000${data.imageUrl}`;
                setNewCast({ ...newCast, profile_path: fullUrl });
                toast.success("Cast image uploaded!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        }
    };

    const addCastMember = () => {
        if (!newCast.name || !newCast.profile_path) {
            return toast.error("Name and Image are required for cast");
        }
        setCastList([...castList, newCast]);
        setNewCast({ name: "", profile_path: "" });
    };

    const removeCastMember = (index) => {
        setCastList(castList.filter((_, i) => i !== index));
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!formData.title || !formData.id) {
                return toast.error("Title and ID are required");
            }

            // Construct payload with nested prices
            const payload = {
                ...formData,
                genres: selectedGenres,
                prices: {
                    normal: Number(formData.price_normal) || 100,
                    executive: Number(formData.price_executive) || 200,
                    premium: Number(formData.price_premium) || 300
                },
                casts: castList,
                budget: Number(formData.budget) || 0,
                revenue: Number(formData.revenue) || 0
            };

            const res = await fetch('http://localhost:5000/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Movie Added Successfully!");
                setShowForm(false);
                fetchMovies(); // Refresh list
                setFormData({
                    id: "", title: "", overview: "", poster_path: "", backdrop_path: "",
                    release_date: "", runtime: "", original_language: "en", vote_average: 0,
                    budget: "", revenue: ""
                });
                setSelectedGenres([]);
                setCastList([]);
            } else {
                const errorData = await res.json();
                toast.error(errorData.details || "Failed to add movie");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error adding movie");
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this movie? This will remove it from the database.")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/movies/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Movie deleted from Database");
                fetchMovies();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting movie");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Movies</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#ff3366] hover:bg-[#ff1f4b] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} /> Add Movie
                </button>
            </div>

            {/* ADD MOVIE FORM MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#15161c] p-6 rounded-2xl w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Add New Movie</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="title" placeholder="Movie Title" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} required />
                                <input name="id" type="number" placeholder="Unique ID (e.g. 101)" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} required />
                            </div>

                            <textarea name="overview" placeholder="Storyline / Overview" rows="3" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} required></textarea>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Poster Image</label>
                                    <input type="file" accept="image/*" className="bg-[#0b0c15] p-2 rounded border border-gray-700 text-white w-full text-sm" onChange={(e) => handleFileUpload(e, 'poster_path')} />
                                    {formData.poster_path && <span className="text-xs text-green-500">Image Uploaded</span>}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Backdrop Image</label>
                                    <input type="file" accept="image/*" className="bg-[#0b0c15] p-2 rounded border border-gray-700 text-white w-full text-sm" onChange={(e) => handleFileUpload(e, 'backdrop_path')} />
                                    {formData.backdrop_path && <span className="text-xs text-green-500">Image Uploaded</span>}
                                </div>
                            </div>



                            {/* GENRES */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Genres</label>
                                <div className="flex flex-wrap gap-2">
                                    {GENRE_OPTIONS.map(genre => {
                                        const isSelected = selectedGenres.some(g => g.id === genre.id);
                                        return (
                                            <button
                                                key={genre.id}
                                                type="button"
                                                onClick={() => toggleGenre(genre)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                                ${isSelected
                                                        ? "bg-[#ff3366] border-[#ff3366] text-white"
                                                        : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white"
                                                    }`}
                                            >
                                                {genre.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-gray-400 text-xs mb-1 block">Normal Price (₹)</label>
                                    <input name="price_normal" type="number" placeholder="100" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs mb-1 block">Executive Price (₹)</label>
                                    <input name="price_executive" type="number" placeholder="200" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs mb-1 block">Premium Price (₹)</label>
                                    <input name="price_premium" type="number" placeholder="300" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <input name="release_date" type="datetime-local" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                                <input name="runtime" type="number" placeholder="Runtime (mins)" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                                <input name="vote_average" type="number" step="0.1" placeholder="Rating (0-10)" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input name="budget" type="number" placeholder="Budget (₹)" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                                <input name="revenue" type="number" placeholder="Revenue (₹)" className="bg-[#0b0c15] p-3 rounded border border-gray-700 text-white w-full" onChange={handleChange} />
                            </div>

                            {/* CAST MANAGEMENT */}
                            <div className="bg-[#0b0c15] p-4 rounded border border-gray-700">
                                <h4 className="text-sm font-bold text-gray-300 mb-3">Cast Details</h4>
                                <div className="flex gap-3 items-end mb-4">
                                    <div className="flex-1">
                                        <input
                                            placeholder="Cast Name"
                                            value={newCast.name}
                                            onChange={(e) => setNewCast({ ...newCast, name: e.target.value })}
                                            className="bg-[#15161c] p-2 rounded border border-gray-600 text-white w-full text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCastUpload}
                                            className="bg-[#15161c] p-2 rounded border border-gray-600 text-white w-full text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addCastMember}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-bold"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Cast List Preview */}
                                <div className="flex flex-wrap gap-3">
                                    {castList.map((cast, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-[#15161c] p-2 rounded border border-gray-600">
                                            <img src={cast.profile_path} alt={cast.name} className="w-8 h-8 rounded-full object-cover" />
                                            <span className="text-xs text-white">{cast.name}</span>
                                            <button type="button" onClick={() => removeCastMember(index)} className="text-red-500 hover:text-white">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#ff3366] hover:bg-[#ff1f4b] text-white py-3 rounded-lg font-bold mt-4">
                                Save Movie
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MOVIES LIST */}
            {
                loading ? (
                    <div className="text-center text-gray-400 py-20">Loading movies...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {movies.map(movie => (
                            <div key={movie._id} className="bg-[#15161c] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition group relative">
                                <div className="relative h-48">
                                    <img src={movie.backdrop_path || movie.poster_path} alt={movie.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#15161c] to-transparent"></div>
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(movie._id)}
                                            className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 shadow-lg"
                                            title="Delete Movie"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-bold truncate">{movie.title}</h3>
                                    <div className="flex items-center gap-4 text-gray-400 text-sm mt-2">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {movie.release_date}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {movie.runtime}m</span>
                                        <span className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" /> {movie.vote_average}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export default MoviesTab;
