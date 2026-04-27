import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home,
  Mic,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Leaf,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  PackageCheck,
  LayoutDashboard,
  Languages,
  MapPin,
  Apple,
  Wheat,
  Carrot,
  Milk,
  Bell,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { logout } from '../store/slices/authSlice';
import LocationModal from './LocationModal';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const suggestionRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const { data } = await axios.get(`/api/products?keyword=${searchQuery}`);
          setSuggestions(data.products.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions', error);
        }
      };
      const delayDebounceFn = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
  };

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('darkMode', newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?keyword=${searchQuery}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const startListening = () => {
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    setRecognitionInstance(recognition);
    
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : (i18n.language === 'mr' ? 'mr-IN' : 'en-IN');
    recognition.interimResults = true;
    recognition.continuous = true; // Use continuous for better "real-time" feeling

    recognition.onstart = () => {
      setIsListening(true);
      setSearchQuery('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = (finalTranscript || interimTranscript).replace(/\./g, '').trim();
      if (currentTranscript) {
        setSearchQuery(currentTranscript);
      }

      // If we have a final result, we set a small timeout to auto-search 
      if (finalTranscript.trim()) {
        const sanitized = finalTranscript.replace(/\./g, '').trim();
        const timeoutId = setTimeout(() => {
          navigate(`/marketplace?keyword=${sanitized}`);
          setShowSuggestions(false);
          setSearchQuery('');
          recognition.stop();
        }, 800);
        return () => clearTimeout(timeoutId);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' }
  ];

  return (
    <>
      <nav className={`sticky top-0 z-[60] w-full transition-all duration-300 border-b border-border/40 backdrop-blur-md ${isDark ? 'bg-slate-900/90' : 'bg-gradient-to-b from-[#F0FFF4] to-white/90'}`}>
        <div className="container mx-auto px-4 md:px-8">
          {/* Main Desktop Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center py-3 md:py-5 gap-4">
            
            {/* Logo & Delivery Info */}
            <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8 shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary p-2 rounded-xl text-white group-hover:rotate-12 transition-all shadow-lg shadow-primary/20">
                  <Leaf size={22} />
                </div>
                <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Krisho</span>
              </Link>

              {/* Functional Delivery Bar */}
              {userInfo && (
                <button 
                  onClick={() => setShowLocationModal(true)}
                  className="hidden md:flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary transition-all group shadow-sm"
                >
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                    <MapPin size={18} />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deliver to</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                      {userInfo.city}, {userInfo.state}
                    </p>
                  </div>
                </button>
              )}

              {/* Mobile Notification & Cart */}
              {userInfo && (
                <div className="flex md:hidden items-center gap-2">
                  <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                    <Bell size={20} />
                  </button>
                  <Link to="/cart" className="relative p-2 text-slate-500">
                    <ShoppingCart size={20} />
                    {cartItems.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Functional Search Bar with Suggestions & Voice */}
            {userInfo && (
              <div className="relative flex-grow max-w-2xl mx-auto w-full order-3 md:order-none" ref={suggestionRef}>
                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-24 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium shadow-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button 
                      type="button" 
                      onClick={startListening} 
                      className={`p-2 rounded-xl transition-all ${
                        isListening 
                          ? 'bg-primary text-white animate-pulse shadow-lg shadow-primary/40' 
                          : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <Mic size={18} className={isListening ? 'animate-bounce' : ''} />
                    </button>
                    <button 
                      type="submit"
                      className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[70] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                      {suggestions.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            navigate(`/marketplace?keyword=${p.name}`);
                            setSearchQuery(p.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-left"
                        >
                          <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-400">
                            <TrendingUp size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{p.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{p.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Home Icon */}
              {userInfo && (
                <Link to="/" className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative group">
                  <Home size={20} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Home</span>
                </Link>
              )}

              {/* Dashboard Icon (Suppliers Only) */}
              {userInfo?.role === 'supplier' && (
                <Link to="/dashboard" className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative group">
                  <LayoutDashboard size={20} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Dashboard</span>
                </Link>
              )}

              {userInfo && (
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative"
                  >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  </button>
                  
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
                      <div className="p-4 border-b border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <p className="font-black text-slate-900 dark:text-white">Notifications</p>
                        <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                      </div>
                      <div className="divide-y divide-border dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                        <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                          <p className="text-sm font-bold text-foreground dark:text-white">Welcome to Krisho! 🌱</p>
                          <p className="text-xs text-slate-500 mt-1">Start exploring fresh produce from local farmers.</p>
                        </div>
                        {userInfo?.role === 'supplier' && (
                          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <p className="text-sm font-bold text-primary">System Update</p>
                            <p className="text-xs text-slate-500 mt-1">Your dashboard has been updated with new features.</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-border dark:border-slate-700 text-center">
                        <button className="text-xs font-bold text-primary hover:underline">Mark all as read</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={toggleDarkMode}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-sm"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {userInfo ? (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700 group"
                  >
                    <div className="text-right hidden lg:block">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Welcome</p>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-none truncate max-w-[80px]">{userInfo.name.split(' ')[0]}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
                      {userInfo.name.charAt(0)}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-6 border-b border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <p className="font-black text-slate-900 dark:text-white truncate">{userInfo.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userInfo.email}</p>
                      </div>
                      <div className="p-3">
                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 rounded-xl hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all font-bold text-sm">
                          <User size={18} /> Profile Settings
                        </Link>
                        <Link to="/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 rounded-xl hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all font-bold text-sm">
                          <PackageCheck size={18} /> Order History
                        </Link>
                        {userInfo?.role === 'supplier' && (
                          <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3.5 rounded-xl hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-all font-bold text-sm">
                            <LayoutDashboard size={18} /> Admin Dashboard
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-sm">
                          <LogOut size={18} /> Logout Session
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-primary text-white px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t('login')}
                </Link>
              )}
            </div>

            {/* Mobile Delivery Bar */}
            <button 
              onClick={() => setShowLocationModal(true)}
              className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl order-2"
            >
              <MapPin size={16} className="text-primary" />
              <div className="flex items-center gap-1 text-xs font-black text-slate-700 dark:text-slate-200">
                Deliver to <span className="text-primary">{userInfo?.city || 'Select Location'}</span>
                <ChevronDown size={14} className="text-slate-400 ml-auto" />
              </div>
            </button>

          </div>
        </div>
      </nav>

      <LocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
      />
    </>
  );
};

export default Navbar;

