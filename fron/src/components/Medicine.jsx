import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Search,
  Boxes,
  Building2,
  Tag,
  DollarSign,
  Pill,
} from "lucide-react";

const API = "https://localhost:7232/api/medicine";

const emptyForm = {
  medicineName: "",
  price: "",
  categoryId: "",
  supplierId: "",
  medicineTypeId: "",
};

const Medicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);

  const [medicineTypeList, setMedicineTypeList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const navigate = useNavigate();

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const fetchMedicines = async () => {
    try {
      const { data } = await axios.get(API, {
        withCredentials: true,
      });
      setMedicines(data);
      setFiltered(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const fetchMedicineTypeList = async () => {
    try {
      const { data } = await axios.get(
        "https://localhost:7232/api/Medicine/medicineTypeList",
        {
          withCredentials: true,
        },
      );
      setMedicineTypeList(data);
    } catch (err) {
      console.error("Error fetching medicine type list:", err);
    }
  };

  const fetchCategoryTypeList = async () => {
    try {
      const { data } = await axios.get(
        "https://localhost:7232/api/Medicine/categoryList",
        {
          withCredentials: true,
        },
      );
      console.log("category list", data);
      setCategoryList(data);
    } catch (err) {
      console.error("Error fetching category list:", err);
    }
  };

  const fetchSupplierList = async () => {
    try {
      const { data } = await axios.get(
        "https://localhost:7232/api/Medicine/supplierList",
        {
          withCredentials: true,
        },
      );
      setSupplierList(data);
    } catch (err) {
      console.error("Error fetching supplier list:", err);
    }
  };

  const fetchLowStockMedicines = async () => {
    try {
      const { data } = await axios.get(
        `${API}/lowstock?threshold=${lowStockThreshold}`,
        {
          withCredentials: true,
        },
      );
      setLowStockMedicines(data);
    } catch (err) {
      console.error("Error fetching low stock medicines:", err);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchMedicineTypeList();
    fetchSupplierList();
    fetchCategoryTypeList();
  }, []);

  useEffect(() => {
    if (showLowStock) {
      fetchLowStockMedicines();
    }
  }, [showLowStock, lowStockThreshold]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      medicines.filter(
        (m) =>
          m.medicineName?.toLowerCase().includes(q) ||
          m.categoryName?.toLowerCase().includes(q) ||
          m.supplierName?.toLowerCase().includes(q),
      ),
    );
  }, [search, medicines]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  const openEdit = (medicine) => {
    setEditTarget(medicine);
    setForm({
      medicineName: medicine.medicineName || "",
      price: medicine.price?.toString() || "",
      categoryId: medicine.categoryId?.toString() || "",
      supplierId: medicine.supplierId?.toString() || "",
      medicineTypeId: medicine.medicineTypeId?.toString() || "",
    });
    setError("");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setError("");
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    const { medicineName, price, categoryId, supplierId, medicineTypeId } =
      form;
    if (!medicineName?.trim()) {
      setError("Medicine name is required.");
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Valid price is required.");
      return false;
    }
    if (!categoryId || parseInt(categoryId) <= 0) {
      setError("Category is required.");
      return false;
    }
    if (!supplierId || parseInt(supplierId) <= 0) {
      setError("Supplier is required.");
      return false;
    }
    if (!medicineTypeId || parseInt(medicineTypeId) <= 0) {
      setError("Medicine Type is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const medicineData = {
        medicineName: form.medicineName.trim(),
        price: parseFloat(form.price),
        categoryId: parseInt(form.categoryId),
        supplierId: parseInt(form.supplierId),
        medicineTypeId: parseInt(form.medicineTypeId),
      };

      if (editTarget) {
        medicineData.medicineId = editTarget.medicineId;
        await axios.put(`${API}/${editTarget.medicineId}`, medicineData, {
          headers: headers(),
        });
      } else {
        await axios.post(API, medicineData, {
          withCredentials: true,
        });
      }
      await fetchMedicines();
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, { headers: headers() });
      await fetchMedicines();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete medicine.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Medicines</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {medicines.length} total medicines
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            Add medicine
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, category, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 bg-white"
            />
          </div>
          <button
            onClick={() => {
              setShowLowStock(!showLowStock);
              if (!showLowStock) fetchLowStockMedicines();
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-300 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors text-sm font-medium"
          >
            <Boxes size={15} />
            Check Low Stock
          </button>
        </div>

        {/* Low Stock Panel */}
        {showLowStock && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Boxes size={18} className="text-amber-600" />
                <h3 className="font-semibold text-amber-800">
                  Low Stock Alert
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-amber-700">Threshold:</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) =>
                    setLowStockThreshold(parseInt(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-1.5 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => setShowLowStock(false)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {lowStockMedicines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockMedicines.map((medicine) => (
                  <div
                    key={medicine.medicineId}
                    className="bg-white rounded-lg p-3 border border-amber-200"
                  >
                    <p className="font-medium text-gray-800">
                      {medicine.medicineName}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {medicine.categoryName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {medicine.supplierName}
                      </p>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      Quantity: {medicine.quantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-700">
                No medicines below threshold
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Medicine
                  </th>
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Medicine Type
                  </th>
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Supplier
                  </th>
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Quantity
                  </th>
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Added
                  </th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? (
                  filtered.map((m) => (
                    <tr
                      key={m.medicineId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <Package size={14} className="text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-800">
                            {m.medicineName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Tag size={13} className="text-gray-400" />
                          {m.categoryName || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Pill size={13} className="text-gray-400" />
                          {m.typeName || m.medicineTypeName || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Building2 size={13} className="text-gray-400" />
                          {m.supplierName || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Boxes size={13} className="text-gray-400" />
                          {m.quantity || 0}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <DollarSign size={13} className="text-gray-400" />$
                          {typeof m.price === "number"
                            ? m.price.toFixed(2)
                            : parseFloat(m.price)?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(m)}
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
                      colSpan="8"
                      className="px-5 py-10 text-center text-sm text-gray-400"
                    >
                      <Package
                        size={28}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      No medicines found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                {editTarget ? "Edit medicine" : "Add medicine"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Medicine name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="medicineName"
                  value={form.medicineName}
                  onChange={handleInputChange}
                  placeholder="Paracetamol"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Price ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="9.99"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800"
                >
                  <option value="">Select a category</option>
                  {categoryList.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Supplier <span className="text-red-400">*</span>
                </label>
                <select
                  name="supplierId"
                  value={form.supplierId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800"
                >
                  <option value="">Select a supplier</option>
                  {supplierList.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Medicine Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="medicineTypeId"
                  value={form.medicineTypeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800"
                >
                  <option value="">Select a medicine type</option>
                  {medicineTypeList.map((type) => (
                    <option
                      key={type.medicineTypeId}
                      value={type.medicineTypeId}
                    >
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 rounded-lg transition-colors"
              >
                {loading
                  ? "Saving..."
                  : editTarget
                    ? "Save changes"
                    : "Add medicine"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Delete medicine
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">
                {deleteConfirm.medicineName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.medicineId)}
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

export default Medicine;
