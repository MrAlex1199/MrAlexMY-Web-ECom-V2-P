import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import {
  Package, Percent, Search, X, Trash2, Edit3, TrendingDown,
} from "lucide-react";
import "../../Styles/loader.css";

export default function AdminPromotions({ adminData }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountValue, setDiscountValue] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/products");
      setProducts(res.data || []);
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  // คำนวณสถิติ
  const promotedProducts = products.filter(p => p.discount > 0);
  const totalDiscountValue = promotedProducts.reduce((sum, p) => sum + (p.price * p.discount) / 100, 0);

  // กรองสินค้า
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const openModal = (product = null) => {
    setSelectedProduct(product);
    setDiscountValue(product?.discount || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setDiscountValue("");
  };

  const applyDiscount = async () => {
    if (!selectedProduct || discountValue === "" || discountValue < 0 || discountValue > 100) {
      toast.error("กรุณากรอกส่วนลดให้ถูกต้อง (0-100%)");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/products/${selectedProduct._id}/discount`,
        { discount: parseInt(discountValue) }
      );
      toast.success(`ตั้งส่วนลด ${discountValue}% สำเร็จ!`);
      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error("ตั้งส่วนลดไม่สำเร็จ");
    }
  };

  const removeDiscount = async (productId) => {
    if (!window.confirm("ยืนยันการลบโปรโมชัน?")) return;

    try {
      await axios.put(`http://localhost:3001/api/products/${productId}/remove-discount`);
      toast.success("ลบโปรโมชันสำเร็จ");
      fetchProducts();
    } catch (error) {
      toast.error("ลบโปรโมชันไม่สำเร็จ");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Header
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          textpage="จัดการโปรโมชัน"
          AdminData={adminData}
        />

        <div className="p-3 space-y-3 mx-auto">
          <Toaster position="top-right" />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สินค้าที่มีโปรโมชัน</p>
                  <p className="text-2xl font-bold text-purple-600">{promotedProducts.length}</p>
                </div>
                <Percent className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">มูลค่าส่วนลดรวม</p>
                  <p className="text-2xl font-bold text-red-600">฿{totalDiscountValue.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สินค้าทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Search + Add */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-600" />
              รายการโปรโมชัน ({filteredProducts.length})
            </h2>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm w-full md:w-64"
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
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">สินค้า</th>
                    <th className="px-6 py-3 text-center">ราคา</th>
                    <th className="px-6 py-3 text-center">ส่วนลด</th>
                    <th className="px-6 py-3 text-center">ราคาหลังลด</th>
                    <th className="px-6 py-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        กำลังโหลด...
                      </td>
                    </tr>
                  ) : currentProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        ไม่พบสินค้า
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => {
                      const discountedPrice = product.price * (1 - product.discount / 100);
                      return (
                        <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product._id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            ฿{product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {product.discount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                <Percent className="w-3 h-3" />
                                {product.discount}%
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-medium">
                            {product.discount > 0 ? (
                              <span className="text-green-600">฿{discountedPrice.toFixed(2)}</span>
                            ) : (
                              "฿" + product.price.toFixed(2)
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openModal(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="แก้ไข"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {product.discount > 0 && (
                                <button
                                  onClick={() => removeDiscount(product._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="ลบโปรโมชัน"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  แสดง {indexOfFirst + 1} ถึง {Math.min(indexOfLast, filteredProducts.length)} จาก {filteredProducts.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages;
                    }
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          pageNum === currentPage
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  }).filter(Boolean)}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedProduct ? "แก้ไขโปรโมชัน" : "เพิ่มโปรโมชัน"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProduct && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{selectedProduct.name}</p>
                <p className="text-xs text-gray-500">ID: {selectedProduct._id}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ส่วนลด (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="เช่น 20"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={applyDiscount}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}