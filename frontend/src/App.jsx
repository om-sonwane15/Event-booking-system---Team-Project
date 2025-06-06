import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Home from "./Pages/Home";
import ChangePassword from "./Pages/ChangePassword";
import AdminDashboard from "./Pages/AdminDashboard";
import UserDashboard from "./Pages/UserDashboard";
import Services from "./pages/Services.jsx";
import About from "./Pages/About";
import ContactUs from "./pages/ContactUs.jsx";
import MainLayout from "./Components/MainLayout";
import Profile from "./pages/Profile.jsx";
import Events from "./pages/Events.jsx";
import BookEvent from "./Components/BookEvent.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import ManageEvents from "./pages/ManageEvents.jsx";

const ProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return !token ? children : <Navigate to="/dashboard" replace />;
};

const PublicLayout = ({ children }) => {
  return <div className="min-h-screen bg-gray-100">{children}</div>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PublicLayout>
                <Login />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <PublicLayout>
                <Register />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot"
          element={
            <PublicRoute>
              <PublicLayout>
                <ForgotPassword />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <PublicLayout>
                <ResetPassword />
              </PublicLayout>
            </PublicRoute>
          }
        />

        {/* Protected Routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Services />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <MainLayout>
                <About />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/status"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContactUs />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChangePassword />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Event Management Routes */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Events />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-event/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BookEvent />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyTickets />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-events"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ManageEvents />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;