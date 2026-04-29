import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Home,
  User,
  PackageCheck,
  ShoppingCart,
  Menu,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNavbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  if (!userInfo) return null;

  const speak = (text) => {
    if (!window.speechSynthesis || !text) return;
    
    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
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

  const isSupplier = userInfo.role === 'supplier';

  const navItems = [
    { 
      id: '/', 
      icon: <Home size={22} strokeWidth={1.5} />, 
      label: 'Home',
      voice: isSupplier ? 'nav_guides.home_supplier' : 'nav_guides.home_consumer'
    },
    { 
      id: isSupplier ? '/dashboard?tab=products' : '/orders', 
      icon: isSupplier ? <Menu size={22} strokeWidth={1.5} /> : <PackageCheck size={22} strokeWidth={1.5} />, 
      label: isSupplier ? 'Manage Mandi' : 'Orders',
      voice: isSupplier ? 'nav_guides.mandi' : 'nav_guides.orders'
    },
    { 
      id: 'ai-chat', 
      icon: <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/30"><Sparkles size={18} /></div>, 
      label: 'AI Helper',
      isAction: true,
      voice: 'nav_guides.ai'
    },
    { 
      id: isSupplier ? '/dashboard?tab=orders' : '/cart', 
      icon: (
        <div className="relative">
          {isSupplier ? <PackageCheck size={22} strokeWidth={1.5} /> : <ShoppingCart size={22} strokeWidth={1.5} />}
          {!isSupplier && cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {cartItems.length}
            </span>
          )}
        </div>
      ), 
      label: isSupplier ? 'Incoming' : 'Cart',
      voice: isSupplier ? 'nav_guides.incoming' : 'nav_guides.cart'
    },
    { 
      id: '/profile', 
      icon: (
        <div className="relative">
          <User size={22} strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-white dark:border-slate-900"></span>
        </div>
      ), 
      label: 'You',
      voice: 'nav_guides.profile'
    },
  ];

  const handleAIChatClick = () => {
    speak(t('nav_guides.ai'));
    window.dispatchEvent(new CustomEvent('toggle-ai-chat'));
  };

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]"
    >
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => (
          item.isAction ? (
            <button
              key={item.id}
              onClick={handleAIChatClick}
              className="flex flex-col items-center gap-0.5 px-1 text-slate-500 dark:text-slate-400"
            >
              <div className="scale-90">
                {item.icon}
              </div>
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.id}
              to={item.id}
              onClick={(e) => {
                speak(t(item.voice));
                if (userInfo?.role === 'supplier' && (item.id === '/cart' || item.id === '/orders')) {
                  e.preventDefault();
                  alert('Supplier accounts are restricted from accessing purchasing workflows.');
                }
              }}
              className={`flex flex-col items-center gap-0.5 px-1 transition-all ${
                location.pathname === item.id 
                  ? 'text-slate-900 dark:text-white' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="scale-90">
                {item.icon}
              </div>
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
