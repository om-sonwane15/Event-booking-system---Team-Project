import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import ChangePassword from "./Pages/ChangePassword";
import ForgotPassword from "./Pages/ForgotPassword";

return (
  <Routes>
    <Route path="/dashboard" element={<Home />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<Login />} />
    <Route path="/ChangePassword" element={<ChangePassword />} />
    <Route path="/forgot" element={<ForgotPassword />} />
    {/* <Route path="/reset" element={<ResetPassword />} /> */}
  </Routes>
);
export default App;
