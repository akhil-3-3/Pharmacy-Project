import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Pill,
  Users,
  Truck,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  LogOut,
  LayoutDashboard,
  Package,
  Tag,
  Boxes,
  Receipt,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const Dashboard2 = () => {
  const [statistics, setStatitics] = useState({
    medicines: 0,
    customers: 0,
    suppliers: 0,
    salesToday: 0,
    revenue: 0,
  });
  const [lowStocks, setLowStocks] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const fetchData = async () => {
    // const accessToken = localStorage.getItem("accessToken");
    // if (!accessToken) {
    //   navigate("/login");
    //   return;
    // }

    // const headers = { Authorization: `Bearer ${accessToken}` };

    const { data: statisticsData } = await axios.get(
      "https://localhost:7232/api/Dashboard/stats",
      { withCredentials: true },
    );
    const { data: lowStocksData } = await axios.get(
      "https://localhost:7232/api/Dashboard/lowstock?threshold=100",
      { withCredentials: true },
    );
    const { data: recentSalesData } = await axios.get(
      "https://localhost:7232/api/Dashboard/recentsales?count=5",
      { withCredentials: true },
    );

    setStatitics({
      medicines: statisticsData.totalMedicines,
      customers: statisticsData.totalCustomers,
      suppliers: statisticsData.totalSuppliers,
      salesToday: statisticsData.todaySales,
      revenue: statisticsData.totalRevenue,
    });
    setLowStocks(
      lowStocksData.map((s) => ({
        id: s.stockId,
        medicineName: s.medicineName,
        quantity: s.quantity,
      })),
    );
    setRecentSales(
      recentSalesData.map((s) => ({
        id: s.saleId,
        customerName: s.customerName,
        saleDate: s.saleDate,
        totalAmount: s.totalAmount,
      })),
    );

    // const {
    //   data: { stats, lowStock, recentSales },
    // } = await axios.get("https://localhost:7236/bff-dashboard", {
    //   headers,
    // });

    // setStatitics({
    //   medicines: stats.totalMedicines,
    //   customers: stats.totalCustomers,
    //   suppliers: stats.totalSuppliers,
    //   salesToday: stats.todaySales,
    //   revenue: stats.totalRevenue,
    // });
    // setLowStocks(
    //   lowStock.map((s) => ({
    //     id: s.stockId,
    //     medicineName: s.medicineName,
    //     quantity: s.quantity,
    //   })),
    // );
    // setRecentSales(
    //   recentSales.map((s) => ({
    //     id: s.saleId,
    //     customerName: s.customerName,
    //     saleDate: s.saleDate,
    //     totalAmount: s.totalAmount,
    //   })),
    // );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    { label: "Medicines", value: statistics.medicines, icon: Pill },
    { label: "Customers", value: statistics.customers, icon: Users },
    { label: "Suppliers", value: statistics.suppliers, icon: Truck },
    {
      label: "Low Stock Alerts",
      value: lowStocks.length,
      icon: AlertTriangle,
      highlight: lowStocks.length > 0,
    },
    {
      label: "Today's Sales",
      value: statistics.salesToday,
      icon: ShoppingCart,
    },
    {
      label: "Total Revenue",
      value: `$${statistics.revenue.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, highlight }) => (
            <div
              key={label}
              className={`bg-white rounded-xl p-4 border ${highlight ? "border-amber-300 bg-amber-50" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon
                  size={13}
                  className={highlight ? "text-amber-500" : "text-gray-400"}
                />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p
                className={`text-xl font-semibold ${highlight ? "text-amber-600" : "text-gray-800"}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <AlertTriangle size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">
                Low Stock Items
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStocks.length > 0 ? (
                lowStocks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <span className="text-sm text-gray-700">
                      {s.medicineName}
                    </span>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {s.quantity} left
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 px-5 py-4">
                  All stocks are sufficient.
                </p>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <ShoppingCart size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Sales
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentSales.length > 0 ? (
                recentSales.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm text-gray-700">{s.customerName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(s.saleDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      ${Number(s.totalAmount).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 px-5 py-4">No sales yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard2;
