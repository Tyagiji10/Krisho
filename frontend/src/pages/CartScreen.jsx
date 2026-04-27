import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, CreditCard } from 'lucide-react';
import { addToCart, removeFromCart, clearCartItems } from '../store/slices/cartSlice';
import axios from 'axios';
import { useState } from 'react';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  
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
      const orderData = {
        orderItems: cartItems,
        shippingAddress: {
          city: userInfo.city,
          state: userInfo.state,
          address: 'Default registered address'
        },
        paymentMethod: 'UPI / Wallet',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: deliveryFee,
        totalPrice: subtotal + deliveryFee,
      };

      await axios.post('http://localhost:5000/api/orders', orderData, config);
      dispatch(clearCartItems());
      alert('Order Placed Successfully! Supplier has been notified.');
      navigate('/dashboard'); // Supplier can see orders, or if consumer, redirect to home
    } catch (error) {
      alert('Order failed: ' + (error.response?.data?.message || error.message));
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
                {showPayment && (
                  <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-[1.5rem] border border-primary/20 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-primary text-white p-1.5 rounded-lg">
                        <CreditCard size={14} />
                      </div>
                      <h3 className="font-black text-[10px] text-foreground dark:text-white uppercase tracking-wider">Direct UPI Payment</h3>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pay directly to the farmer:</p>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-border flex justify-between items-center">
                        <span className="font-mono text-xs dark:text-white">{cartItems[0]?.supplier?.upiId || 'farmer@upi'}</span>
                        <button className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase" onClick={() => navigator.clipboard.writeText(cartItems[0]?.supplier?.upiId || 'farmer@upi')}>Copy</button>
                      </div>
                    </div>
                  </div>
                )}
                
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

              {userInfo && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-border dark:border-slate-700 flex items-start gap-2">
                  <MapPin className="text-primary mt-0.5" size={14} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Shipping to</p>
                    <p className="text-xs font-bold dark:text-white">{userInfo.city}, {userInfo.state}</p>
                  </div>
                </div>
              )}

              {showPayment ? (
                <button 
                  onClick={checkoutHandler}
                  disabled={isPlacing}
                  className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
                >
                  {isPlacing ? 'Processing...' : <>Confirm & Place Order <ArrowRight size={16}/></>}
                </button>
              ) : (
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                  Proceed to Payment <ArrowRight size={16}/>
                </button>
              )}
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-bold px-4">
              By placing order, you agree to Krisho's terms of service and direct farmer-to-consumer trade policy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
