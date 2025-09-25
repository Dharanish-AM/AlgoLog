const API_URL = "http://localhost:8000";
import axios from "axios";

export const getAllStudents = async (token: string, dispatch: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/students/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      // dispatch({
      //   type: "SET_ALL_STUDENTS",
      //   payload: response.data.students,
      // });
      console.log(response.data.students);
      return response.data.students;
    }
  } catch (error) {
    console.error("Error fetching all students:", error);
    throw error;
  }
};

export const getAllContests = async (token: string, dispatch: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/contests/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      // dispatch({
      //   type: "SET_ALL_CONTESTS",
      //   payload: response.data.contests,
      // });
      // console.log(response.data.contests);
      return response.data.contests;
    }
  } catch (error) {
    console.error("Error fetching all contests:", error);
    throw error;
  }
};
