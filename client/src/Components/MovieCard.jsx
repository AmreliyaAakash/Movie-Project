import { StarIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import timeFormat from "../Lib/TimeFormate"

gsap.registerPlugin(ScrollTrigger)

const MovieCard = ({ movie, limitIndex, limitCount }) => {
    // ✅ LIMIT LOGIC (ONLY WORKS WHEN PROPS ARE PASSED)
    if (
        typeof limitIndex === "number" &&
        typeof limitCount === "number" &&
        limitIndex >= limitCount
    ) {
        return null
    }

    const navigate = useNavigate()
    const cardRef = useRef(null)

    /* ================= COUNTDOWN LOGIC ================= */
    const [timeLeft, setTimeLeft] = useState(null)
    const [isReleased, setIsReleased] = useState(false)

    useEffect(() => {
        if (!movie) return

        const calculateTimeLeft = () => {
            if (!movie.release_date) return

            const releaseDate = new Date(movie.release_date).getTime()
            if (isNaN(releaseDate)) {
                // Handle invalid date
                setIsReleased(false)
                setTimeLeft(null)
                return
            }

            const now = new Date().getTime()
            const difference = releaseDate - now

            if (difference <= 0) {
                setIsReleased(true)
                setTimeLeft(null)
                return
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({
                days: String(days).padStart(2, "0"),
                hours: String(hours).padStart(2, "0"),
                minutes: String(minutes).padStart(2, "0"),
                seconds: String(seconds).padStart(2, "0"),
            })

            setIsReleased(false)
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [movie])

    useEffect(() => {
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 40, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 85%",
                },
            }
        )
    }, [])

    const releaseYear = new Date(movie.release_date).getFullYear();
    const isValidDate = !isNaN(releaseYear);

    return (
        <div
            ref={cardRef}
            className="relative group flex flex-col justify-between p-3 w-full bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
            <img
                onClick={() => navigate(`/movies/${movie._id}`)}
                src={movie.backdrop_path}
                alt={movie.title}
                className="rounded-lg h-52 w-full object-cover cursor-pointer"
            />

            <p className="font-semibold mt-2 truncate">{movie.title}</p>

            <p className="text-sm text-gray-400 mt-2">
                {isValidDate ? releaseYear : "TBA"} ●{" "}
                {movie.genres?.slice(0, 2).map(g => typeof g === 'object' ? g.name : g).join(" | ")} ●{" "}
                {timeFormat(movie.runtime)}
            </p>

            <div className="flex items-center gap-2 mt-2">
                {isReleased ? (
                    <button
                        onClick={() => navigate(`/movies/${movie._id}`)}
                        className="px-4 py-2 text-xs bg-primary rounded-full hover:bg-primary/80 transition"
                    >
                        Buy Tickets
                    </button>
                ) : (
                    <div className="px-3 py-2 text-[10px] sm:text-xs bg-red-500/10 border border-red-500/50 text-red-500 rounded-full font-mono font-bold tracking-tight">
                        {timeLeft ? (
                            <span>
                                {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                            </span>
                        ) : (
                            <span>Coming Soon</span>
                        )}
                    </div>
                )}

                <p className="flex items-center gap-1 text-sm text-gray-400 ml-auto">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                </p>
            </div>
        </div>
    )
}

export default MovieCard
