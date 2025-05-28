import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import ChangePassword from "./Pages/ChangePassword";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
function App() {
  return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword/>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
