import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "../redux/weatherSlice";

// Configuration du store Redux. Ici, on ajoute un reducer pour la météo.
export const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});
