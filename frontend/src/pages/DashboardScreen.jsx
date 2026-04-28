import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Package, 
  PlusCircle, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  ChevronRight,
  AlertTriangle,
  CreditCard,
  Settings,
  X,
  Upload,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ImageCropper from '../components/ImageCropper';

const DashboardScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [cropperImage, setCropperImage] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(userInfo?.totalEarnings || 0);
  const [isAiCategorizing, setIsAiCategorizing] = useState(false);
  const [selectedDashboardCategory, setSelectedDashboardCategory] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // Form States
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: 'Grains', stock: '', unit: 'kg', description: '', image: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: userInfo?.paymentDetails?.upiId || '',
    bankName: userInfo?.paymentDetails?.bankName || '',
    accountNumber: userInfo?.paymentDetails?.accountNumber || '',
    ifscCode: userInfo?.paymentDetails?.ifscCode || ''
  });

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'supplier') {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [userInfo, navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [orderRes, productRes] = await Promise.all([
        axios.get(`/api/orders/supplier`, config),
        axios.get(`/api/products?keyword=&city=${userInfo.city}`, config)
      ]);
      
      const rawProducts = productRes?.data?.products || [];
      const rawOrders = Array.isArray(orderRes?.data) ? orderRes.data : [];
      
      // Filter products by current supplier
      const myProducts = rawProducts.filter(p => 
        p.supplier?._id === userInfo._id || p.supplier === userInfo._id
      );
      
      setOrders(rawOrders);
      setProducts(myProducts);

      // Get latest user info for earnings
      try {
        const userRes = await axios.get(`/api/users/profile`, config);
        setTotalEarnings(userRes.data?.totalEarnings || 0);
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
      
      // Simulation: Check for new orders
      if (rawOrders.length > 0 && activeTab === 'overview') {
        const latest = rawOrders[0];
        setNewOrderAlert(latest);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCropperImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setNewProduct({ ...newProduct, image: croppedImage });
    setCropperImage(null);
  };

  const suggestCategory = async () => {
    if (!newProduct.name) return;
    setIsAiCategorizing(true);
    try {
      const { data } = await axios.post(`/api/ai/categorize`, {
        name: newProduct.name,
        description: newProduct.description
      });
      setNewProduct(prev => ({ 
        ...prev, 
        category: data.category,
        description: prev.description || data.suggestedDescription || `Freshly harvested ${prev.name} from my farm.`
      }));
    } catch (err) {
      console.error("AI Suggestion failed", err);
    } finally {
      setIsAiCategorizing(false);
    }
  };

  const generateDescription = async () => {
    if (!newProduct.name || !newProduct.category) {
      alert("Please enter product name and select a category first.");
      return;
    }
    setIsAiCategorizing(true);
    try {
      const { data } = await axios.post(`/api/ai/describe`, {
        name: newProduct.name,
        category: newProduct.category
      });
      setNewProduct(prev => ({ ...prev, description: data.description }));
    } catch (err) {
      console.error("AI Description failed", err);
    } finally {
      setIsAiCategorizing(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to remove this item from Mandi?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleEditProductClick = (product) => {
    setIsEditing(true);
    setEditProductId(product._id);
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      unit: product.unit || 'kg',
      description: product.description,
      image: product.images?.[0] || ''
    });
    setShowAddModal(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalImageUrl = newProduct.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';

      // Check if image is a base64 string (local upload)
      if (finalImageUrl.startsWith('data:image')) {
        const { getStorage, ref, uploadString, getDownloadURL } = await import('firebase/storage');
        await import('../firebase.js'); // Ensure firebase is initialized
        const storage = getStorage();
        const imageRef = ref(storage, `products/${userInfo._id}_${Date.now()}`);
        
        const snapshot = await uploadString(imageRef, finalImageUrl, 'data_url');
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const config = { 
        headers: { Authorization: `Bearer ${userInfo.token}` },
        timeout: 15000 
      };
      
      const productPayload = {
        ...newProduct,
        city: userInfo.city,
        state: userInfo.state,
        images: [finalImageUrl]
      };

      if (isEditing) {
        await axios.put(`/api/products/${editProductId}`, productPayload, config);
      } else {
        await axios.post(`/api/products`, productPayload, config);
      }
      
      setShowAddModal(false);
      setIsEditing(false);
      setEditProductId(null);
      setNewProduct({ name: '', price: '', category: 'Grains', stock: '', unit: 'kg', description: '', image: '' });
      fetchDashboardData();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error saving product';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/users/payment`, paymentDetails, config);
      alert('Payment details updated!');
    } catch (error) {
      alert('Error updating payment details');
    }
  };

  if (!userInfo) return null;

  const sidebarItems = [
    { id: 'overview', icon: <TrendingUp size={20}/>, label: 'Overview' },
    { id: 'products', icon: <Package size={20}/>, label: 'My Products' },
    { id: 'orders', icon: <ShoppingCart size={20}/>, label: 'Orders' },
    { id: 'customers', icon: <Users size={20}/>, label: 'Customers' },
    { id: 'payments', icon: <CreditCard size={20}/>, label: 'Payment Details' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 px-8">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 space-y-2">
        <div className="bg-card dark:bg-slate-800 p-4 rounded-2xl border border-border mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`} 
              className="w-10 h-10 rounded-xl object-cover border-2 border-primary/20"
              alt="Profile"
            />
            <div>
              <p className="font-black text-xs text-foreground dark:text-white truncate max-w-[120px]">{userInfo.name}</p>
              <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">{userInfo.city}</p>
            </div>
          </div>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-sm ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <div className="shrink-0 scale-90">{item.icon}</div> {item.label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex-grow space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-foreground dark:text-white capitalize">
            {activeTab} <span className="text-primary">.</span>
          </h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-secondary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20"
          >
            <PlusCircle size={16} /> Add Product
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { label: 'Total Earnings', value: `₹${(totalEarnings || 0).toLocaleString()}`, icon: <TrendingUp size={18}/>, trend: '+12%', color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Active Orders', value: orders.length, icon: <ShoppingCart size={18}/>, trend: `+${orders.length > 0 ? 1 : 0}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'My Products', value: products.length, icon: <Package size={18}/>, trend: 'Stable', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-card dark:bg-slate-800 p-6 rounded-3xl border border-border shadow-sm group hover:border-primary transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-xl md:text-2xl font-black text-foreground dark:text-white mt-0.5">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {newOrderAlert && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-primary p-6 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-primary/30"
                >
                  <div className="bg-white/20 p-4 rounded-3xl">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xl font-black">New Order Received!</h4>
                    <p className="text-white/80">You just received an order for {newOrderAlert.orderItems[0].name}.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="bg-white text-primary px-8 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all"
                  >
                    View Order
                  </button>
                </motion.div>
              )}

              <div className="bg-card dark:bg-slate-800 rounded-[3rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border dark:border-slate-700 flex justify-between items-center">
                  <h2 className="text-xl font-black text-foreground dark:text-white">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-primary font-bold flex items-center gap-1 hover:underline">
                    View All <ChevronRight size={18} />
                  </button>
                </div>
                <div className="divide-y divide-border dark:divide-slate-700">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No orders yet.</div>
                  ) : orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                          <img src={order.orderItems[0].image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-foreground dark:text-white">{order.orderItems[0].name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID: #{order._id.slice(-6)}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                            <span>Qty: <strong className="text-slate-700 dark:text-slate-200">{order.orderItems[0].qty} {order.orderItems[0].unit || 'kg'}</strong></span>
                            <span>Time: <strong className="text-slate-700 dark:text-slate-200">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({new Date(order.createdAt).toLocaleDateString()})</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-black text-xl text-foreground dark:text-white">₹{order.totalPrice}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['All', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Organic', 'Spices'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDashboardCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedDashboardCategory === cat 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products
                  .filter(p => selectedDashboardCategory === 'All' || p.category === selectedDashboardCategory)
                  .map((p) => (
                    <div key={p._id} className="bg-card dark:bg-slate-800 p-6 rounded-[2.5rem] border border-border flex gap-6 group hover:border-primary transition-all shadow-sm">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={p.images?.[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-lg text-foreground dark:text-white">{p.name}</h4>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{p.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditProductClick(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                              <Edit3 size={18}/>
                            </button>
                            <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                              <X size={18}/>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <p className="font-black text-foreground dark:text-white">₹{p.price}</p>
                          <div className="h-4 w-px bg-border"></div>
                          <p className={`text-sm font-bold ${p.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>{p.stock} {p.unit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                {products.filter(p => selectedDashboardCategory === 'All' || p.category === selectedDashboardCategory).length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-border">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No products found in this category.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" className="bg-card dark:bg-slate-800 rounded-[3rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-border dark:border-slate-700">
                <h2 className="text-xl font-black text-foreground dark:text-white">All Orders</h2>
              </div>
              <div className="divide-y divide-border dark:divide-slate-700">
                {orders.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">No orders received yet.</div>
                ) : orders.map((order) => (
                  <div key={order._id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                        <img src={order.orderItems[0].image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-black text-lg text-foreground dark:text-white">{order.orderItems[0].name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Customer: {order.consumer?.name || 'Guest'}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                          <span>Qty: <strong className="text-slate-700 dark:text-slate-200">{order.orderItems[0].qty} {order.orderItems[0].unit || 'kg'}</strong></span>
                          <span>Time: <strong className="text-slate-700 dark:text-slate-200">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({new Date(order.createdAt).toLocaleDateString()})</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="font-black text-xl text-foreground dark:text-white">₹{order.totalPrice}</p>
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div key="customers" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(new Set(orders.map(o => o.consumer?._id))).filter(id => id).map(custId => {
                const order = orders.find(o => o.consumer?._id === custId);
                const customer = order?.consumer;
                if (!customer) return null;
                return (
                  <div key={custId} className="bg-card dark:bg-slate-800 p-8 rounded-[2.5rem] border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                        {customer.name?.[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-foreground dark:text-white">{customer.name}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase">{customer.city}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Orders</span>
                        <span className="font-black text-foreground dark:text-white">{orders.filter(o => o.consumer?._id === custId).length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-border">
                   <Users size={48} className="mx-auto text-slate-300 mb-4" />
                   <p className="text-slate-500 font-bold">No customers yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div key="payments" className="max-w-2xl mx-auto bg-card dark:bg-slate-800 p-12 rounded-[3rem] border border-border shadow-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="p-5 bg-primary/10 text-primary rounded-[2rem]">
                  <CreditCard size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground dark:text-white">Payment Settings</h3>
                  <p className="text-slate-500 text-sm">Update your withdrawal details</p>
                </div>
              </div>
              
              <form onSubmit={handleUpdatePayment} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="UPI ID" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white"
                  value={paymentDetails.upiId}
                  onChange={e => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                />
                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20">
                  Save Changes
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card dark:bg-slate-800 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 text-slate-400">
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black text-foreground dark:text-white mb-8">{isEditing ? 'Edit Product' : 'New Product'}</h2>
              
              <form onSubmit={handleAddProduct} className="space-y-6">
                <input 
                  required
                  placeholder="Product Name" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                
                <div className="flex justify-between items-center px-2">
                  <label className="text-xs font-bold text-slate-500">Category</label>
                  <button type="button" onClick={suggestCategory} className="text-[10px] text-primary font-black uppercase">
                    {isAiCategorizing ? 'Thinking...' : '✨ AI Suggest'}
                  </button>
                </div>
                
                <select 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  {['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Organic', 'Spices'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="flex justify-between items-center px-2">
                  <label className="text-xs font-bold text-slate-500">Product Description</label>
                  <button type="button" onClick={generateDescription} className="text-[10px] text-secondary font-black uppercase">
                    {isAiCategorizing ? 'Writing...' : '✨ AI Write'}
                  </button>
                </div>
                <textarea 
                  placeholder="Tell customers about your fresh produce..." 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white min-h-[100px] text-sm"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Price (₹)</label>
                    <input required type="number" placeholder="Price" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Stock</label>
                    <input required type="number" placeholder="Stock" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Unit</label>
                    <select 
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm cursor-pointer"
                      value={newProduct.unit}
                      onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="liter">liter</option>
                      <option value="darjan">darjan</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-4 cursor-pointer hover:border-primary transition-all">
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <span className="text-xs font-bold text-slate-500">Local Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                    </label>
                    <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-border">
                      {newProduct.image ? (
                        <img src={newProduct.image} className="w-12 h-12 rounded-lg object-cover" alt="Preview" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={24} />
                      )}
                      <span className="text-[10px] font-bold text-slate-400 mt-2">Selected</span>
                    </div>
                  </div>
                  <input placeholder="Or Image URL" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20">
                  {isEditing ? 'Update Product' : 'Launch Product'}
                </button>
              </form>

              {cropperImage && (
                <ImageCropper 
                  image={cropperImage} 
                  onCropComplete={handleCropComplete} 
                  onCancel={() => setCropperImage(null)} 
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardScreen;
