import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Mail,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7232/api';

const Customers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    phone: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCustomers();
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const response = await axios.get(`${API_BASE_URL}/Customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accesstoken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accesstoken");

      console.log(editingCustomer);
      console.log(formData);
      
      if (editingCustomer) {
        // Update customer
        const result = await axios.put(`${API_BASE_URL}/Customer/${editingCustomer.customerId}`, {
            customerId: editingCustomer.customerId,
            ...formData,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(result);
      } else {
        // Create customer
        await axios.post(`${API_BASE_URL}/Customer`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchCustomers();
      closeModal();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert(error.response?.data || "Failed to save customer");
    }
  };

  const handleDelete = async (customerId) => {
    try {
      const token = localStorage.getItem("accesstoken");
      await axios.delete(`${API_BASE_URL}/Customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer. They may have sales records.");
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        customerName: customer.customerName,
        customerAddress: customer.customerAddress || '',
        phone: customer.phone
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        customerName: '',
        customerAddress: '',
        phone: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      customerName: '',
      customerAddress: '',
      phone: ''
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.customerAddress && customer.customerAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Users size={24} className="text-emerald-600" />
              <span className="font-semibold text-gray-800">Customers</span>
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try a different search term" : "Add your first customer to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.customerId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{customer.customerName}</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <Phone size={14} />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(customer)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(customer)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {customer.customerAddress && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm mt-2 pt-2 border-t">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{customer.customerAddress}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-2 text-xs text-gray-400">
                    Customer ID: {customer.customerId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                Confirm Delete
              </h3>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{deleteConfirm.customerName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. Customer with associated sales cannot be deleted.
              </p>
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.customerId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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

export default Customers;