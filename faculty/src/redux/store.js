import { configureStore } from "@reduxjs/toolkit";
import { studentsReducer } from "./reducers/studentsReducer";
import { authReducer } from "./reducers/authReducer";

const store = configureStore({
  reducer: {
    students:studentsReducer,
    auth: authReducer,
  },
});

export default store;
