import { configureStore } from '@reduxjs/toolkit';

// ── Old slices (used by faculty/student dashboards) ────────────────
import authReducer     from './slices/authSlice';
import marksReducer    from './slices/marksSlice';
import studentsReducer from './slices/studentsSlice';

// ── New admin slices ───────────────────────────────────────────────
import dataReducer from '../components/admin/store/dataSlice';
import uiReducer   from '../components/admin/store/uiSlice';

const store = configureStore({
  reducer: {
    auth:     authReducer,
    marks:    marksReducer,
    students: studentsReducer,
    data:     dataReducer,
    ui:       uiReducer,
  },
});

export default store;