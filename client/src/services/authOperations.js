import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const loginClass = async (formData, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/api/class/login`, formData);
    if (response.status === 200 && response.data) {
      dispatch({
        type: "SET_USER",
        payload: {
          token: response.data.token,
          class: response.data.class,
          isAuthenticated: true,
        },
      });
      localStorage.setItem("token", response.data.token);
      console.log("Class Login Success!");
      return response;
    } else {
      console.error("Login failed with status:", response.status);
      throw new Error("Login failed. Please try again.");
    }
  } catch (err) {
    console.error("Error while Login:", err);
    throw err;
  }
};

export const checkTokenValidity = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/api/class/check-token`, {
      token,
    });
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking token validity:", error);
    throw error;
  }
};

export const getClass = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/class/get-class`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return response.data.class;
    }
  } catch (error) {
    console.error("Error fetching class data:", error);
    throw error;
  }
};
