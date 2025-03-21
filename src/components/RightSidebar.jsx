import React, { useContext, useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { GoBell, GoBellFill } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { MdOutlineSecurity } from "react-icons/md";
import { Logout } from "../firebase/config";
import { AppContext } from "../context/appContext";

const RightSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chatUser, messages } = useContext(AppContext);
  const [msgImage, setMsgImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImage(tempVar);
  }, [messages]);

  return chatUser ? (
    <div className="rs  flex flex-col items-center gap-4 p-4 text-gray-300 bg-[#1F1F1F]/80 h-[94vh] w-full rounded-2xl shadow-lg">
      <div className="image">
        <img
          src={chatUser.userData.avatar}
          alt=""
          className="rounded-full w-22 aspect-square object-cover cursor-pointer"
          onClick={() => window.open(chatUser.userData.avatar)}
        />
      </div>
      <h3 className="font-bold text-center">{chatUser.userData.name}</h3>
      <p className="bg-gray-500/30 rounded-3xl px-3 py-2 text-sm font-medium">
        {chatUser.userData.bio}
      </p>
      <div className="bg-gray-500/30 rounded-3xl px-3 py-2 text-sm flex items-center gap-2">
        <MdOutlineSecurity />
        <p>Red Talk Security</p>
      </div>
      <div className="flex justify-evenly space-x-8 mt-2">
        <CgProfile className="rounded-full size-7 aspect-square cursor-pointer hover:ring-8 hover:ring-gray-500 hover:bg-gray-500 p-1" />
        <GoBellFill className="rounded-full size-7 aspect-square cursor-pointer hover:ring-gray-500 hover:bg-gray-500 p-1" />
        <IoSearch className="rounded-full size-7 aspect-square cursor-pointer hover:ring-8 hover:ring-gray-500 hover:bg-gray-500 p-1" />
      </div>
      <hr className="w-[112%]" />

      <div className="rs-media w-full rounded-xl overflow-y-auto flex flex-col gap-1 scrollbar-hide">
        <div
          className="flex items-center justify-center gap-4 p-3 cursor-pointer hover:bg-slate-500/30 rounded-2xl transition scroll-smooth"
          onClick={toggleDropdown}
        >
          <p className="">Media and Files</p>
          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        </div>
        {isOpen && (
          <div className="grid grid-cols-3 gap-2 w-full pt-2">
            {msgImage.map((url, index) => {
              return (
                <img
                  src={url}
                  key={index}
                  alt="Media"
                  className="rounded-sm object-cover h-24 w-full cursor-pointer"
                  onClick={() => setSelectedImage(url)} // Set selected image on click
                />
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 p-3 cursor-pointer hover:bg-slate-500/30 rounded-2xl transition scroll-smooth">
          <p className="">Custom Chat</p>
          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        </div>
        <div className="flex justify-center text-center cursor-pointer">
          <button
            className="Logout bg-purple-600 w-28 p-2 hover:bg-purple-700 rounded-2xl mt-8 md:mt-6 mb-1 cursor-pointer"
            onClick={() => Logout()}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Modal for displaying the selected image in larger size */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setSelectedImage(null)} // Close the modal when clicked
        >
          <img
            src={selectedImage}
            alt="Large View"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  ) : (
    <div className="flex justify-center items-end gap-4 p-4 text-gray-300 bg-[#1F1F1F]/80 h-[94vh] w-full rounded-2xl shadow-lg">
      <div className="cursor-pointer mb-18">
        <button
          className="Logout bg-purple-600 w-28 p-2 hover:bg-purple-700 rounded-2xl mt-8 md:mt-6 mb-1 cursor-pointer"
          onClick={() => Logout()}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
