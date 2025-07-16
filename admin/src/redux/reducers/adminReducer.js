const initialState = {
  departmensts: [],
  classes: [],
  students: [],
  currentDepartment: null,
  currentClass: null,
  currentYear: null
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
    default:
      return state;
  }
};
