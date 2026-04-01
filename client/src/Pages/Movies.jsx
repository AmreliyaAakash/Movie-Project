import React, { useState, useMemo, useEffect } from 'react';
import { isReleased } from '../Lib/utils';
import { Link } from 'react-router-dom';
import { IoFilter, IoSearch } from "react-icons/io5";
import MovieCard from '../Components/MovieCard';
import Preloader from '../Components/Loading';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`);
        const data = await res.json();
        if (res.ok) {
          setMovies(data);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filter only released movies
  const releasedMovies = useMemo(() => {
    return movies.filter(movie => isReleased(movie.release_date));
  }, [movies]);

  // Extract unique genres from released movies
  const genres = useMemo(() => {
    // Check if genres is array of objects {id, name} or just strings
    const allGenres = releasedMovies.flatMap(movie =>
      Array.isArray(movie.genres)
        ? movie.genres.map(g => typeof g === 'object' ? g.name : g)
        : []
    );
    return ['All', ...new Set(allGenres)];
  }, [releasedMovies]);

  const filteredMovies = releasedMovies.filter(movie => {
    const matchesGenre = selectedGenre === 'All' || movie.genres.some(g => (typeof g === 'object' ? g.name : g) === selectedGenre);
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-6 md:p-12 pt-32 md:pt-32">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Explore Movies</h1>
            <p className="text-gray-400 mt-2">Discover new favorites across all genres</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-full py-3 pl-12 pr-6 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-500"
            />
          </div>
        </header>

        {/* Genre Filters */}
        <div className="mb-10 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 mr-4 text-gray-500">
            <IoFilter />
            <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
          </div>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${selectedGenre === genre
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333] hover:text-white'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No movies found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;




