import React, { useContext, useEffect, useState, useRef } from "react";
import { GoDotFill } from "react-icons/go";
import { GrCircleInformation } from "react-icons/gr";
import { FiSend } from "react-icons/fi";
import { RiGalleryFill } from "react-icons/ri";
import { MdEmojiEmotions } from "react-icons/md";
import { motion } from "framer-motion";
import userImage from "../assets/meetme.png"; // Ensure correct path
import { AppContext } from "../context/AppContext";
import { getDoc, onSnapshot, doc, arrayUnion, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";
import { toast } from "react-toastify";
import uploadImage from "../lib/upload";

// Utility function to handle Firebase updates
const updateFirebaseMessages = async (messagesId, newMessage) => {
  const messageRef = doc(db, "messages", messagesId);
  const messageSnap = await getDoc(messageRef);

  if (!messageSnap.exists()) {
    await setDoc(messageRef, { messages: [] });
  }

  await updateDoc(messageRef, {
    messages: arrayUnion(newMessage),
  });
};

const updateUserChats = async (userIDs, messagesId, lastMessage, userData) => {
  const batch = writeBatch(db);

  for (const id of userIDs) {
    const userchatRef = doc(db, "chats", id);
    const userchatSnap = await getDoc(userchatRef);

    if (userchatSnap.exists()) {
      const userchatData = userchatSnap.data();
      const chatIndex = userchatData.chatData.findIndex(
        (chat) => chat.messageId === messagesId
      );

      if (chatIndex !== -1) {
        userchatData.chatData[chatIndex].lastMessage = lastMessage;
        userchatData.chatData[chatIndex].updatedAt = Date.now();
        if (userchatData.chatData[chatIndex].rid === userData.id) {
          userchatData.chatData[chatIndex].messageSeen = false;
        }

        batch.update(userchatRef, { chatData: userchatData.chatData });
      }
    }
  }

  await batch.commit();
};

// UserStatus Component
const UserStatus = ({ chatUser }) => {
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateOnlineStatus = () => {
      const timeDifference = Date.now() - chatUser.userData.lastSeen;
      if (timeDifference < 70000) {
        setOnlineStatus(true);
        setTimeAgo("");
      } else {
        setOnlineStatus(false);
        const minutesAgo = Math.floor(timeDifference / 60000);
        setTimeAgo(`${minutesAgo} min ago`);
      }
    };

    updateOnlineStatus(); // Initial check
    const interval = setInterval(updateOnlineStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [chatUser]);

  return (
    <div className="flex items-center mx-4 text-gray-300">
      <p className="font-medium text-sm">{chatUser.userData.name} </p>
      {onlineStatus ? (
        <GoDotFill className="text-green-400 ml-2" />
      ) : (
        <span className="text-gray-400 font-mono ml-2 text-sm">{timeAgo}</span>
      )}
    </div>
  );
};

// MessageItem Component
const MessageItem = ({ msg, isUserMessage, chatUser }) => {
  const convertTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours > 12
      ? `${hours - 12}:${minutes} PM`
      : `${hours}:${minutes} AM`;
  };

  return (
    <div
      className={`w-full px-4 py-2 flex gap-3 ${
        isUserMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {!isUserMessage && (
        <img
          src={chatUser.userData.avatar}
          alt="Sender"
          className="w-9 h-9 rounded-full object-cover"
        />
      )}
      <div className="flex flex-col gap-1 max-w-[60%]">
        {msg.image ? (
          <img
            src={msg.image}
            alt="Sent Image"
            className="rounded-xl max-w-[90%] cursor-pointer"
            onClick={() => window.open(msg.image)}
          />
        ) : (
          <motion.div
            className={`rounded-3xl px-4 py-2 max-w-max text-sm relative ${
              isUserMessage
                ? "bg-gradient-to-t from-blue-500 to-purple-600 text-white"
                : "bg-gray-700 text-white"
            }`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p>{msg.message}</p>
          </motion.div>
        )}
        <p className={`text-xs text-gray-400 ${isUserMessage ? "text-right" : "text-left"}`}>
          {convertTimestamp(msg.timestamp)}
        </p>
      </div>
    </div>
  );
};

// Chatbox Component
const Chatbox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } =
    useContext(AppContext);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input || !messagesId) return;

    const newMessage = {
      message: input,
      sender: userData.id,
      timestamp: Date.now(),
    };

    try {
      await updateFirebaseMessages(messagesId, newMessage);
      await updateUserChats([userData.id, chatUser.rid], messagesId, input.slice(0, 30), userData);
      setInput("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileUrl = await uploadImage(file);
      if (fileUrl && messagesId) {
        const newMessage = {
          image: fileUrl,
          sender: userData.id,
          timestamp: Date.now(),
        };

        await updateFirebaseMessages(messagesId, newMessage);
        await updateUserChats([userData.id, chatUser.rid], messagesId, "📷image", userData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      const isAtBottom =
        chatRef.current.scrollHeight - chatRef.current.scrollTop <=
        chatRef.current.clientHeight + 50;

      if (isAtBottom) {
        chatRef.current.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!messagesId) return;
    const unsub = onSnapshot(doc(db, "messages", messagesId), (res) => {
      setMessages(res.data().messages.reverse());
    });
    return () => unsub();
  }, [messagesId]);

  return chatUser ? (
    <div className="chat-box relative h-[94vh] bg-[#1F1F1F]/80 rounded-2xl w-full text-white shadow-lg sm:mt-8 md:mt-0">
      <div className="chat-user flex items-center p-3 border-b border-white-600 bg-sk rounded-t-2xl">
        <img
          src={chatUser.userData.avatar}
          className="w-12 aspect-square rounded-full object-cover"
          alt="User"
        />
        <UserStatus chatUser={chatUser} />
        <GrCircleInformation className="ml-auto cursor-pointer" />
      </div>

      <hr className="border-transparent shadow-2xl" />

      <div
        className="flex flex-col-reverse chat-message relative space-y-2 h-[70vh] overflow-y-scroll scrollbar-hide pb-7 pt-2"
        ref={chatRef}
      >
        {messages.map((msg, index) => (
          <MessageItem
            key={index}
            msg={msg}
            isUserMessage={msg.sender === userData.id}
            chatUser={chatUser}
          />
        ))}
      </div>

      <div className="chat-input grid grid-cols-[30px_auto_30px] items-center gap-2 absolute bottom-0 right-0 w-full px-4 py-2">
        <label htmlFor="imageUpload" className="cursor-pointer flex items-center gap-2">
          <RiGalleryFill size={24} className="text-gray-400" />
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            className="hidden"
            onChange={sendImage}
          />
        </label>

        <div className="flex flex-grow items-center bg-[#3A3B3C] rounded-full px-4 py-2 text-gray-300 shadow-sm w-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Aa"
            className="bg-transparent w-full outline-none placeholder-gray-400"
          />
          <MdEmojiEmotions
            className="text-blue-400 cursor-pointer hover:ring-3 hover:ring-gray-500 hover:bg-gray-500 rounded-full p-1 transition-all duration-100"
            size={28}
          />
        </div>

        <button onClick={sendMessage}>
          <FiSend className="cursor-pointer text-blue-500" size={24} />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex bg-white/60 rounded-2xl flex-col items-center justify-center gap-1 w-[100%]">
      <img src={userImage} alt="userphoto" className="w-15" />
      <p className="text-2xl font-bold text-gray-600">Chat anytime, anywhere</p>
    </div>
  );
};

export default Chatbox;