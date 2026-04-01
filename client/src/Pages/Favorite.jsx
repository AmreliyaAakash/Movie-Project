import React, { useState } from 'react';
import { dummyShowsData } from '../assets/assets';
import { Link } from 'react-router-dom';
import { IoHeart } from "react-icons/io5";
import MovieCard from '../Components/MovieCard';

const Favorite = () => {
  // Simulate some favorites by picking the first 3 movies
  const [favorites, setFavorites] = useState(dummyShowsData.slice(0, 3));

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-6 md:p-12 pt-32 md:pt-32">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <IoHeart className="text-red-500" />
        My Favorites
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">You haven't added any movies to your favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorite;




