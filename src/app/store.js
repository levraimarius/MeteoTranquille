import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "../redux/weatherSlice";

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});
