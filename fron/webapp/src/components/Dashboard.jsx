import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle, LogOut } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7232/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalRevenue: 0
  });
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const headers = { Authorization: `Bearer ${token}` };

      const statsResponse = await axios.get(`${API_BASE_URL}/Dashboard/stats`, { headers });
      const lowStockResponse = await axios.get(`${API_BASE_URL}/Dashboard/lowstock?threshold=10`, { headers });
      const recentSalesResponse = await axios.get(`${API_BASE_URL}/Dashboard/recentsales?count=5`, { headers });

      setStats(statsResponse.data);
      setLowStock(lowStockResponse.data);
      setRecentSales(recentSalesResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accesstoken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accesstoken");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-light text-gray-900">Dashboard</h1>
          <button 
            onClick={handleLogout} 
            className="text-gray-400 hover:text-gray-600 transition text-sm flex items-center gap-1"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Medicines</p>
                <p className="text-2xl font-light text-gray-900 mt-1">{stats.totalMedicines}</p>
              </div>
              <Package size={18} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Customers</p>
                <p className="text-2xl font-light text-gray-900 mt-1">{stats.totalCustomers}</p>
              </div>
              <Users size={18} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Suppliers</p>
                <p className="text-2xl font-light text-gray-900 mt-1">{stats.totalSuppliers}</p>
              </div>
              <Package size={18} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Low Stock Alerts</p>
                <p className="text-2xl font-light text-red-600 mt-1">{stats.lowStockItems}</p>
              </div>
              <AlertCircle size={18} className="text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Today's Sales</p>
                <p className="text-2xl font-light text-gray-900 mt-1">{stats.todaySales}</p>
              </div>
              <ShoppingCart size={18} className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-light text-gray-900 mt-1">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" />
                Low Stock Alert
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {lowStock.length > 0 ? (
                lowStock.map((item) => (
                  <div key={item.stockId} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-900">{item.medicineName}</span>
                        <p className="text-xs text-gray-400 mt-1">ID: {item.stockId}</p>
                      </div>
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">All stocks are sufficient</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900 text-sm">Recent Sales</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.saleId} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-900">Sale #{sale.saleId}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {sale.customerName || 'Walk-in Customer'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{sale.totalAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">No recent sales</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => navigate('/sales/new')}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
          >
            New Sale
          </button>
          <button 
            onClick={() => navigate('/medicines')}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            Manage Stock
          </button>
          <button 
            onClick={() => navigate('/purchase/new')}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            Add Purchase
          </button>
          <button 
            onClick={() => navigate('/customers')}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            Customers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;