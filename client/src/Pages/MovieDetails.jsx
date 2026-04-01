import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dummyShowsData } from '../assets/assets';
import { formatCurrency, formatDate, getImageUrl } from '../Lib/utils';
import { IoTimeOutline, IoCalendarOutline, IoStar, IoPlayCircleOutline } from "react-icons/io5";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Try fetching from API first
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMovie(data);
        } else {
          // Fallback to dummy data if API fails (e.g. for hardcoded demo movies)
          const foundMovie = dummyShowsData.find(m => m.id === parseInt(id));
          if (foundMovie) setMovie(foundMovie);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        // Fallback
        const foundMovie = dummyShowsData.find(m => m.id === parseInt(id));
        setMovie(foundMovie);
      }
      window.scrollTo(0, 0);
    };

    fetchMovie();
  }, [id]);


  /* ================= COUNTDOWN LOGIC ================= */
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReleased, setIsReleased] = useState(false);

  useEffect(() => {
    if (!movie) return;

    const calculateTimeLeft = () => {
      const releaseDate = new Date(movie.release_date).getTime();
      const now = new Date().getTime();
      const difference = releaseDate - now;

      if (difference <= 0) {
        setIsReleased(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsReleased(false);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [movie]);


  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">Loading...</div>;
  }

  // Format date for URL (YYYY-MM-DD)
  const bookingDate = new Date(movie.release_date).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans pb-20">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[100vh] w-full">
        {/* ... (Same Gradients & Image) ... */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent z-10"></div>
        <img
          src={getImageUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 w-full z-20 p-8 md:p-16 flex flex-col md:flex-row gap-8 items-end">

          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-48 md:w-64 rounded-xl shadow-2xl border-4 border-white/10 hidden md:block"
          />

          <div className="flex-1 space-y-4">
            {/* ... (Existing Title/Genres Logic) ... */}
            <div className="flex items-center gap-3 text-orange-400 font-semibold uppercase tracking-wider text-sm">
              {movie.genres.map(g => g.name).join(' • ')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">{movie.title}</h1>
            {movie.tagline && <p className="text-xl text-gray-300 italic">"{movie.tagline}"</p>}

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mt-4">
              <div className="flex items-center gap-2">
                <IoStar className="text-yellow-400 text-xl" />
                <span className="text-white font-bold text-lg">{movie.vote_average?.toFixed(1) || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTimeOutline className="text-xl" />
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              </div>
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="text-xl" />
                <span>{new Date(movie.release_date).toDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 items-start sm:items-center">
              {isReleased ? (
                <Link
                  to={`/movies/${id}/${bookingDate}`}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-orange-600/20"
                >
                  Book Tickets
                </Link>
              ) : (
                <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-orange-500/30">
                  <span className="text-orange-400 font-bold text-sm tracking-widest uppercase">Releasing In</span>
                  <div className="flex gap-3 text-2xl font-mono font-bold">
                    <div>{timeLeft?.days || 0}d</div>:
                    <div>{timeLeft?.hours || 0}h</div>:
                    <div>{timeLeft?.minutes || 0}m</div>:
                    <div>{timeLeft?.seconds || 0}s</div>
                  </div>
                </div>
              )}

              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl font-semibold transition-all">
                <IoPlayCircleOutline className="text-2xl" />
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
              Storyline
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
              Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {movie.casts.slice(0, 8).map((cast, index) => (
                <div key={index} className="text-center group">
                  <div className="w-full aspect-square rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-orange-500 transition-all">
                    <img
                      src={getImageUrl(cast.profile_path)}
                      alt={cast.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">{cast.name}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#222] p-6 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4 text-orange-400">Movie Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Original Language</p>
                <p className="font-medium uppercase">{movie.original_language}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <p className="font-medium">Released</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Budget</p>
                <p className="font-medium">{formatCurrency(100000000)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Revenue</p>
                <p className="font-medium">{formatCurrency(350000000)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;




