import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  History, 
  CreditCard, 
  MapPin,
  PlusCircle,
  LayoutDashboard,
  ShoppingCart,
  User,
  Package,
  X,
  Upload,
  Edit3,
  Image as ImageIcon,
  ChevronRight,
  AlertTriangle,
  Star,
  MessageCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import MarketplaceScreen from './MarketplaceScreen';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../components/ConfirmModal';
import { SkeletonStatGrid } from '../components/Skeletons';
import RevenueChart from '../components/RevenueChart';

const SupplierPortal = ({ user }) => {
  const { t, i18n } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const toast = useToast();
  const { confirm, ConfirmModalUI } = useConfirm();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAiCategorizing, setIsAiCategorizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(user?.totalEarnings || 0);
  const [selectedDashboardCategory, setSelectedDashboardCategory] = useState('All');
  const [selectedAnalyticsProduct, setSelectedAnalyticsProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: 'Grains', stock: '', unit: 'kg', description: '', image: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: user?.paymentDetails?.upiId || '',
    bankName: user?.paymentDetails?.bankName || '',
    accountNumber: user?.paymentDetails?.accountNumber || '',
    ifscCode: user?.paymentDetails?.ifscCode || ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [orderRes, productRes, reviewRes] = await Promise.all([
        axios.get(`/api/orders/supplier`, config),
        axios.get(`/api/products?keyword=&city=${userInfo.city}`, config),
        axios.get(`/api/reviews/${userInfo._id}`, config).catch(() => ({ data: [] }))
      ]);
      
      const rawProducts = productRes?.data?.products || [];
      const rawOrders = Array.isArray(orderRes?.data) ? orderRes.data : [];
      
      const myProducts = rawProducts.filter(p => 
        p.supplier?._id === userInfo._id || p.supplier === userInfo._id
      );
      
      setOrders(rawOrders);
      setProducts(myProducts);
      setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);

      try {
        const userRes = await axios.get(`/api/users/profile`, config);
        setTotalEarnings(userRes.data?.totalEarnings || 0);
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const ok = await confirm({ title: 'Remove Product', message: 'Are you sure you want to remove this item from your Mandi listing?', confirmText: 'Yes, Remove', danger: true });
    if (ok) {
      // Optimistic
      setProducts(prev => prev.filter(p => p._id !== id));
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        toast.success('Product removed from Mandi.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
        fetchDashboardData(); // rollback
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

      if (finalImageUrl.startsWith('data:image')) {
        const compressImage = (base64Str) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 400;
              const MAX_HEIGHT = 400;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
              } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
          });
        };

        const compressedImage = await compressImage(finalImageUrl);

        const { getStorage, ref, uploadString, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        const imageRef = ref(storage, `products/${userInfo._id}_${Date.now()}`);
        
        const snapshot = await uploadString(imageRef, compressedImage, 'data_url');
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const productPayload = { ...newProduct, city: userInfo.city, state: userInfo.state, images: [finalImageUrl] };

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
      toast.success(isEditing ? 'Product updated successfully!' : 'Product added to Mandi!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error saving product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/users/payment`, paymentDetails, config);
      toast.success('Payment details updated successfully!');
    } catch (error) {
      toast.error('Error updating payment details');
    }
  };

  const handleCompleteOrder = async (id) => {
    // Optimistic UI Update
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === id ? { ...order, isDelivered: true } : order
      )
    );
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${id}/complete`, {}, config);
      toast.success('Order marked as completed! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete order');
      fetchDashboardData(); // Rollback
    }
  };

  const handleDeleteOrder = async (id) => {
    const ok = await confirm({ title: 'Remove Order', message: 'This will permanently remove the order record. Continue?', confirmText: 'Remove', danger: true });
    if (ok) {
      // Optimistic UI Update
      setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/orders/${id}`, config);
        toast.success('Order removed.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove order');
        fetchDashboardData(); // Rollback
      }
    }
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
      toast.warning('Please enter product name and select a category first.');
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
  const suggestPrice = async () => {
    if (!newProduct.name) {
      toast.warning('Please enter product name first.');
      return;
    }
    setIsAiCategorizing(true);
    try {
      const { data } = await axios.post(`/api/ai/price-suggest`, {
        name: newProduct.name,
        category: newProduct.category,
        city: userInfo.city,
      });
      setNewProduct(prev => ({ 
        ...prev, 
        price: data.min || prev.price,
        unit: data.unit || prev.unit 
      }));
      toast.info(`✨ Recommended competitive price range: ₹${data.min} - ₹${data.max} per ${data.unit}. ${data.note || ''}`);
    } catch (err) {
      console.error("AI Price Suggestion failed", err);
      toast.error('Could not suggest price at this time.');
    } finally {
      setIsAiCategorizing(false);
    }
  };
  const grossEarnings = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  return (
    <>
    {ConfirmModalUI}
    <div className="space-y-10 px-4 md:px-8 pb-20 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 animate-in fade-in duration-700">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Supplier Command <span className="text-primary">Center.</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manage inventory, track payouts, and drive harvest scale.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Gross Earnings', value: `₹${grossEarnings.toLocaleString()}`, icon: <TrendingUp size={24}/>, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/30', tabId: 'payments' },
          { label: 'My Products', value: products.length, icon: <Package size={24}/>, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30', tabId: 'products' },
          { label: 'Total Orders', value: orders.length, icon: <ShoppingCart size={24}/>, gradient: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/30', tabId: 'orders' }
        ].map((stat, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveTab(stat.tabId)}
            className={`bg-gradient-to-br ${stat.gradient} p-8 rounded-[2.5rem] text-white shadow-2xl ${stat.shadow} hover:-translate-y-1 transition-all duration-300 flex justify-between items-center relative overflow-hidden group text-left`}
          >
            <div className="absolute right-[-10%] bottom-[-20%] text-white/10 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/80">{stat.label}</p>
              <h3 className="text-3xl md:text-4xl font-black mt-2">{stat.value}</h3>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              {stat.icon}
            </div>
          </button>
        ))}
      </section>

      <div className="flex justify-end">
        <button 
          onClick={() => { setIsEditing(false); setNewProduct({name:'', price:'', category:'Grains', stock:'', unit:'kg', description:'', image:''}); setShowAddModal(true); }}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 w-fit"
        >
          <PlusCircle size={18} /> Add New Produce
        </button>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
        {[
          { id: 'overview', label: 'Analytics View', icon: <TrendingUp size={28}/>, bg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
          { id: 'products', label: 'Manage Mandi', icon: <Package size={28}/>, bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
          { id: 'orders', label: 'Incoming Orders', icon: <ShoppingCart size={28}/>, bg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
          { id: 'payments', label: 'Payout Settings', icon: <CreditCard size={28}/>, bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
          { id: 'reviews', label: 'Customer Reviews', icon: <Star size={28}/>, bg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              const isEnabled = localStorage.getItem('voiceEnabled') !== 'false';
              if (window.speechSynthesis && isEnabled) {
                const voices = window.speechSynthesis.getVoices();
                window.speechSynthesis.cancel();
                const message = t(`portal_guides.${tab.id}`);
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                
                if (i18n.language === 'hi') {
                  utterance.lang = 'hi-IN';
                  const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
                  if (hiVoice) utterance.voice = hiVoice;
                } else {
                  utterance.lang = 'en-IN';
                  const enVoice = voices.find(v => v.lang.startsWith('en') && (v.lang.includes('IN') || v.name.includes('India')));
                  if (enVoice) utterance.voice = enVoice;
                }
                
                window.speechSynthesis.speak(utterance);
              }
            }}
            className={`p-6 md:p-8 rounded-[2.2rem] border flex flex-col items-center text-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${
              activeTab === tab.id 
                ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 text-white shadow-xl' 
                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-400'
            }`}
          >
            <div className={`p-4 rounded-2xl ${activeTab === tab.id ? 'bg-white/20 text-white' : tab.bg}`}>
              {tab.icon}
            </div>
            <span className="font-black text-[11px] md:text-xs uppercase tracking-widest mt-1">{tab.label}</span>
          </button>
        ))}
      </section>

      <section className="bg-white dark:bg-slate-800/30 border border-border dark:border-slate-700/50 rounded-[3rem] p-6 md:p-10 shadow-sm animate-in fade-in-50 duration-500">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Analytics & Performance</h3>

            {/* Revenue Chart */}
            <RevenueChart orders={orders} />

            {/* Low Stock Alert */}
            {products.filter(p => p.stock <= 5 && p.stock > 0).length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-black text-amber-700 dark:text-amber-400">⚠️ Low Stock Alert</p>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
                    {products.filter(p => p.stock <= 5 && p.stock > 0).map(p => `${p.name} (${p.stock} ${p.unit} left)`).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div>
              <h4 className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">Recent Orders</h4>
              <div className="divide-y divide-border dark:divide-slate-700/50">
                {orders.length === 0 ? (
                  <p className="text-center py-12 text-slate-400 text-sm">No active orders available to track.</p>
                ) : orders.slice(0, 3).map(order => (
                  <div key={order._id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{order.orderItems[0].name}</p>
                      <p className="text-xs text-slate-500">Quantity: {order.orderItems[0].qty} {order.orderItems[0].unit}</p>
                    </div>
                    <span className="font-black text-primary">₹{order.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">My Products</h3>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['All', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Organic', 'Spices'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDashboardCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                      selectedDashboardCategory === cat 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.filter(p => selectedDashboardCategory === 'All' || p.category === selectedDashboardCategory).map(p => (
                <div key={p._id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-[1.8rem] border border-slate-200 dark:border-slate-700 flex gap-4 items-center hover:border-primary transition-all group">
                  <div onClick={() => setSelectedAnalyticsProduct(p)} className="flex items-center gap-4 flex-grow cursor-pointer">
                    <img src={p.images?.[0]} className="w-16 h-16 rounded-xl object-cover" alt="" />
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{p.name}</h4>
                      <p className="text-xs font-black text-primary">₹{p.price} / {p.unit}</p>
                      <p className="text-[10px] text-slate-400">Stock: {p.stock}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProductClick(p)} className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteProduct(p._id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Incoming Orders</h3>
            <div className="divide-y divide-border dark:divide-slate-700/50">
              {orders.map(order => (
                <div key={order._id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={order.orderItems[0].image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-base">{order.orderItems[0].name}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID: #{order._id.slice(-6)}</p>
                      <p className="text-xs text-slate-400 font-bold">Qty: {order.orderItems[0].qty} {order.orderItems[0].unit}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        📅 {new Date(order.createdAt).toLocaleDateString('en-IN')} at {new Date(order.createdAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg text-slate-900 dark:text-white">₹{order.totalPrice}</span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isDelivered ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {!order.isDelivered && (
                        <button 
                          onClick={() => handleCompleteOrder(order._id)}
                          className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteOrder(order._id)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center py-12 text-slate-400">No orders placed yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="max-w-md mx-auto space-y-6 py-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">Payment Options</h3>
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <input 
                type="text" 
                placeholder="UPI ID" 
                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border outline-none dark:text-white text-sm"
                value={paymentDetails.upiId}
                onChange={e => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
              />
              <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-black tracking-wide text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity">
                Update Settings
              </button>
            </form>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Customer Reviews</h3>
            <p className="text-xs text-slate-400">See what buyers are saying about your farm produce</p>
            
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {reviews.map(review => (
                  <div key={review._id || review.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[1.8rem] border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{review.consumerName || review.name}</h4>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase">{review.item || 'Verified Purchase'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 p-12 rounded-[2rem] border border-dashed border-border text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                  <MessageCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">No reviews yet</h4>
                <p className="text-sm text-slate-500">When customers review your produce, they will appear here.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              
              <form onSubmit={handleAddProduct} className="space-y-5">
                <input 
                  required
                  placeholder="Product Name" 
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />

                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Category</label>
                  <button type="button" onClick={suggestCategory} className="text-[10px] text-primary font-black uppercase">
                    {isAiCategorizing ? 'Thinking...' : '✨ AI Suggest'}
                  </button>
                </div>
                <select 
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm cursor-pointer"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  {['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Organic', 'Spices'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Description</label>
                  <button type="button" onClick={generateDescription} className="text-[10px] text-emerald-600 font-black uppercase">
                    {isAiCategorizing ? 'Writing...' : '✨ AI Auto-Write'}
                  </button>
                </div>
                <textarea 
                  placeholder="Direct from farm quality produce..." 
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm min-h-[80px]"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />

                <div className="flex justify-between items-center px-1 mt-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Price & Stock</label>
                  <button type="button" onClick={suggestPrice} className="text-[10px] text-primary font-black uppercase">
                    {isAiCategorizing ? 'Calculating...' : '✨ AI Price Suggest'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input required type="number" placeholder="Price (₹)" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <input required type="number" placeholder="Stock" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm cursor-pointer"
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

                <div className="space-y-3 pt-2">
                  <input placeholder="Image URL (Optional)" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white text-sm" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black tracking-wide text-base shadow-xl shadow-primary/20 mt-2 hover:opacity-95 transition-opacity">
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Product Analytics Side Drawer */}
      <AnimatePresence>
        {selectedAnalyticsProduct && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnalyticsProduct(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 md:p-8 overflow-y-auto flex flex-col"
            >
              <button onClick={() => setSelectedAnalyticsProduct(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-4">Product Insights</h3>
              <p className="text-xs text-slate-400">Performance tracking for your crop listings</p>

              <div className="mt-6 flex gap-4 items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-border">
                <img src={selectedAnalyticsProduct.images?.[0]} className="w-16 h-16 rounded-xl object-cover" alt="" />
                <div>
                  <h4 className="font-black text-sm dark:text-white">{selectedAnalyticsProduct.name}</h4>
                  <p className="text-xs font-black text-primary">₹{selectedAnalyticsProduct.price} / {selectedAnalyticsProduct.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Views</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{Math.floor(Math.random() * 150) + 45}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Sold</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedAnalyticsProduct.stock < 10 ? Math.floor(Math.random() * 20) : 0}</p>
                </div>
              </div>

              <div className="mt-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-4 rounded-2xl flex-grow">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">Demand Analytics</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  We observed that buyers from neighboring states are highly interested in {selectedAnalyticsProduct.name}. Keep stock level above 10 {selectedAnalyticsProduct.unit} for priority delivery channels.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </>
  );
};

const UserPortal = ({ user }) => {
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  if (user.role === 'supplier') {
    return <SupplierPortal user={user} />;
  }

  return (
    <div className="space-y-12 px-8 md:px-0">
      {/* Quick Actions Header */}
      <section className="px-1 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">
              Hello, {capitalize(user.name.split(' ')[0])} <span className="text-primary">.</span>
            </h1>
            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin size={10} className="text-primary" /> {user.city}, {user.state}
            </p>
          </div>

        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Order History', icon: <History size={24}/>, link: user.role === 'supplier' ? '/dashboard?tab=orders' : '/orders', bg: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
            { label: 'Dashboard', icon: <LayoutDashboard size={24}/>, link: '/dashboard', bg: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', hide: user.role !== 'supplier' },
            { label: 'Messages', icon: <MessageCircle size={24}/>, link: '/dashboard?tab=messages', bg: 'from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-500/20' },
            { label: 'Cart', icon: <ShoppingCart size={24}/>, link: '/cart', bg: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/20' },
            { label: 'Profile', icon: <User size={24}/>, link: '/profile', bg: 'from-purple-500 to-pink-600', shadow: 'shadow-pink-500/20' },
          ].filter(action => !action.hide).map((action, idx) => (
            <Link 
              key={idx} 
              to={action.link}
              className={`group relative overflow-hidden bg-white dark:bg-slate-800 p-4 md:p-6 flex flex-col justify-between h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200/60 dark:border-slate-700/60 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1`}
            >
              {/* Animated Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className={`bg-gradient-to-br ${action.bg} w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg ${action.shadow}`}>
                  {action.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-inner">
                  <ArrowRight className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:-rotate-45 transition-all duration-300" size={14} />
                </div>
              </div>
              <div className="flex flex-col relative z-10 mt-auto">
                <p className="font-black text-xs md:text-sm text-slate-900 dark:text-white leading-tight uppercase tracking-widest">{action.label}</p>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold group-hover:text-primary transition-colors mt-1">Manage & View</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Merged Marketplace (Digital Mandi) */}
      <section className="pt-8 border-t border-border dark:border-slate-800 px-4 md:px-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">Digital Mandi</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Available produce in your region</p>
          </div>
        </div>
        <div className="-mx-4 md:mx-0">
          <MarketplaceScreen isEmbedded={true} key={user?._id || 'guest'} />
        </div>
      </section>
    </div>
  );
};

const LandingPage = () => (
  <div className="space-y-24">
    {/* Hero Section */}
    <section className="relative pt-8 pb-20 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8 flex flex-col items-center text-center md:items-start md:text-left"
        >
          <h1 className="text-[2.75rem] md:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white">
            Direct from <span className="text-primary italic">Farm</span> to your <span className="text-secondary">Home</span>.
          </h1>
          <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mx-auto md:mx-0">
            Krisho empowers Indian farmers by eliminating middlemen, ensuring they get the best prices while you get the freshest produce.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/login" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xl shadow-primary/30 group">
              Log In <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register" className="px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:border-primary transition-all shadow-lg">
              Sign Up
            </Link>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i} 
                  src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                  alt="Farmer"
                  className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-sm bg-slate-200 dark:bg-slate-700" 
                />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Joined by <span className="text-slate-900 dark:text-white font-bold">10,000+</span> farmers across India
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative"
        >
          <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/50 dark:border-slate-800/50">
            <img 
              src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Farmer with crops" 
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-border dark:border-slate-700">
            <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-lg text-green-600 dark:text-green-400"><TrendingUp size={24}/></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Farmer Income</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">+40% Increase</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Stats/Features Section */}
    <section id="about" className="bg-primary/5 dark:bg-primary/10 rounded-[4rem] px-6 py-12 md:p-20">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Why Choose Krisho?</h2>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">We are transforming the agricultural supply chain using technology and transparency.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck size={40} />, title: "Quality Assured", desc: "Every product is verified and sourced directly from registered farmers.", color: "text-blue-600", bg: "bg-blue-100" },
          { icon: <TrendingUp size={40} />, title: "Fair Pricing", desc: "No middlemen means better prices for farmers and savings for consumers.", color: "text-green-600", bg: "bg-green-100" },
          { icon: <Users size={40} />, title: "Community Driven", desc: "Supporting local economies and small-scale farmers across diverse regions.", color: "text-orange-600", bg: "bg-orange-100" }
        ].map((feature, idx) => (
          <motion.div key={idx} whileHover={{ y: -10 }} className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-border dark:border-slate-700 flex items-start gap-6">
            <div className={`${feature.bg} ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center shrink-0`}>
              {feature.icon}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  return userInfo ? <UserPortal user={userInfo} /> : <LandingPage />;
};

export default HomeScreen;
