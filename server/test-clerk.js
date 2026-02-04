require('dotenv').config();
const { createClerkClient } = require('@clerk/clerk-sdk-node');

console.log("Checking Environment Variables...");
if (!process.env.CLERK_SECRET_KEY) {
    console.error("ERROR: CLERK_SECRET_KEY is missing from process.env");
    process.exit(1);
}
console.log("Key found:", process.env.CLERK_SECRET_KEY.slice(0, 10) + "...");

try {
    console.log("Initializing Clerk Client...");
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    console.log("Fetching User List...");
    clerkClient.users.getUserList({ limit: 1 })
        .then(list => {
            console.log("SUCCESS! Authorization working.");
            console.log("Users found:", list.data.length);
        })
        .catch(err => {
            console.error("API CALL FAILED:");
            console.error(JSON.stringify(err, null, 2));
            if (err.errors) {
                err.errors.forEach(e => console.error(`- ${e.message} (${e.code})`));
            }
        });

} catch (error) {
    console.error("INITIALIZATION FAILED:", error);
}
