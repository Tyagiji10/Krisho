import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Footer from './components/Footer';
import HomeScreen from './pages/HomeScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import MarketplaceScreen from './pages/MarketplaceScreen';
import DashboardScreen from './pages/DashboardScreen';
import CartScreen from './pages/CartScreen';
import ProfileScreen from './pages/ProfileScreen';
import OrdersScreen from './pages/OrdersScreen';

import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';

import { useEffect } from 'react';

function App() {
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
    <div className="min-h-screen flex flex-col bg-background dark:bg-slate-900 transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-12 pb-24 md:pb-12">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/marketplace" element={<MarketplaceScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/orders" element={<OrdersScreen />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Routes>
      </main>
      <BottomNavbar />
      <Footer />
    </div>
  );
}

export default App;
