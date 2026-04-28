const API_URL = import.meta.env.MODE === 'development' 
  ? '' // Use Vite proxy in development
  : 'https://krisho.onrender.com'; // Use Render backend in production

export default API_URL;
