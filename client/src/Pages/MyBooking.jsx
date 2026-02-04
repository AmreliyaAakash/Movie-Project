import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { dummyBookingData } from '../assets/assets';
import { formatCurrency, formatDate, formatTime } from '../Lib/utils';
import { IoCalendarOutline, IoTimeOutline, IoTicketOutline, IoCloseCircleOutline, IoAlertCircleOutline } from "react-icons/io5";
import BlurLoader from '../Components/BlurLoader';
import { toast } from 'react-hot-toast';

const MyBooking = () => {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch Bookings
  const fetchBookings = async () => {
    if (!user) return;
    try {
      // Pass user email or ID to filter
      const res = await fetch(`http://localhost:5000/api/payment/bookings?email=${user.emailAddresses[0].emailAddress}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchBookings();
    }
  }, [isLoaded, user]);

  const cancelReasons = [
    "Change of plans",
    "Booked by mistake",
    "Found a better showtime",
    "Other"
  ];

  /* ================= HANDLERS ================= */
  const openCancelModal = (id) => {
    setSelectedBookingId(id);
    setCancelModalOpen(true);
    setCancelReason('');
  };

  const handleCancel = async () => {
    if (!cancelReason) return;

    setIsCancelling(true); // Start Blur

    try {
      const res = await fetch(`http://localhost:5000/api/payment/cancel-booking/${selectedBookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (res.ok) {
        await fetchBookings(); // Refresh list
        setCancelModalOpen(false);
        setSelectedBookingId(null);
        toast.success("Order Cancelled Successfully");

        // Keep blurred for a moment to match "Book Ticket" experience and show toast
        setTimeout(() => {
          setIsCancelling(false);
        }, 2000);

      } else {
        console.error("Cancellation API Failed", res.status);
        toast.error("Failed to cancel order");
        setIsCancelling(false); // Stop Blur on error
      }
    } catch (error) {
      console.error("Cancellation Error:", error);
      toast.error("Error cancelling order");
      setIsCancelling(false); // Stop Blur on error
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-6 md:p-12 pt-32 md:pt-32">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <IoTicketOutline className="text-orange-500" />
        My Bookings
      </h1>

      <div className="space-y-6 max-w-5xl mx-auto">

        {Array.isArray(bookings) && bookings.map((booking) => (
          <div key={booking._id} className="bg-[#222] rounded-2xl overflow-hidden border border-gray-800 flex flex-col md:flex-row hover:border-gray-600 transition-all">
            {/* Movie Image */}
            <div className="w-full md:w-48 h-48 md:h-auto relative">
              <img
                src={booking.show?.movie?.poster_path || "https://via.placeholder.com/200x300?text=No+Image"}
                alt={booking.show?.movie?.title || "Unknown Movie"}
                className="w-full h-full object-cover"
              />
              {booking.status === 'Cancelled' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-red-500 font-bold border-2 border-red-500 px-4 py-1 rounded rotate-[-15deg] text-xl">CANCELLED</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold">{booking.show?.movie?.title || "Unknown Title"}</h2>
                  <span className="text-orange-400 font-medium">{formatCurrency(booking.amount || 0)}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <IoCalendarOutline />
                    <span>{booking.show?.showDateTime ? formatDate(booking.show.showDateTime) : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoTimeOutline />
                    <span>{booking.show?.showDateTime ? formatTime(booking.show.showDateTime) : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoTicketOutline />
                    <span>{booking.bookedSeats?.join(', ') || "N/A"} ({booking.bookedSeats?.length || 0} Seats)</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Booking ID: <span className="font-mono text-gray-300">{booking._id}</span></p>
              </div>

              <div className="mt-6 flex justify-end">
                {booking.status === 'Cancelled' ? (
                  <div className="text-right">
                    <p className="text-red-400 text-sm font-medium flex items-center gap-1 justify-end">
                      <IoAlertCircleOutline />
                      Order Cancelled
                    </p>
                    <p className="text-gray-500 text-xs mt-1 mb-1">Reason: {booking.cancelReason}</p>
                    <p className="text-green-400 text-xs font-semibold">Refund will be credited Your Bank  in 7 business days.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => openCancelModal(booking._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <IoCloseCircleOutline className="text-lg" />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#222] rounded-2xl w-full max-w-md p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
            <p className="text-gray-400 mb-6">Please choose a reason for cancelling your booking.</p>

            <div className="space-y-3 mb-8">
              {cancelReasons.map(reason => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${cancelReason === reason
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-gray-700 hover:border-gray-500 text-gray-300'
                    }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-red-600 disabled:bg-red-600/50 hover:bg-red-700 text-white transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Blur Loader */}
      {isCancelling && <BlurLoader text="Cancelling Order..." />}
    </div>
  );
};

export default MyBooking;