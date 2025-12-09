import React, { useState, useEffect } from "react";
import Header from "../../components/AdminComponents/header";
import Sidebar from "../../components/AdminComponents/Sidebar";
import {
  Package, Truck, CheckCircle, XCircle, AlertCircle,
  Edit, Trash2, ChevronDown, ChevronUp, Calendar, MapPin, User, Clock, X
} from "lucide-react";
import "../../Styles/loader.css";

export default function AdminManageOrders({ adminData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const ordersPerPage = 10;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditOrder, setCurrentEditOrder] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [filter, setFilter] = useState("All Orders");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/admin/orders");
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
  }, []);

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const filterOrders =
    filter === "All Orders"
      ? orders
      : orders.filter((order) => {
          if (filter === "In Transit") return order.status === "In Transit";
          if (filter === "Shipped") return order.status === "Shipped";
          if (filter === "Returned") return order.status === "Returned";
          if (filter === "Cancelled") return order.status === "Cancelled";
          return false;
        });

  const currentOrdersfilter = filterOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalOrdersPages = Math.ceil(filterOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const formatProductList = (products) => {
    if (!products) return "";
    return products.map(p => p.name.replace("Smartphone - ", "")).join(", ");
  };

  const toggleProductView = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleEditOrder = (order) => {
    setCurrentEditOrder({ ...order });
    setEditModalOpen(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!currentEditOrder || !currentEditOrder.status) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/admin/orders/${currentEditOrder.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEditOrder),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedOrders = orders.map(order =>
          order.orderId === currentEditOrder.orderId ? data.order : order
        );
        setOrders(updatedOrders);
        setEditModalOpen(false);
        alert("อัปเดตออเดอร์สำเร็จ!");
      } else {
        throw new Error(data.message || "อัปเดตไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const openDeleteConfirmation = (order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const handleDeleteSelectedOrder = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/admin/orders/${orderToDelete.orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedOrders = orders.filter(order => order.orderId !== orderToDelete.orderId);
        setOrders(updatedOrders);
        setDeleteModalOpen(false);
        setOrderToDelete(null);

        if (updatedOrders.length <= (currentPage - 1) * ordersPerPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        alert("ลบออเดอร์สำเร็จ");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    return `${addr.address}, ${addr.city}, ${addr.country}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Shipped": return <CheckCircle className="w-4 h-4" />;
      case "In Transit": return <Truck className="w-4 h-4" />;
      case "Returned": return <AlertCircle className="w-4 h-4" />;
      case "Cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Shipped": return "bg-green-100 text-green-800";
      case "In Transit": return "bg-yellow-100 text-yellow-800";
      case "Returned": return "bg-orange-100 text-orange-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Header
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          textpage="จัดการออเดอร์"
          AdminData={adminData}
        />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">กำลังจัดส่ง</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === "In Transit").length}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">จัดส่งแล้ว</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === "Shipped").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ยกเลิก/คืน</p>
                  <p className="text-2xl font-bold text-red-600">
                    {orders.filter(o => o.status === "Cancelled" || o.status === "Returned").length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Orders Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                รายการออเดอร์ ({filterOrders.length})
              </h2>
              <div className="flex gap-2 flex-wrap">
                {["All Orders", "In Transit", "Shipped", "Returned", "Cancelled"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setFilter(tab); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === tab
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab === "All Orders" ? "ทั้งหมด" :
                     tab === "In Transit" ? "กำลังจัดส่ง" :
                     tab === "Shipped" ? "จัดส่งแล้ว" :
                     tab === "Returned" ? "คืนสินค้า" : "ยกเลิก"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">ลูกค้า</th>
                    <th className="px-6 py-3">สินค้า</th>
                    <th className="px-6 py-3 text-center">วันที่สั่ง</th>
                    <th className="px-6 py-3 text-center">จัดส่งประมาณ</th>
                    <th className="px-6 py-3 text-center">ราคา</th>
                    <th className="px-6 py-3">สถานะ</th>
                    <th className="px-6 py-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrdersfilter.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-gray-500">
                        ไม่พบออเดอร์
                      </td>
                    </tr>
                  ) : (
                    currentOrdersfilter.map((order) => (
                      <React.Fragment key={order.orderId}>
                        <tr className="bg-white border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">#{order.orderId}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span>{order.userId ? `${order.userId.fname} ${order.userId.lname}` : 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-xs">{formatProductList(order.productSelected)}</span>
                              <button
                                onClick={() => toggleProductView(order.orderId)}
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                              >
                                {expandedOrder === order.orderId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {expandedOrder === order.orderId ? 'ซ่อน' : 'แสดง'}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.createdAt).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {new Date(order.estDelivery).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-800">
                            ${order.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status === "In Transit" ? "กำลังจัดส่ง" :
                               order.status === "Shipped" ? "จัดส่งแล้ว" :
                               order.status === "Returned" ? "คืนสินค้า" : "ยกเลิก"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditOrder(order)}
                                className="text-blue-600 hover:text-blue-700"
                                title="แก้ไข"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirmation(order)}
                                className="text-red-600 hover:text-red-700"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedOrder === order.orderId && (
                          <tr>
                            <td colSpan="8" className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">รายละเอียดสินค้า</h4>
                                  <div className="space-y-2">
                                    {order.productSelected.map((product, i) => (
                                      <div key={i} className="flex justify-between py-1 border-b border-gray-200">
                                        <span>{product.name}</span>
                                        <span className="text-gray-600">
                                          {product.quantity} ชิ้น × ${product.price.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">ข้อมูลการจัดส่ง</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 mt-0.5" />
                                      <span>{formatAddress(order.shippingAddress)}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Truck className="w-4 h-4" />
                                      <span>ผู้ให้บริการ: {order.carrier}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Package className="w-4 h-4" />
                                      <span>Tracking: {order.trackingCode || 'ยังไม่มี'}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      <span>ตำแหน่งล่าสุด: {order.lastLocation || 'กำลังดำเนินการ'}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalOrdersPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  แสดง {indexOfFirstOrder + 1} ถึง {Math.min(indexOfLastOrder, filterOrders.length)} จาก {filterOrders.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  {Array.from({ length: totalOrdersPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalOrdersPages))}
                    disabled={currentPage === totalOrdersPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && currentEditOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">แก้ไขออเดอร์ #{currentEditOrder.orderId}</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateOrder} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select
                  value={currentEditOrder.status}
                  onChange={(e) => setCurrentEditOrder({ ...currentEditOrder, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="In Transit">กำลังจัดส่ง</option>
                  <option value="Shipped">จัดส่งแล้ว</option>
                  <option value="Returned">คืนสินค้า</option>
                  <option value="Cancelled">ยกเลิก</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ให้บริการ</label>
                <input
                  type="text"
                  value={currentEditOrder.carrier}
                  onChange={(e) => setCurrentEditOrder({ ...currentEditOrder, carrier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Code</label>
                <input
                  type="text"
                  value={currentEditOrder.trackingCode || ''}
                  onChange={(e) => setCurrentEditOrder({ ...currentEditOrder, trackingCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
              <p className="mt-2 text-sm text-gray-600">
                คุณแน่ใจหรือไม่ว่าต้องการลบออเดอร์ <span className="font-medium">#{orderToDelete.orderId}</span>?
                <br />การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteSelectedOrder}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                ลบออเดอร์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}