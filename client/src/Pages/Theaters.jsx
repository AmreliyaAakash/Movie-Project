
import React from 'react';
import { IoLocationOutline, IoCallOutline } from "react-icons/io5";

const Theaters = () => {
    console.log("Theaters Component Mounted");
    return (
        <div className="min-h-screen bg-[#0b0c15] text-white font-sans pt-32 px-6 md:px-12 flex flex-col items-center">
            <div className="max-w-7xl w-full">
                <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
                    <IoLocationOutline className="text-[#ff3366]" />
                    Our Locations
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Info Side */}
                    <div className="bg-[#15161c] p-8 rounded-2xl border border-gray-800 h-fit space-y-6 shadow-xl">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Angel CineWorld</h2>
                            <p className="text-gray-400">Premium Cinema Experience</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-700">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <IoLocationOutline className="text-[#ff3366] text-xl" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Address</p>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Street Number 2, Manekpara, Amreli, Gujarat 365601
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <IoCallOutline className="text-[#ff3366] text-xl" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Contact</p>
                                    <p className="text-gray-400 text-sm">+91 98765 43210</p>
                                    <p className="text-gray-400 text-sm">support@angelcineworld.com</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://www.google.com/maps?q=Angel+CineWorld"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-[#ff3366] hover:bg-[#e62e5c] text-white py-3 rounded-xl font-bold transition-all mt-4"
                        >
                            Get Directions
                        </a>
                    </div>

                    {/* Map Side */}
                    <div className="lg:col-span-2 bg-[#15161c] p-2 rounded-2xl border border-gray-800 relative group overflow-hidden shadow-xl">

                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.3940524911495!2d71.21867206263595!3d21.600128959997406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395880c0fa3a4eef%3A0x5843bbdf4ee147c9!2sAngel%20CineWorld!5e0!3m2!1sen!2sin!4v1770025696418!5m2!1sen!2sin"
                            className="w-full h-[500px] rounded-xl grayscale-[50%] group-hover:grayscale-0 transition-all duration-500"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>

                        <div className="absolute top-6 right-6 flex gap-2">
                            <span className="bg-black/70 backdrop-blur text-xs px-3 py-1 rounded-full text-white border border-white/20">
                                Maps View
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Theaters





