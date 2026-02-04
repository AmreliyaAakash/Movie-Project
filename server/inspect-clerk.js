require('dotenv').config();
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

console.log("Inspecting clerkClient.users methods:");
// Log all properties/methods
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(clerkClient.users)));
// Also log keys just in case
console.log(Object.keys(clerkClient.users));

// Try to find anything that looks like ban/block
const allProps = [];
let obj = clerkClient.users;
do {
    allProps.push(...Object.getOwnPropertyNames(obj));
} while (obj = Object.getPrototypeOf(obj));

console.log("All properties on users object:", allProps.filter(p => !p.startsWith('_')).sort());
