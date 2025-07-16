import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducers/authReducer";
import { adminReducer } from "./reducers/adminReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});
