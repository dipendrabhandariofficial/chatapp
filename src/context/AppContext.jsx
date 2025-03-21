import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onSnapshot } from "firebase/firestore";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const  [chatVisible ,setChatVisible] = useState(false);

  const LoadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn("User document does not exist!");
        setUserData(null);
        navigate("/"); // Redirect to profile setup if no data
        return;
      }

      const UserData = userSnap.data();
      setUserData(UserData);

      if (UserData.avatar && UserData.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      await updateDoc(userRef, { lastSeen: Date.now() });

      setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, { lastSeen: Date.now() });
        }
      }, 60000);

    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    if (!userData) return; // Prevent running when userData is null

    const chatRef = doc(db, "chats", userData.id);
    const unSub = onSnapshot(chatRef, async (res) => {
      if (!res.exists()) {
        console.warn("Chat document does not exist!");
        setChatData([]);
        return;
      }

      const chatItems = res.data().chatData || [];
      const tempData = [];

      for (const item of chatItems) {
        const userRef = doc(db, "users", item.rid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists()
          ? userSnap.data()
          : { name: "Unknown", avatar: "" };

        tempData.push({ ...item, userData });
      }

      setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unSub();
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    LoadUserData,
    messagesId,
    setMessagesId,
    messages,
    setMessages,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
