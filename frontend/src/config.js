const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' 
  ? '' // Use Vite proxy in development
  : ''); // Use relative path in production

export default API_URL;
