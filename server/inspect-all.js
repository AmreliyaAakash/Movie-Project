const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/bookingModel');

const inspect = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("No Mongo URI found");
        await mongoose.connect(uri);
        console.log("Connected");

        const bookings = await Booking.find({});
        console.log(`Found ${bookings.length} bookings.`);

        bookings.forEach(b => {
            console.log(`- ID: ${b._id}`);
            console.log(`  Show Date: ${b.show?.showDateTime}`);
            console.log(`  User: ${b.user}`);
            console.log(`  Amount: ${b.amount}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

inspect();
