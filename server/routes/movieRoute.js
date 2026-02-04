const express = require('express');
const router = express.Router();
const Movie = require('../models/movieModel');
const Booking = require('../models/bookingModel');

// GET all movies
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET movie by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let movie;

        // Check if it's a valid MongoDB ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            movie = await Movie.findById(id);
        }

        // If not found by _id, try finding by custom 'id' field
        if (!movie) {
            movie = await Movie.findOne({ id: id });
        }

        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: "Movie not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.post('/', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.status(201).json({ message: "Movie Added", movie: newMovie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add movie", details: error.message });
    }
});

// DELETE movie by ID
router.delete('/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: "Movie Deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET Booked Seats for a Show
router.get('/:id/shows/:date/:time/booked-seats', async (req, res) => {
    try {
        const { id, date, time } = req.params;

        // Convert date and time to proper format if needed, or query effectively
        // We know we save showDateTime in booking.
        // Let's create a range or match exactly.
        // The date param is 'YYYY-MM-DD'. Time is 'HH:MM'.

        const showDateTimeStr = `${date}T${time}:00.000Z`; // Construct ISO string part or just Date

        // OR better, we need to match the booking showDateTime.
        // Since we are not saving timezone info strictly, we might need to be careful.
        // But for this MVP, let's assume we can match the Date object or close enough.

        // Let's refine the query. We need to find bookings where:
        // booking.show.movie id matches
        // booking.show.showDateTime matches

        // Note: Client sends Date string.

        // Since we don't have a rigid Show model with ID, we rely on Movie ID + DateTime.

        // Let's just fuzzy match/find all bookings for this movie and filter/match date on server or mongo.

        // Ideally we construct a Start and End of the minute or hour.

        // Let's rely on how we saved it.
        // In SeatLayout we do: new Date(`${date}T${selectedTime.time}`)
        // Let's reconstruct that here.

        const targetDate = new Date(`${date}T${time}`);

        // Find bookings for this movie and status confirmed
        const query = {
            "show.movie._id": id, // If we saved ID or Object. The model says "movie: { title... }" but wait... 
            // In payments.js we save: show: { movie: bookingDetails.movie, showDateTime: ... }
            // And bookingDetails.movie comes from frontend: { title, poster... } IT DOESNT HAVE ID?
            // Wait, let's check payments.js saving logic again.
            // Frontend SeatLayout: bookingDetails.movie = { title: show.movie.title ... }
            // It DOES NOT save ID. This is a flaw.
            // I should update SeatLayout to send ID and payments to save it if possible?
            // OR I can query by Title? Title is unique enough for this demo.
            // But the route is /:id/...
            // Let's fetch the movie by ID first to get the title, then query bookings by title.
        };

        const movie = await Movie.findById(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        const bookings = await Booking.find({
            "show.movie.title": movie.title,
            "status": "Confirmed"
        });

        // Filter by time manually to avoid timezone headaches or exact ISO string mismatch
        const bookedSeatIds = bookings.reduce((acc, booking) => {
            const bookingTime = new Date(booking.show.showDateTime);
            const reqTime = new Date(`${date}T${time}`);

            // Compare items
            if (bookingTime.toISOString() === reqTime.toISOString()) { // Simple string comparison
                return [...acc, ...booking.bookedSeats];
            }
            return acc;
        }, []);

        // Flatten and return
        res.json(bookedSeatIds);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
