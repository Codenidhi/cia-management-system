import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector }       from 'react-redux';
import { X, Loader, Search, Pencil, Download } from 'lucide-react';
import { CheckCircle, XCircle, Users, TrendingUp, AlertTriangle } from 'lucide-react';

import {
  fetchAllData,
  addDepartment, updateDepartment, deleteDepartment,
  addProgramme,  updateProgramme,  deleteProgramme,
  addStudent,    deleteStudent,
  addFaculty,    deleteFaculty,
  addCourse,     deleteCourse,
  addCIAComponent, updateCIAComponent, deleteCIAComponent,
  updateMarks,
} from './store/dataSlice';

import {
  showAlert, hideAlert,
  setActiveTab,
  openAddModal, openEditModal, closeModal,
  updateFilter,
} from './store/uiSlice';

import './AdminDashboard.css';
import './CIAResults.css';

const sl = (v) => (v == null ? '' : String(v)).toLowerCase();

let alertTimer = null;
const useAutoAlert = (dispatch) => {
  return useCallback((message, type) => {
    clearTimeout(alertTimer);
    dispatch(showAlert({ message, type }));
    alertTimer = setTimeout(() => dispatch(hideAlert()), 3000);
  }, [dispatch]);
};

// ═══════════════════════════════════════════════════════
//  CIA REPORTS TAB
// ═══════════════════════════════════════════════════════
const CIAReportsContent = () => {
  const marks   = useSelector((s) => s.data.marks);
  const loading = useSelector((s) => s.data.loading);

  const [selectedCourse, setSelectedCourse] = React.useState('All');
  const [selectedCIA,    setSelectedCIA]    = React.useState('All');
  const [passPercentage, setPassPercentage] = React.useState(40);
  const [activeView,     setActiveView]     = React.useState('both');

  const filtered = marks.filter(m =>
    (selectedCourse === 'All' || m.course_name === selectedCourse) &&
    (selectedCIA    === 'All' || m.cia_type    === selectedCIA)
  );
  const passed   = filtered.filter(m => m.max_marks > 0 && (m.marks_obtained / m.max_marks) * 100 >= passPercentage);
  const failed   = filtered.filter(m => m.max_marks > 0 && (m.marks_obtained / m.max_marks) * 100 <  passPercentage);
  const passRate = filtered.length > 0 ? Math.round((passed.length / filtered.length) * 100) : 0;

  const uniqueCourses = [...new Set(marks.map(m => m.course_name).filter(Boolean))];
  const uniqueCIAs    = [...new Set(marks.map(m => m.cia_type).filter(Boolean))];

  const openPDF = (subset, title, color) => {
    const filterNote = [
      selectedCourse !== 'All' ? `Course: ${selectedCourse}` : '',
      selectedCIA    !== 'All' ? `CIA: ${selectedCIA}`       : '',
    ].filter(Boolean).join(' | ') || 'All';

    const rows = subset.map((m, i) => {
      const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100).toFixed(1) : '0.0';
      const ok  = parseFloat(pct) >= passPercentage;
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:9px 14px;border:1px solid #ddd;text-align:center">${i + 1}</td>
        <td style="padding:9px 14px;border:1px solid #ddd;font-family:monospace">${m.usn || '-'}</td>
        <td style="padding:9px 14px;border:1px solid #ddd;font-weight:600">${m.student_name || '-'}</td>
        <td style="padding:9px 14px;border:1px solid #ddd">${m.course_name || '-'}</td>
        <td style="padding:9px 14px;border:1px solid #ddd">${m.cia_type || '-'}</td>
        <td style="padding:9px 14px;border:1px solid #ddd;text-align:center;font-weight:700">${m.marks_obtained}</td>
        <td style="padding:9px 14px;border:1px solid #ddd;text-align:center">${m.max_marks}</td>
        <td style="padding:9px 14px;border:1px solid #ddd;text-align:center">${pct}%</td>
        <td style="padding:9px 14px;border:1px solid #ddd;text-align:center">
          <span style="padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;background:${ok ? '#e6f4ea' : '#fce8e8'};color:${ok ? '#2e7d32' : '#c62828'}">${ok ? 'PASS' : 'FAIL'}</span>
        </td></tr>`;
    }).join('');

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;padding:30px;color:#222}.hdr{display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid ${color}}.hdr h1{color:${color};font-size:22px;margin:0 0 4px}.hdr p{color:#555;font-size:12px;margin:0}.meta{text-align:right;font-size:12px;color:#666}.stats{display:flex;gap:16px;margin-bottom:24px}.stat{flex:1;padding:14px 18px;border-radius:8px;border:1px solid #e5e7eb}.stat .val{font-size:26px;font-weight:800}.stat .lbl{font-size:11px;color:#666;margin-top:2px;text-transform:uppercase;letter-spacing:.5px}table{width:100%;border-collapse:collapse;font-size:13px}thead tr{background:${color};color:white}th{padding:10px 14px;text-align:left;border:1px solid #ddd}.footer{margin-top:24px;text-align:center;font-size:11px;color:#999;padding-top:16px;border-top:1px solid #eee}</style></head><body>
<div class="hdr"><div><h1>🎓 CIA Management System</h1><p><strong>${title}</strong> | Pass threshold: ${passPercentage}% | Filter: ${filterNote}</p></div><div class="meta"><div>Generated on</div><div><strong>${new Date().toLocaleString()}</strong></div></div></div>
<div class="stats">
  <div class="stat" style="border-left:4px solid ${color}"><div class="val" style="color:${color}">${subset.length}</div><div class="lbl">Records</div></div>
  <div class="stat" style="border-left:4px solid #2e7d32"><div class="val" style="color:#2e7d32">${passed.length}</div><div class="lbl">Passed</div></div>
  <div class="stat" style="border-left:4px solid #c62828"><div class="val" style="color:#c62828">${failed.length}</div><div class="lbl">Failed</div></div>
  <div class="stat" style="border-left:4px solid #1565c0"><div class="val" style="color:#1565c0">${passRate}%</div><div class="lbl">Pass Rate</div></div>
</div>
<table><thead><tr><th>#</th><th>USN</th><th>Student Name</th><th>Course</th><th>CIA Type</th><th style="text-align:center">Marks</th><th style="text-align:center">Max</th><th style="text-align:center">%</th><th style="text-align:center">Result</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">CIA Management System • Confidential Academic Record</div>
<script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  };

  const ResultTable = ({ rows, type }) => {
    const isPass = type === 'passed';
    if (rows.length === 0) return (
      <div className={`cia-empty-state cia-empty-${type}`}>
        {isPass ? '😕 No students passed with the current filters.' : '🎉 No students failed with the current filters.'}
      </div>
    );
    return (
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>#</th><th>USN</th><th>Student Name</th><th>Course</th><th>CIA Type</th><th>Marks</th><th>Max</th><th>Percentage</th><th>Result</th></tr></thead>
          <tbody>{rows.map((m, idx) => {
            const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100).toFixed(1) : '0.0';
            return (
              <tr key={m.marks_id || idx}>
                <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                <td className="font-mono">{m.usn || '-'}</td>
                <td className="font-bold">{m.student_name || '-'}</td>
                <td>{m.course_name || '-'}</td>
                <td><span className="badge badge-info">{m.cia_type || '-'}</span></td>
                <td className="font-bold">{m.marks_obtained}</td>
                <td>{m.max_marks}</td>
                <td>
                  <div className="cia-pct-bar-wrap">
                    <span className="cia-pct-label">{pct}%</span>
                    <div className="cia-pct-track">
                      <div className={`cia-pct-fill ${isPass ? 'cia-pct-pass' : 'cia-pct-fail'}`} style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`cia-result-badge ${isPass ? 'cia-result-pass' : 'cia-result-fail'}`}>
                    {isPass ? <CheckCircle size={13} /> : <XCircle size={13} />} {isPass ? 'PASS' : 'FAIL'}
                  </span>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
        <div className="results-count">Showing {rows.length} {isPass ? 'passed' : 'failed'} record{rows.length !== 1 ? 's' : ''}</div>
      </div>
    );
  };

  if (loading) return <div className="cia-loading"><div className="cia-spinner" /><p>Loading results…</p></div>;

  return (
    <>
      <div className="section-title" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <h2>CIA Reports</h2>
        <div className="cia-header-actions">
          <button className="cia-dl-btn cia-dl-all"    onClick={() => openPDF(filtered, 'All Results',     '#8B0000')}><Download size={15} /> All (PDF)</button>
          <button className="cia-dl-btn cia-dl-passed" onClick={() => openPDF(passed,   'Passed Students', '#2e7d32')}><Download size={15} /> Passed (PDF)</button>
          <button className="cia-dl-btn cia-dl-failed" onClick={() => openPDF(failed,   'Failed Students', '#c62828')}><Download size={15} /> Failed (PDF)</button>
        </div>
      </div>

      <div className="cia-stat-grid">
        <div className="cia-stat-card cia-stat-total"><Users size={28} /><div><div className="cia-stat-val">{filtered.length}</div><div className="cia-stat-lbl">Total Records</div></div></div>
        <div className="cia-stat-card cia-stat-pass"><CheckCircle size={28} /><div><div className="cia-stat-val">{passed.length}</div><div className="cia-stat-lbl">Passed</div></div></div>
        <div className="cia-stat-card cia-stat-fail"><AlertTriangle size={28} /><div><div className="cia-stat-val">{failed.length}</div><div className="cia-stat-lbl">Failed</div></div></div>
        <div className="cia-stat-card cia-stat-rate"><TrendingUp size={28} /><div><div className="cia-stat-val">{passRate}%</div><div className="cia-stat-lbl">Pass Rate</div></div></div>
      </div>

      {filtered.length > 0 && (
        <div className="cia-passrate-track">
          <div className="cia-passrate-fill" style={{ width: `${passRate}%` }} />
          <span className="cia-passrate-label">{passRate}% students passed</span>
        </div>
      )}

      <div className="filters-container">
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="filter-select">
          <option value="All">All Courses</option>
          {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedCIA} onChange={e => setSelectedCIA(e.target.value)} className="filter-select">
          <option value="All">All CIA Types</option>
          {uniqueCIAs.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="cia-pass-threshold">
          <label>Pass %</label>
          <input type="number" min={0} max={100} value={passPercentage}
            onChange={e => setPassPercentage(Number(e.target.value))} className="cia-threshold-input" />
          <span>%</span>
        </div>
        <div className="cia-view-toggle">
          {[['both', 'Both'], ['passed', '✅ Passed'], ['failed', '❌ Failed']].map(([v, l]) => (
            <button key={v} className={`cia-view-btn ${activeView === v ? 'cia-view-btn-active' : ''}`} onClick={() => setActiveView(v)}>{l}</button>
          ))}
        </div>
      </div>

      {marks.length === 0 ? (
        <div className="cia-empty-state cia-empty-neutral">No marks data found. Faculty can enter marks from their dashboard.</div>
      ) : (
        <>
          {(activeView === 'both' || activeView === 'passed') && (
            <div className="cia-section">
              <div className="cia-section-header cia-section-passed"><CheckCircle size={20} /><h3>Passed Students</h3><span className="cia-section-count">{passed.length}</span></div>
              <ResultTable rows={passed} type="passed" />
            </div>
          )}
          {(activeView === 'both' || activeView === 'failed') && (
            <div className="cia-section" style={{ marginTop: activeView === 'both' ? '32px' : 0 }}>
              <div className="cia-section-header cia-section-failed"><XCircle size={20} /><h3>Failed Students</h3><span className="cia-section-count">{failed.length}</span></div>
              <ResultTable rows={failed} type="failed" />
            </div>
          )}
        </>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════
//  ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════
const AdminDashboard = ({ onLogout }) => {
  const dispatch = useDispatch();
  const notify   = useAutoAlert(dispatch);

  const { departments, programmes, students, faculty, courses, ciaComponents, marks, loading, error } = useSelector(s => s.data);
  const { alert, activeTab, modal, filters } = useSelector(s => s.ui);

  useEffect(() => { dispatch(fetchAllData()); }, [dispatch]);

  const handleDelete = async (thunk, id, label) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try { await dispatch(thunk(id)).unwrap(); notify(`${label} deleted successfully!`, 'success'); }
    catch (err) { notify('Error: ' + err.message, 'error'); }
  };

  const fDepts = departments.filter(d => {
    const q = filters.departments.search.toLowerCase();
    return (sl(d.department_name).includes(q) || sl(d.hod_name).includes(q))
        && (filters.departments.status === 'All' || d.status === filters.departments.status);
  });
  const fProgs = programmes.filter(p =>
    sl(p.programme_name).includes(filters.programmes.search.toLowerCase())
    && (filters.programmes.department === 'All' || p.department_name === filters.programmes.department)
    && (filters.programmes.status     === 'All' || p.status          === filters.programmes.status)
  );
  const fStuds = students.filter(s => {
    const q = filters.students.search.toLowerCase();
    return (sl(s.student_name).includes(q) || sl(s.usn).includes(q) || sl(s.email).includes(q))
        && (filters.students.programme === 'All' || s.programme_name   === filters.students.programme)
        && (filters.students.semester  === 'All' || String(s.semester) === filters.students.semester);
  });
  const fFac = faculty.filter(f => {
    const q = filters.faculty.search.toLowerCase();
    return (sl(f.faculty_name).includes(q) || sl(f.email).includes(q))
        && (filters.faculty.department  === 'All' || f.department_name === filters.faculty.department)
        && (filters.faculty.designation === 'All' || f.designation     === filters.faculty.designation);
  });
  const fCours = courses.filter(c => {
    const q = filters.courses.search.toLowerCase();
    return (sl(c.course_name).includes(q) || sl(c.course_code).includes(q))
        && (filters.courses.programme === 'All' || c.programme_name   === filters.courses.programme)
        && (filters.courses.semester  === 'All' || String(c.semester) === filters.courses.semester)
        && (filters.courses.faculty   === 'All' || c.faculty_name     === filters.courses.faculty);
  });
  const fCIA = ciaComponents.filter(c =>
    sl(c.cia_type).includes(filters.ciaComponents.search.toLowerCase())
    && (filters.ciaComponents.assessmentType === 'All' || c.assessment_type === filters.ciaComponents.assessmentType)
  );
  const fMarks = marks.filter(m => {
    const q = filters.marks.search.toLowerCase();
    return (sl(m.student_name).includes(q) || sl(m.usn).includes(q))
        && (filters.marks.course  === 'All' || m.course_name === filters.marks.course)
        && (filters.marks.ciaType === 'All' || m.cia_type    === filters.marks.ciaType);
  });

  if (loading && departments.length === 0) return (
    <div className="dashboard-container">
      <div className="main-content" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Loader size={48} className="spinner" />
        <p style={{ marginTop: '20px', fontSize: '1.1rem', color: '#666' }}>Loading data…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container">
      <div className="main-content"><div className="content-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ Error Loading Data</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>{error}</p>
        <button className="submit-btn" onClick={() => dispatch(fetchAllData())} style={{ marginRight: '10px' }}>Retry</button>
        <button className="cancel-btn" onClick={onLogout}>Go to Login</button>
      </div></div>
    </div>
  );

  const tabs = [
    ['departments',    'Departments'],
    ['programmes',     'Programmes'],
    ['students',       'Students'],
    ['faculty',        'Faculty'],
    ['courses',        'Courses'],
    ['cia-components', 'CIA Components'],
    ['marks',          'CIA Marks'],
    ['cia-reports',    'CIA Reports'],
  ];

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="tabs-container">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => dispatch(setActiveTab(id))}
              className={`tab-button ${activeTab === id ? 'tab-button-active' : ''}`}>{label}</button>
          ))}
        </div>

        {alert.show && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

        <div className="content-card">

          {/* ══ DEPARTMENTS ══ */}
          {activeTab === 'departments' && (
            <div>
              <div className="section-title">
                <h2>Departments</h2>
                <button className="add-button" onClick={() => dispatch(openAddModal('department'))}>+ Add Department</button>
              </div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by department name or HOD…" value={filters.departments.search} onChange={e => dispatch(updateFilter({ tab: 'departments', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.departments.status} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'departments', field: 'status', value: e.target.value }))}>
                  <option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
                </select>
              </div>
              {fDepts.length === 0 ? <EmptyState message="No departments found." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>Name</th><th>HOD</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{fDepts.map((d, idx) => (
                    <tr key={d.department_id}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td className="font-bold">{d.department_name}</td>
                      <td>{d.hod_name || '-'}</td>
                      <td><span className={`badge badge-${d.status === 'Active' ? 'success' : 'inactive'}`}>{d.status || 'Active'}</span></td>
                      <td>
                        <button className="edit-btn" onClick={() => dispatch(openEditModal({ entityType: 'department', data: d }))}><Pencil size={13} /> Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(deleteDepartment, d.department_id, 'Department')}>Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fDepts.length} of {departments.length} departments</div></div>
              )}
            </div>
          )}

          {/* ══ PROGRAMMES ══ */}
          {activeTab === 'programmes' && (
            <div>
              <div className="section-title">
                <h2>Programmes</h2>
                <button className="add-button" onClick={() => dispatch(openAddModal('programme'))}>+ Add Programme</button>
              </div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by programme name…" value={filters.programmes.search} onChange={e => dispatch(updateFilter({ tab: 'programmes', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.programmes.department} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'programmes', field: 'department', value: e.target.value }))}>
                  <option value="All">All Departments</option>{[...new Set(programmes.map(p => p.department_name).filter(Boolean))].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filters.programmes.status} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'programmes', field: 'status', value: e.target.value }))}>
                  <option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
                </select>
              </div>
              {fProgs.length === 0 ? <EmptyState message="No programmes found." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>Name</th><th>Department</th><th>Duration</th><th>Semesters</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{fProgs.map((p, idx) => (
                    <tr key={p.programme_id}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td className="font-bold">{p.programme_name}</td>
                      <td>{p.department_name || '-'}</td>
                      <td>{p.duration} yrs</td>
                      <td>{p.total_semesters}</td>
                      <td><span className={`badge badge-${p.status === 'Active' ? 'success' : 'inactive'}`}>{p.status || 'Active'}</span></td>
                      <td>
                        <button className="edit-btn" onClick={() => dispatch(openEditModal({ entityType: 'programme', data: p }))}><Pencil size={13} /> Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(deleteProgramme, p.programme_id, 'Programme')}>Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fProgs.length} of {programmes.length} programmes</div></div>
              )}
            </div>
          )}

          {/* ══ STUDENTS ══ */}
          {activeTab === 'students' && (
            <div>
              <div className="section-title">
                <h2>Students</h2>
                <button className="add-button" onClick={() => dispatch(openAddModal('student'))}>+ Add Student</button>
              </div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by name, USN, or email…" value={filters.students.search} onChange={e => dispatch(updateFilter({ tab: 'students', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.students.programme} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'students', field: 'programme', value: e.target.value }))}>
                  <option value="All">All Programmes</option>{[...new Set(students.map(s => s.programme_name).filter(Boolean))].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filters.students.semester} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'students', field: 'semester', value: e.target.value }))}>
                  <option value="All">All Semesters</option>{[...new Set(students.map(s => s.semester).filter(Boolean))].sort((a,b)=>a-b).map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              {fStuds.length === 0 ? <EmptyState message="No students found." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>USN</th><th>Name</th><th>Programme</th><th>Semester</th><th>Email</th><th>Actions</th></tr></thead>
                  <tbody>{fStuds.map((s, idx) => (
                    <tr key={s.student_id}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td className="font-mono">{s.usn}</td>
                      <td className="font-bold">{s.student_name}</td>
                      <td>{s.programme_name || '-'}</td>
                      <td>Sem {s.semester}</td>
                      <td className="text-small">{s.email || '-'}</td>
                      <td><button className="delete-btn" onClick={() => handleDelete(deleteStudent, s.student_id, 'Student')}>Delete</button></td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fStuds.length} of {students.length} students</div></div>
              )}
            </div>
          )}

          {/* ══ FACULTY ══ */}
          {activeTab === 'faculty' && (
            <div>
              <div className="section-title">
                <h2>Faculty</h2>
                <button className="add-button" onClick={() => dispatch(openAddModal('faculty'))}>+ Add Faculty</button>
              </div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by name or email…" value={filters.faculty.search} onChange={e => dispatch(updateFilter({ tab: 'faculty', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.faculty.department} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'faculty', field: 'department', value: e.target.value }))}>
                  <option value="All">All Departments</option>{[...new Set(faculty.map(f => f.department_name).filter(Boolean))].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filters.faculty.designation} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'faculty', field: 'designation', value: e.target.value }))}>
                  <option value="All">All Designations</option>{[...new Set(faculty.map(f => f.designation).filter(Boolean))].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {fFac.length === 0 ? <EmptyState message="No faculty members found." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>Name</th><th>Designation</th><th>Department</th><th>Email</th><th>Actions</th></tr></thead>
                  <tbody>{fFac.map((f, idx) => (
                    <tr key={f.faculty_id}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td className="font-bold">{f.faculty_name}</td>
                      <td>{f.designation || '-'}</td>
                      <td>{f.department_name || '-'}</td>
                      <td className="text-small">{f.email || '-'}</td>
                      <td><button className="delete-btn" onClick={() => handleDelete(deleteFaculty, f.faculty_id, 'Faculty')}>Delete</button></td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fFac.length} of {faculty.length} faculty members</div></div>
              )}
            </div>
          )}

          {/* ══ COURSES ══ */}
          {activeTab === 'courses' && (
            <div>
              <div className="section-title">
                <h2>Courses</h2>
                <button className="add-button" onClick={() => dispatch(openAddModal('course'))}>+ Add Course</button>
              </div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by course name or code…" value={filters.courses.search} onChange={e => dispatch(updateFilter({ tab: 'courses', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.courses.programme} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'courses', field: 'programme', value: e.target.value }))}>
                  <option value="All">All Programmes</option>{[...new Set(courses.map(c => c.programme_name).filter(Boolean))].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={filters.courses.semester} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'courses', field: 'semester', value: e.target.value }))}>
                  <option value="All">All Semesters</option>{[...new Set(courses.map(c => c.semester).filter(Boolean))].sort((a,b)=>a-b).map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                <select value={filters.courses.faculty} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'courses', field: 'faculty', value: e.target.value }))}>
                  <option value="All">All Faculty</option>{[...new Set(courses.map(c => c.faculty_name).filter(Boolean))].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              {fCours.length === 0 ? <EmptyState message="No courses found." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>Code</th><th>Name</th><th>Programme</th><th>Semester</th><th>Faculty</th><th>Actions</th></tr></thead>
                  <tbody>{fCours.map((c, idx) => (
                    <tr key={c.course_id || idx}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td>{c.course_code || '-'}</td>
                      <td className="font-bold">{c.course_name}</td>
                      <td>{c.programme_name || '-'}</td>
                      <td>Sem {c.semester}</td>
                      <td>{c.faculty_name || 'Unassigned'}</td>
                      <td><button className="delete-btn" onClick={() => handleDelete(deleteCourse, c.course_id, 'Course')}>Delete</button></td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fCours.length} of {courses.length} courses</div></div>
              )}
            </div>
          )}

          {/* ══ CIA COMPONENTS ══ */}
          {activeTab === 'cia-components' && (
            <div>
              <div className="section-title"><h2>CIA Components</h2></div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by CIA type…" value={filters.ciaComponents.search} onChange={e => dispatch(updateFilter({ tab: 'ciaComponents', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.ciaComponents.assessmentType} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'ciaComponents', field: 'assessmentType', value: e.target.value }))}>
                  <option value="All">All Assessment Types</option>{[...new Set(ciaComponents.map(c => c.assessment_type).filter(Boolean))].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {fCIA.length === 0 ? <EmptyState message="No CIA components found." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>Type</th><th>Max Marks</th><th>Weightage</th><th>Assessment Type</th><th>Actions</th></tr></thead>
                  <tbody>{fCIA.map((c, idx) => (
                    <tr key={c.cia_id}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td className="font-bold">{c.cia_type}</td>
                      <td>{c.max_marks}</td>
                      <td>{c.weightage}%</td>
                      <td><span className="badge badge-info">{c.assessment_type}</span></td>
                      <td>
                        <button className="edit-btn" onClick={() => dispatch(openEditModal({ entityType: 'cia-component', data: c }))}><Pencil size={13} /> Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(deleteCIAComponent, c.cia_id, 'CIA Component')}>Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fCIA.length} of {ciaComponents.length} components</div></div>
              )}
            </div>
          )}

          {/* ══ CIA MARKS ══ */}
          {activeTab === 'marks' && (
            <div>
              <div className="section-title"><h2>CIA Marks</h2></div>
              <div className="filters-container">
                <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by student name or USN…" value={filters.marks.search} onChange={e => dispatch(updateFilter({ tab: 'marks', field: 'search', value: e.target.value }))} /></div>
                <select value={filters.marks.course} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'marks', field: 'course', value: e.target.value }))}>
                  <option value="All">All Courses</option>{[...new Set(marks.map(m => m.course_name).filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.marks.ciaType} className="filter-select" onChange={e => dispatch(updateFilter({ tab: 'marks', field: 'ciaType', value: e.target.value }))}>
                  <option value="All">All CIA Types</option>{[...new Set(marks.map(m => m.cia_type).filter(Boolean))].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {fMarks.length === 0 ? <EmptyState message="No marks entered yet. Faculty can enter marks from their dashboard." /> : (
                <div className="table-container"><table className="data-table">
                  <thead><tr><th>#</th><th>USN</th><th>Student</th><th>Course</th><th>CIA Type</th><th>Marks</th><th>Max</th><th>Actions</th></tr></thead>
                  <tbody>{fMarks.map((m, idx) => (
                    <tr key={m.marks_id || idx}>
                      <td style={{ color: '#999', fontWeight: 500 }}>{idx + 1}</td>
                      <td className="font-mono">{m.usn}</td>
                      <td className="font-bold">{m.student_name}</td>
                      <td>{m.course_name}</td>
                      <td><span className="badge badge-info">{m.cia_type}</span></td>
                      <td className="font-bold">{m.marks_obtained}</td>
                      <td>{m.max_marks}</td>
                      <td><button className="edit-btn" onClick={() => dispatch(openEditModal({ entityType: 'marks', data: m }))}><Pencil size={13} /> Edit</button></td>
                    </tr>
                  ))}</tbody>
                </table><div className="results-count">Showing {fMarks.length} of {marks.length} marks entries</div></div>
              )}
            </div>
          )}

          {activeTab === 'cia-reports' && <CIAReportsContent />}
        </div>
      </div>

      {modal.show && (
        <FormModal
          mode={modal.mode} entityType={modal.entityType} initialData={modal.editData}
          onClose={() => dispatch(closeModal())}
          onSuccess={(msg) => { notify(msg, 'success'); dispatch(closeModal()); dispatch(fetchAllData()); }}
          onError={(msg) => notify(msg, 'error')}
          departments={departments} programmes={programmes}
          faculty={faculty} students={students}
          courses={courses} ciaComponents={ciaComponents}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
//  FORM MODAL
// ═══════════════════════════════════════════════════════
const FormModal = ({ mode, entityType, initialData, onClose, onSuccess, onError,
                     departments, programmes, faculty }) => {
  const dispatch = useDispatch();
  const isEdit   = mode === 'edit';

  const seed = () => {
    if (!isEdit || !initialData) return {};
    if (entityType === 'department')    return {
      department_name: initialData.department_name,
      hod_name:        initialData.hod_name || '',
      status:          initialData.status   || 'Active',
    };
    if (entityType === 'programme')     return {
      programme_name:   initialData.programme_name,
      department_id:    initialData.department_id,
      duration:         initialData.duration,
      total_semesters:  initialData.total_semesters,
      status:           initialData.status || 'Active',
    };
    if (entityType === 'cia-component') return {
      cia_type:        initialData.cia_type,
      max_marks:       initialData.max_marks,
      weightage:       initialData.weightage,
      assessment_type: initialData.assessment_type,
    };
    if (entityType === 'marks') return { marks_obtained: initialData.marks_obtained };
    return {};
  };

  const [formData, setFormData]     = React.useState(seed);
  const [submitting, setSubmitting] = React.useState(false);
  const hc = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (entityType === 'marks' && isEdit) {
        const mo  = parseFloat(formData.marks_obtained);
        const max = initialData.max_marks;
        if (isNaN(mo) || mo < 0) { onError('Marks cannot be negative'); setSubmitting(false); return; }
        if (max && mo > max)     { onError(`Marks cannot exceed ${max}`); setSubmitting(false); return; }
        await dispatch(updateMarks({ id: initialData.marks_id, data: { marks_obtained: mo } })).unwrap();
        onSuccess('Marks updated successfully!'); return;
      }
      if (entityType === 'department') {
        isEdit
          ? await dispatch(updateDepartment({ id: initialData.department_id, data: formData })).unwrap()
          : await dispatch(addDepartment(formData)).unwrap();
        onSuccess(`Department ${isEdit ? 'updated' : 'added'} successfully!`); return;
      }
      if (entityType === 'programme') {
        isEdit
          ? await dispatch(updateProgramme({ id: initialData.programme_id, data: formData })).unwrap()
          : await dispatch(addProgramme(formData)).unwrap();
        onSuccess(`Programme ${isEdit ? 'updated' : 'added'} successfully!`); return;
      }
      if (entityType === 'cia-component' && isEdit) {
        await dispatch(updateCIAComponent({ id: initialData.cia_id, data: formData })).unwrap();
        onSuccess('CIA Component updated successfully!'); return;
      }
      if (entityType === 'student') { await dispatch(addStudent(formData)).unwrap(); onSuccess('Student added! Login: ' + (formData.email || '') + ' / ' + (formData.password || 'student123')); return; }
      if (entityType === 'faculty') { await dispatch(addFaculty(formData)).unwrap(); onSuccess('Faculty added! Login: ' + (formData.email || '') + ' / ' + (formData.password || 'faculty123')); return; }
      if (entityType === 'course')  { await dispatch(addCourse(formData)).unwrap();  onSuccess('Course added successfully!');  return; }
      onError('Unknown entity type');
    } catch (err) { onError('Error: ' + (err.message || err)); }
    finally { setSubmitting(false); }
  };

  const label = `${isEdit ? 'Edit' : 'Add'} ${entityType.charAt(0).toUpperCase() + entityType.slice(1).replace('-', ' ')}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{label}</h2><button className="close-btn" onClick={onClose}><X size={24} /></button></div>
        <form onSubmit={handleSubmit}>

          {/* ── DEPARTMENT ── */}
          {entityType === 'department' && (<>
            <div className="form-group"><label>Department Name *</label>
              <input type="text" name="department_name" required onChange={hc} defaultValue={formData.department_name} placeholder="e.g., Computer Science" /></div>
            <div className="form-group"><label>HOD Name</label>
              <input type="text" name="hod_name" onChange={hc} defaultValue={formData.hod_name} placeholder="e.g., Dr. John Doe" /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" onChange={hc} defaultValue={formData.status || 'Active'}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select></div>
          </>)}

          {/* ── PROGRAMME ── */}
          {entityType === 'programme' && (<>
            <div className="form-group"><label>Programme Name *</label>
              <input type="text" name="programme_name" required onChange={hc} defaultValue={formData.programme_name} placeholder="e.g., MCA" /></div>
            <div className="form-group"><label>Department *</label>
              <select name="department_id" required onChange={hc} defaultValue={formData.department_id}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
              </select></div>
            <div className="form-group"><label>Duration (years) *</label>
              <input type="number" name="duration" required onChange={hc} defaultValue={formData.duration} min="1" /></div>
            <div className="form-group"><label>Total Semesters *</label>
              <input type="number" name="total_semesters" required onChange={hc} defaultValue={formData.total_semesters} min="1" /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" onChange={hc} defaultValue={formData.status || 'Active'}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select></div>
          </>)}

          {/* ── COURSE ── */}
          {entityType === 'course' && (<>
            <div className="form-group"><label>Course Code *</label>
              <input type="text" name="course_code" required onChange={hc} placeholder="e.g., CS101" /></div>
            <div className="form-group"><label>Course Name *</label>
              <input type="text" name="course_name" required onChange={hc} placeholder="e.g., Data Structures" /></div>
            <div className="form-group"><label>Programme *</label>
              <select name="programme_id" required onChange={hc}>
                <option value="">Select Programme</option>
                {programmes.map(p => <option key={p.programme_id} value={p.programme_id}>{p.programme_name}</option>)}
              </select></div>
            <div className="form-group"><label>Semester *</label>
              <input type="number" name="semester" required onChange={hc} min="1" max="12" /></div>
            <div className="form-group"><label>Faculty</label>
              <select name="faculty_id" onChange={hc}>
                <option value="">Select Faculty</option>
                {faculty.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>)}
              </select></div>
          </>)}

          {/* ── CIA COMPONENT ── */}
          {entityType === 'cia-component' && (<>
            <div className="form-group"><label>CIA Type *</label>
              <input type="text" name="cia_type" required onChange={hc} defaultValue={formData.cia_type} /></div>
            <div className="form-group"><label>Max Marks *</label>
              <input type="number" name="max_marks" required onChange={hc} defaultValue={formData.max_marks} min="1" max="100" /></div>
            <div className="form-group"><label>Weightage (%)</label>
              <input type="number" name="weightage" onChange={hc} defaultValue={formData.weightage} min="0" max="100" step="0.5" /></div>
            <div className="form-group"><label>Assessment Type *</label>
              <select name="assessment_type" required onChange={hc} defaultValue={formData.assessment_type}>
                <option value="">Select Type</option>
                {['Written','Practical','Assignment','Project','Quiz','Test','Presentation','Viva'].map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
          </>)}

          {/* ── STUDENT ── */}
          {entityType === 'student' && (<>
            <div className="form-group"><label>Full Name *</label>
              <input type="text" name="student_name" required onChange={hc} placeholder="e.g., Ravi Kumar" /></div>
            <div className="form-group"><label>USN *</label>
              <input type="text" name="usn" required onChange={hc} placeholder="e.g., 1CA24MC001" /></div>
            <div className="form-group"><label>Email *</label>
              <input type="email" name="email" required onChange={hc} placeholder="e.g., ravi@student.edu" /></div>
            <div className="form-group"><label>Programme *</label>
              <select name="programme_id" required onChange={hc}>
                <option value="">Select Programme</option>
                {programmes.map(p => <option key={p.programme_id} value={p.programme_id}>{p.programme_name}</option>)}
              </select></div>
            <div className="form-group"><label>Semester *</label>
              <input type="number" name="semester" required onChange={hc} min="1" max="12" /></div>
            <div className="form-group"><label>Password *</label>
              <input type="password" name="password" required onChange={hc} placeholder="Set login password" /></div>
          </>)}

          {/* ── FACULTY ── */}
          {entityType === 'faculty' && (<>
            <div className="form-group"><label>Full Name *</label>
              <input type="text" name="faculty_name" required onChange={hc} placeholder="e.g., Dr. Priya Sharma" /></div>
            <div className="form-group"><label>Email *</label>
              <input type="email" name="email" required onChange={hc} placeholder="e.g., priya@college.edu" /></div>
            <div className="form-group"><label>Designation *</label>
              <select name="designation" required onChange={hc}>
                <option value="">Select Designation</option>
                {['Professor','Associate Professor','Assistant Professor','Lecturer','HOD'].map(d => <option key={d} value={d}>{d}</option>)}
              </select></div>
            <div className="form-group"><label>Department *</label>
              <select name="department_id" required onChange={hc}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
              </select></div>
            <div className="form-group"><label>Password *</label>
              <input type="password" name="password" required onChange={hc} placeholder="Set login password" /></div>
          </>)}

          {/* ── MARKS EDIT ── */}
          {entityType === 'marks' && isEdit && (
            <div className="form-group">
              <label>Marks Obtained * <small style={{ color: '#b08080' }}>(Max: {initialData.max_marks})</small></label>
              <input type="number" name="marks_obtained" required onChange={hc} defaultValue={formData.marks_obtained} min="0" max={initialData.max_marks} step="0.5" />
              <small style={{ marginTop: 8, display: 'block', color: '#666' }}>
                Student: <strong>{initialData.student_name}</strong> | Course: <strong>{initialData.course_name}</strong> | CIA: <strong>{initialData.cia_type}</strong>
              </small>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : `Add ${entityType.replace('-', ' ')}`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', background: '#f8f9fa', borderRadius: '8px', margin: '20px 0' }}>
    <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>📭 {message}</p>
  </div>
);

export default AdminDashboard;