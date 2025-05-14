import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getStudents = async (token, dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/api/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      const students = response.data.students;

      dispatch({
        type: "SET_STUDENTS",
        payload: students,
      });

      return students;
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const addStudent = async (newStudent, token, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/api/students`, newStudent, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 || response.status === 201) {
      const addedStudent = response.data.student;
      dispatch({
        type: "ADD_STUDENT",
        payload: addedStudent,
      });
      return {
        status: response.status,
        student: addedStudent,
      };
    }
  } catch (error) {
    console.error("Error adding student:", error);
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

export const refetchStudents = async (token, dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/students/refetch?date=${new Date().toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      const students = response.data.students;
      dispatch({
        type: "SET_STUDENTS",
        payload: students,
      });
      return students;
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
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
