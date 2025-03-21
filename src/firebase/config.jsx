import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup Function
const signup = async (username, email, password, navigate) => {
  try {
    console.log("Signing up user...");
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    console.log("User created with ID:", user.uid);

    // Store user data in Firestore (Check if document exists)
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        username: username.toLowerCase(),
        email,
        name: "",
        avatar: "",
        bio: "Hey, there I am using Red Talk",
        lastSeen: serverTimestamp(),
      });
      console.log("User document created in Firestore.");
    }

    // Initialize empty chat data (Check if chat document exists)
    const chatRef = doc(db, "chats", user.uid);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, { chatData: [] });
      console.log("Chat document created in Firestore.");
    }

    navigate("/");
  } catch (error) {
    console.error("Signup error:", error);
    handleError(error);
  }
};

// Login Function
const Login = async (email, password, navigate) => {
  try {
    console.log("Logging in...");
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    console.log("User logged in:", user.uid);

    // Check if user document exists, recreate if missing
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.warn("User document missing. Recreating...");
      await setDoc(userRef, {
        id: user.uid,
        username: email.split("@")[0].toLowerCase(),
        email,
        name: "",
        avatar: "",
        bio: "Hey, there I am using Red Talk",
        lastSeen: serverTimestamp(),
      });
    }

    // Check if chat document exists, recreate if missing
    const chatRef = doc(db, "chats", user.uid);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      console.warn("Chat document missing. Recreating...");
      await setDoc(chatRef, { chatData: [] });
    }

    navigate("/chat");
  } catch (error) {
    console.error("Login error:", error);
    handleError(error);
  }
};

// Logout Function
const Logout = async () => {
  try {
    console.log("Logging out...");
    await signOut(auth);
    console.log("User logged out.");
  } catch (error) {
    console.error("Logout error:", error);
    handleError(error);
  }
};

// Error Handler for Firebase Auth Errors
const handleError = (error) => {
  switch (error.code) {
    case "auth/email-already-in-use":
      toast.error("This email is already associated with another account.");
      break;
    case "auth/invalid-email":
      toast.error("Please provide a valid email address.");
      break;
    case "auth/weak-password":
      toast.error("Password should be at least 6 characters long.");
      break;
    case "auth/user-not-found":
      toast.error("No account found with this email.");
      break;
    case "auth/wrong-password":
      toast.error("Incorrect password. Please try again.");
      break;
    default:
      toast.error("Something went wrong. Please try again.");
  }
};
const resetPass = async (email) => {
  if (!email) {
    toast.error("provide your email!");
    return null;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("reset email sent");
    } else {
      toast.error("Email doesn't exits");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

// Export Firebase Auth & Functions
export { signup, Login, Logout, auth, db, resetPass };
