import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import { Plus, Upload, Edit, X, ChevronLeft, ChevronRight, Package, } from "lucide-react";
import "../../Styles/loader.css";

const initialNewProductState = {
  name: '',
  price: 0,
  stock_remaining: 0,
  description: '',
  href: '',
  imageSrc: '',
  imageAlt: '',
  breadcrumbs: '',
  details: '',
  discount: 0,
  highlightsStr: '',
  colorsStr: '',
  sizesStr: '',
};

export default function AdminManageProducts({ adminData }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [newProduct, setNewProduct] = useState(initialNewProductState);
  const [file, setFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState("All Products");
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setNewProduct(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    try {
      const uploadedImageUrls = await uploadImagesToCloudinary();

      const payload = {
        ...newProduct,
        imageSrc: uploadedImageUrls[0],
        images: uploadedImageUrls.map(url => ({ src: url, alt: newProduct.name })),
        highlights: newProduct.highlightsStr.split(',').map(s => s.trim()).filter(Boolean),
        colors: newProduct.colorsStr.split(',').map(name => ({ name: name.trim(), class: `bg-${name.trim().toLowerCase()}-500`, selectedClass: `ring-gray-400` })).filter(c => c.name),
        sizes: newProduct.sizesStr.split(',').map(name => ({ name: name.trim(), inStock: true })).filter(s => s.name),
      };
      await axios.post("http://localhost:3001/api/products", payload);
      alert("เพิ่มสินค้าสำเร็จ!");
      setNewProduct(initialNewProductState);
      setImageFiles([]);
      setImagePreviews([]);
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("เพิ่มสินค้าไม่สำเร็จ");
    }
  };

  const uploadImagesToCloudinary = async () => {
    try {
      const formData = new FormData();
      for (const file of imageFiles) {
        formData.append("images", file);
      }

      const response = await axios.post("http://localhost:3001/api/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        return response.data.urls;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload one or more images.");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!productToEdit) return;
    try {
      await axios.put(`http://localhost:3001/api/products/${productToEdit._id}`, productToEdit);
      alert("อัปเดตสินค้าสำเร็จ!");
      setIsEditModalOpen(false);
      setProductToEdit(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("อัปเดตสินค้าไม่สำเร็จ");
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToEdit) return;
    const confirmDel = window.confirm("แน่ใจหรือไม่ว่าต้องการลบสินค้านี้? การลบไม่สามารถย้อนกลับได้");
    if (!confirmDel) return;
    try {
      await axios.delete(`http://localhost:3001/api/products/${productToEdit._id}`);
      alert("ลบสินค้าสำเร็จ!");
      setIsEditModalOpen(false);
      setProductToEdit(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("ลบสินค้าไม่สำเร็จ");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setCsvPreview(results.data.slice(0, 5))
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("กรุณาเลือกไฟล์ CSV");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:3001/api/upload-csv-products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("อัปโหลด CSV สำเร็จ!");
      setFile(null);
      setCsvPreview([]);
      fetchProducts();
    } catch (error) {
      console.error("Error uploading CSV:", error.response || error);
      alert("อัปโหลดไม่สำเร็จ");
    }
  };

  const filteredItems = products.filter(p => {
    if (filter === "All Products") return true;
    if (filter === "In Stock") return p.stock_remaining > 0;
    if (filter === "Sold Out") return p.stock_remaining === 0;
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFilteredItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalFilteredPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Header dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} textpage="จัดการสินค้า" AdminData={adminData} />

        <div className="p-6 space-y-6 mx-auto">

          {/* Add New Product Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                เพิ่มสินค้าใหม่
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAddForm ? 'ซ่อนฟอร์ม' : 'แสดงฟอร์ม'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
                    <input name="name" type="text" placeholder="เช่น Nike Air Max" value={newProduct.name} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ราคา *</label>
                    <input name="price" type="number" placeholder="0.00" value={newProduct.price} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สต็อกคงเหลือ *</label>
                    <input name="stock_remaining" type="number" placeholder="0" value={newProduct.stock_remaining} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ส่วนลด (%)</label>
                    <input name="discount" type="number" placeholder="0" value={newProduct.discount} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์สินค้า</label>
                    <input name="href" type="text" placeholder="/product/..." value={newProduct.href} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breadcrumbs</label>
                    <input name="breadcrumbs" type="text" placeholder="Men > Shoes" value={newProduct.breadcrumbs} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพสินค้า *</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`preview ${index}`} className="w-full h-auto rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                  <textarea name="description" placeholder="คำอธิบายสั้น ๆ" value={newProduct.description} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows="2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                  <textarea name="details" placeholder="รายละเอียดเพิ่มเติม" value={newProduct.details} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows="3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ไฮไลต์ (คั่นด้วย comma)</label>
                    <input name="highlightsStr" type="text" placeholder="น้ำหนักเบา, ระบายอากาศ" value={newProduct.highlightsStr} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สี (คั่นด้วย comma)</label>
                    <input name="colorsStr" type="text" placeholder="Black, White, Red" value={newProduct.colorsStr} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ไซส์ (คั่นด้วย comma)</label>
                    <input name="sizesStr" type="text" placeholder="S, M, L, XL" value={newProduct.sizesStr} onChange={handleNewProductChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2">
                    <Plus className="w-4 h--4" /> เพิ่มสินค้า
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* CSV Upload Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              อัปโหลดสินค้าด้วย CSV
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <button
                onClick={handleUpload}
                disabled={!file}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> อัปโหลด
              </button>
            </div>

            {csvPreview.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างข้อมูล (5 แถวแรก):</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-600">
                    <thead>
                      <tr className="bg-gray-100">
                        {Object.keys(csvPreview[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-left font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-b">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-3 py-2">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Products Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                รายการสินค้า ({filteredItems.length})
              </h2>
              <div className="flex gap-2 flex-wrap">
                {["All Products", "In Stock", "Sold Out"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setFilter(tab); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === tab
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab === "All Products" ? "ทั้งหมด" : tab === "In Stock" ? "มีสินค้า" : "หมด"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ชื่อสินค้า</th>
                    <th className="px-6 py-3 text-center">ราคา</th>
                    <th className="px-6 py-3 text-center">สต็อก</th>
                    <th className="px-6 py-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">กำลังโหลด...</td>
                    </tr>
                  ) : currentFilteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">ไม่พบสินค้า</td>
                    </tr>
                  ) : (
                    currentFilteredItems.map((product) => (
                      <tr key={product._id} className="bg-white border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-center">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock_remaining > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {product.stock_remaining}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => { setProductToEdit(product); setIsEditModalOpen(true); }}
                            className="text-yellow-600 hover:text-yellow-700 font-medium text-sm flex items-center gap-1 mx-auto"
                          >
                            <Edit className="w-4 h-4" /> แก้ไข
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalFilteredPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredItems.length)} จาก {filteredItems.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">แก้ไขสินค้า</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                  <input
                    type="text"
                    value={productToEdit.name}
                    onChange={(e) => setProductToEdit({ ...productToEdit, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคา</label>
                  <input
                    type="number"
                    value={productToEdit.price}
                    onChange={(e) => setProductToEdit({ ...productToEdit, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สต็อก</label>
                  <input
                    type="number"
                    value={productToEdit.stock_remaining}
                    onChange={(e) => setProductToEdit({ ...productToEdit, stock_remaining: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ส่วนลด (%)</label>
                  <input
                    type="number"
                    value={productToEdit.discount || 0}
                    onChange={(e) => setProductToEdit({ ...productToEdit, discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <textarea
                  value={productToEdit.description}
                  onChange={(e) => setProductToEdit({ ...productToEdit, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-between items-center gap-3 pt-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    ลบสินค้า
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}