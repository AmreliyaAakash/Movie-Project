const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/bookingModel');

const checkBookings = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("No Mongo URI found in .env");
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const bookings = await Booking.find({}, 'show.showDateTime createdAt');
        console.log(`Found ${bookings.length} bookings.`);

        const now = new Date();
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(); end.setHours(23, 59, 59, 999);

        console.log("Today's Range:", start.toISOString(), "to", end.toISOString());

        bookings.forEach(b => {
            console.log(`- Booking ID: ${b._id}`);
            console.log(`  Show Time: ${b.show ? b.show.showDateTime : 'N/A'}`);
            console.log(`  Created At: ${b.createdAt}`);

            const showDate = new Date(b.show.showDateTime);
            const isToday = showDate >= start && showDate <= end;
            console.log(`  Is Today? ${isToday}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkBookings();
