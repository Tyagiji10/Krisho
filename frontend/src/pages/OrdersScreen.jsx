import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { CheckCircle, Truck, ArrowRight, ShoppingBag, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { SkeletonOrderRow } from '../components/Skeletons';
import OrderProgressBar from '../components/OrderProgressBar';
import { addToCart } from '../store/slices/cartSlice';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../components/ConfirmModal';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmModalUI } = useConfirm();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [userInfo]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.comment) return toast.error('Please add a comment');
    setIsReviewing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('/api/reviews', {
        supplierId: selectedSupplierId,
        rating: reviewData.rating,
        comment: reviewData.comment
      }, config);
      toast.success('Thank you for your feedback! ⭐');
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCancel = async (order) => {
    const ok = await confirm({
      title: 'Cancel Order',
      message: `Cancel order #${order._id.slice(-8)}? This action cannot be undone.`,
      confirmText: 'Yes, Cancel',
      danger: true,
    });
    if (!ok) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${order._id}/cancel`, {}, config);
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, isCancelled: true } : o));
      toast.success('Order cancelled successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReorder = (order) => {
    order.orderItems.forEach(item => {
      dispatch(addToCart({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        countInStock: 999,
        unit: item.unit || 'kg',
        qty: item.qty,
        supplier: item.supplier,
      }));
    });
    toast.success('Items added to cart! 🛒');
    navigate('/cart');
  };

  const getStatusInfo = (order) => {
    if (order.isCancelled) return { label: 'Cancelled', cls: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' };
    if (order.isDelivered) return { label: 'Delivered ✓', cls: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' };
    return { label: 'Processing', cls: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' };
  };

  return (
    <>
      {ConfirmModalUI}
      
      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Rate Your Experience</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rating</label>
                  <div className="flex gap-2 mt-2">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        className={`text-2xl transition-all ${star <= reviewData.rating ? 'text-secondary scale-110' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Feedback</label>
                  <textarea 
                    required
                    placeholder="Tell us about the product quality and service..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border outline-none dark:text-white mt-2 min-h-[120px] text-sm"
                    value={reviewData.comment}
                    onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                  <button 
                    disabled={isReviewing}
                    type="submit" 
                    className="flex-grow bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:opacity-90 disabled:opacity-50"
                  >
                    {isReviewing ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-8">
        <header>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Order History <span className="text-primary">.</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage your recent purchases</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonOrderRow key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 md:p-20 rounded-[2rem] md:rounded-[3rem] border border-dashed border-border text-center space-y-6 shadow-sm">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">No orders yet</h2>
            <Link to="/marketplace" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order, idx) => {
              const status = getStatusInfo(order);
              const canCancel = !order.isDelivered && !order.isCancelled;
              return (
                <motion.div 
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="p-4 md:p-8">
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID: #{order._id.slice(-8)}</p>
                        <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Progress Bar (only if not cancelled) */}
                    {!order.isCancelled && <OrderProgressBar order={order} />}

                    {/* Items */}
                    <div className="space-y-3 mt-4">
                      {order.orderItems.map((item) => (
                        <div key={item.product} className="flex items-center gap-3">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img src={item.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs md:text-sm font-black text-slate-900 dark:text-white">{item.name}</h4>
                            <p className="text-[10px] md:text-sm text-slate-500 font-medium">{item.qty} {item.unit || 'kg'} × ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-5 border-t border-border dark:border-slate-700 flex flex-col md:flex-row justify-between items-end md:items-center gap-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Total Amount</p>
                        <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">₹{order.totalPrice}</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                        {order.isDelivered && (
                          <>
                            <button
                              onClick={() => {
                                const supplierId = order.orderItems[0]?.supplier?._id || order.orderItems[0]?.supplier;
                                if (supplierId) {
                                  setSelectedSupplierId(supplierId);
                                  setShowReviewModal(true);
                                }
                              }}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-secondary text-secondary text-xs font-black hover:bg-secondary hover:text-white transition-all active:scale-95 shadow-lg shadow-secondary/10"
                            >
                              ★ Review
                            </button>
                            <button
                              onClick={() => handleReorder(order)}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                              <RefreshCw size={14} /> Re-Order
                            </button>
                          </>
                        )}
                        <button className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-black hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95">
                          Details <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersScreen;
