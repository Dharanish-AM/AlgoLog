import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const loginClass = async (formData, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/api/class/login`, formData);
    if (response.status === 200 && response.data) {
      console.log("Login Data :", response.data)
      dispatch({
        type: "SET_USER",
        payload: {
          token: response.data.token,
          class: response.data.class,
          isAuthenticated: true,
          role:"class"
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
    const response = await axios.post(`${API_URL}/api/check-token`, {
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

export const handleGetUser = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/api/get-user`, {
      token,
    });
    if (response.status === 200) {
      console.log("GOt User: ", response.data)
      return response.data;
    } 
  } catch (error) {
    console.error("Error checking token validity:", error);
    throw error;
  }
};

export const changePassword = async (
  classId,
  oldPassword,
  newPassword,
  token
) => {
  try {
    console.log(classId, oldPassword, newPassword, token);
    const response = await axios.post(
      `${API_URL}/api/class/change-password`,
      {
        classId,
        oldPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      return response;
    }
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
