require('dotenv').config();
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

console.log("Fetching one user...");
clerkClient.users.getUserList({ limit: 1 })
    .then(list => {
        const users = Array.isArray(list) ? list : list.data;
        if (users.length > 0) {
            console.log("User Keys:", Object.keys(users[0]));
            console.log("User Data (Partial):", JSON.stringify(users[0], null, 2));
        } else {
            console.log("No users found.");
        }
    })
    .catch(err => console.error(err));
