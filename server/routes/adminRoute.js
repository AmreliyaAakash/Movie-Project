const router = require('express').Router();
const Booking = require('../models/bookingModel');
const Movie = require('../models/movieModel');
const OTP = require('../models/otpModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Admin Credentials from Environment Variables
const ADMIN_USER = process.env.ADMIN_USER || "Aakash";
const ADMIN_PASS = process.env.ADMIN_PASS || "Devanshi";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "amreliyaaakash3@gmail.com";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Admin Login (Step 1: Check Credentials & Send OTP)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            // Hash the OTP before saving
            const hashedOtp = await bcrypt.hash(otp, 10);

            // Save Hashed OTP to Database
            await OTP.findOneAndUpdate(
                { email: ADMIN_EMAIL },
                { otp: hashedOtp },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            await transporter.sendMail({
                from: `"Angel CineWorld Admin" <${process.env.EMAIL_USER}>`,
                to: ADMIN_EMAIL,
                subject: "🔐 Admin Panel Login OTP - Angel CineWorld",

                html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">

            <h2 style="text-align: center; color: #2c3e50;">
                Angel CineWorld Admin Login
            </h2>

            <p style="font-size: 16px; color: #333;">
                Hello Aakash,
            </p>

            <p style="font-size: 15px; color: #555;">
                Your One-Time Password (OTP) for accessing the Admin Panel is:
            </p>

            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 28px; letter-spacing: 5px; font-weight: bold; color: #ffffff; background: #1e88e5; padding: 12px 20px; border-radius: 8px;">
                    ${otp}
                </span>
            </div>

            <p style="font-size: 14px; color: #777;">
                ⏳ This OTP is valid for 5 minutes. Please do not share it with anyone.
            </p>

            <hr style="margin: 25px 0;">

            <p style="font-size: 13px; color: #999; text-align: center;">
                If you did not request this login, please ignore this email.
            </p>

            <p style="font-size: 13px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} Angel CineWorld. All rights reserved.
            </p>

        </div>
    </div>
    `
            });
            // Log for debugging
            res.json({ success: true, message: "OTP sent to email" });
        } catch (error) {
            console.error("Login/Email Error:", error);
            res.status(500).json({ success: false, message: "Error sending OTP" });
        }
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// 2. Verify OTP (Step 2: Grant Access)
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        const otpRecord = await OTP.findOne({ email: ADMIN_EMAIL });

        if (otpRecord) {
            // Compare the provided OTP with the hashed OTP in the DB
            const isMatch = await bcrypt.compare(otp, otpRecord.otp);

            if (isMatch) {
                // Delete OTP after success
                await OTP.deleteOne({ _id: otpRecord._id });
                res.json({ success: true, message: "Login Successful" });
            } else {
                res.status(401).json({ success: false, message: "Invalid OTP" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid OTP or expired" });
        }
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Server Error during verification" });
    }
});


// GET Stats
router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalMovies = await Movie.countDocuments();

        // Calculate Revenue (Sum of 'amount' in Bookings)
        // Assuming 'Confirmed' bookings only? Let's just sum all for now or filter by status 'Confirmed'
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            totalBookings,
            totalMovies,
            revenue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET Recent Bookings
// GET Bookings (Default: Today's Shows)
// GET Bookings (Default: Today's Shows)
// GET Bookings (with optional period filter)
// GET Bookings (Default: All, sorted by newest)
router.get('/bookings', async (req, res) => {
    try {
        let query = {};

        // Fetch bookings with populated user data, converted to plain JS objects
        const bookings = await Booking.find(query)
            .populate('user') // Populate full user document
            .sort({ 'show.showDateTime': -1 }) // Sort newest first usually better for admin
            .lean();

        // ---------------------------------------------------------
        // CLERK INTEGRATION: Fetch real user details
        // ---------------------------------------------------------
        if (process.env.CLERK_SECRET_KEY) {
            try {
                const { createClerkClient } = require('@clerk/clerk-sdk-node');
                const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

                // 1. Collect all Clerk IDs from the bookings
                const clerkIds = bookings
                    .map(b => b.user?.clerkId)
                    .filter(id => id); // Remove null/undefined

                // Deduplicate IDs
                const uniqueClerkIds = [...new Set(clerkIds)];

                if (uniqueClerkIds.length > 0) {
                    // 2. Fetch users from Clerk (batch fetch)
                    // limit: 100 is default, usually enough for "Today's" bookings
                    const clerkUsersList = await clerkClient.users.getUserList({
                        userId: uniqueClerkIds,
                        limit: 100,
                    });

                    const clerkUsers = Array.isArray(clerkUsersList) ? clerkUsersList : clerkUsersList.data;

                    // 3. Create a Map for quick lookup
                    const clerkUserMap = {};
                    if (clerkUsers) {
                        clerkUsers.forEach(u => {
                            clerkUserMap[u.id] = u;
                        });
                    }

                    // 4. Merge Clerk data into bookings
                    bookings.forEach(booking => {
                        if (booking.user && booking.user.clerkId) {
                            const clerkUser = clerkUserMap[booking.user.clerkId];
                            if (clerkUser) {
                                // Construct full name
                                const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
                                const email = clerkUser.emailAddresses[0]?.emailAddress;

                                // Override local DB data with Clerk data
                                booking.user.name = fullName || booking.user.name;
                                booking.user.email = email || booking.user.email;
                                // Add image if available
                                booking.user.imageUrl = clerkUser.imageUrl;
                            }
                        }
                    });
                }
            } catch (clerkError) {
                console.error("Error fetching Clerk users for bookings (Non-fatal):", clerkError);
                // Fallback to local data if Clerk fails, no crash
            }
        }
        // ---------------------------------------------------------

        res.json(bookings);
    } catch (error) {
        console.error("GET /bookings Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// DELETE Booking
router.delete('/bookings/:id', async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET all users from Clerk
router.get('/users', async (req, res) => {
    try {
        // Standard CommonJS require since package code is CJS compatible
        const { createClerkClient } = require('@clerk/clerk-sdk-node');

        if (!process.env.CLERK_SECRET_KEY) {
            console.error("Missing CLERK_SECRET_KEY in .env");
            return res.status(500).json({ error: "Missing Clerk Secret Key" });
        }

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

        const userList = await clerkClient.users.getUserList({
            limit: 100,
        });

        const rawUsers = Array.isArray(userList) ? userList : userList.data;

        // Map to simplified structure
        const users = rawUsers.map(user => ({
            id: user.id,
            imageUrl: user.imageUrl,
            fullName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'No Name',
            email: user.emailAddresses[0]?.emailAddress,
            lastSignInAt: user.lastSignInAt,
            createdAt: user.createdAt,

        }));

        res.json(users);
    } catch (error) {
        console.error("Clerk Fetch Error Full:", JSON.stringify(error, null, 2));
        const errorMessage = error.errors ? error.errors[0]?.message : error.message;
        res.status(500).json({
            error: `Clerk API Error: ${errorMessage}`,
            details: error
        });
    }
});

// DELETE User
router.delete('/users/:id', async (req, res) => {
    try {
        const { createClerkClient } = require('@clerk/clerk-sdk-node');
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

        await clerkClient.users.deleteUser(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error Full:", JSON.stringify(error, null, 2));
        const errorMessage = error.errors ? error.errors[0]?.message : error.message;
        res.status(500).json({ error: `Failed to delete user: ${errorMessage}` });
    }
});






module.exports = router;
