import React, { useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom"; // Use useNavigate
import { toast } from "react-toastify";
import upload from "../lib/upload"; // Import Cloudinary upload function
import { AppContext } from "../context/AppContext";

const Profileupdate = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);
  const navigate = useNavigate(); // Initialize navigate function

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Upload profile picture");
        return;
      }

      const docRef = doc(db, "users", uid);

      if (image) {
        console.log("Uploading image...");
        const  imgUrl = await upload(image); // Upload image to Cloudinary
        setPrevImage(imgUrl);
        console.log("Image URL:", imgUrl);
        await updateDoc(docRef, {
          name: name,
          bio: bio,
          avatar: imgUrl,
        });
      } else {
        await updateDoc(docRef, {
          name: name,
          bio: bio,
        });
      }

      // Fetch updated data and set in context
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      console.log("profile update sucessfully"); // Manually update context

      toast.success("Profile updated successfully!");

      // Navigate only after ensuring state updates
      setTimeout(() => {
        navigate("/chat");
        console.log("Navigating to chat...");
      }, 500);
    } catch (error) {
      console.error(error);
      console.log("Profile update failed");
      toast.error(error.message);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setName(docSnap.data().name);
          setBio(docSnap.data().bio);
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        navigate("/"); // Redirect if not logged in
      }
    });
  }, []);

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-[#1F1F1F]/80 p-4 z-50 fixed top-0 left-0">
      <div className="h-[90%] flex flex-col md:flex-row w-full max-w-3xl drop-shadow-lg rounded-3xl overflow-hidden bg-white">
        {/* Left Section - Form */}
        <div className="flex-1 p-8 flex flex-col justify-center min-h-[300px]">
          <h3 className="text-center text-3xl font-bold text-gray-800 mb-6">
            Profile Update
          </h3>
          <form className="flex flex-col gap-4" onSubmit={profileUpdate}>
            {/* Profile Image Upload */}
            <label
              htmlFor="avatar"
              className="cursor-pointer flex items-center gap-3"
            >
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                id="avatar"
                accept=".png,.jpg,.jpeg"
                hidden
              />
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : "src/assets/user Profile.jpg"
                }
                alt="Profile"
                className="w-20 h-20 object-cover rounded-full shadow-lg"
              />
              <span className="text-md font-semibold text-blue-700 underline underline-offset-3">
                Upload Profile Image
              </span>
            </label>

            {/* Name Input */}
            <input
              type="text"
              placeholder="Your Name"
              required
              className="rounded-xl p-3 w-full bg-gray-200 outline-none text-black shadow-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Bio Input */}
            <textarea
              placeholder="Write your profile bio"
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="rounded-xl p-3 w-full h-28 bg-gray-200 outline-none text-black shadow-md resize-none"
            ></textarea>

            {/* Save Button */}
            <button
              type="submit"
              className="bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
            >
              Save
            </button>
          </form>
        </div>

        {/* Right Section - Branding */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-purple-500 min-h-[300px]">
          <img
            src={
              image
                ? URL.createObjectURL(image)
                : prevImage || "src/assets/meetme.png"
            }
            alt="Red Talk"
            className="w-24 h-24 object-cover rounded-full shadow-lg"
          />
          <p className="text-center font-extrabold text-orange-400 text-3xl mt-3">
            Red Talk
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profileupdate;
