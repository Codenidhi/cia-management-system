import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_URL from "../../config"; // already includes /api

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const fetchMarksByCourse = createAsyncThunk(
  "marks/fetchByCourse",
  async (courseName, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/marks?course=${encodeURIComponent(courseName)}`, { headers: getHeaders() });
      return res.data.data || [];
    } catch { return rejectWithValue([]); }
  }
);

export const fetchStudentMarks = createAsyncThunk(
  "marks/fetchStudentMarks",
  async (usn, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/marks/student/${usn}`, { headers: getHeaders() });
      return res.data.data || [];
    } catch { return rejectWithValue([]); }
  }
);

export const saveMarks = createAsyncThunk(
  "marks/save",
  async ({ course, students }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/marks`, { course, students }, { headers: getHeaders() });
      return res.data;
    } catch (err) { return rejectWithValue(err.response?.data?.message || "Save failed"); }
  }
);

const marksSlice = createSlice({
  name: "marks",
  initialState: { courseMarks: [], studentMarks: [], loading: false, saveStatus: null },
  reducers: { clearSaveStatus(state) { state.saveStatus = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarksByCourse.pending,   (s) => { s.loading = true; })
      .addCase(fetchMarksByCourse.fulfilled, (s, a) => { s.loading = false; s.courseMarks = a.payload; })
      .addCase(fetchMarksByCourse.rejected,  (s) => { s.loading = false; s.courseMarks = []; })
      .addCase(fetchStudentMarks.pending,    (s) => { s.loading = true; })
      .addCase(fetchStudentMarks.fulfilled,  (s, a) => { s.loading = false; s.studentMarks = a.payload; })
      .addCase(fetchStudentMarks.rejected,   (s) => { s.loading = false; s.studentMarks = []; })
      .addCase(saveMarks.pending,   (s) => { s.loading = true; })
      .addCase(saveMarks.fulfilled, (s) => { s.loading = false; s.saveStatus = "success"; })
      .addCase(saveMarks.rejected,  (s) => { s.loading = false; s.saveStatus = "error"; });
  },
});

export const { clearSaveStatus } = marksSlice.actions;
export default marksSlice.reducer;