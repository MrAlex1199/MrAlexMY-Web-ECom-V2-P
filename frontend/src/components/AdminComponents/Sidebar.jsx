import React from "react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("http://localhost:3001/admin/orders");
        // If you get CORS/network errors, check backend server and CORS settings!
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched orders data:", data); // Debug: see what you get

        // Handle both { success, orders } and [orders] directly
        if (Array.isArray(data)) {
          setOrderCount(data.length);
        } else if (data.success && Array.isArray(data.orders)) {
          setOrderCount(data.orders.length);
        } else if (Array.isArray(data.orders)) {
          setOrderCount(data.orders.length);
        } else {
          setOrderCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrderCount(0);
      }
    }
    fetchOrders();
  }, []);
  
  return (
    <div className="font-semibold bg-white text-slate-900 w-70 p-5 sticky top-0">
      <h2 className="text-2xl font-bold mb-6">SERGENTX™</h2>
      <nav className="space-y-4">
        <NavLink
          to="/admindashboard"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md sticky top-0"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/adminmanageproducts"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md"
          }
        >
          Products
        </NavLink>
        <NavLink
          to="/adminmanageorders"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md"
          }
        >
          Orders
          <span className="ml-2 text-xs text-white bg-red-500 text-gray-700 px-2 py-1 rounded-full">
            {orderCount}
          </span>
        </NavLink>
        <NavLink
          to="/adminmanagecustomrs"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md"
          }
        >
          Customers
        </NavLink>
        <NavLink
          to="/adminpromotions"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md"
          }
        >
          Promotions
        </NavLink>
        <NavLink
          to="/adminfinance"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md"
          }
        >
          Finance
        </NavLink>
        <NavLink
          to="/adminteam"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 text-white bg-blue-500 rounded-md sticky top-0"
              : "block px-4 py-2 text-blue-700 rounded-md"
          }
        >
          Teams
        </NavLink>
      </nav>
    </div>
  );
}
