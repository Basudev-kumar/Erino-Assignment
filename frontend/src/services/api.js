import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // The App component will handle this now
    }
    return Promise.reject(error);
  }
);

export default api;




















// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://erino-assignment-jch0.onrender.com/api",
// });

// // Attach token automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
