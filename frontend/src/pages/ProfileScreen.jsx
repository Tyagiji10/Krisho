import { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setCredentials } from '../store/slices/authSlice';
import axios from 'axios';
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
  Globe,
  Camera,
  Star,
  X,
  Check,
  LogOut
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import '../firebase';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState(true);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete('/api/users/profile', config);
        dispatch(logout());
        window.location.href = '/';
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete account");
      }
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      setUploadingImage(true);
      
      // Client-side image compression helper
      const compressImage = (base64Str) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = base64Str;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
        });
      };

      const compressedImage = await compressImage(imageSrc);
      
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put('/api/users/profile', { profileImage: compressedImage }, config);
      dispatch(setCredentials(data));
      
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      alert(`Upload Failed: ${e.response?.data?.message || e.message}`);
      setIsCropping(false);
      setImageSrc(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveProfile = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.put('/api/users/profile', { profileImage: '' }, config);
        dispatch(setCredentials(data));
      } catch (e) {
        console.error(e);
        alert('Failed to remove image');
      }
    }
  };

  if (!userInfo) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-8 relative">
      <header>
        <h1 className="text-2xl md:text-4xl font-black text-foreground dark:text-white">{t('profile')} <span className="text-primary">.</span></h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account and app preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-border dark:border-slate-700 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/10 dark:to-secondary/10 -z-0"></div>
            
            <div className="relative z-10">
              <div className="relative inline-block group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden bg-primary flex items-center justify-center text-white text-4xl md:text-5xl font-black">
                  {userInfo.profileImage ? (
                    <img 
                      src={userInfo.profileImage} 
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <span>{userInfo.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                >
                  <Camera size={32} className="text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-lg shadow-lg pointer-events-none">
                  <Shield size={14} />
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-foreground dark:text-white mt-4 md:mt-6">{userInfo.name}</h2>
              <p className="text-primary font-bold uppercase tracking-widest text-[9px] mt-1">{userInfo.role}</p>
              
              {userInfo.profileImage && (
                <button 
                  onClick={handleRemoveProfile}
                  className="text-xs font-bold text-red-500 hover:text-red-600 mt-2 hover:underline transition-all block mx-auto"
                >
                  Remove Photo
                </button>
              )}

              {/* Supplier Rating */}
              {userInfo.role === 'supplier' && (
                <div className="flex items-center justify-center gap-1 mt-3 bg-secondary/10 w-fit mx-auto px-3 py-1.5 rounded-xl border border-secondary/20">
                  <Star size={14} className="text-secondary fill-secondary" />
                  <span className="text-sm font-black text-secondary">{userInfo.rating || 4.5}</span>
                  <span className="text-[10px] font-bold text-secondary/70 ml-1 uppercase tracking-widest">Rating</span>
                </div>
              )}
              
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

          <button onClick={() => { dispatch(logout()); window.location.href = '/login'; }} className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark active:scale-95 touch-manipulation transition-all text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-3">
            <LogOut size={18} /> Logout Session
          </button>

          <button onClick={handleDeleteAccount} className="w-full py-4 bg-red-500/10 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white active:bg-red-600 active:scale-95 touch-manipulation transition-all text-sm shadow-sm border border-red-500/20 md:py-4.5">
            Delete My Account
          </button>
        </div>
      </div>

      {/* Crop Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col h-[60vh] relative shadow-2xl border border-white/10">
            <div className="relative flex-grow bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-6 bg-card flex gap-4 justify-end border-t border-border dark:border-slate-700">
              <button 
                onClick={() => { setIsCropping(false); setImageSrc(null); }}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                disabled={uploadingImage}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSaveCrop}
                className="px-6 py-3 rounded-xl font-black text-white bg-primary hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <><Check size={18} /> Save Photo</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
