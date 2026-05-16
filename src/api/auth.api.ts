import api from "./axios";



export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};



export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);
console.log("response", data);
  return response.data;
};



export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};