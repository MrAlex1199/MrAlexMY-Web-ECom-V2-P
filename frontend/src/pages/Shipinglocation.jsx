import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function ShippingLocations({ userData, userId }) {
  // State variables for User Address
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  // Function to handle save address
  const handleSaveAddress = async () => {
    if (!firstName || !lastName || !city || !postalCode || !country || !address) {
      alert("All fields are required. Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/save-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          city,
          postalCode,
          country,
          address,
          phone,
          age,
        }),
      });

      if (response.ok) {
        window.alert("Address saved successfully");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("Address save failed: " + errorData.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error saving address");
    }
  };

  // Function to handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const response = await fetch(`http://localhost:3001/delete-address/${userId}/${addressId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          window.alert("Address deleted successfully");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert("Failed to delete address: " + errorData.message);
        }
      } catch (error) {
        console.error(error);
        alert("Error deleting address");
      }
    }
  };

  // State for editing address
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");

  // Open edit form and populate fields
  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setEditFirstName(address.firstName || "");
    setEditLastName(address.lastName || "");
    setEditCity(address.city || "");
    setEditPostalCode(address.postalCode || "");
    setEditCountry(address.country || "");
    setEditAddress(address.address || "");
    setEditPhone(address.phone || "");
    setEditAge(address.age || "");
  };

  // Save edited address
  const handleSaveEditAddress = async () => {
    if (!editFirstName || !editLastName || !editCity || !editPostalCode || !editCountry || !editAddress) {
      alert("All fields are required. Please fill out all fields.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/edit-address/${userId}/${editingAddressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          city: editCity,
          postalCode: editPostalCode,
          country: editCountry,
          address: editAddress,
          phone: editPhone,
          age: editAge,
        }),
      });
      if (response.ok) {
        window.alert("Address updated successfully");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert("Failed to update address: " + errorData.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error updating address");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingAddressId(null);
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
                  className="mt-5 cursor-pointer border-l-2 border-l-blue-700 px-2 py-2 font-semibold"
                >
                  Accounts
                </NavLink>
                <NavLink
                  to="/ShippingLocations"
                  className="mt-5 cursor-pointer border-l-2 border-l-blue-700 px-2 py-2 font-semibold text-blue-700 transition hover:border-l-blue-700 hover:text-blue-700"
                >
                  Shipping Address
                </NavLink>
              </div>
            </ul>
          </div>
          <div className="col-span-8 overflow-hidden rounded-xl sm:bg-gray-50 sm:px-8 sm:shadow">
            <div className="pt-4">
              <h1 className="py-2 text-2xl font-semibold">
                Shipping Locations
              </h1>
              <p className="text-slate-600">
                Manage your shipping address details
              </p>
            </div>
            <hr className="mt-4 mb-8" />

            <p className="py-2 text-xl font-semibold">Current Shipping Addresses</p>
            {userData.address && userData.address.length > 0 ? (
              userData.address.map((addr, index) => (
                <div key={addr._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
                {/* hide address details if editing */}
                  {editingAddressId === null && (
                    <>
                  <div className="text-gray-600">
                    <p><strong>{addr.firstName} {addr.lastName}</strong></p>
                    <p>{addr.city} {addr.postalCode}</p>
                    <p>{addr.address} {addr.phone}</p>
                    <p>{addr.country}</p>
                    {addr.age && <p>Age: {addr.age}</p>}
                  </div>
                  <div className="flex space-x-4 mt-2 sm:mt-0">
                    <button 
                      className="text-sm font-semibold text-blue-600 underline"
                      onClick={() => handleEditAddress(addr)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-sm font-semibold text-red-600 underline"
                      onClick={() => handleDeleteAddress(addr._id)}
                    >
                      Delete
                    </button>
                  </div>
                    </>
                  )}
                  {/* Edit Address Form */}
                  {editingAddressId === addr._id && (
                    <div className="w-full bg-white border rounded-lg p-4 mt-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-first-name" className="block text-sm text-gray-500">First Name</label>
                          <input
                            type="text"
                            id="edit-first-name"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-last-name" className="block text-sm text-gray-500">Last Name</label>
                          <input
                            type="text"
                            id="edit-last-name"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-city" className="block text-sm text-gray-500">City</label>
                          <input
                            type="text"
                            id="edit-city"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-postal-code" className="block text-sm text-gray-500">Postal Code</label>
                          <input
                            type="text"
                            id="edit-postal-code"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editPostalCode}
                            onChange={(e) => setEditPostalCode(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-phone-number" className="block text-sm text-gray-500">Phone Number</label>
                          <input
                            type="number"
                            id="edit-phone-number"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-age" className="block text-sm text-gray-500">Age</label>
                          <input
                            type="number"
                            id="edit-age"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-country" className="block text-sm text-gray-500">Country</label>
                          <input
                            type="text"
                            id="edit-country"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editCountry}
                            onChange={(e) => setEditCountry(e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-address" className="block text-sm text-gray-500">Address</label>
                          <input
                            type="text"
                            id="edit-address"
                            className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEditAddress}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 mb-6">No shipping addresses set</p>
            )}

            <hr className="mt-4 mb-8" />
            <p className="py-2 text-xl font-semibold">
              Add New Shipping Address
            </p>
            {/* Hide add form if editing */}
            {editingAddressId === null && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm text-gray-500"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm text-gray-500"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm text-gray-500">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postal-code"
                      className="block text-sm text-gray-500"
                    >
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postal-code"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone-number"
                      className="block text-sm text-gray-500"
                    >
                      Phone Number
                    </label>
                    <input
                      type="number"
                      id="phone-number"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-sm text-gray-500">
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="18"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="country"
                      className="block text-sm text-gray-500"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm text-gray-500"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="w-full rounded-md border-2 border-gray-300 py-2 px-4 text-gray-700 focus:border-blue-600 focus:outline-none"
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end my-4">
                  <button
                    onClick={handleSaveAddress}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
