import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <>
      {/* Inline Styles */}
      <style>{`
        /*======================
            404 Page
        =======================*/

        .page_404 {
          padding: 40px 0;
          background: #fff;
          font-family: "Arvo", serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          width: 100%;
        }

        .box_404 {
          max-width: 600px;
          margin: auto;
          text-align: center;
        }

        /* Background GIF */
        .four_zero_four_bg {
          background-image: url("https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif");
          height: 350px;
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Removed invert filter */
        }

        .four_zero_four_bg h1 {
          font-size: 90px;
          color: #333; /* Reverted to Dark Text */
        }

        /* Content */
        .content_box_404 {
          margin-top: -30px;
        }

        .content_box_404 h3 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #000; /* Reverted to Black Text */
        }

        .content_box_404 p {
          color: #777; /* Reverted to Gray Text */
          margin-bottom: 20px;
        }

        /* Button */
        .link_404 {
          color: #fff;
          padding: 12px 25px;
          background: #39ac31; /* Reverted to Green Button as in original code */
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: 0.3s;
          display: inline-block;
        }

        .link_404:hover {
          background: #2f8f28;
        }
      `}</style>

      {/* JSX */}
      <section className="page_404">
        <div className="container">
          <div className="box_404">

            <div className="four_zero_four_bg">
              <h1>404</h1>
            </div>

            <div className="content_box_404">
              <h3>Looks like you're lost 😢</h3>

              <p>The page you are looking for is not available.</p>

              <Link to="/" className="link_404">
                Go to Home
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
