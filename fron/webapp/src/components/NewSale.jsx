import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User, 
  Phone,
  Search,
  X,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7232/api';

const NewSale = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    customerAddress: '',
    phone: ''
  });

  // Fetch customers and medicines on load
  useEffect(() => {
    fetchCustomers();
    fetchMedicines();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const response = await axios.get(`${API_BASE_URL}/Customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const response = await axios.get(`${API_BASE_URL}/Medicine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(medicine =>
    medicine.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to cart
  const addToCart = (medicine) => {
    const existingItem = cartItems.find(item => item.medicineId === medicine.medicineId);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.medicineId === medicine.medicineId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        medicineId: medicine.medicineId,
        medicineName: medicine.medicineName,
        price: medicine.price,
        quantity: 1,
        stockQuantity: medicine.stockQuantity || 0
      }]);
    }
  };

  // Update quantity
  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(item => item.medicineId === medicineId);
    if (newQuantity > item.stockQuantity) {
      alert(`Only ${item.stockQuantity} items available in stock`);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.medicineId === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (medicineId) => {
    setCartItems(cartItems.filter(item => item.medicineId !== medicineId));
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Create new customer
  const createCustomer = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`${API_BASE_URL}/Customer`, newCustomer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const createdCustomer = { ...newCustomer, customerId: response.data };
      setCustomers([...customers, createdCustomer]);
      setSelectedCustomer(createdCustomer);
      setShowCustomerModal(false);
      setNewCustomer({ customerName: '', customerAddress: '', phone: '' });
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer");
    }
  };

  // Submit sale
  const submitSale = async () => {
    if (cartItems.length === 0) {
      alert("Please add at least one item to the cart");
      return;
    }

    setLoading(true);
    
    const saleData = {
      customerId: selectedCustomer?.customerId || null,
      items: cartItems.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    };

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`${API_BASE_URL}/Sale`, saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Sale completed successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} className="text-emerald-600" />
            <span className="font-semibold text-gray-800">New Sale</span>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Medicine Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} />
                  Customer Information
                </h2>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="text-emerald-600 text-sm font-medium hover:underline"
                >
                  + New Customer
                </button>
              </div>
              
              {selectedCustomer ? (
                <div className="bg-emerald-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{selectedCustomer.customerName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone size={14} />
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={(e) => {
                    const customer = customers.find(c => c.customerId === parseInt(e.target.value));
                    setSelectedCustomer(customer);
                  }}
                  value=""
                >
                  <option value="">Select a customer (or leave empty for walk-in)</option>
                  {customers.map(customer => (
                    <option key={customer.customerId} value={customer.customerId}>
                      {customer.customerName} - {customer.phone}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Medicine Search */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Pill size={18} />
                Add Medicines
              </h2>
              
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMedicines.map(medicine => (
                  <div key={medicine.medicineId} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.medicineName}</p>
                      <p className="text-sm text-gray-500">₹{medicine.price}</p>
                      <p className="text-xs text-gray-400">Stock: {medicine.stockQuantity || 0}</p>
                    </div>
                    <button
                      onClick={() => addToCart(medicine)}
                      disabled={medicine.stockQuantity === 0}
                      className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-20">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Cart ({cartItems.length} items)
                </h2>
              </div>

              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>No items added</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.medicineId} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{item.medicineName}</p>
                          <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.medicineId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="ml-auto font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={submitSale}
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Complete Sale'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Add New Customer</h3>
              <button onClick={() => setShowCustomerModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newCustomer.customerName}
                  onChange={(e) => setNewCustomer({...newCustomer, customerName: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newCustomer.customerAddress}
                  onChange={(e) => setNewCustomer({...newCustomer, customerAddress: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createCustomer}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSale;