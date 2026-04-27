import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, MapPin, Navigation, Check } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';

const LocationModal = ({ isOpen, onClose }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [city, setCity] = useState(userInfo?.city || '');
  const [state, setState] = useState(userInfo?.state || '');
  const [isSaving, setIsSaving] = useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call and update redux
    setTimeout(() => {
      const updatedUser = { ...userInfo, city, state };
      dispatch(setCredentials(updatedUser));
      setIsSaving(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Update Location</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Where should we deliver your fresh produce?</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <input 
                type="text" 
                placeholder="Enter City" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold"
              />
            </div>

            <div className="relative">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
              <select 
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="">Select State</option>
                {indianStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!city || !state || isSaving}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Check size={20} /> Update Location</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
