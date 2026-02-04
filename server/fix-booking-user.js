const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/bookingModel');
const User = require('./models/userModel');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const fixBooking = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("No Mongo URI found");
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const list = await clerkClient.users.getUserList({ limit: 1 });
        const realClerkUser = Array.isArray(list) ? list[0] : list.data[0];

        if (!realClerkUser) {
            console.log("No users found in Clerk!");
            return;
        }

        const email = realClerkUser.emailAddresses[0].emailAddress;
        console.log("Target Email:", email);

        // 1. Find the User document that already has this email
        let user = await User.findOne({ email: email });

        if (!user) {
            console.log("User not found in DB either! Creating one...");
            // If strictly not found (which contradicts the error), create it. 
            // But the error said it exists.
            user = new User({
                name: realClerkUser.firstName,
                email: email,
                clerkId: realClerkUser.id,
                password: "dummy_password_integrated", // needed for schema if required
                isAdmin: false
            });
            await user.save();
        } else {
            console.log("Found existing DB User:", user._id);
            // Ensure clerkId is set on this existing user
            if (user.clerkId !== realClerkUser.id) {
                user.clerkId = realClerkUser.id;
                await user.save();
                console.log("Updated existing user with Clerk ID");
            }
        }

        // 2. Find the Dummy Booking
        const booking = await Booking.findOne({ transactionId: /469031$/ });
        if (booking) {
            booking.user = user._id;
            await booking.save();
            console.log("Re-assigned Booking to User:", user.name);
        } else {
            // Find ANY booking for today if strict ID search fails
            const start = new Date(); start.setHours(0, 0, 0, 0);
            const end = new Date(); end.setHours(23, 59, 59, 999);
            const anyBooking = await Booking.findOne({ 'show.showDateTime': { $gte: start, $lte: end } });
            if (anyBooking) {
                anyBooking.user = user._id;
                await anyBooking.save();
                console.log("Re-assigned Today's Booking to User:", user.name);
            } else {
                console.log("No booking found to fix.");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

fixBooking();
