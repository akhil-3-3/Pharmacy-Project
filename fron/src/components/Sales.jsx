import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  X,
  Search,
  Eye,
  Trash2,
  AlertCircle,
  User,
  Package,
  Calendar,
  DollarSign,
  Minus,
  Printer,
} from "lucide-react";

const API = "https://localhost:7232/api/sale";
const MEDICINE_API = "https://localhost:7232/api/medicine";
const CUSTOMER_API = "https://localhost:7232/api/v1/Customer";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    medicineId: "",
    medicineName: "",
    quantity: 1,
    price: 0,
    availableStock: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  // Fetch sales
  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API, {
        headers: headers(),
        withCredentials: true,
      });
      setSales(data);
      setFiltered(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get(CUSTOMER_API, { headers: headers() });
      console.log(data);
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // Fetch medicines
  const fetchMedicines = async () => {
    try {
      const { data } = await axios.get(MEDICINE_API, { headers: headers() });
      setMedicines(data);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    }
  };

  // Fetch sale details
  const fetchSaleDetails = async (saleId) => {
    try {
      const { data } = await axios.get(`${API}/${saleId}/details`, {
        headers: headers(),
      });
      setSaleDetails(data);
    } catch (err) {
      console.error("Error fetching sale details:", err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchMedicines();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      sales.filter(
        (s) =>
          s.customerName?.toLowerCase().includes(q) ||
          s.saleId.toString().includes(q) ||
          new Date(s.saleDate).toLocaleDateString().includes(q),
      ),
    );
  }, [search, sales]);

  const openCreateModal = () => {
    setFormData({ customerId: "", items: [] });
    setCurrentItem({
      medicineId: "",
      medicineName: "",
      quantity: 1,
      price: 0,
      availableStock: 0,
    });
    setError("");
    setSuccess("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({ customerId: "", items: [] });
    setError("");
    setSuccess("");
  };

  const openDetailsModal = async (sale) => {
    setSelectedSale(sale);
    await fetchSaleDetails(sale.saleId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSale(null);
    setSaleDetails([]);
  };

  const handleMedicineSelect = (medicineId) => {
    const medicine = medicines.find(
      (m) => m.medicineId === parseInt(medicineId),
    );
    if (medicine) {
      setCurrentItem({
        medicineId: medicine.medicineId,
        medicineName: medicine.medicineName,
        quantity: 1,
        price: medicine.price,
        availableStock: medicine.stockQuantity || 100, // Adjust based on your stock API
      });
      setError("");
    } else {
      setCurrentItem({
        medicineId: "",
        medicineName: "",
        quantity: 1,
        price: 0,
        availableStock: 0,
      });
    }
  };

  const addItemToCart = () => {
    if (!currentItem.medicineId) {
      setError("Please select a medicine");
      return;
    }
    if (currentItem.quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (currentItem.quantity > currentItem.availableStock) {
      setError(`Only ${currentItem.availableStock} units available in stock`);
      return;
    }

    const existingItemIndex = formData.items.findIndex(
      (item) => item.medicineId === currentItem.medicineId,
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...formData.items];
      const newQuantity =
        updatedItems[existingItemIndex].quantity + currentItem.quantity;
      if (newQuantity > currentItem.availableStock) {
        setError(
          `Total quantity exceeds available stock (${currentItem.availableStock})`,
        );
        return;
      }
      updatedItems[existingItemIndex].quantity = newQuantity;
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            medicineId: currentItem.medicineId,
            quantity: currentItem.quantity,
            medicineName: currentItem.medicineName,
            price: currentItem.price,
          },
        ],
      });
    }

    // Reset current item
    setCurrentItem({
      medicineId: "",
      medicineName: "",
      quantity: 1,
      price: 0,
      availableStock: 0,
    });
    setError("");
  };

  const removeItemFromCart = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromCart(index);
      return;
    }

    const item = formData.items[index];
    const medicine = medicines.find((m) => m.medicineId === item.medicineId);
    const availableStock = medicine?.stockQuantity || 100;

    if (newQuantity > availableStock) {
      setError(
        `Only ${availableStock} units available for ${item.medicineName}`,
      );
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    setFormData({ ...formData, items: updatedItems });
    setError("");
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const handleSubmitSale = async () => {
    if (!formData.customerId) {
      setError("Please select a customer");
      return;
    }
    if (formData.items.length === 0) {
      setError("Please add at least one item to the sale");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId: parseInt(formData.customerId),
        items: formData.items.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
      };

      console.log("Submitting sale payload:", payload);

      const { data } = await axios.post(API, payload, { headers: headers() });
      setSuccess(`Sale created successfully! Sale ID: ${data.saleId}`);
      setTimeout(() => {
        closeCreateModal();
        fetchSales();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create sale. Please try again.",
      );
      console.error("Error creating sale:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Sales</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {sales.length} total sales
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Sale
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by customer name, sale ID, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 bg-white"
          />
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Sale ID
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Total Amount
                </th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((sale) => (
                  <tr
                    key={sale.saleId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <ShoppingCart size={14} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          #{sale.saleId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <User size={13} className="text-gray-400" />
                        {sale.customerName}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={13} className="text-gray-400" />
                        {formatDate(sale.saleDate)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                        <DollarSign size={13} className="text-gray-400" />
                        {sale.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailsModal(sale)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
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
                    <ShoppingCart
                      size={28}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    No sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                Create New Sale
              </h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Selection */}
            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1.5">
                Select Customer <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800"
              >
                <option value="">Choose a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.customerName} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Items Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Add Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Medicine
                  </label>
                  <select
                    value={currentItem.medicineId}
                    onChange={(e) => handleMedicineSelect(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="">Select medicine...</option>
                    {medicines.map((medicine) => (
                      <option
                        key={medicine.medicineId}
                        value={medicine.medicineId}
                      >
                        {medicine.medicineName} - ${medicine.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addItemToCart}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              {currentItem.medicineName && (
                <div className="text-xs text-gray-500">
                  Price: ${currentItem.price} | Available:{" "}
                  {currentItem.availableStock} units
                </div>
              )}
            </div>

            {/* Cart Items */}
            {formData.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Cart Items ({formData.items.length}{" "}
                  {formData.items.length === 1 ? "item" : "items"})
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-500">
                          Medicine
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500">
                          Subtotal
                        </th>
                        <th className="px-4 py-2 text-center text-xs text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-gray-800">
                            {item.medicineName}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateItemQuantity(index, item.quantity - 1)
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateItemQuantity(index, item.quantity + 1)
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-800 font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => removeItemFromCart(index)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-right font-semibold text-gray-800"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 text-lg">
                          ${calculateTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 mb-4 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" />
                {success}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={closeCreateModal}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSale}
                disabled={loading || formData.items.length === 0}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {loading ? "Processing..." : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                Sale Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sale Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Sale ID</p>
                  <p className="text-sm font-semibold text-gray-800">
                    #{selectedSale.saleId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedSale.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm text-gray-800">
                    {formatDate(selectedSale.saleDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-sm font-bold text-gray-900">
                    ${selectedSale.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Items Sold
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">
                      Medicine
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {saleDetails.length > 0 ? (
                    saleDetails.map((detail) => (
                      <tr key={detail.saleDetailId}>
                        <td className="px-4 py-2 text-gray-800">
                          <div className="flex items-center gap-2">
                            <Package size={13} className="text-gray-400" />
                            {detail.medicineName}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${detail.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {detail.quantity}
                        </td>
                        <td className="px-4 py-2 text-gray-800 font-medium">
                          ${(detail.unitPrice * detail.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-3 text-right font-semibold text-gray-800"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ${selectedSale.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6">
              <button
                onClick={closeDetailsModal}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
