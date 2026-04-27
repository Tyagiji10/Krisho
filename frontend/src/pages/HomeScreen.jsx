import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  History, 
  CreditCard, 
  MapPin,
  PlusCircle,
  LayoutDashboard,
  ShoppingCart,
  User
} from 'lucide-react';
import { useSelector } from 'react-redux';
import MarketplaceScreen from './MarketplaceScreen';

const UserPortal = ({ user }) => {
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div className="space-y-12 px-8 md:px-0">
      {/* Quick Actions Header */}
      <section className="px-1 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">
              Hello, {capitalize(user.name.split(' ')[0])} <span className="text-primary">.</span>
            </h1>
            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin size={10} className="text-primary" /> {user.city}, {user.state}
            </p>
          </div>

        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Order History', icon: <History size={20}/>, link: user.role === 'supplier' ? '/dashboard?tab=orders' : '/orders', bg: 'bg-blue-500' },
            { label: 'Dashboard', icon: <LayoutDashboard size={20}/>, link: '/dashboard', bg: 'bg-emerald-500' },
            { label: 'Cart', icon: <ShoppingCart size={20}/>, link: '/cart', bg: 'bg-orange-500' },
            { label: 'Profile', icon: <User size={20}/>, link: '/profile', bg: 'bg-indigo-500' },
          ].map((action, idx) => (
            <Link 
              key={idx} 
              to={action.link}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 p-3 md:p-5 flex items-center gap-3 md:gap-4 rounded-[1.2rem] md:rounded-[1.8rem] border border-border dark:border-slate-700 hover:border-primary transition-all shadow-sm"
            >
              <div className={`${action.bg} w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-black/5`}>
                {action.icon}
              </div>
              <div className="flex flex-col">
                <p className="font-black text-[9px] md:text-sm text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{action.label}</p>
                <span className="text-[8px] md:text-[10px] text-slate-400 font-bold group-hover:text-primary transition-colors">View All</span>
              </div>
              <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all hidden md:block" size={14} />
            </Link>
          ))}
        </div>
      </section>

      {/* Merged Marketplace (Digital Mandi) */}
      <section className="pt-8 border-t border-border dark:border-slate-800 px-4 md:px-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">Digital Mandi</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Available produce in your region</p>
          </div>
        </div>
        <div className="-mx-4 md:mx-0">
          <MarketplaceScreen isEmbedded={true} />
        </div>
      </section>
    </div>
  );
};

const LandingPage = () => (
  <div className="space-y-24">
    {/* Hero Section */}
    <section className="relative pt-8 pb-20 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white">
            Direct from <span className="text-primary italic">Farm</span> to your <span className="text-secondary">Home</span>.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Krisho empowers Indian farmers by eliminating middlemen, ensuring they get the best prices while you get the freshest produce.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xl shadow-primary/30 group">
              Log In <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register" className="px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:border-primary transition-all shadow-lg">
              Sign Up
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i} 
                  src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                  alt="Farmer"
                  className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-sm bg-slate-200 dark:bg-slate-700" 
                />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Joined by <span className="text-slate-900 dark:text-white font-bold">10,000+</span> farmers across India
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative"
        >
          <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/50 dark:border-slate-800/50">
            <img 
              src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Farmer with crops" 
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 border border-border dark:border-slate-700">
            <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-lg text-green-600 dark:text-green-400"><TrendingUp size={24}/></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Farmer Income</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">+40% Increase</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Stats/Features Section */}
    <section id="about" className="bg-primary/5 dark:bg-primary/10 rounded-[4rem] px-8 py-12 md:p-20">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Why Choose Krisho?</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">We are transforming the agricultural supply chain using technology and transparency.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck size={32} />, title: "Quality Assured", desc: "Every product is verified and sourced directly from registered farmers.", color: "text-blue-600", bg: "bg-blue-100" },
          { icon: <TrendingUp size={32} />, title: "Fair Pricing", desc: "No middlemen means better prices for farmers and savings for consumers.", color: "text-green-600", bg: "bg-green-100" },
          { icon: <Users size={32} />, title: "Community Driven", desc: "Supporting local economies and small-scale farmers across diverse regions.", color: "text-orange-600", bg: "bg-orange-100" }
        ].map((feature, idx) => (
          <motion.div key={idx} whileHover={{ y: -10 }} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-border dark:border-slate-700">
            <div className={`${feature.bg} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  return userInfo ? <UserPortal user={userInfo} /> : <LandingPage />;
};

export default HomeScreen;
