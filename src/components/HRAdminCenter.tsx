import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Users, 
  History, 
  ListFilter, 
  Plane, 
  AlertCircle, 
  X,
  Send,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MOCK_HR_TICKETS, 
  MOCK_GLOBAL_LEDGER,
  HRTicket,
  GlobalLedgerEntry
} from '../constants';

interface HRAdminCenterProps {
  triggerToast?: (msg: string) => void;
}

export const HRAdminCenter: React.FC<HRAdminCenterProps> = ({ triggerToast }) => {
  const [tickets, setTickets] = useState<HRTicket[]>(MOCK_HR_TICKETS);
  const [ledger, setLedger] = useState<GlobalLedgerEntry[]>(MOCK_GLOBAL_LEDGER);
  const [adjustmentType, setAdjustmentType] = useState<'plus' | 'minus'>('plus');
  const [selectedLedgerSource, setSelectedLedgerSource] = useState('all');
  const [showEvidence, setShowEvidence] = useState<string | null>(null);
  
  // Approve confirmation states
  const [approvingTicket, setApprovingTicket] = useState<HRTicket | null>(null);
  const [approveDays, setApproveDays] = useState<string>('0');
  const [approveReason, setApproveReason] = useState<string>('');
  
  // Form fields for active manual adjustment
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [daysAmount, setDaysAmount] = useState('1');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Undo memory to revert last action (such as manual adjustment or ticket approval)
  const [historyStack, setHistoryStack] = useState<{ tickets: HRTicket[]; ledger: GlobalLedgerEntry[] }[]>([]);

  // Function to save current state to history before changing
  const pushStateToHistory = (newTickets: HRTicket[], newLedger: GlobalLedgerEntry[]) => {
    setHistoryStack(prev => [...prev, { tickets, ledger }]);
    setTickets(newTickets);
    setLedger(newLedger);
  };

  const handleApproveTicket = (id: string) => {
    const approvedTicket = tickets.find(t => t.id === id);
    if (!approvedTicket) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === id) {
        return { ...t, status: 'Added' } as HRTicket;
      }
      return t;
    });

    const newEntry: GlobalLedgerEntry = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN').replace(',', ''),
      employeeName: approvedTicket.employeeName,
      action: `Cộng ${approvedTicket.days} ngày ${approvedTicket.type.toLowerCase()}`,
      amount: approvedTicket.days,
      performer: 'HR Admin',
      balanceAfter: 15.5 + approvedTicket.days, // mock calculation
      source: 'Ticket',
      dept: approvedTicket.employeeId === 'V00437' ? 'HR' : 'Development'
    };

    const updatedLedger = [newEntry, ...ledger];
    pushStateToHistory(updatedTickets, updatedLedger);

    const successMsg = `🎉 Đã duyệt Ticket cấp phép cho ${approvedTicket.employeeName} (+${approvedTicket.days} ngày ${approvedTicket.type.toLowerCase()}) thành công!`;
    if (triggerToast) {
      triggerToast(successMsg);
    }
  };

  const handleRejectTicket = (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === id) {
        return { ...t, status: 'Rejected' } as HRTicket;
      }
      return t;
    });

    pushStateToHistory(updatedTickets, ledger);

    const msg = `❌ Đã từ chối Ticket của ${ticket.employeeName}`;
    if (triggerToast) {
      triggerToast(msg);
    }
  };

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeQuery.trim()) {
      if (triggerToast) triggerToast('⚠️ Vui lòng nhập thông tin nhân viên!');
      return;
    }
    if (!adjustmentReason.trim()) {
      if (triggerToast) triggerToast('⚠️ Vui lòng cung cấp lý do bắt buộc!');
      return;
    }

    const numericDays = parseFloat(daysAmount) || 0;
    if (numericDays <= 0) {
      if (triggerToast) triggerToast('⚠️ Số ngày phép phải lớn hơn 0!');
      return;
    }

    const isPlus = adjustmentType === 'plus';
    const actionText = isPlus 
      ? `Cộng ${numericDays} ngày phép thâm niên/thưởng chủ động`
      : `Trừ ${numericDays} ngày phép chủ động`;

    // Add entry to ledger
    const newEntry: GlobalLedgerEntry = {
      id: `L-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN').replace(',', ''),
      employeeName: employeeQuery.toUpperCase(),
      action: actionText,
      amount: numericDays,
      performer: 'HR Admin',
      balanceAfter: isPlus ? (15.5 + numericDays) : (15.5 - numericDays),
      source: 'Manual',
      dept: 'HR'
    };

    const updatedLedger = [newEntry, ...ledger];
    pushStateToHistory(tickets, updatedLedger);

    const successMsg = `🎉 Đã ${isPlus ? 'cộng' : 'trừ'} ${numericDays} ngày phép cho nhân viên ${employeeQuery.toUpperCase()}`;
    if (triggerToast) {
      triggerToast(successMsg);
    }

    // Reset inputs
    setEmployeeQuery('');
    setAdjustmentReason('');
    setDaysAmount('1');
  };

  const handleUndo = () => {
    if (historyStack.length === 0) {
      if (triggerToast) triggerToast('ℹ️ Không có hành động nào khác để hoàn tác!');
      return;
    }
    const previousState = historyStack[historyStack.length - 1];
    setTickets(previousState.tickets);
    setLedger(previousState.ledger);
    setHistoryStack(prev => prev.slice(0, -1));
    if (triggerToast) triggerToast('🔄 Hoàn tác lệnh thành công!');
  };

  const handleBulkApprove = () => {
    const pendingTickets = tickets.filter(t => t.status === 'Pending HR');
    if (pendingTickets.length === 0) {
      if (triggerToast) triggerToast('ℹ️ Không có ticket nào đang chờ duyệt!');
      return;
    }

    const updatedTickets = tickets.map(t => {
      if (t.status === 'Pending HR') {
        return { ...t, status: 'Added' } as HRTicket;
      }
      return t;
    });

    let updatedLedger = [...ledger];
    pendingTickets.forEach((t, index) => {
      const newEntry: GlobalLedgerEntry = {
        id: `L-${Date.now()}-${index}`,
        timestamp: new Date().toLocaleString('vi-VN').replace(',', ''),
        employeeName: t.employeeName,
        action: `Cộng ${t.days} ngày ${t.type.toLowerCase()}`,
        amount: t.days,
        performer: 'HR Admin',
        balanceAfter: 15.5 + t.days,
        source: 'Ticket',
        dept: 'Development'
      };
      updatedLedger.unshift(newEntry);
    });

    pushStateToHistory(updatedTickets, updatedLedger);
    if (triggerToast) {
      triggerToast(`🎉 Đã duyệt đồng loạt ${pendingTickets.length} tickets thành công!`);
    }
  };

  // Filter ledger list based on filters
  const [deptFilter, setDeptFilter] = useState('Tất cả');

  const filteredLedger = ledger.filter(entry => {
    if (selectedLedgerSource !== 'all' && entry.source.toLowerCase() !== selectedLedgerSource.toLowerCase()) {
      return false;
    }
    if (deptFilter !== 'Tất cả' && entry.dept !== deptFilter) {
      return false;
    }
    return true;
  });

  const pendingTicketsList = tickets.filter(t => t.status === 'Pending HR');

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Approval Center (Tickets) & 2. Manual Adjustment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Center */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-gray-800 flex items-center uppercase tracking-wider">
                <CheckCircle2 size={16} className="mr-2 text-purple-600 fill-purple-55" />
                Phê duyệt Ticket cấp ngày phép
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">Xử lý các kiến nghị thêm phép chế độ của nhân viên</p>
            </div>
            
            {pendingTicketsList.length > 0 && (
              <button 
                onClick={handleBulkApprove}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-[10px] font-black rounded-lg transition-colors flex items-center space-x-1 uppercase tracking-wider"
              >
                <span>✓</span>
                <span>Duyệt tất cả ({pendingTicketsList.length})</span>
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto min-h-[14rem]">
            {pendingTicketsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-2 h-full">
                <CheckCircle2 size={32} className="text-purple-300 fill-purple-50" />
                <p className="text-xs font-bold text-gray-500">Đã giải quyết hết sạch các ticket cấp phép!</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50/50 text-gray-400 uppercase tracking-widest font-black text-[9px] border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-3">Nhân viên</th>
                    <th className="px-6 py-3">Loại chế độ</th>
                    <th className="px-6 py-3 text-center">Minh chứng</th>
                    <th className="px-6 py-3 text-center">Số ngày</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingTicketsList.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-gray-900 uppercase tracking-wide">{ticket.employeeName}</p>
                        <p className="text-[10px] text-gray-400 font-mono font-bold mt-0.5">{ticket.employeeId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-650">{ticket.type}</span>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{ticket.createdAt}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {ticket.evidence ? (
                          <button 
                            type="button"
                            onClick={() => setShowEvidence(ticket.id)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center justify-center"
                            title="Xem minh chứng"
                          >
                            <Plane size={14} className="hover:scale-110 transition-transform" />
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[10px] font-black">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-purple-650 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full text-[11px]">
                          +{ticket.days} ngày
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            type="button"
                            onClick={() => handleRejectTicket(ticket.id)}
                            className="px-3 py-1.5 bg-white border border-red-100 text-red-600 rounded-lg hover:bg-red-50 text-[10px] font-black uppercase tracking-wider"
                          >
                            Từ chối
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setApprovingTicket(ticket);
                              setApproveDays(ticket.days.toString());
                              setApproveReason(`Duyệt cấp phép - ${ticket.type}`);
                            }}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-[10px] font-black uppercase tracking-wider shadow-md shadow-purple-500/10 transition-all"
                          >
                            Duyệt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Manual Adjustment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-fit">
          <h3 className="text-xs font-black text-gray-800 mb-6 flex items-center uppercase tracking-wider">
            <Plus size={16} className="mr-2 text-purple-600" />
            Cộng/Trừ phép chủ động
          </h3>
          <form onSubmit={handleManualAdjustment} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Bộ chọn nhân viên *</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={employeeQuery}
                  onChange={(e) => setEmployeeQuery(e.target.value)}
                  placeholder="Nhập tên hoặc mã NV..." 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
                <Users size={14} className="absolute right-3.5 top-3 text-gray-300" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button 
                type="button"
                onClick={() => setAdjustmentType('plus')}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${adjustmentType === 'plus' ? 'bg-white text-green-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Cộng phép (+)
              </button>
              <button 
                type="button"
                onClick={() => setAdjustmentType('minus')}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${adjustmentType === 'minus' ? 'bg-white text-red-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Trừ phép (-)
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Số lượng ngày phép *</label>
              <input 
                type="number" 
                step="0.5"
                required
                min="0.5"
                value={daysAmount}
                onChange={(e) => setDaysAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Lý do điều chỉnh (Bắt buộc) *</label>
              <textarea 
                required
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Ghi chú lý do để đối soát (ví dụ: thưởng hiệu suất, sửa sai lệch)..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all h-20 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-purple-700 shadow-lg shadow-purple-500/10 transition-all active:scale-[0.98]"
            >
              Cập nhật phép nhân viên
            </button>
            
            <div className="flex items-center justify-center pt-2">
              <button 
                type="button"
                onClick={handleUndo}
                className="text-[10px] text-gray-400 hover:text-purple-600 font-extrabold flex items-center transition-colors uppercase tracking-wider"
              >
                <History size={12} className="mr-1" />
                Hoàn tác (Undo) hành động trước
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Global Ledger */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-gray-800 flex items-center uppercase tracking-wider">
              <History size={16} className="mr-2 text-purple-600" />
              Lịch sử biến động quỹ phép (Global Ledger)
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Tổng hợp toàn bộ nhật ký tăng/giảm phép thủ công & tự động</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 text-[10px] font-black rounded-lg hover:bg-green-100 transition-all uppercase tracking-wider">
              <Plane size={14} className="rotate-90" />
              <span>Xuất sổ phép Excel</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50/50 flex flex-wrap items-center gap-4 border-b border-gray-50 text-xs font-bold">
           <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phòng ban:</span>
              <select 
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-white border border-gray-150 text-[10px] font-black px-2 py-1.5 rounded-lg outline-none cursor-pointer"
              >
                <option value="Tất cả">Tất cả phòng ban</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="HR">HR</option>
              </select>
           </div>
           <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nguồn:</span>
              <div className="flex bg-white p-0.5 rounded-lg border border-gray-150">
                <button 
                  type="button"
                  onClick={() => setSelectedLedgerSource('all')} 
                  className={`px-2 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-wider ${selectedLedgerSource === 'all' ? 'bg-purple-100 text-purple-600 font-black' : 'text-gray-400'}`}
                >
                  Tất cả
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedLedgerSource('system')} 
                  className={`px-2 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-wider ${selectedLedgerSource === 'system' ? 'bg-purple-100 text-purple-600 font-black' : 'text-gray-400'}`}
                >
                  Tự động
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedLedgerSource('manual')} 
                  className={`px-2 py-1 text-[9px] font-black rounded-md transition-all uppercase tracking-wider ${selectedLedgerSource === 'manual' ? 'bg-purple-100 text-purple-600 font-black' : 'text-gray-400'}`}
                >
                  Thủ công
                </button>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[12rem]">
          {filteredLedger.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-2 h-full">
              <AlertCircle size={32} className="text-gray-300" />
              <p className="text-xs font-bold text-gray-500">Không tìm thấy bản ghi biến động nào khớp điều kiện!</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold tracking-widest text-[9px] border-b border-gray-50">
                <tr>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Nhân viên / Phòng ban</th>
                  <th className="px-6 py-4">Nội dung biến động</th>
                  <th className="px-6 py-4 text-center">Nguồn gốc</th>
                  <th className="px-6 py-4 text-center">Tác nhân</th>
                  <th className="px-6 py-4 text-right">Mức quỹ mới</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {filteredLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono font-bold">{entry.timestamp}</td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-gray-900">{entry.employeeName}</p>
                      <p className="text-[9px] text-gray-400 font-black mt-0.5 uppercase tracking-wide">{entry.dept}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{entry.action}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-black uppercase text-[9px] ${
                        entry.source === 'Ticket' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        entry.source === 'System' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                        'bg-purple-50 text-purple-650 border border-purple-100'
                      }`}>
                        {entry.source === 'Ticket' ? 'Ticket' :
                         entry.source === 'System' ? 'Tự động' : 'Thủ công'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-500">{entry.performer}</td>
                    <td className="px-6 py-4 text-right font-black text-purple-600 text-sm">{entry.balanceAfter.toFixed(1)} ngày</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 bg-red-50/30 border-t border-red-50 flex items-center space-x-3">
           <div className="p-1.5 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={14} /></div>
           <p className="text-[10px] text-red-600 font-bold">⚠️ Có 1 trường hợp phép cá nhân âm (Nguyễn Văn C - Development). Phản hồi bộ phận HR trước ngày 25 chốt công!</p>
        </div>
      </div>

      {/* Evidence Viewer (Modal) */}
      <AnimatePresence>
        {showEvidence && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEvidence(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl p-8 overflow-hidden shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-gray-900 tracking-tight text-sm uppercase">MINH CHỨNG ĐÍNH KÈM</h4>
                  <button onClick={() => setShowEvidence(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
               </div>
               <div className="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-gray-50 overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-all duration-700" alt="Evidence" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                     <p className="text-[10px] text-white font-bold uppercase tracking-wider">Giấy xác nhận kết kết hôn / Giấy chứng sinh</p>
                  </div>
               </div>
               <div className="mt-8 flex justify-center">
                  <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all uppercase tracking-wider font-sans">Tải tài liệu gốc</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Approve Ticket Modal */}
      <AnimatePresence>
        {approvingTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setApprovingTicket(null)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 overflow-hidden shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-gray-900 tracking-tight text-sm uppercase">XÁC NHẬN DUYỆT CẤP PHÉP</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Approve Leave Request Confirmation</p>
                </div>
                <button onClick={() => setApprovingTicket(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Employee Quick Info */}
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-semibold font-medium">Nhân viên:</span>
                  <span className="font-extrabold text-gray-900">{approvingTicket.employeeName} ({approvingTicket.employeeId})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-semibold font-medium">Loại chế độ:</span>
                  <span className="font-bold text-blue-600">{approvingTicket.type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-semibold font-medium">Yêu cầu gốc:</span>
                  <span className="font-black text-purple-600">+{approvingTicket.days} ngày</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 font-bold">Số ngày phép được cộng *</label>
                  <input 
                    type="number" 
                    step="0.5"
                    required
                    min="0.5"
                    value={approveDays}
                    onChange={(e) => setApproveDays(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 font-bold">Lý do duyệt / Ghi chú *</label>
                  <textarea 
                    required
                    value={approveReason}
                    onChange={(e) => setApproveReason(e.target.value)}
                    placeholder="Mục lý do duyệt phép (như bổ sung phép thâm niên, kết chuyển phép...)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-purple-500 focus:bg-white transition-all h-24 resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setApprovingTicket(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const numericDays = parseFloat(approveDays) || 0;
                    if (numericDays <= 0) {
                      if (triggerToast) triggerToast('⚠️ Số ngày phép cộng thêm phải lớn hơn 0!');
                      return;
                    }
                    if (!approveReason.trim()) {
                      if (triggerToast) triggerToast('⚠️ Vui lòng nhập lý do duyệt phép!');
                      return;
                    }

                    const updatedTickets = tickets.map(t => {
                      if (t.id === approvingTicket.id) {
                        return { ...t, status: 'Added', days: numericDays } as HRTicket;
                      }
                      return t;
                    });

                    const newEntry: GlobalLedgerEntry = {
                      id: `L-${Date.now()}`,
                      timestamp: new Date().toLocaleString('vi-VN').replace(',', ''),
                      employeeName: approvingTicket.employeeName,
                      action: approveReason,
                      amount: numericDays,
                      performer: 'HR Admin',
                      balanceAfter: 15.5 + numericDays, // mock calculation
                      source: 'Ticket',
                      dept: approvingTicket.employeeId === 'V00437' ? 'HR' : 'Development'
                    };

                    const updatedLedger = [newEntry, ...ledger];
                    pushStateToHistory(updatedTickets, updatedLedger);

                    const successMsg = `🎉 Đã duyệt Ticket cấp phép cho ${approvingTicket.employeeName} (+${numericDays} ngày, Lý do: ${approveReason}) thành công!`;
                    if (triggerToast) {
                      triggerToast(successMsg);
                    }
                    setApprovingTicket(null);
                  }}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-lg shadow-purple-500/10 transition-all font-bold"
                >
                  Xác nhận duyệt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
