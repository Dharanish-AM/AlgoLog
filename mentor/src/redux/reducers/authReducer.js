const initialState = {
  token: null,
  class: null,
  isAuthenticated: false,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: action.payload.isAuthenticated,
        class: action.payload.class,
      };
    default:
      return state;
  }
};
