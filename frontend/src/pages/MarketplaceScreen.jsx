import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { 
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Wheat, Carrot, Apple, Milk, Leaf, Flame, LayoutGrid, List,
  X, ChevronDown, ArrowUpDown, RefreshCw
} from 'lucide-react';
import { SkeletonProductCard } from '../components/Skeletons';

const SORT_OPTIONS = [
  { label: '🧠 Smart (Nearby First)', value: 'smart' },
  { label: '₹ Price: Low to High',   value: 'price_asc' },
  { label: '₹ Price: High to Low',   value: 'price_desc' },
  { label: '🆕 Newest First',        value: 'newest' },
  { label: '⭐ Top Rated',           value: 'rating' },
];

const MarketplaceScreen = ({ isEmbedded = false }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get('keyword') || '';
  const categoryFromUrl = searchParams.get('category') || 'All Items';
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'list' : 'grid');

  // Filter state
  const [sortBy, setSortBy] = useState('smart');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Pull-to-refresh
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);

  const categories = [
    { name: 'All Items', icon: <LayoutGrid size={20} />, key: 'all' },
    { name: 'Grains',     icon: <Wheat size={20} />,     key: 'grains' },
    { name: 'Vegetables', icon: <Carrot size={20} />,    key: 'vegetables' },
    { name: 'Fruits',     icon: <Apple size={20} />,     key: 'fruits' },
    { name: 'Dairy',      icon: <Milk size={20} />,      key: 'dairy' },
    { name: 'Organic',    icon: <Leaf size={20} />,      key: 'organic' },
    { name: 'Spices',     icon: <Flame size={20} />,     key: 'spices' },
  ];

  useEffect(() => { setKeyword(keywordFromUrl); setSelectedCategory(categoryFromUrl); }, [keywordFromUrl, categoryFromUrl]);

  const fetchProducts = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const city = userInfo?.city || '';
      const state = userInfo?.state || '';
      const categoryParam = selectedCategory === 'All Items' ? '' : selectedCategory;
      const params = new URLSearchParams({
        keyword, category: categoryParam,
        pageNumber: page, city, state, sortBy,
        ...(minPrice ? { minPrice } : {}),
        ...(maxPrice ? { maxPrice } : {}),
      });
      const { data } = await axios.get(`/api/products?${params}`);
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);

      // Build active filter chips
      const chips = [];
      if (sortBy !== 'smart') chips.push({ label: SORT_OPTIONS.find(s => s.value === sortBy)?.label, key: 'sort' });
      if (minPrice) chips.push({ label: `Min ₹${minPrice}`, key: 'min' });
      if (maxPrice) chips.push({ label: `Max ₹${maxPrice}`, key: 'max' });
      setActiveFilters(chips);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, page, selectedCategory, userInfo, sortBy, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Force responsive view mode when embedded
  useEffect(() => {
    if (isEmbedded) {
      const handleResize = () => setViewMode(window.innerWidth < 768 ? 'list' : 'grid');
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isEmbedded]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0 && containerRef.current?.scrollTop === 0) {
      setPullY(Math.min(dy, 80));
    }
  };
  const handleTouchEnd = () => {
    if (pullY >= 60) { setIsPulling(true); fetchProducts(false).finally(() => setIsPulling(false)); }
    setPullY(0);
  };

  const removeFilter = (key) => {
    if (key === 'sort') setSortBy('smart');
    if (key === 'min') setMinPrice('');
    if (key === 'max') setMaxPrice('');
  };

  const applyFilters = () => {
    setPage(1);
    setShowFilterSheet(false);
  };

  return (
    <div
      ref={containerRef}
      className="space-y-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(pullY > 0 || isPulling) && (
        <div className="flex items-center justify-center gap-2 text-primary text-sm font-bold py-2 transition-all"
          style={{ height: pullY || 40, opacity: Math.min(pullY / 60, 1) }}>
          <RefreshCw size={16} className={isPulling ? 'animate-spin' : ''} />
          {isPulling ? 'Refreshing...' : pullY >= 60 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}

      {/* Category Filter Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
        {categories.map((cat) => (
          <button 
            key={cat.name}
            onClick={() => { setSelectedCategory(cat.name); setPage(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap font-black text-[10px] md:text-xs uppercase tracking-widest transition-all snap-start border ${
              selectedCategory === cat.name 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/50'
            }`}
          >
            <div className="scale-75 md:scale-100">{cat.icon}</div>
            {t(`categories.${cat.key}`)}
          </button>
        ))}
      </div>

      {/* Toolbar: Sort + Filter + View toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort dropdown (desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
          <ArrowUpDown size={14} className="text-primary" />
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="text-xs font-bold bg-transparent outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilterSheet(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all ${
            activeFilters.length > 0
              ? 'bg-primary text-white border-primary'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters {activeFilters.length > 0 && <span className="bg-white/30 rounded-full px-1.5 py-0.5 text-[10px]">{activeFilters.length}</span>}
        </button>

        {/* Active filter chips */}
        {activeFilters.map(f => (
          <span key={f.key} className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-primary/20">
            {f.label}
            <button onClick={() => removeFilter(f.key)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
          </span>
        ))}

        {/* View Toggle (desktop only) */}
        {!isEmbedded && (
          <div className="hidden md:flex ml-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {['grid', 'list'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-xs font-bold transition-all ${viewMode === mode ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                {mode === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-card dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-border dark:border-slate-700">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
            <Search size={32} />
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">No products found</p>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 md:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} viewMode={viewMode} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-3 rounded-xl border border-border bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:border-primary transition-all">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-black text-foreground dark:text-white">Page {page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-3 rounded-xl border border-border bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:border-primary transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Filter Bottom Sheet (Mobile + Desktop overlay) */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-[9990] flex flex-col justify-end md:justify-center md:items-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowFilterSheet(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 w-full md:max-w-md shadow-2xl border border-border dark:border-slate-700 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Filter & Sort</h2>
              <button onClick={() => setShowFilterSheet(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>

            {/* Sort options (also in sheet for mobile) */}
            <div className="mb-5">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sort By</p>
              <div className="grid grid-cols-1 gap-2">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setSortBy(o.value)}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border ${sortBy === o.value ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/50'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Price Range (₹)</p>
              <div className="flex items-center gap-3">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none focus:border-primary dark:text-white" />
                <span className="text-slate-400 font-bold">–</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold outline-none focus:border-primary dark:text-white" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setSortBy('smart'); setMinPrice(''); setMaxPrice(''); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Reset
              </button>
              <button onClick={applyFilters}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceScreen;
