import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { MenuIcon, SearchIcon, XIcon, TicketPlus } from "lucide-react";
import { IoStar } from "react-icons/io5";
import gsap from "gsap";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { isReleased } from "../Lib/utils";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allMovies, setAllMovies] = useState([]);

  const menuRef = useRef(null);
  const linksRef = useRef([]);
  const tl = useRef(null);
  const isAnimating = useRef(false);

  // New Refs for Entrance Animation
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const actionsRef = useRef(null);

  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  /* Active link class */
  const linkClass = ({ isActive }) =>
    `transition-all duration-300 ${isActive ? "text-primary" : "hover:text-primary"
    }`;

  /* Fetch Movies for Search */
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/movies');
        if (res.ok) {
          const data = await res.json();
          setAllMovies(data);
        }
      } catch (error) {
        console.error("Failed to fetch movies for search");
      }
    };
    fetchMovies();
  }, []);

  /* Entrance Animation */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [logoRef.current, desktopMenuRef.current, actionsRef.current],
        { y: -30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          stagger: 0.15,
          delay: 0.2
        }
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  /* Detect Scroll */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* OPEN animation */
  useEffect(() => {
    if (!menuOpen) return;

    isAnimating.current = true;

    tl.current = gsap.timeline({
      onComplete: () => (isAnimating.current = false),
    });

    tl.current
      .fromTo(menuRef.current, { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" })
      .fromTo(linksRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.3");
  }, [menuOpen]);

  /* CLOSE animation */
  const closeMenu = () => {
    if (isAnimating.current) return;

    isAnimating.current = true;

    tl.current
      .to(linksRef.current, { x: 50, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in" })
      .to(menuRef.current, { x: "100%", opacity: 0, duration: 0.4, ease: "power3.in", onComplete: () => { setMenuOpen(false); isAnimating.current = false; } }, "-=0.2");
  };

  /* Search Handlers */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0 && allMovies.length > 0) {
      const filtered = allMovies.filter((movie) =>
        isReleased(movie.release_date) &&
        (movie.title.toLowerCase().includes(val.toLowerCase()) || String(movie.id) === val)
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Check if query exactly matches an ID
      const exactIdMatch = allMovies.find(m => String(m.id) === query && isReleased(m.release_date));

      if (exactIdMatch) {
        navigate(`/movies/${exactIdMatch._id}`);
      } else if (suggestions.length > 0) {
        navigate(`/movies/${suggestions[0]._id}`);
      }
      setShowSearch(false);
      setQuery("");
    }
  };

  const handleSuggestionClick = (id) => {
    navigate(`/movies/${id}`);
    setShowSearch(false);
    setQuery("");
  };

  /* Search Animation Effect - Inline */
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (showSearch && searchContainerRef.current) {
      gsap.fromTo(searchContainerRef.current,
        { width: 40, opacity: 0 },
        { width: "auto", opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
      );
    }
  }, [showSearch]);

  return (
    <>
      <div
        ref={navRef}
        className={`
          fixed top-0 left-0 z-50 w-full
          flex items-center justify-between
          px-6 md:px-16 lg:px-24 py-4
          transition-all duration-500 ease-in-out
          border-b border-white/0
          ${scrolled ? "bg-[#0b0c15]/80 backdrop-blur-2xl border-white/5 shadow-2xl py-3" : "bg-transparent py-5"}
        `}
      >
        {/* LOGO */}
        <div ref={logoRef} className="opacity-0">
          <NavLink to="/" end className="group block relative">
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src={assets.logo} alt="Logo" className="w-24 md:w-32 h-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-lg" />
          </NavLink>
        </div>

        {/* DESKTOP MENU */}
        <div
          ref={desktopMenuRef}
          className="
            opacity-0 hidden md:flex items-center gap-2
            p-1.5 rounded-full
            bg-white/5 border border-white/5
            backdrop-blur-md shadow-lg shadow-black/20
            hover:border-white/10 transition-colors duration-300
          "
        >
          {["Home", "Movies", "Theaters", "Releases", "Favorites"].map((item) => (
            <NavLink
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              end={item === "Home"}
              className={({ isActive }) => `
                px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden group
                ${isActive ? "text-white bg-white/10 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}
              `}
            >
              <span className="relative z-10">{item}</span>
            </NavLink>
          ))}
        </div>

        {/* ACTIONS */}
        <div ref={actionsRef} className="opacity-0 flex items-center gap-6">
          {showSearch ? (
            <div
              ref={searchContainerRef}
              className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 relative w-auto md:w-64 shadow-2xl origin-right"
            >
              <SearchIcon size={16} className="text-primary min-w-[16px]" />
              <input
                autoFocus
                type="text"
                value={query}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-white px-2 w-full placeholder-gray-500"
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <XIcon size={16} className="text-gray-400 cursor-pointer hover:text-white transition-colors min-w-[16px]" onClick={() => setShowSearch(false)} />

              {query.length > 0 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1c29] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in slide-in-from-top-2 duration-300">
                  {suggestions.map((movie) => (
                    <div
                      key={movie._id}
                      onClick={() => handleSuggestionClick(movie._id)}
                      className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer truncate transition-colors flex items-center gap-2"
                    >
                      <img src={movie.poster_path} alt="" className="w-6 h-8 object-cover rounded" />
                      {movie.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/5 text-gray-300 hover:text-white group"
            >
              <SearchIcon size={20} className="group-hover:text-primary transition-colors" />
            </button>
          )}

          {!user ? (
            <button
              onClick={openSignIn}
              className="
                px-7 py-2.5
                bg-gradient-to-r from-[#ff3366] to-[#ff1f4b]
                text-white text-sm font-bold rounded-full
                shadow-[0_0_20px_rgba(255,51,102,0.4)]
                hover:shadow-[0_0_30px_rgba(255,51,102,0.6)]
                hover:scale-105 active:scale-95
                transition-all duration-300
                border border-white/10
              "
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {/* User Button styling is handled by Clerk */}
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action label="My Bookings" labelIcon={<TicketPlus size={14} />} onClick={() => navigate('/my-bookings')} />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}

          <button
            onClick={() => !isAnimating.current && setMenuOpen(true)}
            className="md:hidden p-2 text-white/80 hover:text-white transition hover:rotate-90 duration-300"
          >
            <MenuIcon size={28} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          className="
            fixed inset-0 z-[60]
            flex flex-col items-center justify-center gap-8
            bg-[#0b0c15]/95 backdrop-blur-2xl
            text-white
          "
        >
          <button
            onClick={closeMenu}
            className="absolute top-8 right-8 p-3 text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 rounded-full hover:rotate-90 duration-300"
          >
            <XIcon size={28} />
          </button>

          <div className="flex flex-col items-center gap-8 w-full px-10">
            {["Home", "Movies", "Theaters", "Releases", "Favorites"].map(
              (item, i) => (
                <NavLink
                  key={item}
                  ref={(el) => (linksRef.current[i] = el)}
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  end={item === "Home"}
                  onClick={closeMenu}
                  className={({ isActive }) => `
                    text-4xl font-extrabold tracking-tight transition-all duration-500
                    ${isActive ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff3366] to-white scale-110" : "text-gray-600 hover:text-white"}
                  `}
                >
                  {item}
                </NavLink>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
