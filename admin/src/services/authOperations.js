import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const  handleLogin = async (email, password, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      email,
      password,
    });
    if (response.status === 200) {
      dispatch({
        type: "SET_AUTH",
        payload: {
          token: response.data.token,
          user: response.data.admin,
          isAuthenticated: true,
        },
      });
    }
    return response;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAdminUser = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/get-admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error.response.data;
  }
};