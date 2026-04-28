import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { CheckCircle, Truck, ArrowRight, ShoppingBag, XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
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
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                          >
                            <RefreshCw size={14} /> Re-Order
                          </button>
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
