import React from 'react';
import { assets } from "../assets/assets.js";
const Footer = () => {
  return (
    <footer className="bg-[#050507] pt-16 pb-8 border-t border-gray-900 mt-12">
      <div className="px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <img src={assets.logo} alt="" srcSet="" />
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.
            </p>
            <div className="flex gap-4">
              <div className="w-32 h-10 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:border-gray-500">
                Google Play
              </div>
              <div className="w-32 h-10 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:border-gray-500">
                App Store
              </div>
            </div>
          </div>

          <div className="col-span-1"></div>

          <div className="col-span-1">
            <h3 className="text-white font-bold mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-[#ff3366] cursor-pointer">Home</li>
              <li className="hover:text-[#ff3366] cursor-pointer">About Us</li>
              <li className="hover:text-[#ff3366] cursor-pointer">Contact Us</li>
              <li className="hover:text-[#ff3366] cursor-pointer">Privacy Policy</li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-bold mb-6">Get in touch</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>+1-202-555-0190</li>
              <li>contact@quickshow.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 text-center">
          <p className="text-gray-600 text-xs">Copyright 2026 © Angel CineWord. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




