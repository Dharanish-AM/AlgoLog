import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getDepartments = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/get-departments`);
    dispatch({
      type: "SET_DEPARTMENTS",
      payload: response.data.departments,
    });
  } catch (error) {
    throw error.response.data;
  }
};

export const getClasses = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/get-classes`);
    dispatch({
      type: "SET_CLASSES",
      payload: response.data.classes,
    });
  } catch (error) {
    throw error.response.data;
  }
};

export const addDepartment = async (token, departmentName, dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/department/create`,
      {
        name: departmentName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    getDepartments(token, dispatch);
    return response;
  } catch (error) {
    throw error.response.data;
  }
};

export const addClass = async (token, formData, dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/class/register`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    getClasses(token, dispatch);
    return response;
  } catch (error) {
    throw error.response.data;
  }
};

export const editStudent = async (id, updatedData, token, dispatch) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/students/${id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      const updatedStudent = response.data.student;
      dispatch({
        type: "UPDATE_STUDENT",
        payload: updatedStudent,
      });
      return {
        status: response.status,
        student: updatedStudent,
      };
    }
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};