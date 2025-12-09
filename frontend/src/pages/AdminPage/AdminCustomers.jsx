import React, { useState, useEffect } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import {
  Users, Mail, Calendar, MapPin, Search, ChevronDown, ChevronUp, X
} from "lucide-react";
import "../../Styles/loader.css";

export default function AdminManageCustomers({ adminData }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/users");
        if (!response.ok) throw new Error("Failed to fetch customers");
        const data = await response.json();
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  // ค้นหา
  const filteredCustomers = customers.filter(customer =>
    `${customer.fname} ${customer.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFilteredItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalFilteredPages = Math.ceil(filteredCustomers.length / itemsPerPage);


  const toggleExpand = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Header
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          textpage="จัดการลูกค้า"
          AdminData={adminData}
        />

        <div className="p-6 space-y-6 mx-auto">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">มีที่อยู่</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {customers.filter(c => c.address && c.address.length > 0).length}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สมัครวันนี้</p>
                  <p className="text-2xl font-bold text-green-600">
                    {customers.filter(c => 
                      new Date(c.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Customers Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                รายชื่อลูกค้า ({filteredCustomers.length})
              </h2>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรืออีเมล..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-3">อีเมล</th>
                    <th className="px-6 py-3 text-center">วันที่สมัคร</th>
                    <th className="px-6 py-3">ที่อยู่</th>
                    <th className="px-6 py-3 text-center">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        กำลังโหลด...
                      </td>
                    </tr>
                  ) : currentFilteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        ไม่พบลูกค้า
                      </td>
                    </tr>
                  ) : (
                    currentFilteredItems.map((customer) => (
                      <React.Fragment key={customer._id}>
                        <tr className="bg-white border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {customer.fname} {customer.lname}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              {customer.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(customer.createdAt).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.address && customer.address.length > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {customer.address && customer.address.length > 0 ? "มีที่อยู่" : "ไม่มีที่อยู่"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleExpand(customer._id)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto"
                            >
                              {expandedCustomer === customer._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {expandedCustomer === customer._id ? 'ซ่อน' : 'แสดง'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedCustomer === customer._id && (
                          <tr>
                            <td colSpan="5" className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">ข้อมูลส่วนตัว</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      <span>ID: <span className="font-mono text-xs">{customer._id}</span></span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      <span>{customer.email}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>สมัครเมื่อ: {new Date(customer.createdAt).toLocaleString('th-TH')}</span>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">ที่อยู่ทั้งหมด</h4>
                                  {customer.address && customer.address.length > 0 ? (
                                    <div className="space-y-3">
                                      {customer.address.map((addr, i) => (
                                        <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                                          <p className="font-medium text-gray-800">ที่อยู่ {i + 1}</p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {addr.address}, {addr.city}, {addr.country}
                                          </p>
                                          {addr.zip && <p className="text-xs text-gray-500 mt-1">รหัสไปรษณีย์: {addr.zip}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">ยังไม่มีที่อยู่</p>
                                  )}
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
            {totalFilteredPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredCustomers.length)} จาก {filteredCustomers.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalFilteredPages))}
                    disabled={currentPage === totalFilteredPages}
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
    </div>
  );
}