import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Edit3,
  Printer,
  Star,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropper from '../components/ImageCropper';
import ChatWindow from '../components/ChatWindow';

const DashboardScreen = () => {
  const { t, i18n } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  useEffect(() => {
    const defaultTab = userInfo?.role === 'supplier' ? 'overview' : 'messages';
    const tab = searchParams.get('tab') || defaultTab;
    setActiveTab(tab);
  }, [searchParams, userInfo]);

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
  const [showProfitBreakdown, setShowProfitBreakdown] = useState(false);
  const [supplierReviews, setSupplierReviews] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);

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
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [userInfo, navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      let currentOrders = [];
      if (userInfo.role === 'supplier') {
        const [orderRes, productRes, reviewsRes] = await Promise.all([
          axios.get(`/api/orders/supplier`, config),
          axios.get(`/api/products?keyword=&city=${userInfo.city}`, config),
          axios.get(`/api/reviews/${userInfo._id}`, config).catch(() => ({ data: [] }))
        ]);
        
        currentOrders = Array.isArray(orderRes?.data) ? orderRes.data : [];
        const rawProducts = productRes?.data?.products || [];
        
        const myProducts = rawProducts.filter(p => {
          const pSupplierId = p.supplier?._id || p.supplier;
          return pSupplierId?.toString() === userInfo._id?.toString();
        });
        
        setOrders(currentOrders);
        setProducts(myProducts);
        setSupplierReviews(reviewsRes.data);
      } else {
        const { data: myOrders } = await axios.get('/api/orders/myorders', config);
        currentOrders = myOrders;
        setOrders(myOrders);
      }

      // Fetch conversations
      fetchConversations();

      // Get latest user info for earnings
      try {
        const userRes = await axios.get(`/api/users/profile`, config);
        setTotalEarnings(userRes.data?.totalEarnings || 0);
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
      
      // Simulation: Check for new orders
      if (currentOrders.length > 0 && activeTab === 'overview') {
        const latest = currentOrders[0];
        setNewOrderAlert(latest);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/messages/conversations', config);
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setIsConversationsLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.role === 'supplier' && activeTab === 'messages') {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000); // Poll for new chats every 5s
      return () => clearInterval(interval);
    }
  }, [userInfo, activeTab]);

  const grossEarnings = orders
    .filter(order => order.isDelivered) // Only count completed/delivered orders
    .reduce((acc, order) => {
      const supplierTotal = (order.orderItems || [])
        .filter(item => {
          const supplierId = item.supplier?._id || item.supplier;
          return supplierId?.toString() === userInfo._id?.toString();
        })
        .reduce((sum, item) => sum + (item.price * item.qty), 0);
      return acc + supplierTotal;
    }, 0);

  const netProfit = orders
    .filter(order => order.isDelivered) // Only count profit from delivered orders
    .reduce((acc, order) => {
      const supplierTotal = (order.orderItems || [])
        .filter(item => {
          const supplierId = item.supplier?._id || item.supplier;
          return supplierId?.toString() === userInfo._id?.toString();
        })
        .reduce((sum, item) => sum + (item.price * item.qty), 0);
      const platformCommission = supplierTotal * 0.08;
      const deliveryCharge = order.shippingPrice || 0;
      return acc + Math.max(0, supplierTotal - platformCommission - deliveryCharge);
    }, 0);

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt #${order._id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; color: #22c55e; letter-spacing: -1px; }
            .invoice-details { text-align: right; }
            .invoice-details strong { font-size: 20px; letter-spacing: 2px; color: #888; }
            .section { margin-bottom: 30px; }
            .section h3 { margin-bottom: 10px; color: #444; border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
            th { background: #f8fafc; font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 12px; }
            .total { text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee; }
            .total-row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 5px; font-size: 14px; color: #555; }
            .total-final { font-size: 18px; font-weight: bold; color: #000; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌱 Krisho</div>
            <div class="invoice-details">
              <strong>INVOICE</strong><br/>
              #${order._id}<br/>
              Date: ${new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div class="section">
            <h3>Shipping Details</h3>
            <p>
              <strong>${order.consumer?.name || 'Customer'}</strong><br/>
              ${order.shippingAddress?.address || 'Default Address'}<br/>
              ${order.shippingAddress?.city || userInfo.city}, ${order.shippingAddress?.state || userInfo.state}
            </p>
          </div>

          <div class="section">
            <h3>Order Items</h3>
            <table>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
              ${order.orderItems.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.qty} ${item.unit || 'kg'}</td>
                  <td>Rs. ${item.price}</td>
                  <td>Rs. ${item.price * item.qty}</td>
                </tr>
              `).join('')}
            </table>
            <div class="total">
              <div class="total-row"><span>Subtotal:</span> <span>Rs. ${order.itemsPrice}</span></div>
              <div class="total-row"><span>Delivery:</span> <span>Rs. ${order.shippingPrice}</span></div>
              <div class="total-row total-final"><span>Total Amount:</span> <span>Rs. ${order.totalPrice}</span></div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 50px; color: #94a3b8; font-size: 12px; font-weight: bold;">
            Thank you for shopping with Krisho!<br/>
            Direct from Farm to your Home.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
        await import('../firebase.js');
        const storage = getStorage();
        const imageRef = ref(storage, `products/${userInfo._id}_${Date.now()}`);
        
        const snapshot = await uploadString(imageRef, compressedImage, 'data_url');
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

  // Voice Guide: speaks how each section works when clicked
  const speakGuide = (tabId) => {
    const isEnabled = localStorage.getItem('voiceEnabled') !== 'false';
    if (!isEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const message = t(`dashboard_guides.${tabId}`);
    if (message) {
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      if (i18n.language.startsWith('hi')) {
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
  };

  const sidebarItems = userInfo?.role === 'supplier' ? [
    { id: 'overview', icon: <TrendingUp size={20}/>, label: 'Overview' },
    { id: 'products', icon: <Package size={20}/>, label: 'My Products' },
    { id: 'orders', icon: <ShoppingCart size={20}/>, label: 'Orders' },
    { id: 'messages', icon: <MessageCircle size={20}/>, label: 'Messages' },
    { id: 'reviews', icon: <Star size={20}/>, label: 'Reviews' },
    { id: 'customers', icon: <Users size={20}/>, label: 'Customers' },
    { id: 'payments', icon: <CreditCard size={20}/>, label: 'Payment Details' },
  ] : [
    { id: 'messages', icon: <MessageCircle size={20}/>, label: 'Messages' },
    { id: 'orders', icon: <ShoppingCart size={20}/>, label: 'My Orders' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 px-8">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-64 space-y-2 shrink-0">
        <div className="bg-card dark:bg-card p-4 rounded-2xl border border-border mb-6">
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
            onClick={() => { setActiveTab(item.id); speakGuide(item.id); }}
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
          <h1 className="text-2xl md:text-4xl font-black text-foreground dark:text-white capitalize">
            {activeTab === 'overview' ? 'Dashboard' : activeTab === 'products' ? 'My Mandi' : activeTab} <span className="text-primary">.</span>
          </h1>
          {activeTab === 'products' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-secondary text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20"
            >
              <PlusCircle size={18} /> Launch New Product
            </button>
          )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Gross Earnings', value: `₹${grossEarnings.toLocaleString()}`, icon: <TrendingUp size={18}/>, trend: '+12%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, icon: <TrendingUp size={18}/>, trend: 'Net', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { label: 'Active Orders', value: orders.length, icon: <ShoppingCart size={18}/>, trend: `+${orders.length > 0 ? 1 : 0}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'My Products', value: products.length, icon: <Package size={18}/>, trend: 'Stable', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-card dark:bg-card p-6 rounded-3xl border border-border shadow-sm group hover:border-primary transition-all">
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

              {/* Profit Breakdown Section */}
              <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border dark:border-slate-700 p-6 md:p-10 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Earnings Breakdown</h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Transparency on platform fees and deductions</p>
                  </div>
                  <button 
                    onClick={() => setShowProfitBreakdown(!showProfitBreakdown)}
                    className="px-6 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all text-sm"
                  >
                    {showProfitBreakdown ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {showProfitBreakdown && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-border dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Sales</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">₹{grossEarnings.toLocaleString()}</h4>
                      <p className="text-xs text-slate-500 mt-2">Total amount from all orders before any deductions.</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-500/5 p-6 rounded-3xl border border-red-100 dark:border-red-500/20">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Deductions (8%)</p>
                      <h4 className="text-2xl font-black text-red-600 dark:text-red-400">- ₹{(grossEarnings * 0.08).toLocaleString()}</h4>
                      <p className="text-xs text-red-500/70 mt-2">Krisho platform commission (8%) and delivery adjustments.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Net Payout</p>
                      <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{netProfit.toLocaleString()}</h4>
                      <p className="text-xs text-emerald-500/70 mt-2">Final amount that will be credited to your account.</p>
                    </div>
                  </motion.div>
                )}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-card dark:bg-slate-800 rounded-[3rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm h-full">
                  <div className="p-8 border-b border-border dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-black text-foreground dark:text-white">Recent Orders</h2>
                    <button onClick={() => setActiveTab('orders')} className="text-primary font-bold flex items-center gap-1 hover:underline">
                      View All <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="divide-y divide-border dark:divide-slate-700">
                    {orders.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">No orders yet.</div>
                    ) : orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={order.orderItems[0].image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="font-bold text-sm text-foreground dark:text-white">{order.orderItems[0].name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">₹{order.totalPrice}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card dark:bg-slate-800 rounded-[3rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm h-full">
                  <div className="p-8 border-b border-border dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-black text-foreground dark:text-white">Recent Chats</h2>
                    <button onClick={() => setActiveTab('messages')} className="text-primary font-bold flex items-center gap-1 hover:underline">
                      View All <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="divide-y divide-border dark:divide-slate-700">
                    {conversations.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">No messages yet.</div>
                    ) : conversations.slice(0, 3).map((conv) => (
                      <button 
                        key={conv.otherUserId}
                        onClick={() => { setActiveTab('messages'); setSelectedConversation(conv); }}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase overflow-hidden">
                            {conv.otherUserProfileImage ? <img src={conv.otherUserProfileImage} className="w-full h-full object-cover" alt="" /> : conv.otherUserName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground dark:text-white">{conv.otherUserName}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{conv.lastMessage}</p>
                          </div>
                        </div>
                        <MessageCircle size={14} className="text-primary opacity-50" />
                      </button>
                    ))}
                  </div>
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
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                        <button 
                          onClick={() => handlePrintOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-primary hover:text-white transition-colors"
                        >
                          <Printer size={12} /> Print Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div key="reviews" className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <h2 className="text-xl font-black text-foreground dark:text-white">Customer Feedback</h2>
                    <p className="text-sm text-slate-500 mt-1">What buyers are saying about your service</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-border">
                    <Star className="text-secondary" fill="currentColor" size={20} />
                    <span className="text-lg font-black text-slate-900 dark:text-white">{userInfo.rating ? Number(userInfo.rating).toFixed(1) : '0.0'}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                  </div>
                </div>
                <div className="divide-y divide-border dark:divide-slate-700">
                  {supplierReviews.length === 0 ? (
                    <div className="p-20 text-center text-slate-400">
                      <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={24} />
                      </div>
                      <p className="font-bold">No reviews yet.</p>
                      <p className="text-xs">Deliver quality products to earn your first rating!</p>
                    </div>
                  ) : supplierReviews.map((review) => (
                    <div key={review._id} className="p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black shrink-0">
                          {review.consumerName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-slate-900 dark:text-white">{review.consumerName}</h4>
                            <div className="flex items-center gap-0.5 text-secondary">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{review.comment}"</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-bold whitespace-nowrap">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
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

          {activeTab === 'messages' && (
            <motion.div key="messages" className="bg-card dark:bg-slate-800 rounded-[3rem] border border-border overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-black text-foreground dark:text-white">Customer Messages</h2>
                <button onClick={fetchConversations} className="text-xs font-bold text-primary hover:underline">Refresh</button>
              </div>
              <div className="divide-y divide-border">
                {isConversationsLoading ? (
                  <div className="p-20 text-center text-slate-400">Loading chats...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">No active conversations found.</div>
                ) : conversations.map((conv) => (
                  <button 
                    key={conv.otherUserId} 
                    onClick={() => setSelectedConversation(conv)}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase overflow-hidden">
                        {conv.otherUserProfileImage ? (
                          <img src={conv.otherUserProfileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          conv.otherUserName?.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">{conv.otherUserName}</h4>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{conv.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                      <MessageCircle size={16} className="text-primary mt-1 inline-block" />
                    </div>
                  </button>
                ))}
              </div>

              {selectedConversation && (
                <ChatWindow 
                  supplierId={selectedConversation.otherUserId}
                  supplierName={selectedConversation.otherUserName}
                  onClose={() => setSelectedConversation(null)}
                />
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
