import React, { useState, useEffect } from 'react';
import { IoRocketOutline } from "react-icons/io5";
import MovieCard from '../Components/MovieCard';
import Preloader from '../Components/Loading';
import { isReleased } from '../Lib/utils';

const Releases = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`);
                const data = await res.json();
                if (res.ok) {
                    const upcomingMovies = data.filter(movie => !isReleased(movie.release_date));
                    setMovies(upcomingMovies);
                }
            } catch (error) {
                console.error("Error fetching releases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) return <Preloader />;

    return (
        <div className="min-h-screen bg-[#0b0c15] text-white pt-32 px-6 md:px-16 pb-20">
            <div className="flex flex-col items-center text-center mb-16">
                <IoRocketOutline className="text-6xl text-[#ff3366] mb-4 animate-bounce" />
                <h1 className="text-4xl font-bold mb-2">Upcoming Releases</h1>
                <p className="text-gray-400 max-w-md">
                    Explore the latest additions to our collection.
                </p>
            </div>

            {movies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 text-xl mt-10">
                    No releases found. Check back soon!
                </div>
            )}
        </div>
    )
}

export default Releases





