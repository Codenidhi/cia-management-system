import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_URL from "../../config";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const fetchMarksByCourse = createAsyncThunk(
  "marks/fetchByCourse",
  async (courseName, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/marks?course=${encodeURIComponent(courseName)}`, {
        headers: getHeaders(),
      });
      return res.data.data || [];
    } catch {
      return rejectWithValue([]);
    }
  }
);

export const fetchStudentMarks = createAsyncThunk(
  "marks/fetchStudentMarks",
  async (usn, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/marks/student/${usn}`, { headers: getHeaders() });
      return res.data.data || [];
    } catch {
      return rejectWithValue([]);
    }
  }
);

export const saveMarks = createAsyncThunk(
  "marks/save",
  async ({ course, students }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/marks`,
        { course, students },
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Save failed");
    }
  }
);

const marksSlice = createSlice({
  name: "marks",
  initialState: {
    courseMarks: [],
    studentMarks: [],
    loading: false,
    saveStatus: null,
  },
  reducers: {
    clearSaveStatus(state) {
      state.saveStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarksByCourse.pending,   (state) => { state.loading = true; })
      .addCase(fetchMarksByCourse.fulfilled, (state, action) => { state.loading = false; state.courseMarks = action.payload; })
      .addCase(fetchMarksByCourse.rejected,  (state) => { state.loading = false; state.courseMarks = []; })
      .addCase(fetchStudentMarks.pending,    (state) => { state.loading = true; })
      .addCase(fetchStudentMarks.fulfilled,  (state, action) => { state.loading = false; state.studentMarks = action.payload; })
      .addCase(fetchStudentMarks.rejected,   (state) => { state.loading = false; state.studentMarks = []; })
      .addCase(saveMarks.pending,    (state) => { state.loading = true; })
      .addCase(saveMarks.fulfilled,  (state) => { state.loading = false; state.saveStatus = "success"; })
      .addCase(saveMarks.rejected,   (state) => { state.loading = false; state.saveStatus = "error"; });
  },
});

export const { clearSaveStatus } = marksSlice.actions;
export default marksSlice.reducer;