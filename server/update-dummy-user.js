const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/userModel');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const update = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("No Mongo URI found");
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const list = await clerkClient.users.getUserList({ limit: 1 });
        const realUser = Array.isArray(list) ? list[0] : list.data[0];

        if (!realUser) {
            console.log("No users found in Clerk!");
            return;
        }

        console.log("Found real Clerk User:", realUser.firstName, realUser.id);

        // Update the local 'Admin User' to have this Clerk ID
        const userId = "6981b4a00e47caf84c40fc6a"; // From previous output
        await User.findByIdAndUpdate(userId, {
            clerkId: realUser.id,
            name: realUser.firstName + (realUser.lastName ? ' ' + realUser.lastName : ''),
            email: realUser.emailAddresses[0].emailAddress
        });

        console.log("Updated local user with real Clerk ID.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

update();
