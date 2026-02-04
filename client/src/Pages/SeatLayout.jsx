import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { ClockIcon, ChevronLeft, Armchair } from 'lucide-react'
import { dummyDateTimeData, dummyShowsData, assets } from '../assets/assets'
import Loading from '../Components/Loading'
import BlurLoader from '../Components/BlurLoader'
import { formatTime } from '../Lib/utils'
import toast from 'react-hot-toast'
import { useClerk } from "@clerk/clerk-react";

const SeatLayout = () => {
  const { id, date } = useParams()
  const navigate = useNavigate()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [isBooking, setIsBooking] = useState(false)

  const { user, isSignedIn, openSignIn } = useClerk();
  const [isProcessing, setIsProcessing] = useState(false); // Processing State
  const paymentSuccess = React.useRef(false); // Ref for payment success tracking

  // Scroll to top when booking modal opens
  useEffect(() => {
    if (isBooking) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isBooking]);

  /* ================= FETCH SHOW & BOOKED SEATS ================= */
  const [bookedSeats, setBookedSeats] = useState([])

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/movies/${id}`)

        if (res.ok) {
          const movie = await res.json()
          setShow({ movie, dateTime: dummyDateTimeData })
        } else {
          const movie = dummyShowsData.find(
            show => String(show._id) === String(id)
          )
          if (movie) {
            setShow({ movie, dateTime: dummyDateTimeData })
          } else {
            console.error("Movie not found, redirecting...");
            navigate('/404'); // Redirect if not found
          }
        }
      } catch (error) {
        console.error(error)
        navigate('/404'); // Redirect on error
      }
    }
    fetchShow()
  }, [id])

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!selectedTime || !date) return;
      try {
        // Construct a robust URL. Note: Time is like "10:00"
        const res = await fetch(`http://localhost:5000/api/movies/${id}/shows/${date}/${selectedTime.time}/booked-seats`);
        if (res.ok) {
          const seats = await res.json();
          setBookedSeats(seats);
        }
      } catch (error) {
        console.error("Failed to fetch booked seats", error);
      }
    }

    // Reset selection when time changes
    setSelectedSeats([]);
    fetchBookedSeats();
  }, [date, selectedTime, id]);

  if (!show || !date) return <Loading />

  /* ================= SEAT PRICE ================= */
  const seatCategories = [
    {
      name: "NORMAL",
      price: show?.movie?.prices?.normal || 99,
      rows: ["A", "B"],
      color: "border-green-500/50 hover:bg-green-500/20 text-green-500"
    },
    {
      name: "EXECUTIVE",
      price: show?.movie?.prices?.executive || 199,
      rows: ["C", "D", "E", "F", "G", "H"],
      color: "border-blue-500/50 hover:bg-blue-500/20 text-blue-500"
    },
    {
      name: "PREMIUM",
      price: show?.movie?.prices?.premium || 299,
      rows: ["I", "J", "K"],
      color: "border-gold-500/50 hover:bg-yellow-500/20 text-yellow-500"
    }
  ]

  /* ================= SHOWTIMES ================= */
  const getShowtimes = () => {
    if (show.dateTime[date]) return show.dateTime[date]
    return [
      { time: "10:00", seats: [] },
      { time: "13:00", seats: [] },
      { time: "16:00", seats: [] },
      { time: "19:00", seats: [] },
      { time: "22:00", seats: [] }
    ]
  }
  const showtimes = getShowtimes()

  /* ================= SEAT CLICK ================= */
  const handleSeatClick = (seatId, category) => {
    if (!selectedTime) return toast.error("Please select a showtime first")
    if (bookedSeats.includes(seatId)) return toast.error("Seat already booked");

    const exists = selectedSeats.find(seat => seat.id === seatId)

    if (!exists && selectedSeats.length >= 5) {
      return toast.error("Max 5 seats allowed")
    }

    setSelectedSeats(prev =>
      exists
        ? prev.filter(seat => seat.id !== seatId)
        : [...prev, { id: seatId, ...category }]
    )
  }

  const totalAmount = selectedSeats.reduce(
    (sum, seat) => sum + seat.price,
    0
  )

  /* ================= RENDER ROW ================= */
  const renderRow = (row, category) => (
    <div key={row} className="flex justify-center items-center gap-6 mb-3">
      <span className="w-6 text-gray-500 font-mono text-sm">{row}</span>
      <div className="flex gap-2 sm:gap-4">
        {Array.from({ length: 14 }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const isSelected = selectedSeats.some(s => s.id === seatId)
          const isBooked = bookedSeats.includes(seatId);
          const isAisle = i === 7

          return (
            <React.Fragment key={seatId}>
              {isAisle && <div className="w-8 shrink-0" />}
              <button
                disabled={isBooked}
                onClick={() => handleSeatClick(seatId, category)}
                className={`
                                    relative w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg rounded-b-md flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300
                                    ${isBooked
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                    : isSelected
                      ? "bg-[#ff3366] text-white shadow-[0_0_15px_#ff3366] scale-110 z-10 border-none"
                      : `bg-[#1a1a2e] border ${category.color}`
                  }
                                `}
              >
                {i + 1}
                {/* Armrest details for realism */}
                <div className={`absolute -left-1 bottom-1 w-1 h-4 rounded-full ${isSelected ? 'bg-[#cc2952]' : isBooked ? 'bg-gray-700' : 'bg-[#2a2a3e]'}`}></div>
                <div className={`absolute -right-1 bottom-1 w-1 h-4 rounded-full ${isSelected ? 'bg-[#cc2952]' : isBooked ? 'bg-gray-700' : 'bg-[#2a2a3e]'}`}></div>
              </button>
            </React.Fragment>
          )
        })}
      </div>
      <span className="w-6 text-gray-500 font-mono text-sm text-right">{row}</span>
    </div>
  )

  /* ================= PROCEED ================= */
  const handleProceed = () => {
    if (!selectedTime) return toast.error("Select showtime")
    setIsBooking(true)
  }

  /* ================= PAYMENT ================= */

  const loadScript = (src) => {
    return new Promise(resolve => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book tickets");
      return openSignIn();
    }

    setIsProcessing(true); // Start Processing
    paymentSuccess.current = false; // Reset success flag

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!res) {
      setIsProcessing(false);
      return toast.error("Razorpay load failed")
    }

    try {
      const amount = totalAmount + Math.round(totalAmount * 0.1)
      const { data: order } = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { amount }
      )

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Angel CineWorld",
        image: assets.logo,
        order_id: order.id,
        handler: async (response) => {
          paymentSuccess.current = true; // Mark as successful to prevent ondismiss from unblurring

          // Combine date and time string to creating a Date object or ISO string
          const showDateTime = new Date(`${date}T${selectedTime.time}`);

          const bookingPayload = {
            ...response,
            bookingDetails: {
              movie: {
                title: show.movie.title,
                poster_path: show.movie.poster_path,
                backdrop_path: show.movie.backdrop_path,
                _id: show.movie._id
              },
              showDateTime: showDateTime,
              seats: selectedSeats.map(s => s.id),
              amount: totalAmount + Math.round(totalAmount * 0.1),
              user: {
                id: user.id,
                fullName: user.fullName,
                email: user.primaryEmailAddress?.emailAddress
              }
            }
          };

          try {
            const verify = await axios.post(
              'http://localhost:5000/api/payment/verify-payment',
              bookingPayload
            )
            if (verify.data.success) {

              toast.success("Booking Successful")
              setTimeout(() => {
                // Keep blurred during redirect
                window.location.href = "/my-bookings"
              }, 2000)
            }
          } catch (e) {
            console.error(e);
            setIsProcessing(false);
            toast.error("Verification Failed");
          }
        },
        modal: {
          ondismiss: function () {
            // Wait a moment to see if success handler fires (race condition fix)
            setTimeout(() => {
              if (!paymentSuccess.current) {
                setIsProcessing(false);
              }
            }, 10000);
          }
        },
        theme: { color: "#ff3366" },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          contact: user.primaryPhoneNumber?.phoneNumber
        }
      }
      new window.Razorpay(options).open()
    } catch (err) {
      setIsProcessing(false);
      toast.error("Payment Failed")
      console.error(err)
    }
  }

  /* ================= BOOKING SCREEN ================= */
  if (isBooking) {
    return (
      <div className="min-h-screen bg-[#0b0c15] text-white flex justify-center items-center p-4">
        <div className="bg-[#15161c] p-8 rounded-2xl w-full max-w-lg border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff3366] to-transparent"></div>

          <h2 className="text-2xl font-bold mb-6 text-center">{show.movie.title}</h2>

          <div className="space-y-4 bg-[#0b0c15] p-4 rounded-xl mb-6">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Selected Seats</span>
              <span className="text-white font-mono">{selectedSeats.map(s => s.id).join(", ")}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Showtime</span>
              <span className="text-white">{formatTime(selectedTime.time)}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal</span>
              <span className="text-white">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Convenience Fee</span>
              <span className="text-white">₹{Math.round(totalAmount * 0.1)}</span>
            </div>
            <div className="h-px bg-gray-700 my-2"></div>
            <div className="flex justify-between font-bold text-lg text-[#ff3366]">
              <span>Total Pay</span>
              <span>₹{totalAmount + Math.round(totalAmount * 0.1)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsBooking(false)}
              disabled={isProcessing}
              className={`flex-1 py-3 rounded-xl border border-gray-600 transition font-semibold ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`flex-1 bg-[#ff3366] py-3 rounded-xl font-bold shadow-lg shadow-red-600/30 transition transform ${isProcessing ? 'opacity-50 cursor-not-allowed scale-100' : 'hover:bg-[#ff1f4b] hover:scale-105'}`}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ================= MAIN SCREEN ================= */
  return (
    <div className="min-h-screen bg-[#0b0c15] text-white font-sans overflow-x-hidden">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0b0c15]/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
          <ChevronLeft />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{show.movie.title}</h1>
          <p className="text-xs text-gray-400">{new Date(date).toDateString()}</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="pt-28 pb-32 px-4 max-w-6xl mx-auto">

        {/* TIMINGS */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {showtimes.map(item => (
            <button
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 flex items-center gap-2
                            ${selectedTime?.time === item.time
                  ? "bg-[#ff3366] border-[#ff3366] text-white shadow-[0_0_15px_#ff3366]"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                }`}
            >
              <ClockIcon size={16} />
              {formatTime(item.time)}
            </button>
          ))}
        </div>

        {/* SCREEN VISUAL */}
        <div className="relative mb-16 perspective-1000">
          <div className="w-3/4 h-2 bg-white mx-auto rounded-full shadow-[0_20px_60px_rgba(255,255,255,0.2)]"></div>
          <div className="w-3/4 mx-auto text-center mt-4 text-gray-600 text-xs tracking-[0.5em] uppercase font-bold">Screen This Way</div>
          {/* Light Cone Effect */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none skew-x-12"></div>
        </div>

        {/* LEGEND */}
        <div className="flex justify-center gap-8 mb-10 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#1a1a2e] border border-gray-600"></div>
            Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ff3366]"></div>
            Selected
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#333]"></div>
            Occupied
          </div>
        </div>

        {/* SEATS */}
        <div className="overflow-x-auto pb-10">
          <div className="min-w-[600px] flex flex-col items-center">
            {seatCategories.map(category => (
              <div key={category.name} className="mb-8 w-full">
                <p className="text-center text-xs font-bold text-gray-500 mb-4 tracking-widest uppercase flex items-center justify-center gap-4">
                  <span className="h-px w-10 bg-gray-800"></span>
                  {category.name} - ₹{category.price}
                  <span className="h-px w-10 bg-gray-800"></span>
                </p>
                {category.rows.map(row => renderRow(row, category))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SUMMARY BAR */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#15161c]/95 backdrop-blur-lg border-t border-gray-800 p-4 z-50 animate-slide-up">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs mb-1">Selected Seats ({selectedSeats.length})</p>
              <p className="font-bold text-white text-lg font-mono">
                {selectedSeats.map(s => s.id).join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-gray-400 text-xs mb-1">Total Amount</p>
                <p className="font-black text-2xl text-[#ff3366]">₹{totalAmount}</p>
              </div>
              <button
                onClick={handleProceed}
                className="bg-[#ff3366] hover:bg-[#ff1f4b] px-8 py-3 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,51,102,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                Book Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blur Loader */}
      {isProcessing && <BlurLoader text="Processing Payment..." />}
    </div>
  )
}

export default SeatLayout
