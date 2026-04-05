import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    alert: { show: false, message: "", type: "success" },
    activeTab: "departments",
    modal: { show: false, mode: "add", entityType: "", editData: null },
    filters: {
      departments:   { search: "", status: "All" },
      programmes:    { search: "", department: "All", status: "All" },
      students:      { search: "", programme: "All", semester: "All" },
      faculty:       { search: "", department: "All", designation: "All" },
      courses:       { search: "", programme: "All", semester: "All", faculty: "All" },
      ciaComponents: { search: "", assessmentType: "All" },
      marks:         { search: "", course: "All", ciaType: "All" },
    },
  },
  reducers: {
    showAlert(state, action) {
      state.alert = { show: true, message: action.payload.message, type: action.payload.type };
    },
    hideAlert(state) {
      state.alert.show = false;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    openAddModal(state, action) {
      state.modal = { show: true, mode: "add", entityType: action.payload, editData: null };
    },
    openEditModal(state, action) {
      state.modal = { show: true, mode: "edit", entityType: action.payload.entityType, editData: action.payload.data };
    },
    closeModal(state) {
      state.modal = { show: false, mode: "add", entityType: "", editData: null };
    },
    updateFilter(state, action) {
      const { tab, field, value } = action.payload;
      if (state.filters[tab]) {
        state.filters[tab][field] = value;
      }
    },
  },
});

export const {
  showAlert, hideAlert,
  setActiveTab,
  openAddModal, openEditModal, closeModal,
  updateFilter,
} = uiSlice.actions;

export default uiSlice.reducer;