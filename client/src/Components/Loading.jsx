import React from "react";

const Preloader = () => {
  return (
    <>
      {/* Styles */}
      <style>
        {`
          .preloader {
            position: fixed;
            inset: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .preloader span {
            display: block;
            height: 15px;
            width: 15px;
            background: #19e3d5;
            margin: 0 7px;
            border-radius: 10px;
            animation: upDown 1.2s infinite;
          }

          .preloader span:nth-child(1) {
            animation-delay: 0.15s;
          }

          .preloader span:nth-child(2) {
            animation-delay: 0.3s;
          }

          .preloader span:nth-child(3) {
            animation-delay: 0.45s;
          }

          .preloader span:nth-child(4) {
            animation-delay: 0.6s;
          }

          .preloader span:nth-child(5) {
            animation-delay: 0.75s;
          }

          @keyframes upDown {
            0% {
              height: 15px;
              background: #19e3d5;
            }

            50% {
              height: 60px;
              background: #d33deb;
            }

            100% {
              height: 15px;
              background: #f00e43;
            }
          }
        `}
      </style>

      {/* Loader */}
      <div className="preloader">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </>
  );
};

export default Preloader;
