import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Phone,
  MapPin,
  Search,
  History,
  Calendar,
  Package,
  IndianRupee,
} from "lucide-react";

const API_BASE_URL = "https://localhost:7232";

const CUSTOMER_URL = `${API_BASE_URL}/api/v1/Customer`;

const emptyForm = {
  customerName: "",
  customerAddress: "",
  phone: "",
};

const Customer2 = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // null | add | edit
  const [mode, setMode] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customerSales, setCustomerSales] = useState([]);

  const [salesLoading, setSalesLoading] = useState(false);

  // =========================================================
  // GET ACCESS TOKEN
  // =========================================================

  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  // =========================================================
  // AXIOS CONFIG
  // =========================================================

  const getAuthConfig = () => {
    const token = getAccessToken();

    return {
      withCredentials: true,
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    };
  };

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching customers from:", CUSTOMER_URL);

      const response = await axios.get(CUSTOMER_URL, getAuthConfig());

      console.log("Customer response:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.data)) {
        setCustomers(data.data);
      } else {
        console.warn("Unexpected customer response:", data);
        setCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response:", err.response.data);

        if (err.response.status === 401) {
          setError("You are not authenticated. Please login again.");
        } else if (err.response.status === 403) {
          setError("You do not have permission to view customers.");
        } else if (err.response.status === 404) {
          setError("Customer API endpoint was not found.");
        } else {
          setError(err.response.data?.message || "Failed to fetch customers.");
        }
      } else {
        setError(
          "Unable to connect to the server. Make sure the API is running.",
        );
      }

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================================================
  // FETCH CUSTOMER SALES
  // =========================================================

  const fetchCustomerSales = async (customerId) => {
    if (!customerId) {
      setCustomerSales([]);
      return;
    }

    setSalesLoading(true);

    try {
      const url = `${API_BASE_URL}/api/Sale/customer/${customerId}`;

      console.log("Fetching customer sales:", url);

      const response = await axios.get(url, getAuthConfig());

      console.log("Sales response:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setCustomerSales(data);
      } else if (Array.isArray(data?.data)) {
        setCustomerSales(data.data);
      } else {
        setCustomerSales([]);
      }
    } catch (err) {
      console.error("Error fetching customer sales:", err);

      setCustomerSales([]);

      if (err.response) {
        console.error("Sales status:", err.response.status);

        console.error("Sales response:", err.response.data);
      }
    } finally {
      setSalesLoading(false);
    }
  };

  // =========================================================
  // CUSTOMER CLICK
  // =========================================================

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerSales(customer.customerId);
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // ADD / EDIT CUSTOMER
  // =========================================================

  const handleAddOrEdit = async () => {
    const customerName = form.customerName?.trim();
    const phone = form.phone?.trim();
    const customerAddress = form.customerAddress?.trim() || "";

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!customerName || !phone) {
      setError("Name and phone are required.");
      return;
    }

    if (!/^\d{7,15}$/.test(phone)) {
      setError("Enter a valid phone number (digits only, 7–15 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;

      const requestBody = {
        customerName,
        customerAddress,
        phone,
      };

      // =========================================
      // ADD
      // =========================================

      if (mode === "add") {
        console.log("Adding customer:", requestBody);

        response = await axios.post(CUSTOMER_URL, requestBody, getAuthConfig());
      }

      // =========================================
      // EDIT
      // =========================================
      else if (mode === "edit") {
        if (!form.customerId) {
          setError("Customer ID is missing.");
          setLoading(false);
          return;
        }

        const updateUrl = `${CUSTOMER_URL}/${form.customerId}`;

        console.log("Updating customer:", updateUrl);

        response = await axios.put(updateUrl, requestBody, getAuthConfig());
      }

      console.log("Add/Edit customer response:", response);

      // =========================================
      // SUCCESS
      // =========================================

      if (response.status >= 200 && response.status < 300) {
        await fetchCustomers();

        setMode(null);
        setForm(emptyForm);
        setError("");
      } else {
        setError(`Failed to ${mode === "add" ? "add" : "update"} customer.`);
      }
    } catch (err) {
      console.error("Error adding/updating customer:", err);

      if (err.response) {
        console.error("Status:", err.response.status);

        console.error("Response:", err.response.data);

        if (err.response.status === 400) {
          setError(
            err.response.data?.message || "Invalid customer information.",
          );
        } else if (err.response.status === 401) {
          setError("You are not authenticated. Please login again.");
        } else if (err.response.status === 403) {
          setError("You do not have permission to perform this action.");
        } else {
          setError(
            err.response.data?.message ||
              "Something went wrong. Please try again.",
          );
        }
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    try {
      const deleteUrl = `${CUSTOMER_URL}/${id}`;

      console.log("Deleting customer:", deleteUrl);

      const response = await axios.delete(deleteUrl, getAuthConfig());

      console.log("Delete response:", response);

      await fetchCustomers();

      setDeleteCustomer(null);
    } catch (err) {
      console.error("Error deleting customer:", err);

      if (err.response) {
        console.error("Delete status:", err.response.status);

        console.error("Delete response:", err.response.data);

        alert(err.response.data?.message || "Failed to delete customer.");
      } else {
        alert("Unable to connect to the server.");
      }
    } finally {
      setDeleteCustomer(null);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  useEffect(() => {
    const searchStr = search.toLowerCase().trim();

    if (!searchStr) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter((customer) => {
      const name = customer.customerName?.toLowerCase() || "";

      const phone = customer.phone?.toLowerCase() || "";

      const address = customer.customerAddress?.toLowerCase() || "";

      return (
        name.includes(searchStr) ||
        phone.includes(searchStr) ||
        address.includes(searchStr)
      );
    });

    setFilteredCustomers(filtered);
  }, [search, customers]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    const number = Number(value) || 0;

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // TOTAL PURCHASES
  // =========================================================

  const totalPurchases = customerSales.reduce((sum, sale) => {
    const quantity = Number(sale.quantity) || 0;

    const unitPrice = Number(sale.unitPrice) || 0;

    return sum + quantity * unitPrice;
  }, 0);

  // =========================================================
  // TOTAL ITEMS
  // =========================================================

  const totalItems = customerSales.reduce(
    (sum, sale) => sum + (Number(sale.quantity) || 0),
    0,
  );

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    setMode(null);
    setForm(emptyForm);
    setError("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-hidden flex flex-col h-screen">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>

            <p className="text-sm text-gray-500 mt-0.5">
              {customers.length} total customers
            </p>
          </div>

          <button
            onClick={() => {
              setMode("add");
              setForm(emptyForm);
              setError("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            Add customer
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && !mode && (
          <div className="flex items-center gap-2 mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle size={15} className="shrink-0" />

            <span>{error}</span>

            <button
              onClick={() => {
                setError("");
                fetchCustomers();
              }}
              className="ml-auto text-xs font-medium underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="relative mb-5 shrink-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 bg-white"
          />
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Name
                    </th>

                    <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Phone
                    </th>

                    <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Address
                    </th>

                    <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Joined
                    </th>

                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {loading && customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>

                        <p className="text-sm text-gray-500 mt-2">
                          Loading customers...
                        </p>
                      </td>
                    </tr>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customerId}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleCustomerClick(customer)}
                      >
                        {/* NAME */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                              {customer.customerName
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>

                            <span className="font-medium text-gray-800">
                              {customer.customerName}
                            </span>
                          </div>
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone size={13} className="text-gray-400" />

                            {customer.phone || "—"}
                          </div>
                        </td>

                        {/* ADDRESS */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin size={13} className="text-gray-400" />

                            {customer.customerAddress || (
                              <span className="text-gray-300">—</span>
                            )}
                          </div>
                        </td>

                        {/* JOINED */}

                        <td className="px-5 py-3.5 text-gray-500">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-3.5">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* EDIT */}

                            <button
                              onClick={() => {
                                setMode("edit");

                                setForm({
                                  customerId: customer.customerId,
                                  customerName: customer.customerName || "",
                                  customerAddress:
                                    customer.customerAddress || "",
                                  phone: customer.phone || "",
                                });

                                setError("");
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* DELETE */}

                            <button
                              onClick={() =>
                                setDeleteCustomer({
                                  customerId: customer.customerId,
                                  customerName: customer.customerName,
                                })
                              }
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-400"
                      >
                        <Users
                          size={28}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          CUSTOMER DETAILS / SALES MODAL
      ====================================================== */}

      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedCustomer(null);
            setCustomerSales([]);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

            <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users size={20} className="text-gray-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {selectedCustomer.customerName}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone size={11} />
                        {selectedCustomer.phone}
                      </span>

                      {selectedCustomer.customerAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {selectedCustomer.customerAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSales([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* SALES */}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-gray-500" />

                <h3 className="text-sm font-semibold text-gray-700">
                  Purchase History
                </h3>
              </div>

              {salesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>

                  <p className="text-sm text-gray-500 mt-2">
                    Loading purchases...
                  </p>
                </div>
              ) : customerSales.length > 0 ? (
                <div className="space-y-3">
                  {customerSales.map((sale, index) => {
                    const quantity = Number(sale.quantity) || 0;

                    const unitPrice = Number(sale.unitPrice) || 0;

                    const total = quantity * unitPrice;

                    return (
                      <div
                        key={sale.saleId || `${sale.medicineName}-${index}`}
                        className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package size={14} className="text-gray-400" />

                              <span className="font-medium text-gray-800">
                                {sale.medicineName || "Unknown medicine"}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />

                                {formatDate(sale.saleDate)}
                              </span>

                              <span>Quantity: {quantity}</span>

                              <span className="flex items-center gap-1">
                                <IndianRupee size={11} />
                                {formatMoney(unitPrice)} per unit
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-800">
                              ₹{formatMoney(total)}
                            </div>

                            <div className="text-xs text-gray-400">Total</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* SUMMARY */}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Purchases:
                      </span>

                      <span className="text-lg font-semibold text-gray-800">
                        ₹{formatMoney(totalPurchases)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">
                        Total Items:
                      </span>

                      <span className="text-sm font-medium text-gray-700">
                        {totalItems}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-3" />

                  <p className="text-sm text-gray-500">
                    No purchase history found
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    This customer hasn't made any purchases yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {mode && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                {mode === "add" ? "Add customer" : "Edit customer"}
              </h2>

              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* NAME */}

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Full name <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  placeholder="Alice"
                  disabled={loading}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="9384719481"
                  disabled={loading}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>

              {/* ADDRESS */}

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Address
                </label>

                <input
                  type="text"
                  name="customerAddress"
                  value={form.customerAddress}
                  onChange={handleInputChange}
                  placeholder="San Francisco"
                  disabled={loading}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="flex items-center gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" />

                {error}
              </div>
            )}

            {/* BUTTONS */}

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeForm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAddOrEdit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 rounded-lg transition-colors"
              >
                {loading
                  ? "Saving..."
                  : mode === "add"
                    ? "Add customer"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteCustomer && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>

              <h2 className="text-base font-semibold text-gray-800">
                Delete customer
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">
                {deleteCustomer.customerName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteCustomer(null)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteCustomer.customerId)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer2;
