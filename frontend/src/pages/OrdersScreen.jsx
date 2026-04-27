import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Package, Clock, CheckCircle, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [userInfo]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={18} className="text-green-500" />;
      case 'Shipped': return <Truck size={18} className="text-blue-500" />;
      default: return <Clock size={18} className="text-orange-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-8">
      <header>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Order History <span className="text-primary">.</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage your recent purchases</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 md:p-20 rounded-[2rem] md:rounded-[3rem] border border-dashed border-border text-center space-y-6 shadow-sm">
          <div className="bg-primary/10 w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto text-primary">
            <ShoppingBag size={32} md:size={48} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">No orders yet</h2>
          <Link to="/marketplace" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {orders.map((order, idx) => (
            <motion.div 
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] border border-border dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 md:mb-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID: {order._id.slice(-8)}</p>
                    <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] md:text-sm font-bold ${
                    order.isDelivered ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                  }`}>
                    <div className="scale-75 md:scale-100">{getStatusIcon(order.isDelivered ? 'Delivered' : 'Processing')}</div>
                    {order.isDelivered ? 'Delivered' : 'Processing'}
                  </div>
                </div>

                <div className="space-y-3">
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

                <div className="mt-4 pt-4 md:mt-8 md:pt-8 border-t border-border dark:border-slate-700 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Total Amount</p>
                    <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">₹{order.totalPrice}</p>
                  </div>
                  <button className="w-full md:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-black hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-sm text-xs">
                    View Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;
