import React, { useState, useEffect } from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Movies from './Pages/Movies'
import MovieDetails from './Pages/MovieDetails'
import SeatLayout from './Pages/SeatLayout'
import MyBooking from './Pages/MyBooking'
import Favorite from './Pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './Components/Footer'
import Theaters from './Pages/Theaters'
import Releases from './Pages/Releases'
import AdminLogin from './Pages/AdminLogin'
import ProtectedAdminRoute from './Components/ProtectedAdminRoute'
import AdminDashboard from './Pages/AdminDashboard'
import Preloader from './Components/Loading'
import NotFound from './Pages/NotFound'
import ScrollToTop from './Components/ScrollToTop'

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <>
      <ScrollToTop />
      <Toaster />
      <Routes>
        {/* Admin Routes */}
        <Route
          path='/admin'
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route
          path='/admin-dashboard'
          element={<Navigate to="/admin" replace />}
        />

        {/* Public Routes with Navbar & Footer */}
        <Route
          element={
            <>
              <Navbar />
              <Outlet />
              <Footer />
            </>
          }
        >
          <Route path='/' element={<Home />} />
          <Route path='/movies' element={<Movies />} />
          <Route path='/theaters' element={<Theaters />} />
          <Route path='/releases' element={<Releases />} />
          <Route path='/movies/:id' element={<MovieDetails />} />
          <Route path='/movies/:id/:date' element={<SeatLayout />} />
          <Route path='/my-bookings' element={<MyBooking />} />
          <Route path='/favorites' element={<Favorite />} />
        </Route>

        {/* Not Found Route (No Navbar/Footer) */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App




