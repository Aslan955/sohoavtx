import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  AlertCircle,
  Calendar,
  Users,
  Briefcase,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define structures
export interface OnsiteRecord {
  id: string; // STT
  employeeId: string; // Mã NV
  fullName: string; // Họ tên
  department: string; // BP (Bộ phận)
  projectId: string; // Mã dự án
  onsiteDays: number; // Số ngày onsite
  status: 'APPROVED' | 'REQUEST' | 'REJECTED'; // Trạng thái
}

const INITIAL_ONSITE_RECORDS: OnsiteRecord[] = [
  { 
    id: '1', 
    employeeId: 'V00623', 
    fullName: 'HỒ TÚ ANH', 
    department: 'Software Dev', 
    projectId: 'A.25.022.HTBTC', 
    onsiteDays: 18,
    status: 'APPROVED'
  },
  { 
    id: '2', 
    employeeId: 'V00914', 
    fullName: 'HỒ LONG NHẬT MAN', 
    department: 'Delivery', 
    projectId: 'X.24.NB.PMO', 
    onsiteDays: 12,
    status: 'APPROVED'
  },
  { 
    id: '3', 
    employeeId: 'V00437', 
    fullName: 'ADMINISTRATOR', 
    department: 'HR Admin', 
    projectId: 'HQ.INTERNAL.01', 
    onsiteDays: 4,
    status: 'REQUEST'
  },
  { 
    id: '4', 
    employeeId: 'V00497', 
    fullName: 'NGUYỄN VĂN AN', 
    department: 'Infrastructure', 
    projectId: 'S.23.NB.SND', 
    onsiteDays: 21,
    status: 'APPROVED'
  },
  { 
    id: '5', 
    employeeId: 'V00188', 
    fullName: 'TRẦN THỊ CẨM LY', 
    department: 'Back Office', 
    projectId: 'A.25.022.HTBTC', 
    onsiteDays: 10,
    status: 'REJECTED'
  },
  { 
    id: '6', 
    employeeId: 'V00245', 
    fullName: 'VŨ ĐỨC HẢI', 
    department: 'Hardware Dev', 
    projectId: 'H.24.HW.05', 
    onsiteDays: 15,
    status: 'APPROVED'
  },
  { 
    id: '7', 
    employeeId: 'V00311', 
    fullName: 'LÊ HOÀNG NAM', 
    department: 'Quality Testing', 
    projectId: 'X.24.NB.PMO', 
    onsiteDays: 16,
    status: 'REQUEST'
  }
];

