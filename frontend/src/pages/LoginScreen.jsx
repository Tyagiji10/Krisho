import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import axios from 'axios';
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn, Mail, Lock, AlertCircle, User, MapPin, ChevronDown, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { indianStates, topCitiesByState } from '../utils/indiaData';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

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
      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;

      // 2. Fetch user profile from backend database
      const { data } = await axios.post('/api/users/login', { firebaseUid, email });
      dispatch(setCredentials({ ...data }));
      navigate('/');
    } catch (err) {
      let message = err.response?.data?.message || err.message || 'Failed to login. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Password reset link sent to your email!');
      setTimeout(() => setShowResetModal(false), 3000);
    } catch (err) {
      setResetError(err.message.includes('auth/user-not-found') 
        ? 'No account found with this email.' 
        : 'Failed to send reset email. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    role: 'consumer',
    state: '',
    city: ''
  });

  const googleLoginHandler = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const { data } = await axios.post('/api/users/google-login', {
        name: user.displayName,
        email: user.email,
        firebaseUid: user.uid,
        photo: user.photoURL
      });
      
      // If user info is incomplete (missing city/state), show onboarding
      if (!data.city || !data.state) {
        dispatch(setCredentials({ ...data })); // Save initial token
        setShowOnboarding(true);
      } else {
        dispatch(setCredentials({ ...data }));
        navigate('/');
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  const onboardingHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      };
      const { data } = await axios.put('/api/users/profile', onboardingData, config);
      dispatch(setCredentials({ ...data }));
      setShowOnboarding(false);
      navigate('/');
    } catch (err) {
      setError('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 px-8">
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] p-6 md:p-10 shadow-2xl border border-border dark:border-slate-700"
            >
              <div className="text-center mb-6 md:mb-8">
                <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 text-primary">
                  <User size={24} md:size={32} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Complete Your Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Just a few more details to get you started</p>
              </div>

              <form onSubmit={onboardingHandler} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">I want to join as a</label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {['consumer', 'supplier'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setOnboardingData({ ...onboardingData, role })}
                        className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all capitalize text-xs md:text-base ${
                          onboardingData.role === role 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">State</label>
                    <div className="relative">
                      <select
                        required
                        className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white appearance-none cursor-pointer text-xs md:text-base"
                        value={onboardingData.state}
                        onChange={(e) => setOnboardingData({ ...onboardingData, state: e.target.value, city: '' })}
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                      <input
                        list="city-list"
                        required
                        disabled={!onboardingData.state}
                        placeholder="Search city..."
                        className="w-full pl-10 pr-3 py-3 md:pl-12 md:pr-4 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white disabled:opacity-50 text-xs md:text-base"
                        value={onboardingData.city}
                        onChange={(e) => setOnboardingData({ ...onboardingData, city: e.target.value })}
                      />
                      <datalist id="city-list">
                        {onboardingData.state && topCitiesByState[onboardingData.state]?.map(city => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 md:py-5 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                >
                  {isLoading ? 'Saving...' : 'Enter Krisho'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showResetModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] p-6 md:p-10 shadow-2xl border border-border dark:border-slate-700 relative"
            >
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Lock size={24} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 px-4">We'll send a recovery link to your email</p>
              </div>

              {resetSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex flex-col items-center gap-3 border border-emerald-100 dark:border-emerald-500/20 text-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 size={32} />
                  <p className="text-sm font-bold">{resetSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  {resetError && (
                    <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-2.5 border border-red-100 dark:border-red-500/20">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="text-xs font-medium">{resetError}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase">Your Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                        placeholder="example@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-border dark:border-slate-700"
      >
        <div className="text-center mb-8">
          <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 text-primary dark:text-primary-light">
            <LogIn size={24} md:size={32} />
          </div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base mt-1">Login to your Krisho account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 flex items-start gap-2.5 border border-red-100 dark:border-red-500/20">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4 md:space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                placeholder="farmer@eshakti.com"
                className="w-full pl-11 pr-4 py-3 md:pl-12 md:pr-4 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-xs md:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <button 
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[10px] md:text-xs font-bold text-primary hover:underline transition-all"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 md:pl-12 md:pr-12 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white text-xs md:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>

          <div className="relative my-6 md:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-[10px] md:text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={googleLoginHandler}
            className="w-full py-3 md:py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl md:rounded-2xl font-bold text-xs md:text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
            Continue with Google
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center text-[10px] md:text-sm text-slate-600 dark:text-slate-400">
          <p>Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up for free</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
