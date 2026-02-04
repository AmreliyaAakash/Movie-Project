const mongoose = require('mongoose');
const Movie = require('./models/movieModel');
require('dotenv').config();

const inspectMovies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const movies = await Movie.find({}, '_id id title');
        console.log("Movies found:", movies);

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
};

inspectMovies();
