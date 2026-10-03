import axios from "axios";



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10_000,
});



/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);



/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  (error) => {
    /*
    |--------------------------------------------------------------------------
    | UNAUTHORIZED
    |--------------------------------------------------------------------------
    */

    if (error.response?.status === 401) {
      console.error("Unauthorized Request");
    }

    /*
    |--------------------------------------------------------------------------
    | SERVER ERROR
    |--------------------------------------------------------------------------
    */

    if (error.response?.status >= 500) {
      console.error("Server error");
    }

    /*
    |--------------------------------------------------------------------------
    | NETWORK ERROR
    |--------------------------------------------------------------------------
    */

    if (!error.response) {
      console.error("Network error");
    }

    return Promise.reject(error);
  }
);

export default api;