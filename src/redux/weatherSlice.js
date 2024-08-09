import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getGeocode, fetchWeatherData } from "../services/weatherService";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async ({ query }, thunkAPI) => {
    try {
      // Obtenir les coordonnées
      const { latitude, longitude } = await getGeocode(query);

      // Obtenir les données météo
      const weatherData = await fetchWeatherData(latitude, longitude);
      return weatherData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

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
