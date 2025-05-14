const initialState = {
  token: null,
  user: null,
  isAuthenticated: true,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};
