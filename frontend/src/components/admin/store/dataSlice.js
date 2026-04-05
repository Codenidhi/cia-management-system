import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_URL from "../../../config"; // already includes /api

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const unwrap = (res) => {
  const d = res.data;
  if (Array.isArray(d))       return d;
  if (Array.isArray(d?.data)) return d.data;
  if (d?.data)                return d.data;
  return d;
};

const make = (type, endpoint) => ({
  fetchAll: createAsyncThunk(`data/${type}/fetchAll`, async (_, { rejectWithValue }) => {
    try   { return unwrap(await axios.get(`${API_URL}/${endpoint}`, { headers: getHeaders() })); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }),
  add: createAsyncThunk(`data/${type}/add`, async (body, { rejectWithValue }) => {
    try   { return unwrap(await axios.post(`${API_URL}/${endpoint}`, body, { headers: getHeaders() })); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }),
  update: createAsyncThunk(`data/${type}/update`, async ({ id, data }, { rejectWithValue }) => {
    try   { return unwrap(await axios.put(`${API_URL}/${endpoint}/${id}`, data, { headers: getHeaders() })); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }),
  del: createAsyncThunk(`data/${type}/delete`, async (id, { rejectWithValue }) => {
    try   { await axios.delete(`${API_URL}/${endpoint}/${id}`, { headers: getHeaders() }); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }),
});

const dept   = make("departments",  "departments");
const prog   = make("programmes",   "programmes");
const stud   = make("students",     "students");
const fac    = make("faculty",      "faculty");
const course = make("courses",      "courses");
const cia    = make("cia",          "cia-components");
const marks  = make("marks",        "cia-marks");

export const fetchAllData = createAsyncThunk("data/fetchAll", async (_, { dispatch }) => {
  await Promise.allSettled([
    dispatch(dept.fetchAll()),   dispatch(prog.fetchAll()),
    dispatch(stud.fetchAll()),   dispatch(fac.fetchAll()),
    dispatch(course.fetchAll()), dispatch(cia.fetchAll()),
    dispatch(marks.fetchAll()),
  ]);
});

export const addDepartment    = dept.add;
export const updateDepartment = dept.update;
export const deleteDepartment = dept.del;
export const addProgramme     = prog.add;
export const updateProgramme  = prog.update;
export const deleteProgramme  = prog.del;
export const addStudent       = stud.add;
export const deleteStudent    = stud.del;
export const addFaculty       = fac.add;
export const deleteFaculty    = fac.del;
export const addCourse        = course.add;
export const deleteCourse     = course.del;
export const addCIAComponent    = cia.add;
export const updateCIAComponent = cia.update;
export const deleteCIAComponent = cia.del;
export const addMarks    = marks.add;
export const updateMarks = marks.update;

const dataSlice = createSlice({
  name: "data",
  initialState: {
    departments: [], programmes: [], students: [],
    faculty: [], courses: [], ciaComponents: [],
    marks: [], loading: false, error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAllData.pending,   (s) => { s.loading = true;  s.error = null; });
    builder.addCase(fetchAllData.fulfilled, (s) => { s.loading = false; });
    builder.addCase(fetchAllData.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    builder.addCase(dept.fetchAll.fulfilled, (s, a) => { s.departments = a.payload || []; });
    builder.addCase(dept.add.fulfilled,      (s, a) => { if (a.payload) s.departments.push(a.payload); });
    builder.addCase(dept.update.fulfilled,   (s, a) => {
      if (!a.payload) return;
      const i = s.departments.findIndex(d => d.department_id === a.payload.department_id);
      if (i !== -1) s.departments[i] = a.payload; else s.departments.push(a.payload);
    });
    builder.addCase(dept.del.fulfilled, (s, a) => { s.departments = s.departments.filter(d => d.department_id !== a.payload); });

    builder.addCase(prog.fetchAll.fulfilled, (s, a) => { s.programmes = a.payload || []; });
    builder.addCase(prog.add.fulfilled,      (s, a) => { if (a.payload) s.programmes.push(a.payload); });
    builder.addCase(prog.update.fulfilled,   (s, a) => {
      if (!a.payload) return;
      const i = s.programmes.findIndex(p => p.programme_id === a.payload.programme_id);
      if (i !== -1) s.programmes[i] = a.payload; else s.programmes.push(a.payload);
    });
    builder.addCase(prog.del.fulfilled, (s, a) => { s.programmes = s.programmes.filter(p => p.programme_id !== a.payload); });

    builder.addCase(stud.fetchAll.fulfilled, (s, a) => { s.students = a.payload || []; });
    builder.addCase(stud.add.fulfilled,      (s, a) => { if (a.payload) s.students.push(a.payload); });
    builder.addCase(stud.del.fulfilled,      (s, a) => { s.students = s.students.filter(x => x.student_id !== a.payload); });

    builder.addCase(fac.fetchAll.fulfilled, (s, a) => { s.faculty = a.payload || []; });
    builder.addCase(fac.add.fulfilled,      (s, a) => { if (a.payload) s.faculty.push(a.payload); });
    builder.addCase(fac.del.fulfilled,      (s, a) => { s.faculty = s.faculty.filter(x => x.faculty_id !== a.payload); });

    builder.addCase(course.fetchAll.fulfilled, (s, a) => { s.courses = a.payload || []; });
    builder.addCase(course.add.fulfilled,      (s, a) => { if (a.payload) s.courses.push(a.payload); });
    builder.addCase(course.del.fulfilled,      (s, a) => { s.courses = s.courses.filter(x => x.course_id !== a.payload); });

    builder.addCase(cia.fetchAll.fulfilled, (s, a) => { s.ciaComponents = a.payload || []; });
    builder.addCase(cia.add.fulfilled,      (s, a) => { if (a.payload) s.ciaComponents.push(a.payload); });
    builder.addCase(cia.update.fulfilled,   (s, a) => {
      if (!a.payload) return;
      const i = s.ciaComponents.findIndex(x => x.cia_id === a.payload.cia_id);
      if (i !== -1) s.ciaComponents[i] = a.payload; else s.ciaComponents.push(a.payload);
    });
    builder.addCase(cia.del.fulfilled, (s, a) => { s.ciaComponents = s.ciaComponents.filter(x => x.cia_id !== a.payload); });

    builder.addCase(marks.fetchAll.fulfilled, (s, a) => { s.marks = a.payload || []; });
    builder.addCase(marks.add.fulfilled,      (s, a) => { if (a.payload) s.marks.push(a.payload); });
    builder.addCase(marks.update.fulfilled,   (s, a) => {
      if (!a.payload) return;
      const i = s.marks.findIndex(x => x.marks_id === a.payload.marks_id);
      if (i !== -1) s.marks[i] = a.payload;
    });
  },
});

export default dataSlice.reducer;