import api from "./axios";



/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};



/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};



/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  console.log("Current User:", response);

  return response.data;
};



/*
|--------------------------------------------------------------------------
| LOGOUT USER
|--------------------------------------------------------------------------
*/

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};