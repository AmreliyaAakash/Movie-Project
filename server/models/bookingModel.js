const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    show: {
        movie: {
            title: String,
            poster_path: String,
            backdrop_path: String
        },
        showDateTime: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    bookedSeats: {
        type: Array,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Confirmed',
        enum: ['Confirmed', 'Cancelled']
    },
    cancelReason: {
        type: String
    }
}, { timestamps: true });

// Partial TTL Index: Expire "Cancelled" bookings after 7 days (604800 seconds)
// Note: MongoDB checks TTL every 60s.
bookingSchema.index({ updatedAt: 1 }, {
    expireAfterSeconds: 604800,
    partialFilterExpression: { status: 'Cancelled' }
});

module.exports = mongoose.model('bookings', bookingSchema);
