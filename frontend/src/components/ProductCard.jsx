import { ShoppingCart, Star, MapPin, CheckCircle, Users, Trash2, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCart, removeFromCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { useState } from 'react';
import ChatWindow from './ChatWindow';
import ReviewModal from './ReviewModal';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const { cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  
  const isInCart = cartItems.find(x => x.product === product._id);
  const isWishlisted = wishlistItems.find(x => x._id === product._id);

  const [qty, setQty] = useState(1);

  const addToCartHandler = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      countInStock: product.stock,
      unit: product.unit || 'kg',
      qty: qty,
      supplier: product.supplier?._id || product.supplier
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const removeFromCartHandler = () => {
    dispatch(removeFromCart(product._id));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <div className={`bg-card dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-border dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group h-full flex ${viewMode === 'list' ? 'flex-row items-center gap-4 p-3' : 'flex-col'}`}>
      <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 ${viewMode === 'list' ? 'w-24 h-24 md:w-32 md:h-32 rounded-xl' : 'aspect-square'}`}>
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=400&q=80'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {viewMode !== 'list' && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-bold text-primary uppercase tracking-widest border border-white/20">
            {t(`categories.${product.category?.toLowerCase().replace(' ', '_') || 'all'}`)}
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && viewMode !== 'list' && (
          <div className="absolute top-3 right-10 bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
            {t('only_left', { count: product.stock })}
          </div>
        )}
        {/* Chat with supplier button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowChat(true); }}
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-primary hover:scale-110"
          title="Chat with Farmer"
        >
          <MessageSquare size={13} />
        </button>

        {/* Heart / Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 ${
            isWishlisted 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-red-400 hover:scale-110'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {showChat && (
          <ChatWindow 
            supplierId={product.supplier?._id || product.supplier} 
            supplierName={product.supplier?.name || 'Agri Farmer'} 
            onClose={() => setShowChat(false)} 
          />
        )}
      </div>

      <div className={`space-y-2 md:space-y-3 flex-grow flex flex-col ${viewMode === 'list' ? 'py-1' : 'p-4 md:p-6'}`}>
        <div className="flex justify-between items-start">
          <h3 className="text-sm md:text-xl font-black text-foreground dark:text-white group-hover:text-primary transition-colors leading-tight">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReviews(true); }}
            className="flex items-center gap-0.5 text-secondary font-bold shrink-0 text-xs md:text-base hover:scale-105 transition-transform"
          >
            <Star size={12} fill="currentColor" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : 'New'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] md:text-sm">
          <MapPin size={10} className="text-primary" />
          <span className="truncate">{product.city || product.supplier?.city || 'Local Farm'}</span>
          <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
          <span className="truncate">{product.state || product.supplier?.state}</span>
        </div>

        {product.salesCount > 0 && (
          <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <Users size={10} />
            {t('purchased_by', { count: product.salesCount })}
          </div>
        )}

        <div className="pt-2 mt-auto flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg md:text-2xl font-black text-foreground dark:text-white">₹{product.price}</span>
              <span className="text-slate-400 text-[10px] font-medium ml-0.5">/ {product.unit}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={qty} 
              onChange={(e) => setQty(Number(e.target.value))}
              disabled={product.stock === 0}
              className="px-2 py-2 md:py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none flex-grow min-w-0"
            >
              {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>
                  {x + 1} {product.unit}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowChat(true)}
              className="p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center min-w-[3rem] active:scale-95"
              title="Chat with Farmer"
            >
              <MessageSquare size={16} />
            </button>

            {isInCart ? (
              <button 
                onClick={removeFromCartHandler}
                className="p-2 md:p-3 rounded-lg md:rounded-xl transition-all flex items-center justify-center min-w-[3rem] bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <button 
                onClick={addToCartHandler}
                disabled={product.stock === 0}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all flex items-center justify-center min-w-[3rem] active:scale-95 ${
                  added
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                } disabled:opacity-50 disabled:grayscale`}
              >
                {added ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
              </button>
            )}
          </div>
        {showReviews && (
          <ReviewModal 
            supplierId={product.supplier?._id || product.supplier} 
            supplierName={product.supplier?.name || 'Agri Farmer'} 
            onClose={() => setShowReviews(false)} 
          />
        )}
          </div>
      </div>
    </div>
  );
};

export default ProductCard;