export const OnsiteReportPage: React.FC = () => {
  const [records, setRecords] = useState<OnsiteRecord[]>(INITIAL_ONSITE_RECORDS);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [showFilters, setShowFilters] = useState(false);
  
  // New Record Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmpId, setNewEmpId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newDept, setNewDept] = useState('Software Dev');
  const [newProjectId, setNewProjectId] = useState('A.25.022.HTBTC');
  const [newOnsiteDays, setNewOnsiteDays] = useState<number>(15);
  const [newStatus, setNewStatus] = useState<'APPROVED' | 'REQUEST' | 'REJECTED'>('REQUEST');
  
  // Quick Edit States
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editOnsiteDays, setEditOnsiteDays] = useState<number>(0);

  // Status Alerts
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Extract metadata lists
  const departments = useMemo(() => {
    return ['All', ...Array.from(new Set(records.map(r => r.department)))];
  }, [records]);

  const projects = useMemo(() => {
    return ['All', ...Array.from(new Set(records.map(r => r.projectId)))];
  }, [records]);

  // Save specific record onsite days in Report tab
  const handleStartEdit = (record: OnsiteRecord) => {
    setEditingRecordId(record.id);
    setEditOnsiteDays(record.onsiteDays);
  };

  const handleSaveEdit = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    setRecords(records.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          onsiteDays: editOnsiteDays
        };
      }
      return r;
    }));

    setEditingRecordId(null);
    showToast(`Đã cập nhật số ngày Onsite của ${record.fullName} thành ${editOnsiteDays} ngày!`, 'success');
  };

  const handleStatusChange = (recordId: string, status: 'APPROVED' | 'REQUEST' | 'REJECTED') => {
    setRecords(records.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status
        };
      }
      return r;
    }));
    const label = status === 'APPROVED' ? 'Đã duyệt' : status === 'REQUEST' ? 'Chờ duyệt' : 'Từ chối';
    showToast(`Đã thay đổi trạng thái của nhân sự thành "${label}"!`, 'success');
  };

  // Add new Onsite record
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newFullName.trim()) {
      showToast('⚠️ Vui lòng nhập đầy đủ Mã nhân viên và Họ tên!', 'error');
      return;
    }

    const newRecord: OnsiteRecord = {
      id: (records.length + 1).toString(),
      employeeId: newEmpId.toUpperCase().trim(),
      fullName: newFullName.toUpperCase().trim(),
      department: newDept,
      projectId: newProjectId,
      onsiteDays: newOnsiteDays,
      status: newStatus
    };

    setRecords([...records, newRecord]);
    setShowAddForm(false);
    setNewEmpId('');
    setNewFullName('');
    setNewOnsiteDays(15);
    setNewStatus('REQUEST');
    showToast(`🎉 Đã thêm mới báo cáo Onsite cho nhân sự ${newRecord.fullName} thành công!`, 'success');
  };

  // Delete Onsite Record
  const handleDeleteRecord = (recordId: string, fullName: string) => {
    if (confirm(`Bạn có chắc muốn xóa bản ghi Onsite của nhân viên ${fullName}?`)) {
      setRecords(records.filter(r => r.id !== recordId));
      showToast(`Đã xóa thành công bản ghi Onsite của ${fullName}.`, 'info');
    }
  };

  // Filters calculation
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const matchesSearch = 
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projectId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = selectedDept === 'All' || item.department === selectedDept;
      const matchesProj = selectedProject === 'All' || item.projectId === selectedProject;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesDept && matchesProj && matchesStatus;
    });
  }, [records, searchTerm, selectedDept, selectedProject, selectedStatus]);

  // General statistics
  const stats = useMemo(() => {
    const totalEmployees = filteredRecords.length;
    const totalOnsiteDays = filteredRecords.reduce((acc, r) => acc + r.onsiteDays, 0);
    const avgDays = totalEmployees > 0 ? (totalOnsiteDays / totalEmployees).toFixed(1) : '0';
    const activeProjects = Array.from(new Set(filteredRecords.map(r => r.projectId))).length;

    return { totalEmployees, totalOnsiteDays, avgDays, activeProjects };
  }, [filteredRecords]);

  return (
    <div className="flex-grow p-6 bg-transparent flex flex-col space-y-5 h-full overflow-y-auto w-full max-w-full text-left">
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-18 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border-l-4 border font-bold text-xs ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-500 border-emerald-250' 
                : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-500 border-rose-250'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-500 border-indigo-250'
            }`}
          >
            <AlertCircle size={16} />
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with Page Titles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="text-[#0fa57c]" size={22} />
            Báo cáo Onsite Khách hàng
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Báo cáo tổng hợp số ngày onsite dự án của nhân sự để làm căn cứ tính phụ cấp và lương trong module Payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddForm(true)}
            id="add-onsite-btn"
            className="px-4 py-2 bg-[#0fa57c] hover:bg-[#0d8c69] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/15 cursor-pointer transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            Thêm Báo Cáo Onsite
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1 */}
        <div id="stat-card-total-employees" className="bg-white border border-slate-200/80 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nhân sự Onsite</span>
            <div className="text-xl font-black text-slate-900">{stats.totalEmployees} nhân sự</div>
            <div className="text-[10px] text-slate-500 font-semibold">Triển khai dự án khách hàng</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0fa57c]">
            <Users size={18} />
          </div>
        </div>

        {/* Widget 2 */}
        <div id="stat-card-total-days" className="bg-white border border-slate-200/80 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tổng ngày công Onsite</span>
            <div className="text-xl font-black text-[#0fa57c]">{stats.totalOnsiteDays} ngày công</div>
            <div className="text-[10px] text-slate-500 font-semibold">Công tích lũy trong kỳ báo cáo</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Calendar size={18} />
          </div>
        </div>

        {/* Widget 3 */}
        <div id="stat-card-avg-days" className="bg-white border border-slate-200/80 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Số ngày trung bình</span>
            <div className="text-xl font-black text-slate-900">{stats.avgDays} ngày/người</div>
            <div className="text-[10px] text-slate-500 font-semibold">Thời gian onsite trung bình</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Clock size={18} />
          </div>
        </div>

        {/* Widget 4 */}
        <div id="stat-card-active-projects" className="bg-white border border-slate-200/80 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dự án triển khai</span>
            <div className="text-xl font-black text-slate-900">{stats.activeProjects} dự án</div>
            <div className="text-[10px] text-slate-500 font-semibold">Số địa điểm làm việc ngoài công ty</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Briefcase size={18} />
          </div>
        </div>
      </div>

      {/* Control Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Searching */}
          <div className="flex items-center gap-2.5 flex-grow sm:flex-initial min-w-[280px] max-w-md">
            <div className="relative flex-grow">
              <input 
                type="text" 
                id="onsite-search-input"
                placeholder="Mã NV, Họ tên hoặc Mã dự án..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold placeholder:text-slate-400 transition-all"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <button
              type="button"
              id="toggle-filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                showFilters 
                ? 'bg-slate-100 border-slate-350 text-slate-800' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Filter size={13} className={showFilters ? 'text-slate-800' : 'text-slate-500'} />
              Lọc nâng cao
              <ChevronDown size={12} className={`transition-transform duration-150 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Right Export / Import buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('All');
                setSelectedProject('All');
                setSelectedStatus('All');
                setSelectedMonth('2026-05');
                showToast('Đã làm mới dữ liệu và tất cả các bộ lọc', 'info');
              }}
              id="reset-filter-btn"
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw size={12} />
              Reset
            </button>

            <button
              onClick={() => {
                showToast(`📥 Đã xuất báo cáo Onsite tháng ${selectedMonth} định dạng EXCEL thành công!`, 'success');
              }}
              id="export-onsite-btn"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Download size={12} />
              Xuất dữ liệu Excel
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 pt-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Bộ phận (BP)</label>
                  <select 
                    value={selectedDept} 
                    id="filter-dept-select"
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'Tất cả Bộ phận' : dept}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Mã dự án</label>
                  <select 
                    value={selectedProject} 
                    id="filter-project-select"
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  >
                    {projects.map(proj => <option key={proj} value={proj}>{proj === 'All' ? 'Tất cả Dự án' : proj}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Trạng thái</label>
                  <select 
                    value={selectedStatus} 
                    id="filter-status-select"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  >
                    <option value="All">Tất cả Trạng thái</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REQUEST">Chờ duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Tháng công</label>
                  <input 
                    type="month"
                    value={selectedMonth}
                    id="filter-month-input"
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      showToast(`Đã chuyển kỳ công sang tháng ${e.target.value}`, 'info');
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add New Onsite Record Drawer / Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 animate-fadeIn p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              id="add-onsite-form-container"
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Plus className="text-[#0fa57c]" size={16} strokeWidth={2.5} />
                  Khai báo nhân sự Onsite mới
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Mã nhân viên</label>
                  <input 
                    type="text" 
                    placeholder="VD: V00623" 
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#0fa57c] outline-none rounded-xl text-xs font-semibold placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Họ và tên</label>
                  <input 
                    type="text" 
                    placeholder="VD: HỒ TÚ ANH" 
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#0fa57c] outline-none rounded-xl text-xs font-semibold placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Bộ phận công tác (BP)</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#0fa57c] outline-none rounded-xl text-xs font-semibold"
                  >
                    <option value="Software Dev">Software Dev</option>
                    <option value="Delivery">Delivery</option>
                    <option value="HR Admin">HR Admin</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Hardware Dev">Hardware Dev</option>
                    <option value="Back Office">Back Office</option>
                    <option value="Quality Testing">Quality Testing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Mã dự án Onsite</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#0fa57c] outline-none rounded-xl text-xs font-semibold"
                  >
                    <option value="A.25.022.HTBTC">A.25.022.HTBTC (Bộ Tài Chính)</option>
                    <option value="X.24.NB.PMO">X.24.NB.PMO (Dự án PMO)</option>
                    <option value="V.25.H.FX.039.03">V.25.H.FX.039.03 (Dự án FX)</option>
                    <option value="S.23.NB.SND">S.23.NB.SND (Dự án SND)</option>
                    <option value="H.24.HW.05">H.24.HW.05 (Dự án Hardware)</option>
                    <option value="HQ.INTERNAL.01">HQ.INTERNAL.01 (Dự án nội bộ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Số ngày Onsite</label>
                  <input 
                    type="number" 
                    min="0"
                    max="31"
                    placeholder="VD: 15" 
                    value={newOnsiteDays}
                    onChange={(e) => setNewOnsiteDays(Math.max(0, Math.min(31, parseInt(e.target.value) || 0)))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#0fa57c] outline-none rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Trạng thái duyệt</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#0fa57c] outline-none rounded-xl text-xs font-semibold"
                  >
                    <option value="REQUEST">⏱ Chờ duyệt (Request)</option>
                    <option value="APPROVED">✓ Đã duyệt (Approved)</option>
                    <option value="REJECTED">✗ Từ chối (Rejected)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#0fa57c] hover:bg-[#0d8c69] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Khai báo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Data Content Module */}
      <div id="onsite-report-container" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileSpreadsheet size={14} className="text-[#0fa57c]" />
            Báo cáo tổng hợp Onsite ({filteredRecords.length} Bản ghi)
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Thông tin số ngày công Onsite làm căn cứ hỗ trợ phụ cấp và chi phí điều chuyển dự án ngoại bộ.
          </span>
        </div>

        <div className="overflow-x-auto w-full no-scrollbar">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-[#0b2545] text-white text-[10.5px] font-black uppercase tracking-wider border-b border-slate-900">
                <th className="py-3.5 px-4 text-center w-16 border-r border-[#1e3a8a]/40">STT</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40 w-36">Mã nhân viên</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40">Họ và tên</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40 w-44">Bộ phận (BP)</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40 w-44">Mã dự án</th>
                <th className="py-3.5 px-4 text-center border-r border-[#1e3a8a]/40 w-48 bg-[#134074]">Số ngày Onsite</th>
                <th className="py-3.5 px-4 text-center w-44">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11.5px] text-slate-700 font-bold bg-white">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* STT */}
                    <td className="py-3 px-4 text-center text-slate-400 font-mono border-r border-slate-100">
                      {idx + 1}
                    </td>

                    {/* Mã NV */}
                    <td className="py-3 px-4 font-mono text-slate-950 border-r border-slate-100">
                      <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200/50">
                        {row.employeeId}
                      </span>
                    </td>

                    {/* Họ tên */}
                    <td className="py-3 px-4 text-slate-900 uppercase tracking-tight font-extrabold border-r border-slate-100">
                      {row.fullName}
                    </td>

                    {/* BP */}
                    <td className="py-3 px-4 text-slate-600 border-r border-slate-100">
                      {row.department}
                    </td>

                    {/* Mã dự án */}
                    <td className="py-3 px-4 text-indigo-700 font-mono border-r border-slate-100">
                      {row.projectId}
                    </td>

                    {/* Số ngày onsite (Editable inline) */}
                    <td className="py-3 px-4 border-r border-slate-100 text-center bg-slate-50/50">
                      {editingRecordId === row.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <input 
                            type="number" 
                            min="0"
                            max="31"
                            value={editOnsiteDays}
                            onChange={(e) => setEditOnsiteDays(Math.max(0, Math.min(31, parseInt(e.target.value) || 0)))}
                            className="w-18 px-1.5 py-1 font-mono text-center font-black text-xs text-blue-700 bg-white border border-slate-300 rounded focus:border-blue-500 outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(row.id)}
                            className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                            title="Lưu"
                          >
                            <Check size={12} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setEditingRecordId(null)}
                            className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-600 cursor-pointer"
                            title="Hủy"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-900 text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full cursor-pointer hover:bg-emerald-100" onClick={() => handleStartEdit(row)} title="Nhấn để chỉnh sửa nhanh">
                          {row.onsiteDays}
                        </span>
                      )}
                    </td>

                    {/* Trạng thái duyệt */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-full border cursor-pointer outline-none transition-all ${
                          row.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : row.status === 'REQUEST'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <option value="APPROVED">✓ Đã duyệt</option>
                        <option value="REQUEST">⏱ Chờ duyệt</option>
                        <option value="REJECTED">✗ Từ chối</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-450">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="text-slate-300" size={32} />
                      <span className="text-xs font-bold text-slate-500">Không tìm thấy báo cáo onsite nào phù hợp.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-600 gap-3">
          <div>
            Hiển thị <span className="text-slate-900 font-extrabold">{filteredRecords.length}</span> / <span className="text-slate-900">{records.length}</span> nhân viên Onsite
          </div>
          <div className="flex items-center space-x-1">
            <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-white text-slate-400 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 bg-[#0fa57c] border border-[#0fa57c] rounded text-white font-extrabold text-xs">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-white text-slate-600">Tiếp</button>
          </div>
        </div>
      </div>
    </div>
  );
};
