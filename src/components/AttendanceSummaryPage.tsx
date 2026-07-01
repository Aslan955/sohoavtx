import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Play, 
  Save, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  Filter, 
  CheckSquare, 
  AlertCircle,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeSummary {
  id: string; // STT
  employeeId: string;
  fullName: string;
  division: string;
  department: string;
  shop: string;
  group: string;
  line: string;
  actualWorkingDays: number;
  excusedLeaveDays: number;
  unexcusedLeaveDays: number;
  isLocked: boolean;
}

const INITIAL_SUMMARIES: EmployeeSummary[] = [
  { id: '1', employeeId: 'V00623', fullName: 'HỒ TÚ ANH', division: 'R&D Division', department: 'Software Dev', shop: 'Shop A', group: 'G1', line: 'L1', actualWorkingDays: 22.0, excusedLeaveDays: 1.5, unexcusedLeaveDays: 0.5, isLocked: false },
  { id: '2', employeeId: 'V00914', fullName: 'HỒ LONG NHẬT MAN', division: 'PMO Division', department: 'Delivery', shop: 'Shop B', group: 'G2', line: 'L1', actualWorkingDays: 21.5, excusedLeaveDays: 1.0, unexcusedLeaveDays: 0.5, isLocked: false },
  { id: '3', employeeId: 'V00437', fullName: 'ADMINISTRATOR', division: 'Corporate Division', department: 'HR Admin', shop: 'Shop A', group: 'G1', line: 'L2', actualWorkingDays: 24.0, excusedLeaveDays: 0.0, unexcusedLeaveDays: 0.0, isLocked: true },
  { id: '4', employeeId: 'V00497', fullName: 'NGUYỄN VĂN USER', division: 'Operations Division', department: 'Onsite Client', shop: 'Shop C', group: 'G4', line: 'L3', actualWorkingDays: 23.0, excusedLeaveDays: 1.0, unexcusedLeaveDays: 0.0, isLocked: false },
  { id: '5', employeeId: 'V00188', fullName: 'TRẦN THỊ CẨM LY', division: 'Operations Division', department: 'Back Office', shop: 'Shop B', group: 'G3', line: 'L2', actualWorkingDays: 20.0, excusedLeaveDays: 3.5, unexcusedLeaveDays: 0.5, isLocked: false },
  { id: '6', employeeId: 'V00245', fullName: 'VŨ ĐỨC HẢI', division: 'R&D Division', department: 'Hardware Dev', shop: 'Shop C', group: 'G1', line: 'L1', actualWorkingDays: 23.5, excusedLeaveDays: 0.0, unexcusedLeaveDays: 0.5, isLocked: true },
  { id: '7', employeeId: 'V00311', fullName: 'LÊ HOÀNG NAM', division: 'QA Division', department: 'Quality Testing', shop: 'Shop B', group: 'G2', line: 'L4', actualWorkingDays: 22.5, excusedLeaveDays: 1.0, unexcusedLeaveDays: 0.5, isLocked: false },
  { id: '8', employeeId: 'V00712', fullName: 'PHẠM TIẾN ĐẠT', division: 'PMO Division', department: 'Project Manager', shop: 'Shop A', group: 'G3', line: 'L3', actualWorkingDays: 19.0, excusedLeaveDays: 3.0, unexcusedLeaveDays: 0.5, isLocked: false },
  { id: '9', employeeId: 'V00501', fullName: 'ĐỖ THỊ MAI', division: 'Corporate Division', department: 'Finance Office', shop: 'Shop A', group: 'G1', line: 'L1', actualWorkingDays: 24.0, excusedLeaveDays: 0.0, unexcusedLeaveDays: 0.0, isLocked: false },
  { id: '10', employeeId: 'V00882', fullName: 'HOÀNG VĂN THÁI', division: 'QA Division', department: 'Automation QA', shop: 'Shop C', group: 'G2', line: 'L2', actualWorkingDays: 21.0, excusedLeaveDays: 1.5, unexcusedLeaveDays: 0.5, isLocked: false },
];

