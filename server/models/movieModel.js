const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    poster_path: {
        type: String,
        required: true
    },
    backdrop_path: {
        type: String,
        required: true,
    },

    genres: [
        {
            id: Number,
            name: String
        }
    ],
    casts: [
        {
            name: String,
            profile_path: String
        }
    ],
    release_date: {
        type: String,
        required: true
    },
    original_language: {
        type: String,
        required: true
    },
    tagline: {
        type: String
    },
    vote_average: {
        type: Number
    },
    vote_count: {
        type: Number
    },
    runtime: {
        type: Number,
        required: true
    },
    prices: {
        normal: { type: Number, default: 100 },
        executive: { type: Number, default: 200 },
        premium: { type: Number, default: 300 }
    },
    budget: Number,
    revenue: Number
}, { timestamps: true });

module.exports = mongoose.model('movies', movieSchema);
