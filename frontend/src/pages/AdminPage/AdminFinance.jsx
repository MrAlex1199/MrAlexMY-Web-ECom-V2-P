import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import Sidebar from "../../components/AdminComponents/Sidebar";
import Header from "../../components/AdminComponents/header";
import {
  DollarSign, TrendingUp, ShoppingCart, Percent, Download
} from "lucide-react";
import "../../Styles/loader.css";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title
);

export default function Finance({ adminData }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last30days");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalDiscount: 0,
    totalOrders: 0,
  });

  const [chartData, setChartData] = useState({
    categorySales: { labels: [], datasets: [] },
    monthlySales: { labels: [], datasets: [] },
    yearlySales: { labels: [], datasets: [] },
    dailyRevenue: { labels: [], datasets: [] },
    weeklyRevenue: { labels: [], datasets: [] },
  });

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("http://localhost:3001/admin/orders"),
          fetch("http://localhost:3001/api/products"),
        ]);

        const orders = await ordersRes.json();
        const products = await productsRes.json();

        // กรองตามช่วงเวลา
        const filteredOrders = filterOrdersByRange(orders, dateRange);

        // คำนวณสถิติ
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const totalSales = filteredOrders.reduce((sum, o) => sum + o.subtotal, 0);
        const totalDiscount = totalSales - totalRevenue;
        const totalOrders = filteredOrders.length;

        setStats({ totalRevenue, totalSales, totalDiscount, totalOrders });

        // สร้างกราฟ
        setChartData({
          categorySales: generateCategorySales(filteredOrders, products),
          monthlySales: generateMonthlySales(filteredOrders),
          yearlySales: generateYearlySales(filteredOrders),
          dailyRevenue: generateDailyRevenue(filteredOrders),
          weeklyRevenue: generateWeeklyRevenue(filteredOrders),
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [dateRange]);

  // ฟังก์ชันกรองออเดอร์
  const filterOrdersByRange = (orders, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "last7days":
        startDate = new Date(now); startDate.setDate(now.getDate() - 6); break;
      case "last30days":
        startDate = new Date(now); startDate.setDate(now.getDate() - 29); break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1); break;
      default:
        startDate = new Date(now); startDate.setDate(now.getDate() - 29);
    }

    startDate.setHours(0, 0, 0, 0);
    return orders.filter(o => new Date(o.createdAt) >= startDate);
  };

  // กราฟตามหมวดหมู่
  const generateCategorySales = (orders, products) => {
    const categoryMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p._id === item.productId);
        if (product) {
          const cat = product.category || "อื่นๆ";
          categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
        }
      });
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#06B6D4'],
      }],
    };
  };

  // รายเดือน
  const generateMonthlySales = (orders) => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const sales = months.map((_, i) => {
      return orders.filter(o => new Date(o.createdAt).getMonth() === i)
        .reduce((sum, o) => sum + o.subtotal, 0);
    });

    return { labels: months, datasets: [{ label: 'ยอดขาย', data: sales, backgroundColor: '#3B82F6' }] };
  };

  // รายปี
  const generateYearlySales = (orders) => {
    const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
    const sales = years.map(year => {
      return orders.filter(o => new Date(o.createdAt).getFullYear() === parseInt(year))
        .reduce((sum, o) => sum + o.subtotal, 0);
    });

    return { labels: years, datasets: [{ label: 'ยอดขาย', data: sales, backgroundColor: '#10B981' }] };
  };

  // รายวัน
  const generateDailyRevenue = (orders) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('th-TH', { weekday: 'short' });
    });

    const revenue = last7Days.map(day => {
      return orders.filter(o => {
        return o.createdAt.toLocaleDateString('th-TH', { weekday: 'short' }) === day;
      }).reduce((sum, o) => sum + o.totalPrice, 0);
    });

    return { labels: last7Days, datasets: [{ label: 'รายได้', data: revenue, borderColor: '#EF4444', tension: 0.4 }] };
  };

  // รายสัปดาห์
  const generateWeeklyRevenue = (orders) => {
    const weeks = ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'];
    const revenue = weeks.map((_, i) => {
      return orders.filter(o => Math.floor(new Date(o.createdAt).getDate() / 7) === i)
        .reduce((sum, o) => sum + o.totalPrice, 0);
    });

    return { labels: weeks, datasets: [{ label: 'รายได้', data: revenue, borderColor: '#F59E0B', tension: 0.4 }] };
  };

  if (!adminData || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
  const barLineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Header dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} textpage="การเงิน" AdminData={adminData} />

        <div className="p-6 space-y-6 mx-auto">

          {/* Header + Date Range */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ดการเงิน</h1>
            <div className="flex items-center gap-3">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="last7days">7 วันล่าสุด</option>
                <option value="last30days">30 วันล่าสุด</option>
                <option value="thisMonth">เดือนนี้</option>
                <option value="thisYear">ปีนี้</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: DollarSign, label: "รายได้รวม", value: `฿${stats.totalRevenue.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: ShoppingCart, label: "ยอดขายรวม", value: `฿${stats.totalSales.toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Percent, label: "ส่วนลดรวม", value: `฿${stats.totalDiscount.toLocaleString()}`, color: "text-red-600", bg: "bg-red-50" },
              { icon: TrendingUp, label: "จำนวนออเดอร์", value: stats.totalOrders, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    <p className={`text-2xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bg}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Category Sales */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ยอดขายตามหมวดหมู่</h3>
              <div className="h-64">
                <Pie data={chartData.categorySales} options={pieOptions} />
              </div>
            </div>

            {/* Monthly Sales */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ยอดขายรายเดือน</h3>
              <div className="h-64">
                <Bar data={chartData.monthlySales} options={barLineOptions} />
              </div>
            </div>

            {/* Daily Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">รายได้รายวัน (7 วันล่าสุด)</h3>
              <div className="h-64">
                <Line data={chartData.dailyRevenue} options={barLineOptions} />
              </div>
            </div>

            {/* Weekly Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">รายได้รายสัปดาห์</h3>
              <div className="h-64">
                <Line data={chartData.weeklyRevenue} options={barLineOptions} />
              </div>
            </div>

            {/* Yearly Sales */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ยอดขายรายปี</h3>
              <div className="h-64">
                <Bar data={chartData.yearlySales} options={barLineOptions} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}