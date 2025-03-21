import React, { useState } from "react";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import bgImage from "../assets/business-people-office-break.jpg";
import { signup, Login, resetPass } from "../firebase/config";
import { useNavigate } from "react-router-dom";


const Signup = () => {
  const [currentState, setcurrentState] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (currentState === "Sign Up") {
      try {
        await signup(username, email, password, navigate); // Pass navigate
        setcurrentState("Login");
      } catch (error) {
        console.error("Signup Error:", error.message);
      }
    } else {
      try {
        await Login(email, password, navigate); // Pass navigate
      } catch (error) {
        console.error("Login Error:", error.message);
      }
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-gray-100 ">
      {/* Background Image */}
      <img
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={bgImage}
        alt="Login Red Talk"
      />

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-purple-400/90"></div>

      {/* Main Content */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 w-full px-4 font-sans">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center">
          <BsFillChatSquareTextFill className="text-sky-400 h-32 w-auto" />
          <p className="font-mono text-5xl font-extrabold text-orange-400">
            RED Talk
          </p>
        </div>

        {/* Sign-Up / Login Form */}
        <div
          className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm"
          style={{
            boxShadow:
              "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
          }}
        >
          <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">
            {currentState}
          </h2>
          <form className="flex flex-col space-y-4" onSubmit={onSubmitHandler}>
            {/* Name Input (Only for Signup) */}
            {currentState === "Sign Up" && (
              <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                placeholder="Full Name"
                className="w-full px-4 py-2 border-b border-slate-500 focus:outline-none "
                required
              />
            )}
            {/* Email Input */}
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Email"
              className="w-full px-4 py-2 border-b border-slate-500 focus:outline-none "
              required
            />
            {/* Password Input */}
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              value={password}
              className="w-full px-4 py-2 border-b border-slate-500 focus:outline-none "
              required
            />
            {/* Terms & Conditions */}
            {currentState === "Sign Up" && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" required />
                <span className="text-xs text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-blue-500 underline">
                    Terms & Conditions
                  </a>
                </span>
              </label>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              className="px-10 mx-auto bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-300"
            >
              {currentState === "Sign Up" ? "Create an Account" : "Login"}
            </button>
          </form>
          {/* Switch between Login & Signup */}
          {currentState === "Sign Up" ? (
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <a
                href="#"
                className="text-blue-500 underline"
                onClick={(e) => {
                  e.preventDefault();
                  setcurrentState("Login");
                }}
              >
                Login
              </a>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-600 mt-4">
              Create an Account{" "}
              <a
                href="#"
                className="text-blue-500 underline"
                onClick={() => setcurrentState("Sign Up")}
              >
                Click here
              </a>
            </p>
            // forget password
          )}
          {currentState === "Login" ? (
            <p
              className="text-blue-500 text-sm underline text-center pt-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                resetPass(email);
              }}
            >
              Forget Password?
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Signup;
