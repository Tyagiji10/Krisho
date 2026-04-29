import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';
import HomeScreen from './pages/HomeScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import MarketplaceScreen from './pages/MarketplaceScreen';
import DashboardScreen from './pages/DashboardScreen';
import CartScreen from './pages/CartScreen';
import ProfileScreen from './pages/ProfileScreen';
import OrdersScreen from './pages/OrdersScreen';
import WishlistScreen from './pages/WishlistScreen';

import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function App() {
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark || (localStorage.getItem('darkMode') === null && systemDark)) {
      document.documentElement.classList.add('dark');
      if (localStorage.getItem('darkMode') === null) {
        localStorage.setItem('darkMode', 'true');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 overflow-x-hidden relative">
      {/* Agricultural Doodle Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.15] dark:opacity-[0.25] dark:invert dark:hue-rotate-180 brightness-100 dark:brightness-[2] dark:contrast-[1.5]"
           style={{ backgroundImage: "url('/agri_doodle_pattern_1777442677675.png')", backgroundRepeat: 'repeat', backgroundSize: '500px' }}>
      </div>

      <Navbar />
      <main className={`flex-grow container mx-auto px-2 md:px-6 pb-16 md:pb-12 ${userInfo ? (userInfo.role === 'supplier' ? 'pt-[110px] md:pt-28' : 'pt-[180px] md:pt-28') : 'pt-24 md:pt-28'}`}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/marketplace" element={<MarketplaceScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/orders" element={<OrdersScreen />} />
          <Route path="/wishlist" element={<WishlistScreen />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Routes>
      </main>
      <BottomNavbar />
      <AIAssistant />
      <Footer />
    </div>
  );
}

export default App;
