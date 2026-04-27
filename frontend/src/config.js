const API_URL = import.meta.env.MODE === 'development' 
  ? '' // Use Vite proxy in development
  : ''; // Use relative path in production (handled by vercel.json rewrites)

export default API_URL;
