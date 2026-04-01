import React, { useLayoutEffect, useRef, useState } from "react"
import { PlayCircleIcon } from "lucide-react"
import { dummyTrailers } from "../assets/assets"
import BlurCircle from "./BlurCircle"
import gsap from "gsap"

const getEmbedUrl = (url) => {
    const id = url.split("v=")[1]
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0`
}

const TrailersSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const animRef = useRef(null)

    // ✅ GSAP animation (THIS WORKS)
    useLayoutEffect(() => {
        gsap.fromTo(
            animRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        )
    }, [currentIndex])

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 relative overflow-hidden">

            <h2 className="text-white text-2xl font-semibold mb-6">
                Trailers
            </h2>

            <div className="relative bg-[#2f2f2f] rounded-2xl overflow-hidden shadow-2xl">
                <BlurCircle top="-120px" right="-120px" />

                {/* ✅ GSAP SAFE WRAPPER */}
                <div ref={animRef} className="relative pt-[56.25%]">
                    <iframe
                        key={dummyTrailers[currentIndex].videoUrl}
                        src={getEmbedUrl(dummyTrailers[currentIndex].videoUrl)}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Trailer"
                    />
                </div>
            </div>

            {/* 🎞 THUMBNAILS */}
            <div className="mt-6 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {dummyTrailers.map((trailer, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`
              relative min-w-[220px] h-[120px] shrink-0
              rounded-xl overflow-hidden cursor-pointer
              transition duration-300
              ${index === currentIndex ? "ring-2 ring-[#ff3366] scale-105" : "opacity-60 hover:opacity-100 hover:scale-[1.02]"}
            `}
                    >
                        <img
                            src={trailer.image}
                            alt="trailer"
                            className="w-full h-full object-cover brightness-75 hover:brightness-100 transition"
                        />
                        <PlayCircleIcon className="absolute inset-0 m-auto w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                ))}
            </div>

        </div>
    )
}

export default TrailersSection





