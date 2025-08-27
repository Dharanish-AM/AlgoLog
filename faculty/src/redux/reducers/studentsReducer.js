const initialState = {
  students: [],
  selectedStudent: null,
  loading: false,
};

export const studentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_STUDENTS":
      return {
        ...state,
        students: action.payload,
      };
    case "ADD_STUDENT":
      return {
        ...state,
        students: [...state.students, action.payload],
      };
    case "UPDATE_STUDENT":
      const updatedStudents = state.students.map((student) =>
        student._id === action.payload._id ? action.payload : student
      );
      return {
        ...state,
        students: updatedStudents,
      };
    case "DELETE_STUDENT":
      return {
        ...state,
        students: state.students.filter(
          (student) => student._id !== action.payload
        ),
      };
    default:
      return state;
  }
};
