import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getGeocode, fetchWeatherData } from "../services/weatherService";

// Thunk asynchrone pour récupérer les données météo en utilisant Redux Toolkit.
export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async ({ query }, thunkAPI) => {
    try {
      const { latitude, longitude } = await getGeocode(query);
      const weatherData = await fetchWeatherData(latitude, longitude);
      return weatherData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Création d'un slice Redux pour gérer l'état de la météo.
const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    data: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default weatherSlice.reducer;
