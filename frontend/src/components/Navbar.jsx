import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  TrendingUp,
  Camera,
  ScanLine,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { logout } from '../store/slices/authSlice';
import LocationModal from './LocationModal';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const suggestionRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const notifRefMobile = useRef(null);

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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const stored = localStorage.getItem('voiceEnabled');
    return stored === null ? true : stored === 'true';
  });
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleVoice = () => {
    const newVal = !isVoiceEnabled;
    setIsVoiceEnabled(newVal);
    localStorage.setItem('voiceEnabled', newVal);
    if (newVal) {
      speak(i18n.language.startsWith('hi') ? 'वॉयस गाइडेंस इनेबल हो गया है।' : 'Voice guidance enabled.');
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  // Pre-load voices for speech synthesis
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Voice Instruction Logic
  useEffect(() => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    let messageKey = '';
    const path = location.pathname;
    
    if (path === '/') {
      messageKey = userInfo 
        ? (userInfo.role === 'supplier' ? 'voice_guides.welcome_supplier' : 'voice_guides.welcome_consumer')
        : 'voice_guides.welcome_guest';
    } else if (path === '/login') {
      messageKey = 'voice_guides.login';
    } else if (path === '/register') {
      messageKey = 'voice_guides.register';
    } else if (path === '/marketplace') {
      messageKey = 'voice_guides.mandi';
    } else if (path === '/cart') {
      messageKey = 'voice_guides.cart';
    } else if (path === '/dashboard') {
      const tab = new URLSearchParams(location.search).get('tab');
      if (tab === 'products') {
        messageKey = 'voice_guides.manage_mandi';
      } else if (tab === 'orders') {
        messageKey = 'voice_guides.incoming_orders';
      } else {
        messageKey = 'voice_guides.dashboard';
      }
    } else if (path === '/orders') {
      messageKey = 'voice_guides.orders';
    } else if (path === '/profile') {
      messageKey = 'voice_guides.profile';
    }

    if (messageKey) {
      const message = t(messageKey);
      if (!message || message === messageKey) return; // Don't speak if translation missing
      
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      const voices = window.speechSynthesis.getVoices();
      if (i18n.language.startsWith('hi')) {
        utterance.lang = 'hi-IN';
        const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.lang = 'en-IN';
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.lang.includes('IN') || v.name.includes('India')));
        if (enVoice) utterance.voice = enVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, [location.pathname, location.search, isVoiceEnabled, userInfo, t, i18n.language]);

  const speak = (text) => {
    if (!isVoiceEnabled || !window.speechSynthesis || !text) return;
    
    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    if (i18n.language.startsWith('hi')) {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.lang.includes('IN') || v.name.includes('India')));
      if (enVoice) utterance.voice = enVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const [notifications, setNotifications] = useState([
    { id: 'welcome', title: 'Welcome to Krisho! 🌱', text: 'Start exploring fresh produce from local farmers.', type: 'welcome' }
  ]);

  useEffect(() => {
    if (userInfo?.role === 'supplier') {
      const fetchOrdersForNotifications = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get('/api/orders/supplier', config);
          
          const orderNotifs = data.map(order => ({
            id: order._id,
            title: `📦 New Order #${order._id.slice(-6)}`,
            text: `Received order for ${order.orderItems[0].name} (Qty: ${order.orderItems[0].qty} ${order.orderItems[0].unit || 'kg'}) - ₹${order.totalPrice}`,
            time: new Date(order.createdAt),
            type: 'order'
          }));

          orderNotifs.sort((a, b) => b.time - a.time);
          
          setNotifications(prev => {
            const welcome = prev.filter(n => n.type === 'welcome');
            return [...welcome, ...orderNotifs];
          });
        } catch (err) {
          console.error("Error fetching orders for notifications", err);
        }
      };

      fetchOrdersForNotifications();
      const interval = setInterval(fetchOrdersForNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

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
      if (notifRef.current && !notifRef.current.contains(event.target) && (!notifRefMobile.current || !notifRefMobile.current.contains(event.target))) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
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
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/products?keyword=${searchQuery}`);
        setSuggestions(data.products.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
    const langMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      pa: 'pa-IN'
    };
    recognition.lang = langMap[i18n.language] || 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 5;

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

      const currentTranscript = (finalTranscript || interimTranscript).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').replace(/\s+/g, ' ').trim();
      if (currentTranscript) {
        setSearchQuery(currentTranscript);
      }

      // If we have a final result, we set a small timeout to auto-search 
      if (finalTranscript.trim()) {
        const sanitized = finalTranscript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').replace(/\s+/g, ' ').trim();
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

  const NotificationDropdown = () => (
    <div className="absolute right-0 mt-4 w-80 max-w-[90vw] bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-[80]">
      <div className="p-4 border-b border-border dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
        <p className="font-black text-slate-900 dark:text-white">Notifications</p>
        <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="divide-y divide-border dark:divide-slate-700 max-h-[300px] overflow-y-auto">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
            <p className={`text-sm font-bold ${notif.type === 'order' ? 'text-primary' : 'text-foreground dark:text-white'}`}>{notif.title}</p>
            <p className="text-xs text-slate-500 mt-1">{notif.text}</p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border dark:border-slate-700 text-center">
        <button className="text-xs font-bold text-primary hover:underline">Mark all as read</button>
      </div>
    </div>
  );

  return (
    <>
      <nav className={`fixed top-0 z-[60] w-full transition-all duration-300 border-b border-border/40 backdrop-blur-md ${isDark ? 'bg-slate-900/90' : 'bg-gradient-to-b from-[#F0FFF4] to-white/90'}`}>
        <div className="container mx-auto px-2 md:px-6">
          {/* Main Desktop Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center py-3 md:py-5 gap-4">
            
            {/* Top Row for Mobile (Logo + Right Actions) / Left side for Desktop */}
            <div className="flex items-center justify-between w-full md:w-auto shrink-0 gap-4 md:gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary p-2 rounded-xl text-white group-hover:rotate-12 transition-all shadow-lg shadow-primary/20">
                  <Leaf size={22} />
                </div>
                <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Krisho</span>
              </Link>

              {/* Functional Delivery Bar (Desktop) */}
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

              {/* Mobile Only Right Actions (When Logged In) */}
              {userInfo && (
                <div className="flex md:hidden items-center gap-2">
                  <button 
                    onClick={toggleVoice}
                    className={`p-2 rounded-xl transition-all ${isVoiceEnabled ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-primary'}`}
                  >
                    {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  <button 
                    onClick={toggleDarkMode}
                    className="p-2 text-slate-500 hover:text-primary transition-colors"
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <div className="relative" ref={notifRefMobile}>
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2 text-slate-500 hover:text-primary transition-colors relative"
                    >
                      <Bell size={20} />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    {isNotificationsOpen && <NotificationDropdown />}
                  </div>
                </div>
              )}

              {/* Always Visible on Mobile (When Logged Out) or Desktop Actions */}
              {!userInfo && (
                <div className="flex md:hidden items-center gap-3">
                  <button 
                    onClick={toggleVoice}
                    className={`p-2.5 rounded-xl transition-all shadow-sm ${isVoiceEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary'}`}
                  >
                    {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  <button 
                    onClick={toggleDarkMode}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-sm"
                  >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <Link 
                    to="/login" 
                    className="bg-primary text-white px-4 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('login')}
                  </Link>
                </div>
              )}
            </div>

            {/* Functional Search Bar with Suggestions & Voice */}
            {userInfo && userInfo.role !== 'supplier' && (
              <div className="relative flex-grow max-w-2xl mx-auto w-full order-2 md:order-none" ref={suggestionRef}>
                <form onSubmit={handleSearch} className="relative group shadow-sm rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 overflow-hidden">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-300 transition-colors">
                    <Search size={22} strokeWidth={2} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search or ask a question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full bg-transparent py-3.5 pl-12 pr-[120px] outline-none transition-all text-base font-medium text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <button 
                      type="button" 
                      onClick={startListening} 
                      className={`hover:text-primary transition-all p-1.5 rounded-full ${
                        isListening 
                          ? 'text-primary bg-primary/10 animate-pulse' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Mic size={22} strokeWidth={2} className={isListening ? 'animate-bounce' : ''} />
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

            <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
              {/* Home Icon */}
              {userInfo && (
                <Link 
                  to="/" 
                  onClick={() => speak('Going to Home')}
                  className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative group"
                >
                  <Home size={20} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Home</span>
                </Link>
              )}



              {userInfo && (
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      speak('Checking your notifications');
                    }}
                    className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative"
                  >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  </button>
                  
                  {isNotificationsOpen && <NotificationDropdown />}
                </div>
              )}

              <button 
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl transition-all shadow-sm hidden md:block ${isVoiceEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary'}`}
                title="Toggle Voice Instructions"
              >
                {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <button 
                onClick={toggleDarkMode}
                className="p-2.5 bg-slate-100 dark:bg-card rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-sm"
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
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-all overflow-hidden">
                      {userInfo.profileImage ? (
                        <img src={userInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userInfo.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-card border border-border dark:border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-6 border-b border-border dark:border-slate-700 bg-slate-50 dark:bg-card">
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
            {userInfo && !isScrolled && (
              <button 
                onClick={() => setShowLocationModal(true)}
                className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-200 dark:bg-card rounded-2xl order-3 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <MapPin size={16} className="text-primary" />
                <div className="flex items-center gap-1 text-xs font-black text-slate-700 dark:text-slate-200">
                  Deliver to <span className="text-primary">{userInfo?.city || 'Select Location'}</span>
                  <ChevronDown size={14} className="text-slate-400 ml-auto" />
                </div>
              </button>
            )}

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

