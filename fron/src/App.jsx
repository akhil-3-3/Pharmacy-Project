import React from "react";
import { Route, Routes } from "react-router-dom";
import Customers2 from "./components/Customer2";
import Register2 from "./components/Register2";
import Login2 from "./components/Login2";
import Dashboard2 from "./components/Dashboard2";
import Sidebar2 from "./components/Sidebar2";
import Medicine from "./components/Medicine";
import Sales from "./components/Sales";
import Supplier from "./components/Supplier";
import Purchase from "./components/Purchase";
import Layout from "./components/Layout";
import Email from "./components/Email";
import Payment from "./components/Payment";
import SignalRDemo from "./components/SignalRDemo";
import SignalRWebSocket from "./components/SignalRWebSocket";
import Category from "./components/Category";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login2 />} />
      <Route path="/register" element={<Register2 />} />

      <Route element={<Layout />}>
        <Route path="/medicines" element={<Medicine />} />
        <Route path="/categories" element={<Category />} />

        <Route path="/purchases" element={<Purchase />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/suppliers" element={<Supplier />} />
        <Route path="/dashboard" element={<Dashboard2 />} />
        <Route path="/customers" element={<Customers2 />} />
        <Route path="/send-email" element={<Email />} />
        <Route path="/pay" element={<Payment />} />
        {/* <Route path="/signalr" element={<SignalRDemo />} /> */}
        <Route path="/signalr" element={<SignalRWebSocket />} />
      </Route>
    </Routes>
  );
};

export default App;
