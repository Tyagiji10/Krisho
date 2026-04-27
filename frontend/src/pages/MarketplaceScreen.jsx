import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Wheat,
  Carrot,
  Apple,
  Milk,
  Leaf,
  Flame,
  LayoutGrid,
  List
} from 'lucide-react';

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

  const { userInfo } = useSelector((state) => state.auth);

  const categories = [
    { name: 'All Items', icon: <LayoutGrid size={20} />, key: 'all' },
    { name: 'Grains', icon: <Wheat size={20} />, key: 'grains' },
    { name: 'Vegetables', icon: <Carrot size={20} />, key: 'vegetables' },
    { name: 'Fruits', icon: <Apple size={20} />, key: 'fruits' },
    { name: 'Dairy', icon: <Milk size={20} />, key: 'dairy' },
    { name: 'Organic', icon: <Leaf size={20} />, key: 'organic' },
    { name: 'Spices', icon: <Flame size={20} />, key: 'spices' },
  ];

  useEffect(() => {
    setKeyword(keywordFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [keywordFromUrl, categoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const city = userInfo?.city || '';
        const state = userInfo?.state || '';
        const categoryParam = selectedCategory === 'All Items' ? '' : selectedCategory;
        
        const { data } = await axios.get(
          `/api/products?keyword=${keyword}&category=${categoryParam}&pageNumber=${page}&city=${city}&state=${state}`
        );
        
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, page, selectedCategory, userInfo]);

  // Force responsive view mode when embedded in the Home page
  useEffect(() => {
    if (isEmbedded) {
      const handleResize = () => {
        setViewMode(window.innerWidth < 768 ? 'list' : 'grid');
      };
      handleResize(); // Set initially
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isEmbedded]);

  return (
    <div className={`space-y-8 ${!isEmbedded ? 'px-8' : ''}`}>
      {/* Header & Search */}
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-foreground dark:text-white uppercase tracking-tighter">
              {t('marketplace')} <span className="text-primary">.</span>
            </h1>
            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {userInfo?.city 
                ? `Showing fresh produce near ${userInfo.city}, ${userInfo.state}` 
                : t('tagline')}
            </p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      )}
        
      {/* Category Tabs */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar px-6 md:px-8 scroll-smooth snap-x">
        {categories.map((cat) => (
          <button 
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
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

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card dark:bg-slate-800 rounded-[2rem] aspect-[3/4] animate-pulse border border-border dark:border-slate-700" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-card dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-border dark:border-slate-700">
          <div className="bg-primary/10 w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
             <Search size={32} md:size={48} />
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">No products found</p>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
          <button 
            onClick={() => {setKeyword(''); setSelectedCategory('All Items');}}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all text-xs md:text-base"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className={
          isEmbedded 
            ? "flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x no-scrollbar -mx-4 px-4 md:mx-0 md:px-0" 
            : (viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "flex flex-col gap-4")
        }>
          {products.map((product) => (
            <div key={product._id} className={isEmbedded ? "min-w-[260px] md:min-w-[300px] max-w-[260px] md:max-w-[300px] snap-start shrink-0 h-full" : ""}>
              <ProductCard product={product} viewMode={isEmbedded ? 'grid' : viewMode} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination / View All */}
      {isEmbedded ? (
        <div className="text-center mt-4">
          <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-sm">
            Explore All Produce <ChevronRight size={18} />
          </Link>
        </div>
      ) : pages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-8">
          <button 
            onClick={() => {setPage(page - 1); window.scrollTo(0, 0);}} 
            disabled={page === 1}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 text-foreground dark:text-white disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={20} md:size={24} />
          </button>
          <div className="flex items-center gap-1.5 font-black text-foreground dark:text-white text-xs md:text-base">
            <span className="bg-primary text-white w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center">{page}</span>
            <span className="text-slate-400">/</span>
            <span>{pages}</span>
          </div>
          <button 
            onClick={() => {setPage(page + 1); window.scrollTo(0, 0);}} 
            disabled={page === pages}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 text-foreground dark:text-white disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight size={20} md:size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketplaceScreen;

