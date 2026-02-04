const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/bookingModel');
const User = require('./models/userModel');

const inspect = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("No Mongo URI found");
        await mongoose.connect(uri);
        console.log("Connected");

        // Find the booking likely shown in screenshot (transaction ID ending in 469031)
        // actually regex search for transactionId ending in 469031
        const booking = await Booking.findOne({ transactionId: /469031$/ }).populate('user');

        if (!booking) {
            console.log("Booking not found matching ID *469031");
            return;
        }

        console.log("Booking Found:", booking._id);
        console.log("Transaction ID:", booking.transactionId);

        if (!booking.user) {
            console.log("No user populated.");
        } else {
            console.log("User ID:", booking.user._id);
            console.log("User Name (Local):", booking.user.name);
            console.log("User Email (Local):", booking.user.email);
            console.log("Clerk ID:", booking.user.clerkId);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

inspect();
