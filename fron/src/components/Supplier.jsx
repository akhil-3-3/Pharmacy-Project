import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Phone,
  MapPin,
  Search,
  Building2,
  Calendar,
} from "lucide-react";

const API = "https://localhost:7232/api/Supplier";

const emptyForm = { supplierName: "", supplierAddress: "", phone: "" };

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API, {
        headers: headers(),
        withCredentials: true,
      });
      setSuppliers(data);
      setFiltered(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      suppliers.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.supplierAddress?.toLowerCase().includes(q),
      ),
    );
  }, [search, suppliers]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  const openEdit = (supplier) => {
    setEditTarget(supplier);
    setForm({
      supplierName: supplier.supplierName,
      supplierAddress: supplier.supplierAddress ?? "",
      phone: supplier.phone,
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
    const { supplierName, phone } = form;
    if (!supplierName.trim()) {
      setError("Supplier name is required.");
      return false;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return false;
    }
    if (!/^\d{7,15}$/.test(phone.trim())) {
      setError("Enter a valid phone number (digits only, 7–15 characters).");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editTarget) {
        await axios.put(`${API}/${editTarget.supplierId}`, form, {
          headers: headers(),
        });
      } else {
        await axios.post(API, form, { headers: headers() });
      }
      await fetchSuppliers();
      closeModal();
    } catch (err) {
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
      await fetchSuppliers();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting supplier:", err);
      setError("Failed to delete supplier. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Suppliers</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {suppliers.length} total suppliers
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            Add Supplier
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
            placeholder="Search by name, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 bg-white"
          />
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Supplier
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Phone
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Address
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Added Date
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
                filtered.map((supplier) => (
                  <tr
                    key={supplier.supplierId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <Building2 size={14} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {supplier.supplierName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={13} className="text-gray-400" />
                        {supplier.phone}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={13} className="text-gray-400" />
                        {supplier.supplierAddress || (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar size={13} className="text-gray-400" />
                        {formatDate(supplier.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(supplier)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(supplier)}
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
                    <Truck size={28} className="mx-auto mb-2 text-gray-300" />
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                {editTarget ? "Edit Supplier" : "Add Supplier"}
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
                  Supplier Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={form.supplierName}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Address
                </label>
                <textarea
                  name="supplierAddress"
                  value={form.supplierAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows="3"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 resize-none"
                />
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
                    : "Add Supplier"}
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
                Delete Supplier
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">
                {deleteConfirm.supplierName}
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
                onClick={() => handleDelete(deleteConfirm.supplierId)}
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

export default Supplier;
