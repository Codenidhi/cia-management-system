import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api";
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/students`, { headers: getHeaders() });
      return res.data.data || [];
    } catch {
      return rejectWithValue([]);
    }
  }
);

export const addStudent = createAsyncThunk(
  "students/add",
  async (studentData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/students`, studentData, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add student");
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/students/${id}`, { headers: getHeaders() });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete student");
    }
  }
);

const studentsSlice = createSlice({
  name: "students",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.loading = true; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStudents.rejected, (state) => {
        state.loading = false;
        state.list = [];
      })
      .addCase(addStudent.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
      });
  },
});

export default studentsSlice.reducer;