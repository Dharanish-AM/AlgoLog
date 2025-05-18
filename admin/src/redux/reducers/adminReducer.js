const initialState = {
  departmensts: [],
  classes: [],
  students: [],
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
    default:
      return state;
  }
};
