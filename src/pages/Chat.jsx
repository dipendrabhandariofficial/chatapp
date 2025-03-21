import React, { useContext, useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { AppContext } from "../context/appContext";
import Chatbox from "../components/ChatBox";

const Chat = () => {
  const { chatData, userData } = useContext(AppContext); // Fixing context destructuring
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData && chatData) {
      setLoading(false);
    }
  }, [userData, chatData]);

  if (!userData) { // Ensure the user is logged in
    return <div className="text-white">Please log in</div>;
  }

  return (
    <div className="h-screen bg-neutral-800 flex items-center justify-center  sm:px-4 ">
      {loading ? (
        <div className="text-black ">Loading...</div>
      ) : (
        <div className="chat-container w-full max-w-6xl h-[90vh] rounded-xl shadow-lg grid grid-cols-1   lg:grid-cols-[1fr_2fr_1fr] gap-4">
          <LeftSidebar className="" />
          <Chatbox />
          <RightSidebar className="" />
        </div>
      )}
    </div>
  );
};

export default Chat;
