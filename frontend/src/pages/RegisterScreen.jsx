import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { UserPlus, Mail, Lock, User, MapPin, Briefcase, AlertCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { indianStates, topCitiesByState } from '../utils/indiaData';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;

      // 2. Save user profile to backend database
      const { data } = await axios.post('/api/users', {
        name,
        email,
        password,
        firebaseUid,
        role,
        state,
        city,
      });
      dispatch(setCredentials({ ...data }));
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      let message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-border dark:border-slate-700"
      >
        <div className="text-center mb-8">
          <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 text-primary dark:text-primary-light">
            <UserPlus size={24} md:size={32} />
          </div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base mt-1">Join the digital agriculture revolution</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-start gap-2.5 border border-red-100 dark:border-red-500/20">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Role Selection - Full Width */}
          <div className="md:col-span-2 space-y-3 mb-2">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setRole('consumer')}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                  role === 'consumer' 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' 
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                <User size={18} md:size={24} />
                <span className="font-bold text-xs md:text-base">Consumer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('supplier')}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                  role === 'supplier' 
                    ? 'border-secondary bg-secondary/5 dark:bg-secondary/10 text-secondary' 
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                <Briefcase size={18} md:size={24} />
                <span className="font-bold text-xs md:text-base">Farmer</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white text-xs md:text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white text-xs md:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">State</label>
            <div className="relative">
              <select
                required
                className="w-full pl-5 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white appearance-none cursor-pointer text-xs md:text-base"
                value={state}
                onChange={(e) => { setState(e.target.value); setCity(''); }}
              >
                <option value="">Select State</option>
                {indianStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input
                list="city-list"
                required
                disabled={!state}
                placeholder="Search city..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white disabled:opacity-50 text-xs md:text-base"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <datalist id="city-list">
                {state && topCitiesByState[state]?.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white text-xs md:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Join Krisho'}
            </button>
          </div>
        </form>

        <div className="mt-6 md:mt-8 text-center text-[10px] md:text-sm text-slate-600 dark:text-slate-400">
          <p>Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in here</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterScreen;
