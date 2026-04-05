import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_URL from "../../config";

// Safe parse — never crashes on "undefined" or null stored in localStorage
const safeParseUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
      const { token, user } = res.data;
      if (token) localStorage.setItem("token", token);
      if (user)  localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    safeParseUser(),
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;