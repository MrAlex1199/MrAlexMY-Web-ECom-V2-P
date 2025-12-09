import React, { useState, useEffect } from "react";

export default function Header({
  setDropdownOpen,
  dropdownOpen,
  textpage,
  AdminData,
}) {
  const [time, setTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleProfileClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex bg-white shadow rounded-lg p-4 justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {textpage}
        </h1>
        {/* Digital Clock */}
        <div className="text-2xl font-semibold text-gray-700 mr-4">
          {time.toLocaleTimeString()}
        </div>
        <div className="flex items-center space-x-4">
          <img
            src={profileImage}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          <div className="relative">
            <button
              className="block px-4 py-2 text-gray-800 font-medium"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {AdminData.firstName} {AdminData.lastName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="py-2">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                    onClick={handleProfileClick}
                  >
                    Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 transition"
                    onClick={() => {
                      localStorage.removeItem("isAdmin");
                      localStorage.removeItem("AToken");
                      window.location.href = "/admin-login";
                    }} 
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Profile</h2>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={profileImage}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full mb-2"
                />
                <label
                  htmlFor="profileImageInput"
                  className="text-blue-600 cursor-pointer"
                >
                  Change Profile Image
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Name</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={AdminData.firstName}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={AdminData.lastName}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg"
                  value={AdminData.email}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">
                  Phone Number
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={AdminData.phoneNumber}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
