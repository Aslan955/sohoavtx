import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  XCircle, 
  Inbox, 
  FileText, 
  ClipboardList, 
  Bell, 
  Heart, 
  Award, 
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MOCK_LEAVES, 
  MOCK_TIMESHEETS, 
  MOCK_PERSONAL_LEAVE, 
  MOCK_HR_TICKETS, 
  LeaveRequest, 
  TimesheetEntry, 
  LeaveBalance, 
  HRTicket 
} from '../constants';

interface DashboardProps {
  onNavigate?: (item: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Current time state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishesSent, setWishesSent] = useState<Record<string, boolean>>({});
  
  // Data states initialized from constants
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(MOCK_TIMESHEETS);
  const [personalLeave, setPersonalLeave] = useState<LeaveBalance>(MOCK_PERSONAL_LEAVE);
  const [hrTickets, setHrTickets] = useState<HRTicket[]>(MOCK_HR_TICKETS);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Sync clock time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getVietnameseDateTimeString = (date: Date) => {
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const weekday = weekdays[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${weekday}, ${dd}/${mm}/${yyyy} - ${hh}:${min}:${ss}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Birthday list combining original IMIS birthdays and others
  const birthdays = [
    { id: 'b-1', name: 'Bùi Thu Hiền', role: 'Merchandise', date: 'Hôm nay', isToday: true, avatar: 'https://ui-avatars.com/api/?name=Bui+Hien&background=ffeedd&color=e67e22&bold=true' },
    { id: 'b-2', name: 'Nguyễn Khắc Hiển', role: 'MB Infrastructure', date: 'Hôm nay', isToday: true, avatar: 'https://ui-avatars.com/api/?name=Khac+Hien&background=e3f2fd&color=0d47a1&bold=true' },
    { id: 'b-3', name: 'Ánh Dương', role: 'SEO Specialist', date: '03/07', isToday: false, avatar: 'https://ui-avatars.com/api/?name=Anh+Duong&background=0fa57c&color=fff&bold=true' },
    { id: 'b-4', name: 'Nguyễn Văn Nam', role: 'Marketing Manager', date: '18/06', isToday: false, avatar: 'https://ui-avatars.com/api/?name=Nguyen+Nam&background=4f46e5&color=fff&bold=true' },
  ];

  const handleSendWish = (id: string, name: string) => {
    setWishesSent(prev => ({ ...prev, [id]: true }));
    showToast(`🎉 Đã gửi lời chúc mừng sinh nhật thành công tới ${name}!`);
  };

  // Quick Approve/Reject Action handlers
  const handleApproveLeave = (id: string, applicant: string) => {
    setLeaves(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' as const } : item));
    showToast(`✅ Đã phê duyệt đơn xin nghỉ phép của ${applicant} thành công!`);
  };

  const handleRejectLeave = (id: string, applicant: string) => {
    setLeaves(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected' as const } : item));
    showToast(`❌ Đã từ chối đơn xin nghỉ phép của ${applicant}.`);
  };

  const handleApproveTimesheet = (id: string, author: string) => {
    setTimesheets(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' as const } : item));
    showToast(`✅ Đã phê duyệt bảng công của ${author} thành công!`);
  };

  const handleRejectTimesheet = (id: string, author: string) => {
    setTimesheets(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected' as const } : item));
    showToast(`❌ Đã từ chối bảng công của ${author}.`);
  };

  // Filter lists based on quick search
  const filteredLeaves = leaves.filter(item => 
    item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTimesheets = timesheets.filter(item => 
    item.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Computed Counts
  const pendingLeavesCount = leaves.filter(l => l.status === 'Requested').length;
  const pendingTimesheetsCount = timesheets.filter(t => t.status === 'Requested').length;
  const pendingTicketsCount = hrTickets.filter(t => t.status === 'Pending HR').length;

  return (
    <div className="p-6 bg-transparent min-h-full space-y-6 relative select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#0f172a]/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700/50 flex items-center space-x-3 text-xs font-bold font-sans pointer-events-auto"
          >
            <div className="w-2 h-2 rounded-full bg-[#0fa57c] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Welcoming Header Area with Fwork Style */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-2 border-b border-slate-200/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Chào admin, chúc một ngày hiệu quả
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Bảng tổng quan Portal IMIS — {currentTime.toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* Live Clock Pill (Fwork style) */}
        <div className="flex items-center">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full shadow-xs flex items-center space-x-2.5 text-xs font-bold text-slate-600 font-mono">
            <Clock size={14} className="text-[#0fa57c] animate-pulse" />
            <span>{getVietnameseDateTimeString(currentTime)}</span>
          </div>
        </div>


      </div>

      {/* 2. Key Metrics Row (3 Fwork style responsive widgets with emerald accent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric 1: Remaining Personal Leave */}
        <div 
          onClick={() => onNavigate && onNavigate('Phép cá nhân')}
          className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm hover:border-[#0fa57c]/40 transition-all duration-200 relative overflow-hidden group cursor-pointer"
        >
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quỹ phép còn lại</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">{personalLeave.remaining}</span>
              <span className="text-xs font-semibold text-slate-400">/ {personalLeave.totalEntitlement} ngày</span>
            </div>
            <p className="text-[10px] font-bold text-[#0fa57c] flex items-center gap-1">
              <TrendingUp size={11} /> Đã sử dụng {personalLeave.used} ngày
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-[#0fa57c] group-hover:scale-110 transition-transform duration-300">
            <Calendar size={20} />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-50/20 rounded-full blur-2xl pointer-events-none group-hover:bg-[#0fa57c]/5 transition-colors" />
        </div>

        {/* Metric 2: Pending Leave Requests */}
        <div 
          onClick={() => onNavigate && onNavigate('Leaves')}
          className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm hover:border-[#0fa57c]/40 transition-all duration-200 relative overflow-hidden group cursor-pointer"
        >
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn phép chờ duyệt</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">{pendingLeavesCount}</span>
              <span className="text-xs font-semibold text-slate-400">yêu cầu</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">Đang cần bạn xem xét</p>
          </div>
          <div className={`p-3.5 rounded-xl ${pendingLeavesCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'} group-hover:scale-110 transition-transform duration-300`}>
            <Inbox size={20} />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-50/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/5 transition-colors" />
        </div>

        {/* Metric 3: Pending Timesheets */}
        <div 
          onClick={() => onNavigate && onNavigate('Timesheet')}
          className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm hover:border-[#0fa57c]/40 transition-all duration-200 relative overflow-hidden group cursor-pointer"
        >
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timesheet chờ duyệt</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">{pendingTimesheetsCount}</span>
              <span className="text-xs font-semibold text-slate-400">bảng công</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">Yêu cầu xác nhận tuần</p>
          </div>
          <div className={`p-3.5 rounded-xl ${pendingTimesheetsCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} group-hover:scale-110 transition-transform duration-300`}>
            <FileText size={20} />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/5 transition-colors" />
        </div>
      </div>

      {/* 3. Personal Leave Balance Details & Birthdays Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personal Leave Balance Details Card */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-[#0fa57c] rounded-xl"><Award size={16} /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Quỹ Nghỉ Phép Cá Nhân (2026)</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Chi tiết hạn mức phép của admin</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate && onNavigate('Phép cá nhân')}
                className="text-xs font-bold text-[#0fa57c] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Structured Leave fields matching original IMIS metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hạn mức phép gốc</span>
                <span className="text-xl font-black text-slate-800 font-mono mt-1">{personalLeave.totalEntitlement} <span className="text-[11px] font-semibold text-slate-400">ngày</span></span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tồn năm ngoái</span>
                <span className="text-xl font-black text-slate-800 font-mono mt-1">{personalLeave.carriedForward} <span className="text-[11px] font-semibold text-slate-400">ngày</span></span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cấp thêm (Bonus)</span>
                <span className="text-xl font-black text-[#0fa57c] font-mono mt-1">+{personalLeave.granted} <span className="text-[11px] font-semibold text-slate-400">ngày</span></span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đã nghỉ (Used)</span>
                <span className="text-xl font-black text-slate-800 font-mono mt-1">{personalLeave.used} <span className="text-[11px] font-semibold text-slate-400">ngày</span></span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đang chờ duyệt</span>
                <span className="text-xl font-black text-amber-600 font-mono mt-1">{personalLeave.pendingApproval} <span className="text-[11px] font-semibold text-slate-400">ngày</span></span>
              </div>
              <div className="p-3 bg-[#0fa57c]/5 rounded-xl border border-[#0fa57c]/10 flex flex-col justify-between">
                <span className="text-[10px] text-[#0fa57c] font-bold uppercase tracking-wider">Phép còn lại</span>
                <span className="text-xl font-black text-emerald-800 font-mono mt-1">{personalLeave.remaining} <span className="text-[11px] font-semibold text-emerald-600">ngày</span></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button 
              onClick={() => onNavigate && onNavigate('Leaves')}
              className="px-4 py-2 bg-[#0fa57c] hover:bg-[#0fa57c]/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-800/15 cursor-pointer active:scale-95"
            >
              Nộp đơn nghỉ phép
            </button>
          </div>
        </div>

        {/* Upcoming Birthdays Card */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Gift size={16} /></div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sinh Nhật Nhân Sự Sắp Tới</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Chào đón tuổi mới cùng các thành viên</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[195px] pr-1">
            {birthdays.map((person) => (
              <div 
                key={person.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                  person.isToday 
                    ? 'bg-rose-50/40 border-rose-100' 
                    : 'bg-slate-50/40 border-slate-100 hover:border-slate-200/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={person.avatar} 
                      alt={person.name} 
                      className="w-10 h-10 rounded-full border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    {person.isToday && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white">🎂</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">{person.name}</span>
                      {person.isToday && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-wider rounded">Hôm nay</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">{person.role} • <span className="font-bold text-slate-500">{person.date}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendWish(person.id, person.name)}
                  disabled={wishesSent[person.id]}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    wishesSent[person.id]
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed'
                      : 'bg-rose-500 hover:bg-rose-600 text-white active:scale-95'
                  }`}
                >
                  {wishesSent[person.id] ? 'Đã gửi' : 'Chúc'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Leave Queue & Timesheet Queue Double Grids */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Leave Requests Pending Queue (Grid 5) */}
        <div className="xl:col-span-7 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Inbox size={16} /></div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Yêu Cầu Nghỉ Phép Mới Nhất</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Đơn gửi từ nhân sự đang chờ xử lý</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('Leaves')}
              className="text-xs font-bold text-[#0fa57c] hover:underline flex items-center space-x-1"
            >
              <span>Tất cả đơn</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Loại phép</th>
                  <th className="py-2.5 px-3 text-center">Tổng giờ</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLeaves.slice(0, 4).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-3 px-3 font-bold text-slate-700">
                      <div>{item.fullName}</div>
                      <div className="text-[9px] text-slate-400 font-medium tracking-tight mt-0.5">{item.project}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-500">{item.leaveType}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 font-mono">{item.totalHours}h</td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      <div className="text-[10px] font-mono">{item.startDate}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.endDate}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center">
                        {item.status === 'Requested' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded-md border border-amber-100">Chờ duyệt</span>
                        ) : item.status === 'Approved' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-md border border-emerald-100">Đã duyệt</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-bold rounded-md border border-rose-100">Từ chối</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.status === 'Requested' ? (
                          <>
                            <button 
                              onClick={() => handleApproveLeave(item.id, item.fullName)}
                              title="Duyệt đơn" 
                              className="p-1 hover:bg-emerald-50 text-[#0fa57c] rounded transition-colors cursor-pointer"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button 
                              onClick={() => handleRejectLeave(item.id, item.fullName)}
                              title="Từ chối đơn" 
                              className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors cursor-pointer"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Không thể sửa</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                      Không tìm thấy yêu cầu nghỉ phép nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timesheet Approval Queue (Grid 6) */}
        <div className="xl:col-span-5 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FileText size={16} /></div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Timesheet Cần Phê Duyệt</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Hồ sơ xác nhận bảng công hàng tuần</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('Timesheet')}
              className="text-xs font-bold text-[#0fa57c] hover:underline flex items-center space-x-1"
            >
              <span>Xem bảng công</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[350px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2.5 px-3">Nhân sự</th>
                  <th className="py-2.5 px-3">Dự án</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Duyệt nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTimesheets.slice(0, 4).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-3.5 px-3 font-bold text-slate-700">{item.authorName}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-500 truncate max-w-[120px]" title={item.projectName}>
                      {item.projectName}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex justify-center">
                        {item.status === 'Requested' ? (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded-md border border-orange-100">Cần duyệt</span>
                        ) : item.status === 'Approved' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-md border border-emerald-100">Đã duyệt</span>
                        ) : item.status === 'Draft' ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-md border border-slate-200">Nháp</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-bold rounded-md border border-rose-100">Từ chối</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.status === 'Requested' ? (
                          <>
                            <button 
                              onClick={() => handleApproveTimesheet(item.id, item.authorName)}
                              title="Duyệt bảng công" 
                              className="p-1 hover:bg-emerald-50 text-[#0fa57c] rounded transition-colors cursor-pointer"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button 
                              onClick={() => handleRejectTimesheet(item.id, item.authorName)}
                              title="Từ chối bảng công" 
                              className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors cursor-pointer"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Khóa</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTimesheets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                      Không tìm thấy Timesheet nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
