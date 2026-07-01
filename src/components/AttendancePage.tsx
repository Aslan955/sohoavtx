import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Calendar as CalendarIcon, 
  Fingerprint, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  X,
  FileCheck,
  Building,
  Briefcase,
  HelpCircle,
  TrendingUp,
  User,
  Coffee,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttendanceDay {
  dayNum: number;
  month: number;
  year: number;
  shiftCode: string;
  checkIn: string;
  checkOut: string;
  workingCount: number; // e.g. 1.0, 0.78, 0.5, 0.0
  notes?: string;
  isHoliday?: boolean;
  status: 'draft' | 'confirmed';
}

export const AttendancePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 1)); // Start at May 2026
  const [activeSubTab, setActiveSubTab] = useState<'quan-ly-cong' | 'phe-duyet-ca' | 'ca-lam-viec'>('quan-ly-cong');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDay, setSelectedDay] = useState<AttendanceDay | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState({
    draft: true,
    confirmed: true,
  });

  // Simulator state
  const [liveTime, setLiveTime] = useState<string>('');
  const [liveDate, setLiveDate] = useState<string>('');
  const [punchLogs, setPunchLogs] = useState<Array<{ time: string; type: 'IN' | 'OUT' }>>([
    { time: '08:05', type: 'IN' },
    { time: '17:30', type: 'OUT' }
  ]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustType, setAdjustType] = useState('InCheck');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tick live time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setLiveDate(now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Static May 2026 Data based on User Screen Capture
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([
    // Week 18 (27/4 to 3/5)
    { dayNum: 27, month: 3, year: 2026, shiftCode: 'HC44', checkIn: '00:00', checkOut: '00:00', workingCount: 1.0, notes: 'Ngày nghỉ bù lễ;', isHoliday: true, status: 'confirmed' },
    { dayNum: 28, month: 3, year: 2026, shiftCode: 'HC44', checkIn: '08:07', checkOut: '17:11', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 29, month: 3, year: 2026, shiftCode: 'HC44', checkIn: '08:12', checkOut: '18:03', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 30, month: 3, year: 2026, shiftCode: 'HC44', checkIn: '00:00', checkOut: '00:00', workingCount: 1.0, notes: 'Ngày lễ;', isHoliday: true, status: 'confirmed' },
    { dayNum: 1, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '00:00', checkOut: '00:00', workingCount: 1.0, notes: 'Ngày lễ;', isHoliday: true, status: 'confirmed' },
    { dayNum: 2, month: 4, year: 2026, shiftCode: 'HC44/2', checkIn: '00:00', checkOut: '00:00', workingCount: 0.5, notes: '', isHoliday: false, status: 'draft' },
    { dayNum: 3, month: 4, year: 2026, shiftCode: 'NT', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Nghỉ tuần', isHoliday: true, status: 'confirmed' },

    // Week 19 (4/5 to 10/5)
    { dayNum: 4, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:50', checkOut: '17:07', workingCount: 0.91, notes: 'Không đủ giờ công', status: 'draft' },
    { dayNum: 5, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:10', checkOut: '17:13', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 6, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:05', checkOut: '17:06', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 7, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:13', checkOut: '17:18', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 8, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:14', checkOut: '17:16', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 9, month: 4, year: 2026, shiftCode: 'HC44/2', checkIn: '00:00', checkOut: '00:00', workingCount: 0.5, status: 'draft' },
    { dayNum: 10, month: 4, year: 2026, shiftCode: 'NT', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Nghỉ tuần', isHoliday: true, status: 'confirmed' },

    // Week 20 (11/5 to 17/5)
    { dayNum: 11, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:16', checkOut: '17:19', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 12, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:19', checkOut: '17:22', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 13, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:23', checkOut: '15:39', workingCount: 0.78, notes: 'Không đủ giờ công', status: 'draft' },
    { dayNum: 14, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:12', checkOut: '17:19', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 15, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:08', checkOut: '17:21', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 16, month: 4, year: 2026, shiftCode: 'HC44/2', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Không có dữ liệu chấm công', status: 'draft' },
    { dayNum: 17, month: 4, year: 2026, shiftCode: 'NT', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Nghỉ tuần', isHoliday: true, status: 'confirmed' },

    // Week 21 (18/5 to 24/5)
    { dayNum: 18, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:16', checkOut: '17:18', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 19, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:08', checkOut: '17:51', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 20, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '09:37', checkOut: '17:08', workingCount: 0.82, notes: 'Không đủ giờ công', status: 'draft' },
    { dayNum: 21, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Không có dữ liệu chấm công', status: 'draft' },
    { dayNum: 22, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: '', status: 'draft' },
    { dayNum: 23, month: 4, year: 2026, shiftCode: 'HC44/2', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: '', status: 'draft' },
    { dayNum: 24, month: 4, year: 2026, shiftCode: 'NT', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Nghỉ tuần', isHoliday: true, status: 'confirmed' },

    // Week 22 (25/5 to 31/5)
    { dayNum: 25, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:05', checkOut: '17:15', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 26, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:10', checkOut: '17:20', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 27, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:12', checkOut: '17:14', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 28, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:04', checkOut: '17:09', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 29, month: 4, year: 2026, shiftCode: 'HC44', checkIn: '08:15', checkOut: '17:18', workingCount: 1.0, status: 'confirmed' },
    { dayNum: 30, month: 4, year: 2026, shiftCode: 'HC44/2', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Nghỉ bù', isHoliday: true, status: 'draft' },
    { dayNum: 31, month: 4, year: 2026, shiftCode: 'NT', checkIn: '00:00', checkOut: '00:00', workingCount: 0, notes: 'Nghỉ tuần', isHoliday: true, status: 'confirmed' },
  ]);

  const handleSimulatePunch = (type: 'IN' | 'OUT') => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const logObj = { time: timeStr, type };
    setPunchLogs([logObj, ...punchLogs]);
    
    // Attempt to update today's card (May 21, index position 24 in our static data which holds dayNum: 21, month: 4)
    const clone = [...attendanceData];
    const todayIndex = clone.findIndex(d => d.dayNum === 21 && d.month === 4);
    if (todayIndex !== -1) {
      if (type === 'IN') {
        clone[todayIndex].checkIn = timeStr;
      } else {
        clone[todayIndex].checkOut = timeStr;
      }
      // Re-calculate working count
      if (clone[todayIndex].checkIn !== '00:00' && clone[todayIndex].checkOut !== '00:00') {
        clone[todayIndex].workingCount = 1.0;
        clone[todayIndex].notes = 'Chấm công vân tay live';
      } else if (clone[todayIndex].checkIn !== '00:00') {
        clone[todayIndex].workingCount = 0.5;
        clone[todayIndex].notes = 'Chỉ có giờ vào';
      }
      setAttendanceData(clone);
    }

    triggerToast(`🎉 Thiết bị ghi nhận: ${type === 'IN' ? 'VÀO CA' : 'RA CA'} thành công lúc ${timeStr}!`);
  };

  const handleRequestCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    
    triggerToast(`📩 Đã nộp đề xuất điều chỉnh giờ Chấm công ngày ${selectedDay.dayNum}/05 thành công! Chờ cấp trên phê duyệt.`);
    setShowAdjustmentModal(false);
    setAdjustmentReason('');
  };

  // Helper logic to find if day has filter matching
  const filteredDays = attendanceData.filter(d => {
    // search text
    const stringified = `${d.dayNum} ${d.shiftCode} ${d.notes || ''} ${d.checkIn}-${d.checkOut}`;
    const matchesSearch = stringified.toLowerCase().includes(searchTerm.toLowerCase());
    
    // state checks
    const matchesStatus = (d.status === 'draft' && statusFilter.draft) || 
                          (d.status === 'confirmed' && statusFilter.confirmed);

    return matchesSearch && matchesStatus;
  });

  const renderDayCell = (d: AttendanceDay, index: number) => {
    const isNT = d.shiftCode === 'NT';
    const isHoliday = d.isHoliday;
    const isOffDay = isNT || isHoliday;
    const isToday = d.dayNum === 21 && d.month === 4;

    // Check filters to dim unmatching days
    const isFilteredOut = !filteredDays.some(fd => fd.dayNum === d.dayNum && fd.month === d.month && fd.year === d.year);

    let cardBgClass = '';
    let borderClass = '';
    let textClass = '';
    let badgeClass = '';
    let statusText = d.notes || '';

    if (isHoliday) {
      cardBgClass = 'bg-[#ecfeff]/90 hover:bg-[#cffafe]'; // Cyan/teal pastel for holidays
      borderClass = 'border-cyan-200/80';
      textClass = 'text-cyan-900';
      badgeClass = 'bg-cyan-100/80 text-cyan-800';
      if (!statusText) statusText = 'Ngày lễ';
    } else if (isNT) {
      cardBgClass = 'bg-[#f8fafc]/90 hover:bg-[#f1f5f9]'; // Light slate gray for rest days
      borderClass = 'border-slate-200/80';
      textClass = 'text-slate-600';
      badgeClass = 'bg-slate-200/80 text-slate-700';
      if (!statusText) statusText = 'Nghỉ tuần';
    } else if (d.workingCount >= 1.0) {
      cardBgClass = 'bg-[#f0fdf4] hover:bg-[#dcfce7]'; // Emerald green pastel for full day
      borderClass = 'border-emerald-200/80';
      textClass = 'text-emerald-900';
      badgeClass = 'bg-emerald-100 text-emerald-800';
    } else if (d.workingCount > 0) {
      cardBgClass = 'bg-[#fffbeb] hover:bg-[#fef3c7]'; // Yellow/amber warning for partial hours
      borderClass = 'border-amber-200';
      textClass = 'text-amber-900';
      badgeClass = 'bg-amber-100 text-amber-800';
      if (!statusText) statusText = 'Thiếu giờ công';
    } else {
      // Absent / Missing clock-in
      cardBgClass = 'bg-[#fff1f2] hover:bg-[#ffe4e6]'; // Soft rose/pink pastel for missing data
      borderClass = 'border-rose-200/80';
      textClass = 'text-rose-900';
      badgeClass = 'bg-rose-100 text-rose-800';
      if (!statusText) statusText = 'Không chấm công';
    }

    return (
      <div 
        key={`day-${d.dayNum}-${d.month}-${index}`} 
        onClick={() => setSelectedDay(d)} 
        className={`p-3.5 rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-md border text-left active:scale-[98%] relative group min-h-[120px] ${cardBgClass} ${borderClass} ${
          isToday ? 'ring-2 ring-red-500 ring-offset-2 z-10 shadow-sm' : ''
        } ${isFilteredOut ? 'opacity-30 blur-[0.5px] pointer-events-none' : ''}`}
      >
        {/* Top: Shift code & day */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black tracking-wider uppercase opacity-75">{d.shiftCode}</span>
          <span className={`text-xs font-black min-w-5 h-5 flex items-center justify-center rounded-full ${
            isToday 
              ? 'text-white bg-red-500 font-extrabold px-1.5' 
              : 'text-slate-500'
          }`}>
            {d.dayNum}
          </span>
        </div>
        
        {/* Middle: check-in / check-out times */}
        <div className="my-2">
          {isOffDay && (d.checkIn === '00:00' || !d.checkIn) ? (
            <div className="text-[12px] font-semibold text-slate-400 font-mono tracking-tight text-center">
              -- : --
            </div>
          ) : (
            <div className="text-[12px] font-extrabold font-mono text-slate-800 tracking-tight text-center">
              {d.checkIn !== '00:00' && d.checkOut !== '00:00' 
                ? `${d.checkIn} - ${d.checkOut}` 
                : d.checkIn !== '00:00' ? `${d.checkIn} - --:--` : '--:-- - --:--'}
            </div>
          )}
          
          {/* Badge indicator */}
          <div className="text-center mt-1.5">
            <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md inline-block tracking-tight ${badgeClass}`}>
              {d.workingCount} công
            </span>
          </div>
        </div>

        {/* Bottom: Note or Status message */}
        <div className={`text-[8.5px] font-black tracking-tight text-center truncate max-w-full leading-tight uppercase ${
          !isOffDay && d.workingCount < 1.0 ? 'text-red-600' : 'text-slate-500'
        }`}>
          {isToday ? '★ Hôm nay' : statusText || ' '}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-transparent font-sans">
      {/* LEFT INNER COLUMN NAVIGATION */}
      <div className="w-56 bg-white border-r border-slate-100 flex flex-col pt-3 shrink-0">
        <div className="px-4 py-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
          CHẤM CÔNG CÁ NHÂN
        </div>
        <div className="mt-2 space-y-1 px-2 flex-1">
          <button 
            onClick={() => setActiveSubTab('quan-ly-cong')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
              activeSubTab === 'quan-ly-cong' 
                ? 'bg-[#10b981]/10 text-[#0f766e] border-l-4 border-[#10b981]' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock size={16} className="mr-2" />
            Quản lý công
          </button>
          <button 
            onClick={() => setActiveSubTab('phe-duyet-ca')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
              activeSubTab === 'phe-duyet-ca' 
                ? 'bg-[#10b981]/10 text-[#0f766e] border-l-4 border-[#10b981]' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCheck size={16} className="mr-2" />
            Phê duyệt phân ca
          </button>
          <button 
            onClick={() => setActiveSubTab('ca-lam-viec')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
              activeSubTab === 'ca-lam-viec' 
                ? 'bg-[#10b981]/10 text-[#0f766e] border-l-4 border-[#10b981]' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building size={16} className="mr-2" />
            Ca làm việc
          </button>
        </div>

        {/* User Card Metadata inside Navigation */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
              VU
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-800 leading-none">Nguyễn Văn User</div>
              <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Mã NV: V00497</div>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER INTERACTIVE CALENDAR CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Dynamic Navigation Toolbar and Heading */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 sticky top-0 z-15">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-black text-slate-800 tracking-tight flex items-center">
              Quản lý công
              <span className="text-[11px] bg-slate-100 text-slate-500 rounded-md px-2 py-0.5 ml-2 font-bold uppercase tracking-wider">
                Tháng 5 2026
              </span>
            </h1>

            {/* Red / Dark Arrow controller as pictured */}
            <div className="flex items-center space-x-1.5 ml-4">
              <button 
                onClick={() => triggerToast('Đã di chuyển tới tháng 04/2026')}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold shadow-sm flex items-center transition-all active:scale-95"
              >
                Hôm nay
              </button>
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <button 
                  onClick={() => triggerToast('Xem tháng trước đó')}
                  className="p-1.5 hover:bg-white text-rose-600 rounded-md transition-colors"
                >
                  <ChevronLeft size={14} className="stroke-[3px]" />
                </button>
                <button 
                  onClick={() => triggerToast('Xem tháng kế tiếp')}
                  className="p-1.5 hover:bg-white text-rose-600 rounded-md transition-colors"
                >
                  <ChevronRight size={14} className="stroke-[3px]" />
                </button>
              </div>
            </div>

            {/* View selectors */}
            <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[11px] font-bold">
              <button 
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Ngày
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tuần
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tháng
              </button>
            </div>
          </div>

          {/* Right Toolbar Options */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-40 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 outline-none rounded-lg text-xs font-semibold tracking-tight transition-all"
              />
              <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <button 
              onClick={() => triggerToast('Bộ lọc nâng cao của Timekeeping')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center space-x-1.5 border border-slate-200 transition-colors"
            >
              <Filter size={12} />
              <span>Các bộ lọc</span>
              <ChevronDown size={10} />
            </button>

            <button 
              onClick={() => triggerToast('Đã lưu mục này vào danh sách Yêu thích')}
              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-500 border border-amber-200 rounded-lg transition-colors"
              title="Yêu thích"
            >
              <Star size={14} className="fill-current" />
            </button>
          </div>
        </div>

        {/* CALENDAR BODY */}
        {activeSubTab === 'quan-ly-cong' ? (
          <div className="p-4 flex-1 flex flex-col space-y-4">
            
            {/* Color Legend Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col flex-wrap lg:flex-row lg:items-center justify-between text-xs font-bold text-slate-600 gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-[#0f766e] font-black text-xs uppercase tracking-widest bg-[#10b981]/10 px-2.5 py-1 rounded-lg">
                  Chú thích màu công
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#f0fdf4] border border-emerald-200 block"></span>
                  <span className="text-xs text-slate-600 font-bold">Đủ công (≥1.0)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#fffbeb] border border-amber-200 block"></span>
                  <span className="text-xs text-slate-600 font-bold">Thiếu giờ công (&lt;1.0)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#fff1f2] border border-rose-200 block"></span>
                  <span className="text-xs text-slate-600 font-bold">Không chấm công / Vắng</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#f8fafc] border border-slate-200 block"></span>
                  <span className="text-xs text-slate-600 font-bold">Nghỉ tuần (NT)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#ecfeff] border border-cyan-200 block"></span>
                  <span className="text-xs text-slate-600 font-bold">Nghỉ lễ (H)</span>
                </div>
              </div>
            </div>

            {/* Grid Calendar Header and Body */}
            <div className="bg-slate-100/55 border border-slate-200 rounded-3xl p-3 shadow-sm min-w-[750px] flex-1 flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-center text-[10.5px] font-black text-slate-500 uppercase tracking-widest mb-3 shadow-xs">
                <div className="flex items-center justify-center font-bold text-slate-400">W</div>
                <div className="py-1">Thứ 2</div>
                <div className="py-1">Thứ 3</div>
                <div className="py-1">Thứ 4</div>
                <div className="py-1">Thứ 5</div>
                <div className="py-1">Thứ 6</div>
                <div className="py-1">Thứ 7</div>
                <div className="py-1 text-rose-600">Chủ Nhật</div>
              </div>

              {/* Grid content rows */}
              <div className="space-y-2 flex-grow overflow-y-auto">
                {[18, 19, 20, 21, 22].map((weekNum, idx) => {
                  const startIdx = idx * 7;
                  const weekDays = attendanceData.slice(startIdx, startIdx + 7);
                  return (
                    <div key={`week-row-${weekNum}`} className="grid grid-cols-[50px_repeat(7,1fr)] gap-2 items-stretch">
                      {/* Week marker */}
                      <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-xs font-black text-slate-400 shadow-xs">
                        <span className="text-[8px] tracking-wider text-slate-400 uppercase leading-none mb-1">Tuần</span>
                        <span className="text-xs font-black text-slate-600">{weekNum}</span>
                      </div>
                      
                      {weekDays.map((d, index) => renderDayCell(d, startIdx + index))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 mb-4">
              <CalendarIcon size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Thông báo hệ thống</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              Chức năng '{activeSubTab === 'phe-duyet-ca' ? 'Phê duyệt phân ca' : 'Danh sách Ca làm việc'}' thuộc quyền hạn Quản lý hoặc Nhân sự. Bạn hiện tại đang xem với vai trò Nhân viên.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR WITH PHYSICAL TIME-CLOCK PUNCH SIMULATOR */}
      <div className="w-80 bg-white border-l border-slate-200 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="space-y-6">
          
          {/* 1. Live fingerprint clock */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center space-x-2 text-emerald-400">
              <Fingerprint size={18} className="animate-pulse" />
              <div className="text-[9px] font-black uppercase tracking-widest leading-none">Chấm công live GPS/Wifi</div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black font-mono tracking-wider">{liveTime}</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{liveDate}</div>
            </div>

            {/* Quick check-in action simulator */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSimulatePunch('IN')}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                <span>CHẤM VÀO</span>
              </button>
              <button 
                onClick={() => handleSimulatePunch('OUT')}
                className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                <span>CHẤM RA</span>
              </button>
            </div>
          </div>

          {/* 2. Mini checkin log container */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lịch sử hôm nay (21/05)</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            
            <div className="mt-3 space-y-2.5">
              {punchLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span>Tọa độ thiết bị (Văn phòng)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${
                    log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {log.type} {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Small monthly mini calendar picker as pictured */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Th05 2026</span>
              <div className="flex items-center space-x-1">
                <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={12} /></button>
                <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={12} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-slate-400">
              <span className="text-slate-300">T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
              
              {/* Fake grid days for Mini calendar representation */}
              <span className="text-slate-200">27</span>
              <span className="text-slate-200">28</span>
              <span className="text-slate-200">29</span>
              <span className="text-slate-200">30</span>
              <span className="text-slate-300">1</span>
              <span className="text-slate-300">2</span>
              <span className="text-slate-300">3</span>

              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>

              <span>11</span>
              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>

              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span className="bg-blue-600 text-white rounded-md font-extrabold">21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>

              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
              <span>30</span>
              <span>31</span>
            </div>
          </div>

          {/* 4. Filter parameters */}
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              TRẠNG THÁI HIỂN THỊ
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={statusFilter.draft}
                  onChange={(e) => setStatusFilter({...statusFilter, draft: e.target.checked})}
                  className="rounded text-[#10b981] focus:ring-[#10b981] border-gray-300 text-xs w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                  Soạn thảo / Bản nháp
                </span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={statusFilter.confirmed}
                  onChange={(e) => setStatusFilter({...statusFilter, confirmed: e.target.checked})}
                  className="rounded text-[#10b981] focus:ring-[#10b981] border-gray-300 text-xs w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                  Đã xác nhận / Phê duyệt
                </span>
              </label>
            </div>
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
          IMIS Timekeeping System v4.2
        </div>
      </div>

      {/* DETAIL DRAWER / POPUP OVERLAY */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header detail */}
                <div className="p-6 border-b border-light gray flex items-center justify-between bg-slate-50">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Clock size={20} /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 leading-none">CHI TIẾT CHẤM CÔNG</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Ngày {selectedDay.dayNum}, Tháng 5/2026</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* State Indicators */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái công</span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${selectedDay.workingCount >= 1.0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className="text-xs font-black text-slate-700 capitalize">{selectedDay.status === 'confirmed' ? 'Đã phê duyệt' : 'Chưa xác nhận'}</span>
                    </div>
                  </div>

                  {/* Day analytics block */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Giờ Vào Ca</label>
                      <span className="text-sm font-black text-emerald-800">{selectedDay.checkIn !== '00:00' ? selectedDay.checkIn : '--:--'}</span>
                    </div>
                    <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Giờ Ra Ca</label>
                      <span className="text-sm font-black text-rose-800">{selectedDay.checkOut !== '00:00' ? selectedDay.checkOut : '--:--'}</span>
                    </div>
                  </div>

                  {/* Detailed Information list */}
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2.5 border-b border-slate-100">
                      <span>Ca làm việc đăng ký:</span>
                      <span className="text-slate-800 font-extrabold">{selectedDay.shiftCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2.5 border-b border-slate-100">
                      <span>Tổng công nhận:</span>
                      <span className="text-slate-800 font-extrabold">{selectedDay.workingCount} công</span>
                    </div>
                    {selectedDay.notes && (
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2.5 border-b border-slate-100">
                        <span>Ghi chú công:</span>
                        <span className="text-rose-600 font-extrabold">{selectedDay.notes}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2.5">
                      <span>Hình thức ghi nhận:</span>
                      <span className="text-slate-800 font-extrabold flex items-center">
                        <MapPin size={12} className="mr-1 text-emerald-500" /> Web GPS Fingerprint
                      </span>
                    </div>
                  </div>

                  {/* Error Adjustment CTA */}
                  {selectedDay.workingCount < 1.0 && !selectedDay.isHoliday && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-start space-x-3 mt-4">
                      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                      <div>
                        <div className="text-[11px] font-black text-amber-900 uppercase">Phát hiện lỗi chấm công</div>
                        <p className="text-[10.5px] text-amber-700 font-medium leading-relaxed mt-1">
                          Hệ thống cảnh báo ngày này chưa đủ giờ công quy định. Bạn có thể gửi đơn điều chỉnh để nhận đầy đủ quyền lợi.
                        </p>
                        <button 
                          onClick={() => setShowAdjustmentModal(true)}
                          className="mt-2.5 px-3.5 py-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-black hover:bg-amber-700 transition-colors uppercase"
                        >
                          Tạo đơn điều chỉnh công
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom footer drawer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedDay(null)} 
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Đóng lại
                </button>
                <button 
                  onClick={() => {
                    triggerToast(`🎉 Đã gửi yêu cầu Approve cho ngày ${selectedDay.dayNum} thành công!`);
                    setSelectedDay(null);
                  }} 
                  className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Confirm Công
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ERROR ADJUSTMENT SUBMITTAL POPUP */}
      <AnimatePresence>
        {showAdjustmentModal && selectedDay && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdjustmentModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-20"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={16} /></div>
                  <span className="text-xs font-black text-slate-800 uppercase">TẠO ĐƠN ĐIỀU CHỈNH GIỜ CHẤM CÔNG</span>
                </div>
                <button onClick={() => setShowAdjustmentModal(false)} className="p-1 hover:bg-slate-200 rounded-full">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleRequestCorrection} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Loại điều chỉnh</label>
                  <select 
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
                  >
                    <option value="InCheck">Bổ sung giờ vào ca (Clock In)</option>
                    <option value="OutCheck">Bổ sung giờ ra ca (Clock Out)</option>
                    <option value="Both">Bổ sung cả hai (In & Out)</option>
                    <option value="LeaveDirect">Yêu cầu tính công đặc thù</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Giờ Đề xuất *</label>
                    <input 
                      type="text" required placeholder="Ví dụ: 08:00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ngày Sự kiện</label>
                    <input 
                      type="text" disabled value={`${selectedDay.dayNum}/05/2026`}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Giải trình lý do rõ ràng *</label>
                  <textarea 
                    required 
                    placeholder="Quên quẹt thẻ vân tay / Thiết bị cơ quan bị lỗi ghi nhận..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none h-20 resize-none focus:border-amber-500"
                  />
                </div>

                <p className="text-[10px] text-gray-400 font-bold leading-normal italic text-center">
                  ⚠️ Đơn sẽ được chuyển thẳng tới Manager trực tiếp duyệt. Mọi hành vi cố tình giải trình gian lận sẽ được tính là vi phạm nội quy lao động IMIS.
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowAdjustmentModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Bỏ qua
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Ký số & Gửi đơn
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM ACCENTS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center space-x-3 min-w-[280px]"
          >
            <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs">
              ✓
            </div>
            <span className="text-[11.5px] font-extrabold tracking-tight text-slate-200">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
