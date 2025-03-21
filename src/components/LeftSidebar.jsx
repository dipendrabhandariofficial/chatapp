import React, { useState, useEffect, useRef, useContext } from "react";
import { CiSearch } from "react-icons/ci";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { db, Logout } from "../firebase/config";
import Profileupdate from "../pages/Profileupdate";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { setDoc, updateDoc } from "firebase/firestore";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
  } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showsearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user) => {
            if (user.rid === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {}
  };

  const addChar = async () => {
    if (!user) return;

    const messageRef = collection(db, "messages");
    const chatRef = collection(db, "chats");

    try {
      const newMessageDoc = doc(messageRef); // Creates new message document
      await setDoc(newMessageDoc, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatDocRef = doc(chatRef, user.id);
      await updateDoc(chatDocRef, {
        chatData: arrayUnion({
          messageId: newMessageDoc.id,
          lastMessage: "",
          updatedAt: Date.now(),
          rid: userData.id,
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatRef, userData.id), {
        chatData: arrayUnion({
          messageId: newMessageDoc.id,
          lastMessage: "",
          updatedAt: Date.now(),
          rid: user.id,
          messageSeen: true,
        }),
      });

      toast.success("Chat added!");
    } catch (error) {
      console.error("Error adding chat:", error);
      toast.error(error.message);
    }
  };
  const sortedChatData = chatData.sort((a, b) => {
    return b.updatedAt - a.updatedAt; // Sort in descending order
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const setChat = async (item) => {
    setMessagesId(item.messageId);
    setChatUser(item);
    const userchatRef = doc(db,"chats", userData.id);
    const userChatSnapshot = await getDoc(userchatRef);
    const userChatsData = userChatSnapshot.data();
    const chatIndex =userChatsData.chatData.findIndex((c)=>c.messageId===item.messageId);
    userChatsData.chatData[chatIndex].messageSeen =true;
    await updateDoc(userchatRef,{
      chatData:userChatsData.chatData
    })

  };

  return (
    <div className="bg-[#1F1F1F]/80 text-white h-[94vh]  overflow-y-scroll scrollbar-hide  sm:p-0 flex flex-col rounded-2xl shadow-lg">
      {/* Show Profile Update when clicked */}
      {showProfileUpdate ? (
        <Profileupdate closeProfile={() => setShowProfileUpdate(false)} />
      ) : (
        <>
          {/* Top Section */}
          <div className="flex items-center justify-between relative mb-5">
            <div className="flex items-center gap-3 p-2">
              <img
                src="public\meetme.png"
                alt="Logo"
                className="w-12 h-12"
              />
              <p className="text-white font-bold text-2xl">Red Talk</p>
            </div>
            {/* Menu Icon */}
            <div
              className="relative group"
              ref={menuRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle on Click (Mobile)
            >
              <PiDotsThreeOutlineVerticalFill
                size={25}
                className="cursor-pointer opacity-80 hover:opacity-100 transition"
              />
              {/* Menu (Shows on Hover & Click) */}
              <div
                className={`absolute -top-2 right-4 bg-black/40 w-24 rounded-lg shadow-lg cursor-pointer transition-opacity duration-200 
                ${
                  isMenuOpen
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`} // Click OR Hover
              >
                <p
                  className="text-white text-sm px-3 py-2 hover:bg-gray-600/50 rounded-t-lg"
                  onClick={() => {
                    setShowProfileUpdate(true);
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  Edit Profile
                </p>
                <hr className="border-gray-500" />
                <p
                  className="text-white text-sm px-3 py-2 hover:bg-gray-600/50 rounded-b-lg"
                  onClick={() => {
                    Logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Log out
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-[#3A3B3C] rounded-full px-4 py-2 text-black mb-5 shadow-sm">
            <CiSearch className="text-gray-300" size={20} />
            <input
              type="text"
              placeholder="Search here..."
              onChange={inputHandler}
              className="w-full outline-none px-2 placeholder-gray-300 text-white"
            />
          </div>
          {/* Friends List */}
          <div className="h-100 flex flex-col space-y-1 overflow-y-auto scrollbar-hide p-1">
            {showsearch && user ? ( // Ensure both conditions are met
              <div
                className="flex items-center   space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-500/30 transition hover:text-white"
                onClick={addChar}
              >
                <img
                  src={user.avatar || "src/assets/meetme.png"} // Use default if null
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-200">{user.username}</p>
                </div>
              </div>
            ) : (
              sortedChatData.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setChat(item)}
                  className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer  hover:bg-gray-500/30 transition hover:text-white"
                >
                  <img
                    src={item.userData.avatar || "src/assets/meetme.png"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-200">
                      {item.userData.username}
                    </p>
                    <span
                      className={`text-sm   ${
                        item.messageSeen || item.messageId === messagesId
                          ? "text-gray-300"
                          :"text-blue-500"
                      }`}
                    >
                      {item.lastMessage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeftSidebar;