export const AttendanceSummaryPage: React.FC = () => {
  const [data, setData] = useState<EmployeeSummary[]>(INITIAL_SUMMARIES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [standardWorkingDays, setStandardWorkingDays] = useState(24);
  const [showFilters, setShowFilters] = useState(false);

  // Interactive Options Checkboxes
  const [isOptionAutoSave, setIsOptionAutoSave] = useState(true);
  const [isOptionLockAll, setIsOptionLockAll] = useState(false);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isAggregating, setIsAggregating] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Get unique values for dropdowns
  const divisions = ['All', ...Array.from(new Set(INITIAL_SUMMARIES.map(item => item.division)))];
  const departments = ['All', ...Array.from(new Set(INITIAL_SUMMARIES.map(item => item.department)))];

  const getBillingCycleText = (monthStr: string) => {
    if (!monthStr || !monthStr.includes('-')) return '26/04/2026 - 25/05/2026';
    const parts = monthStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    const doubleDigit = (num: number) => num < 10 ? `0${num}` : `${num}`;
    return `26/${doubleDigit(prevMonth)}/${prevYear} - 25/${doubleDigit(month)}/${year}`;
  };

  // Filtering Logic
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiv = selectedDivision === 'All' || item.division === selectedDivision;
    const matchesDept = selectedDepartment === 'All' || item.department === selectedDepartment;
    return matchesSearch && matchesDiv && matchesDept;
  });

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  // Buttons Event Handlers
  const handleSearch = () => {
    showToast(`Tìm kiếm thành công! Đã tìm thấy ${filteredData.length} kết quả phù hợp.`, 'success');
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedDivision('All');
    setSelectedDepartment('All');
    setSelectedMonth('2026-05');
    setStandardWorkingDays(24);
    setIsOptionAutoSave(true);
    setIsOptionLockAll(false);
    setData(INITIAL_SUMMARIES);
    setSelectedIds([]);
    showToast('Đã làm mới bộ lọc và dữ liệu ban đầu.', 'info');
  };

  const handleAggregate = () => {
    setIsAggregating(true);
    setTimeout(() => {
      // Simulate real calculation of working days based on filter settings
      const updatedData = data.map(item => {
        const matchesDiv = selectedDivision === 'All' || item.division === selectedDivision;
        const matchesDept = selectedDepartment === 'All' || item.department === selectedDepartment;
        
        if (matchesDiv && matchesDept && !item.isLocked) {
          // Calculate dynamically with standard working days
          const calculatedWorking = +(standardWorkingDays - Math.random() * 2).toFixed(1);
          const calculatedExcused = +(Math.random() * 1.5).toFixed(1);
          const calculatedUnexcused = +(Math.random() * 0.5).toFixed(1);
          return {
            ...item,
            actualWorkingDays: calculatedWorking,
            excusedLeaveDays: calculatedExcused,
            unexcusedLeaveDays: calculatedUnexcused,
            isLocked: isOptionLockAll ? true : item.isLocked
          };
        }
        return item;
      });
      
      setData(updatedData);
      setIsAggregating(false);
      
      let msg = '🎉 Đã tổng hợp dữ liệu công thành công!';
      if (isOptionAutoSave) {
        msg += ' Hệ thống đã tự động lưu dữ liệu vào cơ sở dữ liệu lớn.';
      }
      showToast(msg, 'success');
    }, 1200);
  };

  const handleSave = () => {
    showToast('💾 Đã lưu dữ liệu tổng hợp công của tháng vào Database thành công!', 'success');
  };

  const handleLock = () => {
    if (selectedIds.length === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất một nhân viên từ bảng để khóa!', 'error');
      return;
    }
    const updated = data.map(item => {
      if (selectedIds.includes(item.id)) {
        return { ...item, isLocked: true };
      }
      return item;
    });
    setData(updated);
    showToast(`🔒 Đã KHÓA bảng công của ${selectedIds.length} nhân viên được chọn!`, 'success');
  };

  const handleUnlockSelected = () => {
    if (selectedIds.length === 0) {
      showToast('⚠️ Vui lòng chọn ít nhất một nhân viên từ bảng để mở khóa!', 'error');
      return;
    }
    const updated = data.map(item => {
      if (selectedIds.includes(item.id)) {
        return { ...item, isLocked: false };
      }
      return item;
    });
    setData(updated);
    showToast(`🔓 Đã MỞ KHÓA bảng công của ${selectedIds.length} nhân viên được chọn!`, 'info');
  };

  const handleExport = () => {
    showToast('📥 Xuất báo cáo dữ liệu định dạng IMIS_TIMESHEET_SUMMARY_MAY2026.xlsx thành công!', 'success');
  };

  const handleImport = () => {
    showToast('📤 Đang mở cổng kết nối nhận file... Bạn có thể tải file mẫu để import dữ liệu.', 'info');
  };

  // Quick edit value helper
  const handleUpdateValue = (id: string, field: 'actualWorkingDays' | 'excusedLeaveDays' | 'unexcusedLeaveDays', val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const target = data.find(i => i.id === id);
    if (target?.isLocked) {
      showToast(`⚠️ Nhân viên ${target.fullName} đã bị khóa, không thể chỉnh sửa trực tiếp!`, 'error');
      return;
    }
    
    const updated = data.map(item => {
      if (item.id === id) {
        return { ...item, [field]: num };
      }
      return item;
    });
    setData(updated);
  };

  return (
    <div className="flex-grow p-6 bg-transparent flex flex-col space-y-5 h-full overflow-y-auto w-full max-w-full">
      {/* Toast Alert Feedback Banner */}
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
                  : 'bg-blue-50 text-blue-800 border-blue-500 border-blue-250'
            }`}
          >
            <AlertCircle size={16} />
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Compact Control Center */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Main Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Quick Search & Toggle Filter */}
          <div className="flex items-center gap-2.5 flex-grow sm:flex-initial min-w-[280px] max-w-md">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Mã nhân viên hoặc Tên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold placeholder:text-slate-400 transition-all"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                showFilters 
                ? 'bg-slate-100 border-slate-350 text-slate-800 shadow-inner' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              <Filter size={13} className={showFilters ? 'text-slate-800' : 'text-slate-500'} />
              Bộ lọc
              <ChevronDown size={12} className={`transition-transform duration-150 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Right: Actions list */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button" 
              onClick={handleSearch}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              Tìm Kiếm
            </button>

            <button 
              type="button" 
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              Làm mới
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

            <button 
              type="button" 
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Save size={12} />
              Lưu
            </button>

            <button 
              type="button" 
              onClick={handleLock}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Lock size={12} />
              Khóa
            </button>

            <button 
              type="button" 
              onClick={handleUnlockSelected}
              className="px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
              title="Mở khóa các bản ghi đã chọn"
            >
              <Unlock size={12} />
              Mở khóa dòng chọn
            </button>

            <button 
              type="button" 
              onClick={handleExport}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Download size={12} />
              Xuất dữ liệu
            </button>

            <button 
              type="button" 
              onClick={handleImport}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Upload size={12} />
              Nhập dữ liệu
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Area */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 pt-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase pl-1">Division</label>
                  <select 
                    value={selectedDivision} 
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  >
                    {divisions.map(div => <option key={div} value={div}>{div === 'All' ? 'Tất cả Division' : div}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase pl-1">Department</label>
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'Tất cả Department' : dept}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase pl-1">Kỳ công tháng</label>
                  <input 
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      showToast(`Đã chuyển kỳ công sang tháng ${e.target.value}`, 'info');
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase pl-1">Chu kỳ tính công</label>
                  <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-250 text-slate-700 rounded-lg text-xs font-semibold select-none flex items-center h-[32px]">
                    {getBillingCycleText(selectedMonth)}
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase pl-1">Ngày công tiêu chuẩn</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="1"
                      max="31"
                      value={standardWorkingDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setStandardWorkingDays(val);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none rounded-lg text-xs font-semibold"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] font-extrabold text-slate-400">ngày</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Checkbox Parameters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4.5 pt-1 text-xs font-semibold text-slate-650 border-t border-slate-50">
          <label className="flex items-center space-x-2 cursor-pointer selection-none">
            <input 
              type="checkbox" 
              checked={isOptionAutoSave}
              onChange={(e) => setIsOptionAutoSave(e.target.checked)}
              className="rounded text-slate-800 focus:ring-slate-400 border-slate-300 text-xs w-[15px] h-[15px] cursor-pointer"
            />
            <span>Tự động lưu dữ liệu sau mỗi lần nhập</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer selection-none">
            <input 
              type="checkbox" 
              checked={isOptionLockAll}
              onChange={(e) => setIsOptionLockAll(e.target.checked)}
              className="rounded text-slate-800 focus:ring-slate-400 border-slate-300 text-xs w-[15px] h-[15px] cursor-pointer"
            />
            <span>Tự động khóa dữ liệu khi chốt công</span>
          </label>
        </div>
      </div>

      {/* Main Aggregation Data Table (Strict blueprint with dark blue headers) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <CheckSquare size={14} className="text-orange-500" />
            Bảng kết quả tổng hợp công ({filteredData.length} nhân viên)
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Dữ liệu kết xuất từ hệ thống đồng bộ vân tay và GPS IMIS
          </span>
        </div>

        <div className="overflow-x-auto w-full no-scrollbar-x select-none">
          <table className="w-full text-left border-collapse table-auto">
            {/* Table Header matching the exact original header dark navy color as in image */}
            <thead>
              <tr className="bg-[#0b2545] text-white text-[10.5px] font-black uppercase tracking-wider border-b border-slate-900">
                <th className="py-3.5 px-3 text-center w-12 border-r border-[#1e3a8a]/40">
                  <input 
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-none accent-orange-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 text-center w-16 border-r border-[#1e3a8a]/40">Khoá</th>
                <th className="py-3.5 px-3 text-center w-12 border-r border-[#1e3a8a]/40">STT</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40">Mã nhân viên</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40">Tên nhân viên</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40">Division</th>
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40">Department</th>
                
                {/* Visual matching of "Kỳ công tháng" */}
                <th className="py-3.5 px-4 border-r border-[#1e3a8a]/40 text-center bg-[#134074]/30 min-w-[124px]">
                  Kỳ công tháng
                </th>
                
                {/* Visual matching of "Số ngày làm việc thực tế" */}
                <th className="py-3.5 px-4 text-center border-r border-[#1e3a8a]/40 bg-[#134074]">
                  Số ngày làm việc thực tế
                </th>
                
                {/* Visual matching of "Số ngày nghỉ có phép" */}
                <th className="py-3.5 px-4 text-center border-r border-[#1e3a8a]/40 bg-[#134074]/90">
                  Số ngày nghỉ có phép
                </th>
                
                {/* Visual matching of "Số ngày nghỉ không phép" */}
                <th className="py-3.5 px-4 text-center bg-[#1e3a8a]">
                  Số ngày nghỉ không phép
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200/70 text-[11.5px] text-slate-700 font-bold bg-white">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const isSelected = selectedIds.includes(row.id);
                  const monthLabel = selectedMonth && selectedMonth.includes('-') 
                    ? `Tháng ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`
                    : 'Tháng 05/2026';
                  return (
                    <tr 
                      key={row.id}
                      className={`transition-colors duration-150 hover:bg-slate-50/80 ${
                        row.isLocked ? 'bg-slate-50/40 text-slate-450' : ''
                      } ${isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Select row checkbox */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="rounded text-orange-500 focus:ring-orange-500 border-gray-300 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Lock Status interactive toggle */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.map(item => {
                              if (item.id === row.id) {
                                return { ...item, isLocked: !item.isLocked };
                              }
                              return item;
                            });
                            setData(updated);
                            showToast(
                              row.isLocked 
                                ? `🔓 Đã mở khóa chỉnh sửa cho ${row.fullName}` 
                                : `🔒 Đã khóa bảng công cho ${row.fullName}`,
                              row.isLocked ? 'info' : 'success'
                            );
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            row.isLocked 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={row.isLocked ? "Bản ghi đã khóa (Click để mở khóa)" : "Bản ghi đang mở (Click để khóa)"}
                        >
                          {row.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      </td>

                      {/* STT */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* Mã NV */}
                      <td className="py-2.5 px-4 font-mono text-slate-900 border-r border-slate-100">
                        {row.employeeId}
                      </td>

                      {/* Tên NV */}
                      <td className="py-2.5 px-4 text-slate-900 uppercase tracking-tight border-r border-slate-100">
                        {row.fullName}
                      </td>

                      {/* Division */}
                      <td className="py-2.5 px-4 text-slate-600 border-r border-slate-100 truncate max-w-[130px]">
                        {row.division}
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-4 text-slate-600 border-r border-slate-100 truncate max-w-[125px]">
                        {row.department}
                      </td>

                      {/* Kỳ công tháng */}
                      <td className="py-2.5 px-4 text-center border-r border-slate-100 text-slate-800 bg-slate-50/30">
                        <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-[10px] font-black">
                          {monthLabel}
                        </span>
                      </td>

                      {/* Số ngày làm việc thực tế (Editable if unlocked, otherwise formatted) */}
                      <td className="py-2.5 px-4 border-r border-slate-100 text-center bg-slate-50/50">
                        {row.isLocked ? (
                          <span className="font-mono text-slate-800 text-xs font-black bg-slate-100 px-2.5 py-1 rounded">
                            {row.actualWorkingDays.toFixed(1)} ngày
                          </span>
                        ) : (
                          <div className="flex items-center justify-center">
                            <input 
                              type="number" 
                              step="0.5"
                              min="0"
                              max="31"
                              value={row.actualWorkingDays}
                              onChange={(e) => handleUpdateValue(row.id, 'actualWorkingDays', e.target.value)}
                              className="w-18 px-1.5 py-1 font-mono text-center font-black text-xs text-blue-700 bg-white border border-slate-300 rounded focus:border-blue-500 outline-none"
                            />
                          </div>
                        )}
                      </td>

                      {/* Số ngày nghỉ có phép (Editable if unlocked) */}
                      <td className="py-2.5 px-4 text-center bg-slate-50/50 border-r border-slate-100">
                        {row.isLocked ? (
                          <span className="font-mono text-slate-700 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded">
                            {row.excusedLeaveDays.toFixed(1)} ngày
                          </span>
                        ) : (
                          <div className="flex items-center justify-center">
                            <input 
                              type="number" 
                              step="0.5"
                              min="0"
                              max="31"
                              value={row.excusedLeaveDays}
                              onChange={(e) => handleUpdateValue(row.id, 'excusedLeaveDays', e.target.value)}
                              className="w-18 px-1.5 py-1 font-mono text-center text-xs text-emerald-700 bg-white border border-slate-300 rounded focus:border-emerald-500 outline-none font-bold"
                            />
                          </div>
                        )}
                      </td>

                      {/* Số ngày nghỉ không phép (Editable if unlocked) */}
                      <td className="py-2.5 px-4 text-center bg-slate-50/50">
                        {row.isLocked ? (
                          <span className="font-mono text-rose-800 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded">
                            {row.unexcusedLeaveDays.toFixed(1)} ngày
                          </span>
                        ) : (
                          <div className="flex items-center justify-center">
                            <input 
                              type="number" 
                              step="0.5"
                              min="0"
                              max="31"
                              value={row.unexcusedLeaveDays}
                              onChange={(e) => handleUpdateValue(row.id, 'unexcusedLeaveDays', e.target.value)}
                              className="w-18 px-1.5 py-1 font-mono text-center text-xs text-rose-700 bg-white border border-slate-300 rounded focus:border-rose-500 outline-none font-bold"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-450">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="text-slate-400" size={24} />
                      <span className="text-xs">Không tìm thấy bản ghi nhân viên nào trùng khớp với bộ lọc điều kiện!</span>
                      <button 
                        type="button" 
                        onClick={handleReset}
                        className="text-xs text-blue-600 hover:underline font-black mt-1"
                      >
                        Reset Bộ Lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Stats Bar */}
        <div className="bg-slate-50 border-t border-slate-200 p-4.5 flex flex-col md:flex-row md:items-center justify-between text-xs font-bold text-slate-600 gap-3">
          <div>
            Hiển thị <span className="text-slate-900 font-extrabold">{filteredData.length}</span> / <span className="text-slate-900">{data.length}</span> bản ghi nhân sự. 
            {selectedIds.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-extrabold">
                Đã chọn {selectedIds.length} bản ghi
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-white text-slate-400 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 bg-blue-600 border border-blue-600 rounded text-white font-extrabold text-xs">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded hover:bg-white text-slate-600">Tiếp</button>
          </div>
        </div>
      </div>
    </div>
  );
};
