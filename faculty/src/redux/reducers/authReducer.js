const initialState = {
  token: null,
  class: null,
  department: null,
  isAuthenticated: false,
  role: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: action.payload.isAuthenticated,
        class: action.payload.class,
        department: action.payload.department,
        role:action.payload.role
      };
    default:
      return state;
  }
};
