import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoStar, IoPlayCircleOutline, IoArrowForward } from "react-icons/io5";
import TrailersSection from '../Components/TrailersSection';
import MovieCard from '../Components/MovieCard';
import gsap from 'gsap';
import { isReleased } from '../Lib/utils';
import Preloader from '../Components/Loading';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for animations
  const heroContentRef = useRef(null);
  const moviesGridRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/movies');
        if (res.ok) {
          const data = await res.json();
          setMovies(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  // Filter Released Movies
  const releasedMovies = movies.filter(m => isReleased(m.release_date));

  // Pick a featured movie for the Hero section
  const featuredMovie = releasedMovies.find(m => m.title.includes("Avengers")) || releasedMovies[0];

  const formatRuntime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  /* GSAP Entrance Animation */
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Hero Content Animation
      if (heroContentRef.current && heroContentRef.current.children.length > 0) {
        gsap.fromTo(heroContentRef.current.children,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.2 }
        );
      }

      // Grid Animation
      if (moviesGridRef.current && moviesGridRef.current.children.length > 0) {
        gsap.fromTo(moviesGridRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.6,
            scrollTrigger: {
              trigger: moviesGridRef.current,
              start: "top 80%",
            }
          }
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0b0c15] text-white font-sans">

      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-[100vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c15] via-[#0b0c15]/60 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c15] via-transparent to-transparent z-10"></div>

          <img
            src={featuredMovie.backdrop_path}
            alt={featuredMovie.title}
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />

          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-20">
            <div ref={heroContentRef} className="max-w-2xl space-y-6">
              <div className="uppercase tracking-widest text-[#ff3366] font-bold text-sm">
                {featuredMovie.genres?.map(g => typeof g === 'object' ? g.name : g).slice(0, 3).join(" | ")}
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">{featuredMovie.title}</h1>

              <div className="flex items-center gap-6 text-gray-300 font-medium">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-800 p-1 rounded text-xs">{new Date(featuredMovie.release_date).getFullYear()}</span>
                </div>
                <span>{formatRuntime(featuredMovie.runtime)}</span>
              </div>

              <p className="text-lg text-gray-400 line-clamp-3 leading-relaxed max-w-xl">
                {featuredMovie.overview}
              </p>

              <div className="flex gap-4 pt-4">
                <Link
                  to={`/movies/${featuredMovie._id}`}
                  className="bg-[#ff3366] hover:bg-[#ff1f4b] text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-600/30 flex items-center gap-2"
                >
                  Get Ticket
                </Link>
                <button className="flex items-center gap-2 px-8 py-3 rounded-full border border-gray-600 hover:border-white transition-colors font-bold">
                  <IoPlayCircleOutline className="text-2xl" />
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Now Showing Section */}
      <div className="px-6 md:px-16 lg:px-24 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Now Showing</h2>
          <Link to="/movies" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
            View All <IoArrowForward />
          </Link>
        </div>

        {loading ? <Preloader /> : (
          <div ref={moviesGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
            {releasedMovies.slice(0, 4).map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
        <div className="flex justify-center mt-10">
          <Link to="/movies" className="bg-[#ff3366] px-6 py-2 rounded text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-[#ff1f4b] transition-colors">Show more</Link>
        </div>
      </div>

      {/* Trailers Section */}
      <TrailersSection />

      {/* Footer Removed (Moved to Global Component) */}
    </div>
  );
};

export default Home;