import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  MapPin, 
  Languages, 
  Smartphone, 
  Bell, 
  Shield,
  ChevronRight,
  Globe
} from 'lucide-react';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState(true);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
  ];

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        // Implement delete API call here. Using a mock logout for now.
        dispatch(logout());
        window.location.href = '/';
      } catch (error) {
        alert("Failed to delete account");
      }
    }
  };

  if (!userInfo) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-8">
      <header>
        <h1 className="text-2xl md:text-4xl font-black text-foreground dark:text-white">{t('profile')} <span className="text-primary">.</span></h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account and app preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-border dark:border-slate-700 text-center shadow-xl">
            <div className="relative inline-block">
              <img 
                src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] object-cover border-4 border-white dark:border-slate-700 shadow-2xl"
                alt="Profile"
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-lg shadow-lg">
                <Shield size={14} />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-foreground dark:text-white mt-4 md:mt-6">{userInfo.name}</h2>
            <p className="text-primary font-bold uppercase tracking-widest text-[9px] mt-1">{userInfo.role}</p>
            
            <div className="mt-6 md:mt-8 space-y-3 text-left">
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <Mail size={16} className="shrink-0" />
                <span className="text-xs md:text-sm font-medium truncate">{userInfo.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <MapPin size={16} className="shrink-0" />
                <span className="text-xs md:text-sm font-medium">{userInfo.city}, {userInfo.state}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          {/* Language Selection */}
          <div className="bg-card dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-border dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-foreground dark:text-white">Language Settings</h3>
                <p className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-widest">Select your preferred language</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    i18n.language === lang.code
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-transparent hover:border-primary/30'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-card dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-border dark:border-slate-700 shadow-sm">
             <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-foreground dark:text-white">App Preferences</h3>
                <p className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-widest">Device-specific settings</p>
              </div>
            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <Bell className="text-slate-400" size={18} />
                  <div>
                    <p className="font-bold text-sm text-foreground dark:text-white">Push Notifications</p>
                    <p className="text-[10px] text-slate-500">Alerts for new orders/messages</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-5 rounded-full transition-all relative ${notifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleDeleteAccount} className="w-full py-4 bg-red-500/10 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white active:bg-red-600 active:scale-95 touch-manipulation transition-all text-sm shadow-sm border border-red-500/20 md:py-4.5">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
