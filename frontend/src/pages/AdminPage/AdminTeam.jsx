import React, { useState, useEffect } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import {
  Users, Shield, UserCheck, Search, ChevronDown, ChevronUp,
  Mail, Phone, Calendar, X
} from "lucide-react";
import "../../Styles/loader.css";

export default function AdminTeam({ adminData }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState("All Members");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/admins");
        if (!response.ok) throw new Error("Failed to fetch team members");
        const data = await response.json();
        setTeam(data || []);
      } catch (error) {
        console.error("Error:", error);
        setTeam([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  // คำนวณสถิติ
  const stats = {
    total: team.length,
    admin: team.filter(m => m.role.toLowerCase() === "admin").length,
    manager: team.filter(m => m.role.toLowerCase() === "manager").length,
    staff: team.filter(m => m.role.toLowerCase() === "staff").length,
  };

  // กรองตาม role + ค้นหา
  const filteredTeam = team.filter(member => {
    const matchesRole = filter === "All Members" || member.role.toLowerCase() === filter.toLowerCase();
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredTeam.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const toggleExpand = (id) => setExpandedMember(expandedMember === id ? null : id);

  const getRoleBadge = (role) => {
    const lower = role.toLowerCase();
    if (lower === "admin") return "bg-red-100 text-red-800";
    if (lower === "manager") return "bg-blue-100 text-blue-800";
    if (lower === "staff") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getRoleIcon = (role) => {
    const lower = role.toLowerCase();
    if (lower === "admin") return <Shield className="w-4 h-4" />;
    if (lower === "manager") return <UserCheck className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Header
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          textpage="ทีมงานผู้ดูแล"
          AdminData={adminData}
        />

        <div className="p-6 space-y-6 mx-auto">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">สมาชิกทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">แอดมิน</p>
                  <p className="text-2xl font-bold text-red-600">{stats.admin}</p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ผู้จัดการ</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.manager}</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">พนักงาน</p>
                  <p className="text-2xl font-bold text-green-600">{stats.staff}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Team Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                รายชื่อทีมงาน ({filteredTeam.length})
              </h2>

              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรืออีเมล..."
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

                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
                >
                  <option value="All Members">ทั้งหมด</option>
                  <option value="Admin">แอดมิน</option>
                  <option value="Manager">ผู้จัดการ</option>
                  <option value="Staff">พนักงาน</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-3">ตำแหน่ง</th>
                    <th className="px-6 py-3">อีเมล</th>
                    <th className="px-6 py-3">โทรศัพท์</th>
                    <th className="px-6 py-3 text-center">เข้าร่วมเมื่อ</th>
                    <th className="px-6 py-3 text-center">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-500">
                        กำลังโหลด...
                      </td>
                    </tr>
                  ) : currentMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-500">
                        ไม่พบสมาชิก
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((member) => (
                      <React.Fragment key={member._id}>
                        <tr className="bg-white border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                                {member.firstName[0]}{member.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-gray-500">ID: {member.employeeID}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              {member.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {member.phoneNumber || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {new Date(member.createdAt).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleExpand(member._id)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto"
                            >
                              {expandedMember === member._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {expandedMember === member._id ? 'ซ่อน' : 'แสดง'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedMember === member._id && (
                          <tr>
                            <td colSpan="6" className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">ข้อมูลส่วนตัว</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      <span>รหัสพนักงาน: <span className="font-mono">{member.employeeID}</span></span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      <span>{member.email}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Phone className="w-4 h-4" />
                                      <span>{member.phoneNumber || "ยังไม่ระบุ"}</span>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">การเข้าร่วม</h4>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>วันที่เข้าร่วม: {new Date(member.createdAt).toLocaleString('th-TH')}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Shield className="w-4 h-4" />
                                      <span>สิทธิ์การเข้าถึง: {member.role === "admin" ? "เต็มสิทธิ์" : member.role === "manager" ? "จัดการออเดอร์/สินค้า" : "ดูข้อมูล"}</span>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredTeam.length)} จาก {filteredTeam.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    ก่อนหน้า
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
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
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    ถัดไป
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
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