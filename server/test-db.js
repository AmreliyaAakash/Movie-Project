const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/movieModel');

const run = async () => {
    try {
        console.log("Connecting...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected. Finding movies...");
        const movies = await Movie.find();
        console.log(`Found ${movies.length} movies.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

run();
