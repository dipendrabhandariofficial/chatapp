import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat"; // Fixed case issue
import Profileupdate from "./pages/Profileupdate";
import { ToastContainer } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import { AppContext } from "./context/AppContext";

const App = () => {
  const navigate = useNavigate();
  const { LoadUserData } = useContext(AppContext) 

  useEffect(() => {
     onAuthStateChanged(auth, async (user) => {
      if (user) {
          navigate("/chat");
          await LoadUserData(user.uid )
      } else {
        navigate("/"); 
      }
    });
    
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profileupdate />} />
      </Routes>
    </>
  );
};

export default App;
