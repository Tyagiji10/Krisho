import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toggleWishlistAsync } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { useToast } from '../components/ToastProvider';

const WishlistScreen = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items } = useSelector(state => state.wishlist);

  const handleRemove = (product) => {
    // If from backend, it has productId. toggleWishlistAsync expects product object with _id
    const prodToToggle = { ...product, _id: product.productId || product._id };
    dispatch(toggleWishlistAsync(prodToToggle));
    toast.info(`${product.name} removed from wishlist`);
  };

  const handleAddToCart = (product) => {
    const realId = product.productId || product._id;
    dispatch(addToCart({
      product: realId,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      countInStock: product.stock || 99,
      unit: product.unit || 'kg',
      qty: 1,
      supplier: product.supplier?._id || product.supplier,
    }));
    toast.success(`${product.name} added to cart!`);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20">
      <header className="mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-foreground dark:text-white flex items-center gap-3">
          <Heart className="text-red-500" fill="currentColor" size={28} />
          Wishlist <span className="text-primary">.</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Your saved products</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-border p-16 text-center space-y-5">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Heart size={36} className="text-red-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Your wishlist is empty</h2>
          <p className="text-sm text-slate-500">Save products you love by tapping the ❤️ icon</p>
          <Link to="/marketplace" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(product => (
            <div key={product._id} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-border dark:border-slate-700 p-4 flex gap-4 items-start hover:shadow-lg transition-all group">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                <p className="text-lg font-black text-primary mt-1">₹{product.price} <span className="text-xs text-slate-400 font-medium">/ {product.unit}</span></p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAddToCart(product)}
                    className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-black hover:opacity-90 transition-all active:scale-95">
                    Add to Cart
                  </button>
                  <button onClick={() => handleRemove(product)}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistScreen;
