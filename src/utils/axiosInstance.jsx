import axios from 'axios';

// Determine the baseURL based on environment
const baseURL = window.location.hostname === 'ocalhost'
  ? 'http://localhost:5008/api/v1'
  : 'https://backend.visiondata.live/api/v1/';

// const baseURL = "http://localhost:5008/api/v1";
// Create the Axios instance
export const VisionBase = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to include the token
// VisionBase.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Add response interceptor to handle expired JWT token
// VisionBase.interceptors.response.use(
//   (response) => response, // If response is successful, return it as is
//   (error) => {
//     if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//       console.warn("Session expired. Redirecting to login...");
      
//       // Clear storage
//       localStorage.clear();
//       sessionStorage.clear();

//       // Redirect to login
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );
