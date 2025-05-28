import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import ChangePassword from "./Pages/ChangePassword";
import ForgotPassword from "./Pages/ForgotPassword";
import Register from "./Pages/Register";
function App() {
  return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="/forgot" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
