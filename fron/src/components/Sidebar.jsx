import React, { useState } from "react";
import {
  Package,
  Grid,
  Boxes,
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";

const Sidebar2 = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Medicines", icon: Package, path: "/medicines" },
    { name: "Categories", icon: Grid, path: "/categories" },
    { name: "Stock", icon: Boxes, path: "/stock" },
    { name: "Customers", icon: Users, path: "/customers" },
    { name: "Suppliers", icon: Truck, path: "/suppliers" },
    { name: "Sales", icon: ShoppingCart, path: "/sales" },
    { name: "Purchases", icon: TrendingUp, path: "/purchases" },
  ];

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="px-5 py-6 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="transition-opacity duration-300">
            <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
              Pharma<span className="text-amber-500">Admin</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Inventory Management</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <a
              key={name}
              href={path}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-all duration-200 group"
            >
              <Icon
                size={16}
                className="text-gray-400 group-hover:text-amber-500 transition-colors flex-shrink-0"
              />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap transition-all duration-300">
                  {name}
                </span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
          <LogOut
            size={16}
            className="text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0"
          />
          {!collapsed && (
            <span className="font-medium whitespace-nowrap transition-all duration-300">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar2;
