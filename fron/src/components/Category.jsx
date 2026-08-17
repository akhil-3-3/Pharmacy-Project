import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Search,
  Package,
} from "lucide-react";

const API = "https://localhost:7232/api/category";

const emptyForm = {
  categoryName: "",
};

const Category = () => {
  const [categories, setCategories] = useState([]);
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

  // =========================
  // Fetch Categories
  // =========================

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(API, {
        withCredentials: true,
      });

      setCategories(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching categories:", err);

      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // Search
  // =========================

  useEffect(() => {
    const q = search.toLowerCase().trim();

    setFiltered(
      categories.filter((category) =>
        category.categoryName?.toLowerCase().includes(q),
      ),
    );
  }, [search, categories]);

  // =========================
  // Add
  // =========================

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  // =========================
  // Edit
  // =========================

  const openEdit = (category) => {
    setEditTarget(category);

    setForm({
      categoryName: category.categoryName || "",
    });

    setError("");
    setModal(true);
  };

  // =========================
  // Close Modal
  // =========================

  const closeModal = () => {
    setModal(false);
    setError("");
    setEditTarget(null);
    setForm(emptyForm);
  };

  // =========================
  // Input Change
  // =========================

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // =========================
  // Validation
  // =========================

  const validate = () => {
    const { categoryName } = form;

    if (!categoryName?.trim()) {
      setError("Category name is required.");
      return false;
    }

    if (categoryName.trim().length < 2) {
      setError("Category name must be at least 2 characters.");
      return false;
    }

    return true;
  };

  // =========================
  // Add / Update
  // =========================

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const categoryData = {
        categoryName: form.categoryName.trim(),
      };

      if (editTarget) {
        categoryData.categoryId = editTarget.categoryId;

        await axios.put(`${API}/${editTarget.categoryId}`, categoryData, {
          headers: headers(),
          withCredentials: true,
        });
      } else {
        await axios.post(API, categoryData, {
          headers: headers(),
          withCredentials: true,
        });
      }

      await fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, {
        headers: headers(),
        withCredentials: true,
      });

      await fetchCategories();

      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(err.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* =========================
            Header
        ========================= */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>

            <p className="text-sm text-gray-500 mt-0.5">
              {categories.length} total categories
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            Add category
          </button>
        </div>

        {/* =========================
            Search
        ========================= */}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400 bg-white"
            />
          </div>
        </div>

        {/* =========================
            Table
        ========================= */}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Category
                  </th>

                  <th className="px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    ID
                  </th>

                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? (
                  filtered.map((category) => (
                    <tr
                      key={category.categoryId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Category */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <Tag size={14} className="text-gray-600" />
                          </div>

                          <span className="font-medium text-gray-800">
                            {category.categoryName}
                          </span>
                        </div>
                      </td>

                      {/* ID */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Package size={13} className="text-gray-400" />

                          {category.categoryId}
                        </div>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(category)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(category)}
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
                      colSpan="3"
                      className="px-5 py-10 text-center text-sm text-gray-400"
                    >
                      <Tag size={28} className="mx-auto mb-2 text-gray-300" />
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* =========================
          Add / Edit Modal
      ========================= */}

      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                {editTarget ? "Edit category" : "Add category"}
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Category name <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleInputChange}
                  placeholder="Painkillers"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Error */}

            {error && (
              <div className="flex items-center gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="shrink-0" />

                {error}
              </div>
            )}

            {/* Buttons */}

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
                    : "Add category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          Delete Confirmation
      ========================= */}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>

              <h2 className="text-base font-semibold text-gray-800">
                Delete category
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">
                {deleteConfirm.categoryName}
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
                onClick={() => handleDelete(deleteConfirm.categoryId)}
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

export default Category;
