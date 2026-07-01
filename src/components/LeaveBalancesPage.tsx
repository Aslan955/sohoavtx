import React, { useState } from 'react';
import { 
  ChevronRight, 
  Wallet, 
  Clock, 
  Calendar,
  Plus,
  Send,
  Timer,
  Info,
  CheckCircle2,
  XCircle,
  History,
  Plane,
  Heart,
  Baby,
  Filter,
  Users,
  AlertCircle,
  UserX,
  MessageSquare,
  Check,
  X,
  ListFilter,
  ChevronDown,
  Paperclip,
  Upload,
  User
} from 'lucide-react';
import { 
  MOCK_PERSONAL_LEAVE, 
  MOCK_LEAVE_HISTORY, 
  MOCK_HR_TICKETS, 
  MOCK_LEAVES,
  MOCK_TEAM_REQUESTS
} from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const CreateRequestModal = ({ isOpen, onClose, balance }: { isOpen: boolean; onClose: () => void; balance: number }) => {
  const [leaveType, setLeaveType] = useState('annual');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalHours, setTotalHours] = useState('8');
  const [reason, setReason] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="stroke-[3px]" />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-1">GỬI ĐƠN ĐĂNG KÝ THÀNH CÔNG</h4>
              <p className="text-xs text-slate-500 font-bold max-w-sm">
                Đơn đăng ký nghỉ/ WFH đã được gửi và đang ở trạng thái Chờ phê duyệt (Pending Approval) bởi Quản lý trực tiếp!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Plane size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">ĐƠN ĐĂNG KÝ NGHỈ/ WFH</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Create Leave Request</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Header Info: Employee & Approver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nhân viên (Employee)</label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <img src="https://ui-avatars.com/api/?name=V00497&background=0D8ABC&color=fff" className="w-8 h-8 rounded-lg" alt="" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Nguyễn Văn User</p>
                  <p className="text-[10px] text-gray-500">V00497 • Developer</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Người duyệt (Approver)</label>
              <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">M</div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Trần Văn B (Manager)</p>
                  <p className="text-[10px] text-blue-600">Phê duyệt trực tiếp</p>
                </div>
                <div className="ml-auto">
                   <CheckCircle2 size={14} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balance Alert */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-100">
             <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                   <Wallet size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Số dư phép hiện tại</p>
                   <p className="text-xl font-black">{balance} ngày</p>
                </div>
             </div>
             <div className="text-right">
                <div className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-bold mt-1">
                   Available
                </div>
             </div>
          </div>

          {/* Type and Followers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Loại hình nghỉ (Leave Type) *</label>
              <select 
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:border-blue-600 outline-none transition-all appearance-none"
              >
                <option value="annual">Nghỉ phép có hưởng lương</option>
                <option value="unpaid">Nghỉ phép không lương</option>
                <option value="wfh">Đăng ký WFH</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Số giờ nghỉ (Total Hours) *</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.5"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  placeholder="Nhập số giờ nghỉ..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                />
                <Clock size={16} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* From - To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Từ ngày (From) *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Đến ngày (To) *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                />
             </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Lý do nghỉ (Reason) *</label>
            <textarea 
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vui lòng nhập lý do cụ thể để Manager duyệt nhanh hơn..."
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:border-blue-600 outline-none transition-all h-24 resize-none"
            />
          </div>


        </form>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
           <button 
             type="button" 
             onClick={onClose}
             className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
           >
             Hủy bỏ
           </button>
           <div className="flex space-x-3">
              <button 
                type="button"
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Lưu nháp
              </button>
              <button 
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all transform active:scale-95"
              >
                Tạo đơn đăng ký
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

const LeaveBucket = ({ remaining, pending }: { remaining: number; pending: number }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      
      <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center self-start">
        <Wallet size={16} className="mr-2 text-blue-600" />
        Phép cá nhân
      </h3>

      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
          <motion.circle
            initial={{ strokeDasharray: "0 440" }}
            animate={{ strokeDasharray: `${(remaining / 20) * 440} 440` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeLinecap="round" className="text-blue-600"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold text-gray-900">{remaining}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng phép</span>
        </div>
      </div>

      <div className="mt-6 w-full space-y-3">
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
          <div className="flex items-center text-xs font-medium text-green-700">
            <CheckCircle2 size={14} className="mr-2" />
            Phép khả dụng
          </div>
          <span className="text-sm font-bold text-green-700">{remaining} ngày</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
          <div className="flex items-center text-xs font-medium text-orange-700">
            <Timer size={14} className="mr-2" />
            Phép chờ duyệt
          </div>
          <span className="text-sm font-bold text-orange-700">{pending} ngày</span>
        </div>
      </div>

      <div className="mt-4 flex items-start space-x-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl w-full border border-gray-100 italic">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p>Bạn sẽ được cộng thêm 1 ngày phép vào ngày 01/06/2026</p>
      </div>
    </div>
  );
};

const QuickAction = ({ title, icon: Icon, color, description, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-start space-x-4 group active:scale-[0.98]"
  >
    <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
    </div>
    <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

const ManagementDashboard = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [managementTab, setManagementTab] = useState<'queue' | 'history'>('queue');
  const [showAbsentList, setShowAbsentList] = useState(false);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('5');
  const [selectedYear, setSelectedYear] = useState('2026');

  const departments = ['all', 'Development', 'Tester', 'Designer', 'HR', 'Production', 'Marketing'];
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const years = ['2025', '2026', '2027'];

  const absentEmployees = [
    { name: 'Nguyễn Thị D', position: 'HR', reason: 'Nghỉ phép năm', avatar: 'https://ui-avatars.com/api/?name=NT+D&background=random' },
    { name: 'Phạm Văn E', position: 'Production', reason: 'Nghỉ không lương', avatar: 'https://ui-avatars.com/api/?name=PV+E&background=random' },
    { name: 'Đỗ Thị F', position: 'Marketing', reason: 'Nghỉ phép năm', avatar: 'https://ui-avatars.com/api/?name=DT+F&background=random' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Quick Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-red-50 text-red-600"><UserX size={24} /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đang vắng mặt (Hôm nay)</p>
            <p className="text-2xl font-black text-gray-900">3 / 20</p>
            <button 
              onClick={() => setShowAbsentList(!showAbsentList)}
              className="text-[11px] text-blue-600 font-bold hover:underline mt-1"
            >
              {showAbsentList ? 'Đóng danh sách' : 'Xem danh sách'}
            </button>
          </div>
          {showAbsentList && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-white z-10 p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Danh sách vắng mặt</span>
                <button onClick={() => setShowAbsentList(false)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {absentEmployees.map((emp, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <img src={emp.avatar} className="w-6 h-6 rounded-lg" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-900 truncate">{emp.name}</p>
                      <p className="text-[9px] text-gray-500 truncate">{emp.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600"><Timer size={24} /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Chờ phê duyệt</p>
            <p className="text-2xl font-black text-gray-900">{MOCK_TEAM_REQUESTS.filter(r => r.status === 'Pending').length} đơn</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cảnh báo nhân sự</p>
            <p className="text-2xl font-black text-gray-900">1 nhân viên</p>
            <p className="text-[10px] text-gray-500 italic">Sắp nghỉ thai sản (Lê Thị B)</p>
          </div>
        </div>
      </div>

      {/* 1.1 Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase">Phòng ban:</label>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'Tất cả phòng ban' : dept}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase">Thời gian:</label>
          <div className="flex items-center space-x-1">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            >
              {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors">
            <Filter size={14} />
            <span>Lọc kết quả</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Approval Queue & 5. Processed History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-50 bg-gray-50/30 flex items-center">
            <button 
              onClick={() => setManagementTab('queue')}
              className={`px-4 py-2 text-xs font-bold transition-all relative ${
                managementTab === 'queue' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Đang chờ duyệt
              {managementTab === 'queue' && <motion.div layoutId="mTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600" />}
            </button>
            <button 
              onClick={() => setManagementTab('history')}
              className={`px-4 py-2 text-xs font-bold transition-all relative ${
                managementTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Lịch sử đã duyệt
              {managementTab === 'history' && <motion.div layoutId="mTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600" />}
            </button>
          </div>
          
          <div className="p-6 flex items-center justify-between border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800 flex items-center">
              <ListFilter size={16} className="mr-2 text-blue-600" />
              {managementTab === 'queue' ? 'Danh sách đơn cần phê duyệt' : 'Lịch sử phê duyệt đơn'}
            </h3>
            <div className="flex items-center space-x-2">
              {managementTab === 'queue' && (
                <button className="px-3 py-1.5 bg-green-50 text-green-600 text-[11px] font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center">
                  <Check size={14} className="mr-1" /> Duyệt hàng loạt
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3 w-4">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-6 py-3 font-bold">Nhân viên</th>
                  <th className="px-6 py-3 font-bold">Loại đơn</th>
                  <th className="px-6 py-3 font-bold">Thời gian</th>
                  <th className="px-6 py-3 font-bold">Số dư phép cá nhân</th>
                  <th className="px-6 py-3 text-right font-bold">Trạng thái / Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_TEAM_REQUESTS
                  .filter(r => managementTab === 'queue' ? r.status === 'Pending' : r.status !== 'Pending')
                  .map(req => (
                  <tr key={req.id} className="group hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                       <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-4" onClick={() => setSelectedRequest(req)}>
                      <div className="flex items-center space-x-3">
                        <img src={req.avatar} className="w-8 h-8 rounded-lg" alt={req.employeeName} referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-gray-900">{req.employeeName}</p>
                          <p className="text-[10px] text-gray-400">{req.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700" onClick={() => setSelectedRequest(req)}>{req.type}</td>
                    <td className="px-6 py-4" onClick={() => setSelectedRequest(req)}>
                      <p className="font-bold text-gray-900">{req.totalDays} ngày</p>
                      <p className="text-[10px] text-gray-400">{req.startDate} - {req.endDate}</p>
                    </td>
                    <td className="px-6 py-4" onClick={() => setSelectedRequest(req)}>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-blue-600">{req.currentBalance}</span>
                        <span className="text-[10px] text-gray-400 uppercase">ngày</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {managementTab === 'queue' ? (
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"><Check size={14} /></button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><X size={14} /></button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Team Leave Calendar (Mini) & Others */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                <Calendar size={16} className="mr-2 text-blue-600" />
                Lịch nghỉ của Team
              </h3>
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-gray-50 border-none text-[10px] font-bold text-gray-500 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'Team (All)' : dept}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <span key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className={`h-8 rounded-lg flex items-center justify-center text-[11px] font-medium relative ${
                    i + 1 === 13 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-50'
                  }`}>
                    {i + 1}
                    {(i+1 === 14 || i+1 === 15 || i+1 === 20) && (
                      <span className="absolute bottom-1 w-1 h-1 bg-orange-400 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-50 space-y-2">
                <div className="flex items-center text-[10px] text-gray-500">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                   Cần sự chú ý (Nhiều hơn 2 người nghỉ)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detail Overlay (Drawer) */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-4">
                   <img src={selectedRequest.avatar} className="w-12 h-12 rounded-xl" alt="" referrerPolicy="no-referrer" />
                   <div>
                     <h3 className="font-black text-gray-900">{selectedRequest.employeeName}</h3>
                     <p className="text-xs text-gray-500 font-medium">{selectedRequest.position}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                   <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-4 tracking-widest">Chi tiết đơn</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-blue-50 p-3 rounded-xl">
                        <p className="text-[10px] text-blue-400 font-bold uppercase">Loại đơn</p>
                        <p className="text-sm font-bold text-blue-900">{selectedRequest.type}</p>
                     </div>
                     <div className="bg-orange-50 p-3 rounded-xl">
                        <p className="text-[10px] text-orange-400 font-bold uppercase">Số ngày</p>
                        <p className="text-sm font-bold text-orange-900">{selectedRequest.totalDays} ngày</p>
                     </div>
                     <div className="col-span-2 bg-gray-50 p-3 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Thời gian</p>
                        <p className="text-sm font-bold text-slate-800">{selectedRequest.startDate} - {selectedRequest.endDate}</p>
                     </div>
                   </div>
                </section>

                <section>
                   <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Lý do nghỉ</h4>
                   <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 italic">
                     "{selectedRequest.reason}"
                   </div>
                </section>

                <section>
                   <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-4 tracking-widest">Lịch sử nghỉ 30 ngày qua</h4>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border-b border-gray-50">
                         <span className="text-xs text-gray-650">01/05 - 02/05 (Nghỉ ốm)</span>
                         <span className="text-xs font-bold text-gray-900">2 ngày</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b border-gray-50">
                         <span className="text-xs text-gray-655 font-bold">12/04 (Việc riêng)</span>
                         <span className="text-xs font-bold text-gray-900">0.5 ngày</span>
                      </div>
                   </div>
                </section>

                <section>
                   <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Phản hồi của Manager</h4>
                   <textarea 
                     placeholder="Nhập lý do nếu bạn từ chối đơn này..."
                     className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-600 outline-none transition-all h-24"
                   />
                </section>
              </div>

              <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <button className="py-3 font-bold text-red-650 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">Từ chối</button>
                <button className="py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors">Duyệt đơn</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LeaveBalancesPage: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'personal' | 'management'>('personal');
  const [activePersonalTab, setActivePersonalTab] = useState('manager');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="bg-transparent min-h-full">
      {/* Top Main Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 pt-2 sticky top-0 z-20 shadow-sm font-sans font-medium tracking-tight">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-xs text-gray-400 font-medium">
             <Calendar size={14} className="mr-2" />
             <span>Timekeeping</span>
             <ChevronRight size={12} className="mx-1" />
             <span className="text-gray-900 font-bold">Phép cá nhân</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <button 
            type="button"
            onClick={() => setActiveMainTab('personal')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeMainTab === 'personal' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Trang cá nhân
            {activeMainTab === 'personal' && <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            type="button"
            onClick={() => setActiveMainTab('management')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeMainTab === 'management' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý & Phê duyệt
            <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-655 text-[10px] rounded-full font-black">3</span>
            {activeMainTab === 'management' && <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeMainTab === 'personal' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LeaveBucket remaining={MOCK_PERSONAL_LEAVE.remaining} pending={MOCK_PERSONAL_LEAVE.pendingApproval} />
              
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickAction 
                  title="Đơn đăng ký nghỉ/ WFH" 
                  description="Nghỉ phép năm, nghỉ không lương hoặc nghỉ bù. Manager sẽ duyệt đơn này." 
                  icon={Plane} 
                  color="bg-blue-600" 
                  onClick={() => setIsCreateModalOpen(true)}
                />
                <QuickAction title="Yêu cầu cấp thêm phép" description="Dành cho các chế độ Thai sản, Hiếu hỉ, Kết hôn... Gửi ticket cho HR xử lý." icon={Heart} color="bg-pink-550" />
                <QuickAction title="Đăng ký OT" description="Ghi nhận giờ làm thêm để quy đổi vào phép cá nhân hoặc nhận lương OT." icon={Clock} color="bg-orange-550" />
                <div className="bg-gradient-to-br from-indigo-600 to-blue-800 p-6 rounded-2xl text-white flex flex-col justify-between overflow-hidden relative">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-1">Cần hỗ trợ?</h4>
                    <p className="text-blue-100 text-[11px]">Mọi thắc mắc về quỹ phép, phù lòng liên hệ bộ phận HR nội bộ.</p>
                  </div>
                  <button className="relative z-10 w-fit mt-4 px-4 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors">Contact HR</button>
                  <History size={80} className="absolute -bottom-4 -right-4 opacity-10" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100 px-6">
                <button onClick={() => setActivePersonalTab('manager')} className={`px-6 py-4 text-sm font-bold transition-all relative ${activePersonalTab === 'manager' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Đơn nghỉ phép (To Manager)
                  {activePersonalTab === 'manager' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                <button onClick={() => setActivePersonalTab('hr')} className={`px-6 py-4 text-sm font-bold transition-all relative ${activePersonalTab === 'hr' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Ticket cấp phép (To HR)
                  {activePersonalTab === 'hr' && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
              </div>
              <div className="p-6">
                {activePersonalTab === 'manager' ? (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 font-bold border-b border-gray-50"><th className="pb-4">Ngày tạo</th><th className="pb-4 font-bold">Loại đơn</th><th className="pb-4 font-bold">Thời gian</th><th className="pb-4 font-bold">Số ngày</th><th className="pb-4 font-bold">Trạng thái</th><th className="pb-4 text-right font-bold">Thao tác</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-55 font-bold">
                        {MOCK_LEAVES.filter(l => l.employeeId === 'V00437').map(l => (
                          <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 text-gray-500 font-mono font-bold">{l.createdAt}</td><td className="py-4 font-bold text-gray-800">{l.leaveType}</td><td className="py-4 text-gray-600">{l.startDate.split(' ')[0]} - {l.endDate.split(' ')[0]}</td><td className="py-4 font-black text-blue-600">{(l.totalHours / 8).toFixed(1)} ngày</td><td className="py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${l.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{l.status}</span></td><td className="py-4 text-right"><button className="text-blue-600 font-bold hover:underline">Chi tiết</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_HR_TICKETS.map(ticket => (
                      <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-blue-100 transition-all">
                        <div className="flex items-center space-x-4"><div className={`p-2 rounded-lg ${ticket.status === 'Added' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}><Plus size={18} /></div><div><h5 className="text-sm font-bold">{ticket.type}</h5><p className="text-[11px] text-gray-500">{ticket.createdAt} • <span className="font-bold text-blue-600">+{ticket.days} ngày</span></p></div></div><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${ticket.status === 'Added' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{ticket.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center"><History size={16} className="mr-2 text-blue-600" />Lịch sử biến động (The Ledger)</h3>
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {MOCK_LEAVE_HISTORY.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-6 relative z-10 group"><div className={`mt-2 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 ${item.type === 'plus' ? 'bg-green-500' : 'bg-red-500'}`}>{item.type === 'plus' ? <Plus size={12} className="text-white" /> : <Info size={12} className="text-white" />}</div><div className="flex-1 pb-4 border-b border-gray-50 group-last:border-none"><div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-gray-400 uppercase">{item.date}</span><span className={`text-sm font-extrabold ${item.type === 'plus' ? 'text-green-600' : 'text-red-500'}`}>{item.type === 'plus' ? '+' : '-'}{item.amount.toFixed(1)} ngày</span></div><h4 className="text-sm font-bold text-gray-800">{item.reason}</h4>{item.person && <p className="text-[11px] text-gray-500 mt-1 flex items-center"><Send size={10} className="mr-1" />Đã duyệt bởi <span className="font-bold text-gray-700 ml-1">{item.person}</span></p>}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMainTab === 'management' && <ManagementDashboard />}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateRequestModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            balance={MOCK_PERSONAL_LEAVE.remaining}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveBalancesPage;
