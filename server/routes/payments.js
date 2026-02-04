const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();



// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const Booking = require('../models/bookingModel');

// ... (Razorpay init)

// Route 1: Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Route 2: Verify Payment & Save Booking
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            // User Sync/Resolution Logic
            const User = require('../models/userModel');
            let userId = null;

            // Scenario 1: User Logged in via Clerk (Passed from Frontend)
            if (bookingDetails && bookingDetails.user) {
                const { id: clerkId, fullName, email } = bookingDetails.user;

                // Check if user exists by clerkId OR email
                let user = await User.findOne({
                    $or: [{ clerkId: clerkId }, { email: email }]
                });

                if (user) {
                    // Update clerkId if missing (migration)
                    if (!user.clerkId) {
                        user.clerkId = clerkId;
                        await user.save();
                    }
                    userId = user._id;
                } else {
                    // Create New User
                    // Note: We need a password for the model schema, but Clerk handles auth.
                    // We can set a dummy password or make it optional in schema (better).
                    // For now, let's use a hashed dummy string if required, or update model to not require password if clerkId exists.
                    // Let's assume schema requires password for now and satisfy it.

                    const bcrypt = require('bcryptjs');
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(clerkId + Date.now(), salt); // Random password

                    const newUser = new User({
                        name: fullName || "Clerk User",
                        email: email,
                        clerkId: clerkId,
                        password: hashedPassword, // Dummy password
                        isAdmin: false
                    });
                    const savedUser = await newUser.save();
                    userId = savedUser._id;
                }
            } else {
                // Scenario 2: Fallback to Default Admin (for testing/legacy) or Null
                const defaultUser = await User.findOne({ email: "admin@movie.com" });
                userId = defaultUser ? defaultUser._id : null;
            }

            // Save Booking to Database
            if (bookingDetails) {
                const newBooking = new Booking({
                    show: {
                        movie: bookingDetails.movie,
                        showDateTime: bookingDetails.showDateTime
                    },
                    user: userId,
                    amount: bookingDetails.amount,
                    bookedSeats: bookingDetails.seats,
                    transactionId: razorpay_payment_id,
                    status: 'Confirmed'
                });
                await newBooking.save();

                // Send Ticket Email
                const { sendTicketEmail } = require('../utils/emailService');
                const showDateObj = new Date(bookingDetails.showDateTime);

                await sendTicketEmail(bookingDetails.user?.email || "user@example.com", {
                    movieName: bookingDetails.movie.title, // Assuming bookingDetails.movie has title
                    showDate: showDateObj.toLocaleDateString(),
                    showTime: showDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    seats: bookingDetails.seats,
                    amount: bookingDetails.amount,
                    transactionId: razorpay_payment_id,
                    user: bookingDetails.user?.fullName || "Movie Fan"
                });
            }

            res.json({ success: true, message: "Payment Verified & Booking Saved" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: "Verification failed" });
    }
});

// Route 3: Get User Bookings (Filtered by Email)
router.get('/bookings', async (req, res) => {
    try {
        const { email } = req.query;
        let query = {};

        if (email) {
            // Find user by email to get _id
            const User = require('../models/userModel');
            const user = await User.findOne({ email: email });

            if (user) {
                query.user = user._id;
            } else {
                // User not found in DB? Return empty
                return res.json([]);
            }
        } else {
            // Security: If no email provided, DO NOT return all bookings.
            // This endpoint is for users. Admin usually uses /api/admin/bookings
            // Return empty or throw error? Let's return empty to be safe.
            return res.json([]);
        }

        const bookings = await Booking.find(query)
            .populate('show.movie') // Populate movie details if strictly reference needed, but we save details in show object usually.
            // Actually our schema structure for 'show' is embedded usually?
            // In creation: show: { movie: ..., showDateTime: ... }
            // Let's check Schema. If Schema has specific refs, populate needs match.
            // But 'show' in bookingModel.js is nested object. 'user' is ref.
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Route 4: Cancel Booking
router.post('/cancel-booking/:id', async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled', cancelReason: reason },
            { new: true }
        ).populate('user'); // Populate user to get email

        if (booking && booking.user) {
            const { sendCancellationEmail } = require('../utils/emailService');
            const showDateObj = new Date(booking.show.showDateTime);

            await sendCancellationEmail(booking.user.email, {
                movieName: booking.show.movie.title || "Movie",
                showDate: showDateObj.toLocaleDateString(),
                showTime: showDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                seats: booking.bookedSeats,
                amount: booking.amount,
                refundAmount: booking.amount, // Full refund for simple logic
                reason: reason,
                user: booking.user.name || "User"
            });
        }

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to cancel booking" });
    }
});

module.exports = router;
