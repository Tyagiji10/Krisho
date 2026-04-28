import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, CreditCard } from 'lucide-react';
import { addToCart, removeFromCart, clearCartItems } from '../store/slices/cartSlice';
import axios from 'axios';
import { useState } from 'react';
import { useToast } from '../components/ToastProvider';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const toast = useToast();
  
  const [isPlacing, setIsPlacing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const deliveryFee = subtotal > 150 ? 0 : 50;

  const updateQtyHandler = (item, qty) => {
    if (qty > 0 && qty <= item.countInStock) {
      dispatch(addToCart({ ...item, qty }));
    }
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = async () => {
    if (!userInfo) {
      navigate('/login?redirect=/cart');
      return;
    }

    setIsPlacing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // Calculate splits per supplier
      const splitsMap = {};
      cartItems.forEach(item => {
        const supplierId = typeof item.supplier === 'object' ? item.supplier._id : item.supplier;
        if (!splitsMap[supplierId]) splitsMap[supplierId] = 0;
        splitsMap[supplierId] += (item.qty * item.price);
      });
      const splits = Object.keys(splitsMap).map(supplierId => ({
        supplierId,
        amount: splitsMap[supplierId]
      }));

      // 1. Create Razorpay Order
      const { data: paymentOrder } = await axios.post('/api/payment/create-order', {
        amount: subtotal + deliveryFee,
        splits
      }, config);

      if (paymentOrder.mock) {
        toast.error('Real Razorpay API Keys are required in your backend .env to display the Checkout Pop-up.');
        setIsPlacing(false);
        return;
      }

      // Fetch the public key from the backend config endpoint
      const { data: clientId } = await axios.get('/api/payment/config', config);

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: clientId,
        amount: (subtotal + deliveryFee) * 100,
        currency: "INR",
        name: "Krisho Marketplace",
        description: "Secure Agri-Checkout",
        order_id: paymentOrder.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, config);

            // 4. Place Order
            const orderData = {
              orderItems: cartItems,
              shippingAddress: {
                city: userInfo.city,
                state: userInfo.state,
                address: userInfo.customAddress || 'Default registered address',
              },
              paymentMethod: 'Razorpay',
              itemsPrice: subtotal,
              taxPrice: 0,
              shippingPrice: deliveryFee,
              totalPrice: subtotal + deliveryFee,
            };

            await axios.post('/api/orders', orderData, config);
            dispatch(clearCartItems());
            toast.success('Payment Successful! Order placed securely. 💳');
            navigate('/orders');
          } catch (verificationError) {
            toast.error('Payment Verification Failed!');
            setIsPlacing(false);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        theme: {
          color: "#22c55e" // Tailwind primary green
        },
        modal: {
          ondismiss: function() {
            setIsPlacing(false);
            toast.error('Payment cancelled by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error(response.error.description || 'Payment Failed');
        setIsPlacing(false);
      });
      rzp.open();
    } catch (error) {
      toast.error('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-8">
      <header>
        <h1 className="text-2xl md:text-4xl font-black text-foreground dark:text-white">Your Cart <span className="text-primary">.</span></h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Check your items and proceed to secure checkout</p>
      </header>

      {cartItems.length === 0 ? (
        <div className="bg-card dark:bg-slate-800 p-12 md:p-20 rounded-[2rem] md:rounded-[3rem] border border-dashed border-border text-center space-y-6">
          <div className="bg-primary/10 w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto text-primary">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground dark:text-white">Your cart is empty</h2>
          <Link to="/marketplace" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm">
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item.product} className="bg-card dark:bg-slate-800 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-border flex flex-col sm:flex-row items-center gap-4 md:gap-6 group hover:border-primary transition-all">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={item.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-sm md:text-xl font-black text-foreground dark:text-white">{item.name}</h3>
                  <p className="text-slate-500 text-[10px] md:text-sm font-bold">₹{item.price} / {item.unit || 'unit'}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
                      <button onClick={() => updateQtyHandler(item, item.qty - 1)} className="p-1.5 hover:text-primary"><Minus size={14}/></button>
                      <span className="w-8 text-center font-black dark:text-white text-xs">{item.qty}</span>
                      <button onClick={() => updateQtyHandler(item, item.qty + 1)} className="p-1.5 hover:text-primary"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeFromCartHandler(item.product)} className="text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <p className="text-lg md:text-2xl font-black text-foreground dark:text-white">₹{item.price * item.qty}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-card dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-border shadow-xl space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-xs md:text-base">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-xs md:text-base">
                  <span>Delivery {subtotal > 150 && <span className="text-primary text-[10px] uppercase ml-2 px-2 py-0.5 bg-primary/10 rounded-full">Free</span>}</span>
                  <span className={subtotal > 150 ? "line-through text-slate-300 dark:text-slate-600" : ""}>₹50</span>
                </div>
                <div className="h-px bg-border dark:bg-slate-700"></div>
                <div className="flex justify-between text-xl md:text-2xl font-black text-foreground dark:text-white">
                  <span>Total</span>
                  <span>₹{subtotal + deliveryFee}</span>
                </div>
              </div>

              {/* Dynamic Address Selection */}
              {userInfo && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-border dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-primary mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Shipping Address</p>
                        <p className="text-xs font-bold dark:text-white">{userInfo.city}, {userInfo.state}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPayment(!showPayment)} 
                      className="text-xs text-primary font-bold"
                    >
                      {showPayment ? 'Use Default' : 'Edit'}
                    </button>
                  </div>
                  
                  {showPayment && (
                    <input 
                      type="text" 
                      placeholder="Enter full custom delivery address..."
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-border dark:border-slate-700 outline-none focus:border-primary dark:text-white"
                      value={userInfo.customAddress || ''}
                      onChange={(e) => {
                        // Set local state for order processing
                        userInfo.customAddress = e.target.value;
                      }}
                    />
                  )}
                </div>
              )}

              {/* Razorpay Mock Flow */}
              <button 
                onClick={checkoutHandler}
                disabled={isPlacing}
                className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
              >
                {isPlacing ? 'Processing Payment...' : <>Proceed to Secure Checkout <ArrowRight size={16}/></>}
              </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-bold px-4 flex items-center justify-center gap-1">
              <CreditCard size={12} /> Secured by Razorpay payment integration fallback.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
