import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Setting({ userData }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Function to handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      // Fetch token from localStorage or wherever it's stored
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        // console.error("Token not found");
        return;
      }

      const response = await fetch("http://localhost:3001/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`, // Use stored token
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      console.error(data.message);
      if (data.UpdatedPassdWord === true) {
        alert("Success to change password");
      } else {
        alert("failure to change password - please try again");
      }
      // Display success message or handle errors
    } catch (error) {
      // console.error("Error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        // console.error("Token not found");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/deleteAccount/${userData.userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        alert("Account deleted successfully");
        // Perform any additional cleanup or redirection here
      } else {
        alert("Failed to delete account");
      }
    } catch (error) {
      // console.error("Error:", error);
    } finally {
      setShowConfirmPopup(false); // Close the popup after the request is completed
    }
  };

  return (
    <div className="card rounded-lg shadow-md mt-5 mx-10 bg-white">
      <div className="mx-4 min-h-screen max-w-screen-xl sm:mx-8 xl:mx-auto">
        <h1 className="border-b py-6 text-4xl font-semibold">Settings</h1>
        <div className="grid grid-cols-8 pt-3 sm:grid-cols-10">
          <div className="col-span-2 hidden sm:block">
            <ul className="flex flex-col space-y-2">
              <div className="flex flex-col space-y-2">
                <NavLink
                  to="/SettingUser"
                  className="mt-5 cursor-pointer border-l-2 border-l-blue-700 px-2 py-2 font-semibold text-blue-700 transition hover:border-l-blue-700 hover:text-blue-700"
                >
                  Accounts
                </NavLink>
                <NavLink
                  to="/ShippingLocations"
                  className="mt-5 cursor-pointer border-l-2 border-l-blue-700 px-2 py-2 font-semibold"
                >
                  Shipping Address
                </NavLink>
              </div>
            </ul>
          </div>
          <div className="col-span-8 overflow-hidden rounded-xl sm:bg-gray-50 sm:px-8 sm:shadow">
            <div className="pt-4">
              <h1 className="py-2 text-2xl font-semibold">Account settings</h1>
              <p className="font- text-slate-600">
                Your can change Email and password or deleteAccount
              </p>
            </div>
            <hr className="mt-4 mb-8" />
            <p className="py-2 text-xl font-semibold">Email Address</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-600">
                Your email address is <strong>{userData.email}</strong>
              </p>
              <button className="inline-flex text-sm font-semibold text-blue-600 underline decoration-2">
                Change
              </button>
            </div>
            <hr className="mt-4 mb-8" />
            <form onSubmit={(e) => handleChangePassword(e)}>
              <p className="py-2 text-xl font-semibold">Password</p>
              <div className="flex items-center">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <label for="login-password">
                    <span className="text-sm text-gray-500">
                      Current Password
                    </span>
                    <div className="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
                      <input
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                        }}
                        id="Current-password"
                        className="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                        placeholder="***********"
                      />
                    </div>
                  </label>
                  <label for="login-password">
                    <span className="text-sm text-gray-500">New Password</span>
                    <div className="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
                      <input
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                        }}
                        id="New-password"
                        className="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                        placeholder="***********"
                      />
                    </div>
                  </label>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-5 ml-2 h-6 w-6 cursor-pointer text-sm font-semibold text-gray-600 underline decoration-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </div>
              <p className="mt-2">
                Can't remember your current password.{" "}
                <a
                  className="text-sm font-semibold text-blue-600 underline decoration-2"
                  href="/"
                >
                  Recover Account
                </a>
              </p>
              <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white">
                Save Password
              </button>
            </form>

            <hr className="mt-4 mb-8" />

            <div className="mb-10">
              <p className="py-2 text-xl font-semibold">Delete Account</p>
              <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-rose-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Proceed with caution
              </p>
              <p className="mt-2">
                Make sure you have taken backup of your account in case you ever
                need to get access to your data. We will completely wipe your
                data. There is no way to access your account after this action.
              </p>
              <button
                className="ml-auto text-sm font-semibold text-rose-600 underline decoration-2"
                onClick={() => setShowConfirmPopup(true)}
              >
                Continue with deletion
              </button>

              {showConfirmPopup && (
                <div
                  id="popup-modal"
                  className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50"
                >
                  <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                      <button
                        type="button"
                        className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={() => setShowConfirmPopup(false)}
                      >
                        <svg
                          className="w-3 h-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                          />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                      <div className="p-4 md:p-5 text-center">
                        <svg
                          className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete your account?
                        </h3>
                        <button
                          onClick={handleDeleteAccount}
                          className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                        >
                          Yes, I'm sure
                        </button>
                        <button
                          onClick={() => setShowConfirmPopup(false)}
                          className="py-2.5 px-5 ml-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        >
                          No, cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
