import axios from "axios";



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
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
      console.log("Unauthorized Request");
    }

    /*
    |--------------------------------------------------------------------------
    | SERVER ERROR
    |--------------------------------------------------------------------------
    */

    if (error.response?.status === 500) {
      console.log("Internal Server Error");
    }

    /*
    |--------------------------------------------------------------------------
    | NETWORK ERROR
    |--------------------------------------------------------------------------
    */

    if (!error.response) {
      console.log("Network Error");
    }

    return Promise.reject(error);
  }
);

export default api;