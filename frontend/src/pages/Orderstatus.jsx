import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Orderstatus({ userId }) {
  const [filter, setFilter] = useState("In Transit");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:3001/orders/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  const formatAddress = (addr) => {
      if (!addr) return "No address provided";
      return `${addr.address}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Order Status
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Track your orders in real-time
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-4 px-4">
        <button
          onClick={() => setFilter("In Transit")}
          className={`px-5 py-2.5 rounded-lg transition duration-200 ${
            filter === "In Transit"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
          }`}
        >
          In Transit
        </button>
        <button
          onClick={() => setFilter("Shipped")}
          className={`px-5 py-2.5 rounded-lg transition duration-200 ${
            filter === "Shipped"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
          }`}
        >
          Shipped
        </button>
        <button
          onClick={() => setFilter("Cancelled")}
          className={`px-5 py-2.5 rounded-lg transition duration-200 ${
            filter === "Cancelled"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
          }`}
        >
          Cancelled
        </button>
        <button
          onClick={() => setFilter("Returned")}
          className={`px-5 py-2.5 rounded-lg transition duration-200 ${
            filter === "Returned"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
          }`}
        >
          Returned
        </button>
        <button
          onClick={() => setFilter("All")}
          className={`px-5 py-2.5 rounded-lg transition duration-200 ${
            filter === "All"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-100 shadow-sm"
          }`}
        >
          All Orders
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order {order.orderId}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                      order.status === "Shipped"
                        ? "bg-green-200 text-green-700"
                        : order.status === "In Transit"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 text-left sm:text-right">
                  <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Est. Delivery: {new Date(order.estDelivery).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Shipping To</p>
                    <p className="text-gray-800 text-sm">{formatAddress(order.shippingAddress)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Payment</p>
                    <p className="text-gray-800 text-sm capitalize">{order.payment}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <p className="text-sm text-gray-500 font-medium mb-2">Items</p>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {order.productSelected.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-gray-800 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Delivery Fee: ${order.deliveryPrice.toFixed(2)}</span>
                    <span className="text-lg font-semibold text-gray-900">Total: ${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tracking Code</p>
                    <p className="text-gray-800 font-medium">{order.trackingCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Carrier</p>
                    <p className="text-gray-800 font-medium">{order.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Update</p>
                    <p className="text-gray-800 font-medium">{order.lastLocation}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                  <NavLink
                    to="/Products"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 text-center text-sm font-medium"
                  >
                    Buy Again
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 text-center text-sm font-medium"
                  >
                    Contact Support
                  </NavLink>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No orders found for this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
