import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  X,
  Search,
  Eye,
  Trash2,
  AlertCircle,
  User,
  ShoppingCart,
  Calendar,
  DollarSign,
  Minus,
  Building2,
  Truck,
} from "lucide-react";

const API = "https://localhost:7232/api/purchase";
const MEDICINE_API = "https://localhost:7232/api/medicine";
const SUPPLIER_API = "https://localhost:7232/api/supplier";

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    medicineId: "",
    medicineName: "",
    quantity: 1,
    unitPrice: 0, // Changed from price to unitPrice
    availableStock: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  // Fetch purchases
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API, {
        headers: headers(),
        withCredentials: true,
      });
      setPurchases(data);
      console.log(data);
      setFiltered(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get(SUPPLIER_API, { headers: headers() });
      console.log("suppliers", data);
      setSuppliers(data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
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

  // Fetch purchase details
  const fetchPurchaseDetails = async (purchaseId) => {
    try {
      const { data } = await axios.get(`${API}/${purchaseId}/details`, {
        headers: headers(),
      });
      console.log("purchase details", data);
      setPurchaseDetails(data);
    } catch (err) {
      console.error("Error fetching purchase details:", err);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchMedicines();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      purchases.filter(
        (p) =>
          p.supplierName?.toLowerCase().includes(q) ||
          p.purchaseId.toString().includes(q) ||
          new Date(p.purchaseDate).toLocaleDateString().includes(q),
      ),
    );
  }, [search, purchases]);

  const openCreateModal = () => {
    setFormData({ supplierId: "", items: [] });
    setCurrentItem({
      medicineId: "",
      medicineName: "",
      quantity: 1,
      unitPrice: 0,
      availableStock: 0,
    });
    setError("");
    setSuccess("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({ supplierId: "", items: [] });
    setError("");
    setSuccess("");
  };

  const openDetailsModal = async (purchase) => {
    setSelectedPurchase(purchase);
    await fetchPurchaseDetails(purchase.purchaseId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPurchase(null);
    setPurchaseDetails([]);
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
        unitPrice: 0, // Allow user to enter unit price
        availableStock: medicine.stockQuantity || 0,
      });
      setError("");
    } else {
      setCurrentItem({
        medicineId: "",
        medicineName: "",
        quantity: 1,
        unitPrice: 0,
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
    if (currentItem.unitPrice <= 0) {
      setError("Please enter a valid unit price");
      return;
    }

    const existingItemIndex = formData.items.findIndex(
      (item) => item.medicineId === currentItem.medicineId,
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += currentItem.quantity;
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
            unitPrice: currentItem.unitPrice, // Changed to unitPrice
          },
        ],
      });
    }

    // Reset current item
    setCurrentItem({
      medicineId: "",
      medicineName: "",
      quantity: 1,
      unitPrice: 0,
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

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    setFormData({ ...formData, items: updatedItems });
    setError("");
  };

  const updateItemUnitPrice = (index, newUnitPrice) => {
    const updatedItems = [...formData.items];
    updatedItems[index].unitPrice = newUnitPrice;
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
  };

  const handleSubmitPurchase = async () => {
    if (!formData.supplierId) {
      setError("Please select a supplier");
      return;
    }
    if (formData.items.length === 0) {
      setError("Please add at least one item to the purchase");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplierId: parseInt(formData.supplierId),
        items: formData.items.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Changed to unitPrice
        })),
      };

      console.log("Submitting purchase payload:", payload);

      const { data } = await axios.post(API, payload, { headers: headers() });
      setSuccess(
        `Purchase created successfully! Purchase ID: ${data.purchaseId}`,
      );
      setTimeout(() => {
        closeCreateModal();
        fetchPurchases();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create purchase. Please try again.",
      );
      console.error("Error creating purchase:", err);
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
            <h1 className="text-2xl font-semibold text-gray-800">Purchases</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {purchases.length} total purchases
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Purchase
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
            placeholder="Search by supplier name, purchase ID, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 bg-white"
          />
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Purchase ID
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Supplier
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
                filtered.map((purchase) => (
                  <tr
                    key={purchase.purchaseId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <Package size={14} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          #{purchase.purchaseId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Building2 size={13} className="text-gray-400" />
                        {purchase.supplierName}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={13} className="text-gray-400" />
                        {formatDate(purchase.purchaseDate)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                        <DollarSign size={13} className="text-gray-400" />
                        {purchase.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailsModal(purchase)}
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
                    <Package size={28} className="mx-auto mb-2 text-gray-300" />
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Purchase Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                Create New Purchase
              </h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Supplier Selection */}
            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1.5">
                Select Supplier <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({ ...formData, supplierId: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800"
              >
                <option value="">Choose a supplier...</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.supplierName} - {supplier.phone}
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
                        {medicine.medicineName} - Current Stock:{" "}
                        {medicine.quantity || 0}
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentItem.unitPrice}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        unitPrice: parseFloat(e.target.value) || 0,
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
                  Current Stock: {currentItem.availableStock} units
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
                          Unit Price
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
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItemUnitPrice(
                                  index,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
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
                            ${(item.unitPrice * item.quantity).toFixed(2)}
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
                          Total Purchase Amount:
                        </td>
                        <td
                          className="px-4 py-3 font-bold text-gray-900 text-lg"
                          colSpan="2"
                        >
                          ${calculateTotal().toFixed(2)}
                        </td>
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
                onClick={handleSubmitPurchase}
                disabled={loading || formData.items.length === 0}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {loading ? "Processing..." : "Complete Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Details Modal */}
      {showDetailsModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                Purchase Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Purchase Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Purchase ID</p>
                  <p className="text-sm font-semibold text-gray-800">
                    #{selectedPurchase.purchaseId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Supplier</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedPurchase.supplierName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm text-gray-800">
                    {formatDate(selectedPurchase.purchaseDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-sm font-bold text-gray-900">
                    ${selectedPurchase.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Items Purchased
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
                  {purchaseDetails.length > 0 ? (
                    purchaseDetails.map((detail) => (
                      <tr key={detail.purchaseDetailId}>
                        <td className="px-4 py-2 text-gray-800">
                          <div className="flex items-center gap-2">
                            <Package size={13} className="text-gray-400" />
                            {detail.medicineName}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${detail.unitPrice?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {detail.quantity}
                        </td>
                        <td className="px-4 py-2 text-gray-800 font-medium">
                          $
                          {((detail.unitPrice || 0) * detail.quantity).toFixed(
                            2,
                          )}
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
                      ${selectedPurchase.totalAmount.toFixed(2)}
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

export default Purchase;
