import React, { useMemo, useState } from 'react';
import { Columns3, GripVertical, Search, Star, X, Check, Eye, Info } from 'lucide-react';
import { Pakd, SystemUser, effectiveCurrentPhase, pakdTotalCost } from './projectTypes';
import { khCode, PHASE_DEFAULT_NAMES } from './projectData';
import { PAKD_STATUS_LABEL, KANBAN_MOVE_ROLES, PhasePlanInput } from './projectWorkflow';

const fmtBn = (v: number) => v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(2)} tỷ` : `${v.toLocaleString('vi-VN')} đ`;

const DOT: Record<string, string> = {
  DRAFT: 'bg-gray-400', RETURNED: 'bg-red-500',
  PENDING_SALES_DIRECTOR: 'bg-orange-400', PENDING_BUSINESS_DIRECTOR: 'bg-orange-400',
  PENDING_BOD: 'bg-orange-400', PENDING_ACCOUNTANT: 'bg-orange-400',
  PENDING_IT: 'bg-sky-500', COMPLETED: 'bg-green-500',
};

// Màu nhấn của từng cột KH để phân biệt nhanh khi kéo thả
const COL_ACCENT = [
  'border-t-slate-400', 'border-t-sky-400', 'border-t-indigo-400',
  'border-t-violet-400', 'border-t-amber-400', 'border-t-emerald-400',
];

interface PendingMove {
  pakd: Pakd;
  targetOrder: number;
}

export const PhaseKanbanPage: React.FC<{
  pakds: Pakd[];
  simUser: SystemUser;
  onOpen: (id: string) => void;
  onMove: (pakdId: string, targetOrder: number, plan: PhasePlanInput) => void;
}> = ({ pakds, simUser, onOpen, onMove }) => {
  const [search, setSearch] = useState('');
  const [keyOnly, setKeyOnly] = useState(false);
  const [dragId, setDragId] = useState('');
  const [overCol, setOverCol] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingMove | null>(null);

  const canMove = KANBAN_MOVE_ROLES.includes(simUser.role);

  // Số cột = số giai đoạn nhiều nhất trong các PAKD (tối thiểu 6 giai đoạn chuẩn)
  const colCount = useMemo(
    () => pakds.reduce((mx, p) => Math.max(mx, p.steps.length), PHASE_DEFAULT_NAMES.length),
    [pakds],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pakds.filter(p => {
      const hit = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        || p.customerName.toLowerCase().includes(q) || (p.masterCode || '').toLowerCase().includes(q);
      return hit && (!keyOnly || !!p.isKeyProject);
    });
  }, [pakds, search, keyOnly]);

  const columns = useMemo(() => {
    const buckets: Pakd[][] = Array.from({ length: colCount }, () => []);
    visible.forEach(p => {
      const idx = Math.min(Math.max(effectiveCurrentPhase(p), 1), colCount) - 1;
      buckets[idx].push(p);
    });
    return buckets;
  }, [visible, colCount]);

  const colName = (i: number) => {
    const named = pakds.find(p => p.steps[i]?.name)?.steps[i]?.name;
    return PHASE_DEFAULT_NAMES[i] || named || `Giai đoạn ${i + 1}`;
  };

  // Ưu tiên id lấy từ dataTransfer (nguồn sự thật của trình duyệt), fallback về state khi trình duyệt không cấp.
  const dropOn = (targetOrder: number, droppedId: string) => {
    setOverCol(null);
    const p = pakds.find(x => x.id === (droppedId || dragId));
    setDragId('');
    if (!p) return;
    if (effectiveCurrentPhase(p) === targetOrder) return; // thả lại chỗ cũ — không làm gì
    if (targetOrder > p.steps.length) return;
    setPending({ pakd: p, targetOrder });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <Columns3 size={16} className="text-blue-600" />
        <h2 className="text-base font-bold text-gray-800">Bảng giai đoạn dự án (KH01–{khCode(colCount - 1)})</h2>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
          <Info size={12} className="text-blue-500 shrink-0" />
          {canMove
            ? 'Kéo thẻ dự án sang cột giai đoạn khác để chuyển KH, sau đó nhập mục tiêu (đầu vào) và kết quả đầu ra của giai đoạn đó.'
            : `Vai trò ${simUser.role} chỉ được xem. Chỉ AM, GĐ Kinh doanh, GĐ Khối, BOD được chuyển giai đoạn.`}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setKeyOnly(v => !v)} title="Lọc dự án trọng điểm"
            className={`flex items-center gap-1 text-[11px] font-semibold rounded px-2.5 py-1.5 border transition-colors ${keyOnly ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Star size={13} className={keyOnly ? 'fill-amber-400 text-amber-500' : ''} />Trọng điểm
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, mã PAKD, khách hàng..."
              className="text-[11px] border border-gray-300 rounded pl-7 pr-2 py-1.5 w-64 outline-none focus:border-blue-400" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max items-start">
          {columns.map((items, i) => {
            const order = i + 1;
            const revenue = items.reduce((s, p) => s + (p.revenue || 0), 0);
            const isOver = overCol === order;
            return (
              <div key={order}
                onDragOver={(e) => { if (canMove && dragId) { e.preventDefault(); setOverCol(order); } }}
                onDragLeave={() => setOverCol(c => c === order ? null : c)}
                onDrop={(e) => { e.preventDefault(); if (canMove) dropOn(order, e.dataTransfer?.getData('text/plain') || ''); }}
                className={`w-[260px] shrink-0 rounded-lg border border-t-4 ${COL_ACCENT[i % COL_ACCENT.length]} transition-colors ${isOver ? 'border-blue-400 bg-blue-50/70' : 'border-gray-200 bg-gray-50/70'}`}>
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-blue-700 tracking-wide">{khCode(i)}</span>
                    <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">{items.length}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-700 leading-tight mt-0.5">{colName(i)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Giá dự thầu: <b className="text-gray-600">{fmtBn(revenue)}</b></p>
                </div>

                <div className="p-2 space-y-2 min-h-[140px] max-h-[62vh] overflow-y-auto">
                  {items.length === 0 && (
                    <p className="text-[10px] text-gray-400 italic text-center py-6">
                      {isOver ? 'Thả vào đây' : 'Chưa có dự án'}
                    </p>
                  )}
                  {items.map(p => (
                    <div key={p.id}
                      draggable={canMove}
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'move'; setDragId(p.id); }}
                      onDragEnd={() => { setDragId(''); setOverCol(null); }}
                      className={`bg-white border rounded-md px-2.5 py-2 shadow-sm transition-all ${dragId === p.id ? 'opacity-40' : 'hover:border-blue-300 hover:shadow'} ${canMove ? 'cursor-grab active:cursor-grabbing' : ''} border-gray-200`}>
                      <div className="flex items-start gap-1.5">
                        {canMove && <GripVertical size={13} className="text-gray-300 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-blue-600">{p.id}</span>
                            {p.isKeyProject && <Star size={10} className="fill-amber-400 text-amber-500" />}
                            {p.masterCode && <span className="text-[9px] font-mono text-gray-400">{p.masterCode}</span>}
                          </div>
                          <p className="text-[11px] font-semibold text-gray-800 leading-snug mt-0.5 break-words">{p.name || <i className="text-gray-400 font-normal">(chưa đặt tên)</i>}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate" title={p.customerName}>{p.customerName || '—'}</p>
                          <div className="flex items-center justify-between gap-2 mt-1.5">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${DOT[p.status] || 'bg-gray-400'}`} />
                              <span className="text-[9px] text-gray-500">{PAKD_STATUS_LABEL[p.status]}</span>
                            </span>
                            <button onClick={() => onOpen(p.id)} title="Xem chi tiết"
                              className="text-gray-300 hover:text-blue-600 transition-colors"><Eye size={13} /></button>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-gray-100">
                            <span className="text-[9px] text-gray-400">DT {fmtBn(p.revenue || 0)}</span>
                            <span className="text-[9px] text-gray-400">CP {fmtBn(pakdTotalCost(p))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pending && (
        <PhasePlanModal move={pending} onClose={() => setPending(null)}
          onConfirm={(plan) => { onMove(pending.pakd.id, pending.targetOrder, plan); setPending(null); }} />
      )}
    </div>
  );
};

// ===== Modal nhập kế hoạch giai đoạn đích khi thả thẻ =====
const PhasePlanModal: React.FC<{
  move: PendingMove;
  onClose: () => void;
  onConfirm: (plan: PhasePlanInput) => void;
}> = ({ move, onClose, onConfirm }) => {
  const { pakd, targetOrder } = move;
  const from = effectiveCurrentPhase(pakd);
  const step = pakd.steps[targetOrder - 1];
  const [objective, setObjective] = useState(step?.objective || '');
  const [output, setOutput] = useState(step?.output || '');
  const [startDate, setStartDate] = useState(step?.startDate || '');
  const [endDate, setEndDate] = useState(step?.endDate || '');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!objective.trim()) { setErr('Nhập mục tiêu (đầu vào) của giai đoạn.'); return; }
    if (!output.trim()) { setErr('Nhập kết quả đầu ra của giai đoạn.'); return; }
    if (startDate && endDate && startDate > endDate) { setErr('Ngày bắt đầu phải trước ngày kết thúc.'); return; }
    onConfirm({ objective, output, startDate, endDate, reason });
  };

  const inp = 'w-full text-[11px] border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400';
  const lab = 'text-[10px] font-bold text-gray-500 uppercase tracking-wide';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Chuyển giai đoạn dự án</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                <span className="font-mono font-bold text-blue-600">{pakd.id}</span> — {pakd.name || '(chưa đặt tên)'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={17} /></button>
          </div>

          <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100 flex items-center justify-center gap-3 text-[11px]">
            <span className="text-gray-500">{khCode(from - 1)}</span>
            <span className="text-blue-400">→</span>
            <span className="font-bold text-blue-700">{khCode(targetOrder - 1)} — {step?.name || PHASE_DEFAULT_NAMES[targetOrder - 1]}</span>
          </div>

          <div className="p-4 space-y-3">
            {err && <p className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-200 rounded px-2 py-1.5">{err}</p>}

            <div className="space-y-1">
              <label className={lab}>Mục tiêu (đầu vào) *</label>
              <textarea value={objective} onChange={(e) => { setObjective(e.target.value); setErr(''); }} rows={2}
                placeholder="Mục tiêu cần đạt của giai đoạn này..." className={inp} />
            </div>

            <div className="space-y-1">
              <label className={lab}>Kết quả đầu ra *</label>
              <textarea value={output} onChange={(e) => { setOutput(e.target.value); setErr(''); }} rows={2}
                placeholder="Sản phẩm/tài liệu bàn giao khi kết thúc giai đoạn..." className={inp} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={lab}>Ngày bắt đầu</label>
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setErr(''); }} className={inp} />
              </div>
              <div className="space-y-1">
                <label className={lab}>Ngày kết thúc</label>
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setErr(''); }} className={inp} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={lab}>Lý do chuyển giai đoạn</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Ghi chú để lưu vào nhật ký (không bắt buộc)" className={inp} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
            <button onClick={submit} className="flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600">
              <Check size={13} className="mr-1" />Xác nhận chuyển {khCode(targetOrder - 1)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
