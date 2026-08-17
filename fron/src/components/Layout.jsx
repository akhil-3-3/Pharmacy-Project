import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar2 from "./Sidebar2";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar2 />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
