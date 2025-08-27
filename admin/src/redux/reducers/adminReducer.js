const initialState = {
  departmensts: [],
  classes: [],
  students: [],
  currentDepartment: null,
  currentClass: null,
  currentYear: null,
};

export const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_DEPARTMENTS":
      return {
        ...state,
        departments: action.payload,
      };
    case "SET_CLASSES":
      return {
        ...state,
        classes: action.payload,
      };
    case "SET_STUDENTS":
      return {
        ...state,
        students: action.payload,
      };
    case "SET_CURRENT_DEPARTMENT":
      return {
        ...state,
        currentDepartment: action.payload,
      };
    case "SET_CURRENT_CLASS":
      return {
        ...state,
        currentClass: action.payload,
      };
    case "SET_CURRENT_YEAR":
      return {
        ...state,
        currentYear: action.payload,
      };
    case "UPDATE_STUDENT":
      return {
        ...state,
        students: state.students.map((student) =>
          student._id === action.payload._id ? action.payload : student
        ),
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
