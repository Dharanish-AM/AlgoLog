import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getDepartments = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/get-departments`);
    console.log(response);
    dispatch({
      type: "SET_DEPARTMENTS",
      payload: response.data.departments,
    });
    return response.data.departments;
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

export const handleDeleteStudent = async (id, token, dispatch) => {
  try {
    const response = await axios.delete(`${API_URL}/api/students/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      dispatch({
        type: "DELETE_STUDENT",
        payload: id,
      });
      return response;
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

export const refetchSingleStudent = async (studentId, token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/students/refetch/single?id=${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
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
    console.error("Error fetching single student data:", error);
    throw error;
  }
};

export const refetchStudents = async (classId, token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/students/refetch?date=${new Date().toString()}&classId=${classId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      getDepartments(classId, token, dispatch);
      getClasses(token, dispatch);
      return response;
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const refetchAllStudents = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/students/refetch/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      // Refresh data after refetch
      await getDepartments(token, dispatch);
      await getClasses(token, dispatch);
      await getAllStudents(token, dispatch);
    }

    return response;
  } catch (error) {
    console.error("Error refetching all students:", error);
    throw error;
  }
};

export const getAllStudents = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/students/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      dispatch({
        type: "SET_ALL_STUDENTS",
        payload: response.data.students,
      });
      console.log(response.data.students);
      return response.data.students;
    }
  } catch (error) {
    console.error("Error fetching all students:", error);
    throw error;
  }
};

export const getAllContests = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/contests/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      dispatch({
        type: "SET_ALL_CONTESTS",
        payload: response.data.contests,
      });
      console.log(response.data.contests);
      return response.data.contests;
    }
  } catch (error) {
    console.error("Error fetching all contests:", error);
    throw error;
  }
};
