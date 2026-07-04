import React from 'react';
import { AlertTriangle, TrendingDown, Clock, CheckCircle2, FileEdit, Eye, Ban, Wallet, Layers } from 'lucide-react';
import { Pakd, ProjectStep } from './projectTypes';
import { khCode } from './projectData';
import { PAKD_STATUS_LABEL, PAKD_PENDING_ROLE } from './projectWorkflow';

// ===================== Ngưỡng cảnh báo (chỉnh 1 chỗ) =====================
const THRESHOLDS = {
  minMarginPct: 15, // biên lợi nhuận tối thiểu (%)
  nearBudgetPct: 85, // sắp chạm trần ngân sách (%)
};

const fmtMoney = (v: number) => v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(2)} tỷ` : `${v.toLocaleString('vi-VN')} đ`;

const stepHasInfo = (s: ProjectStep) => !!(s.startDate || s.endDate || (s.objective || '').trim() || (s.output || '').trim() || (s.productionBudget || 0) > 0 || (s.businessBudget || 0) > 0);
const curPhase = (p: Pakd) => Math.max(p.currentPhase || 1, p.steps.reduce((acc, s, i) => stepHasInfo(s) ? i + 1 : acc, 0));

const budgetOf = (p: Pakd) => p.steps.reduce((s, st) => s + (st.productionBudget || 0) + (st.businessBudget || 0), 0);
const spentOf = (p: Pakd) => p.steps.reduce((s, st) => s + (st.actualSpent || 0), 0);

// ===================== Quy tắc cảnh báo =====================
type Severity = 'RED' | 'AMBER' | 'BLUE';
interface Alert { pakdId: string; pakdName: string; severity: Severity; title: string; detail: string; icon: React.ReactNode }

function buildAlerts(pakds: Pakd[]): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date().toISOString().substring(0, 10);
  for (const p of pakds) {
    const budget = budgetOf(p);
    const spent = spentOf(p);
    const pct = budget > 0 ? (spent / budget) * 100 : 0;

    if (budget > 0 && spent > budget) {
      alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'RED', title: `Chi thực tế vượt tổng ngân sách (${pct.toFixed(0)}%)`, detail: `Đã chi ${fmtMoney(spent)} / NS ${fmtMoney(budget)}`, icon: <AlertTriangle size={15} /> });
    } else {
      const overPhases = p.steps
        .map((st, i) => ({ code: khCode(i), b: (st.productionBudget || 0) + (st.businessBudget || 0), sp: st.actualSpent || 0 }))
        .filter(x => x.b > 0 && x.sp > x.b);
      if (overPhases.length > 0) {
        alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'AMBER', title: `Vượt ngân sách cục bộ ở ${overPhases.map(x => x.code).join(', ')}`, detail: overPhases.map(x => `${x.code}: ${fmtMoney(x.sp)}/${fmtMoney(x.b)}`).join(' • '), icon: <Wallet size={15} /> });
      } else if (budget > 0 && pct >= THRESHOLDS.nearBudgetPct) {
        alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'AMBER', title: `Sắp chạm trần ngân sách (${pct.toFixed(0)}%)`, detail: `Đã chi ${fmtMoney(spent)} / NS ${fmtMoney(budget)}`, icon: <Wallet size={15} /> });
      }
    }

    if (p.revenue > 0 && spent > 0) {
      const margin = ((p.revenue - spent) / p.revenue) * 100;
      if (margin < THRESHOLDS.minMarginPct) {
        alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'RED', title: `Biên lợi nhuận còn ${margin.toFixed(1)}% (< ${THRESHOLDS.minMarginPct}%)`, detail: `Doanh thu ${fmtMoney(p.revenue)} • đã chi ${fmtMoney(spent)}`, icon: <TrendingDown size={15} /> });
      }
    }

    if ((p.expectedCost || 0) > 0 && spent > (p.expectedCost || 0)) {
      alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'RED', title: 'Chi vượt chi phí dự kiến tối đa', detail: `Đã chi ${fmtMoney(spent)} / dự kiến tối đa ${fmtMoney(p.expectedCost || 0)}`, icon: <AlertTriangle size={15} /> });
    }

    // Giai đoạn hiện tại quá hạn kết thúc mà chưa chuyển
    const cp = curPhase(p);
    const curStep = p.steps[cp - 1];
    if (curStep?.endDate && curStep.endDate < today && cp < p.steps.length && p.status === 'COMPLETED') {
      alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'AMBER', title: `${khCode(cp - 1)} quá hạn kết thúc (${curStep.endDate})`, detail: 'Chưa chuyển sang giai đoạn kế tiếp', icon: <Clock size={15} /> });
    }

    if (p.status === 'RETURNED') {
      alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'BLUE', title: 'Bị trả lại — chờ người lập chỉnh sửa & nộp lại', detail: `Người lập: ${p.creator}`, icon: <Ban size={15} /> });
    }

    // Đang điều chỉnh trình duyệt lại
    if (p.pendingAdjustReason && PAKD_PENDING_ROLE[p.status]) {
      alerts.push({ pakdId: p.id, pakdName: p.name, severity: 'BLUE', title: 'Phương án điều chỉnh đang chờ duyệt lại', detail: `Lý do: ${p.pendingAdjustReason}`, icon: <FileEdit size={15} /> });
    }
  }
  const order: Record<Severity, number> = { RED: 0, AMBER: 1, BLUE: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

const SEV_STYLE: Record<Severity, { box: string; text: string; badge: string; label: string }> = {
  RED: { box: 'bg-red-50 border-red-300', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Nghiêm trọng' },
  AMBER: { box: 'bg-amber-50 border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'Cần chú ý' },
  BLUE: { box: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', label: 'Theo dõi' },
};

// ===================== KPI card =====================
const Kpi: React.FC<{ label: string; value: React.ReactNode; sub?: string; tone?: 'default' | 'red' | 'amber' | 'green' | 'blue' }> = ({ label, value, sub, tone = 'default' }) => {
  const tones: Record<string, string> = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`border rounded px-3 py-2.5 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
};

// ===================== Dashboard BOD =====================
export const BodDashboard: React.FC<{ pakds: Pakd[]; simUser: { role: string; fullName: string }; onOpen: (id: string) => void }> = ({ pakds, simUser, onOpen }) => {
  const alerts = buildAlerts(pakds);
  const redCount = alerts.filter(a => a.severity === 'RED').length;

  const total = pakds.length;
  const completed = pakds.filter(p => p.status === 'COMPLETED').length;
  const draft = pakds.filter(p => p.status === 'DRAFT').length;
  const returned = pakds.filter(p => p.status === 'RETURNED').length;
  const inFlow = pakds.filter(p => !!PAKD_PENDING_ROLE[p.status]).length;
  const waitingMe = pakds.filter(p => PAKD_PENDING_ROLE[p.status] === simUser.role).length;

  const totalBudget = pakds.reduce((s, p) => s + budgetOf(p), 0);
  const totalSpent = pakds.reduce((s, p) => s + spentOf(p), 0);
  const spentPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const totalRevenue = pakds.reduce((s, p) => s + (p.revenue || 0), 0);
  const totalExpCost = pakds.reduce((s, p) => s + (p.expectedCost || 0), 0);
  const portfolioMargin = totalRevenue > 0 ? ((totalRevenue - totalExpCost) / totalRevenue) * 100 : 0;

  // Phân bố theo bước trong luồng
  const stageDist = Object.keys(PAKD_STATUS_LABEL)
    .map(s => ({ status: s, label: PAKD_STATUS_LABEL[s as keyof typeof PAKD_STATUS_LABEL], count: pakds.filter(p => p.status === s).length }))
    .filter(x => x.count > 0);

  // Watchlist: có cảnh báo trước, sau đó theo % chi giảm dần
  const alertIds = new Set(alerts.map(a => a.pakdId));
  const watchRows = [...pakds]
    .map(p => {
      const b = budgetOf(p); const sp = spentOf(p);
      const pct = b > 0 ? (sp / b) * 100 : 0;
      const worst: Severity | 'OK' = alerts.find(a => a.pakdId === p.id)?.severity || 'OK';
      return { p, b, sp, pct, worst };
    })
    .sort((a, b) => {
      const rank = (w: Severity | 'OK') => w === 'RED' ? 0 : w === 'AMBER' ? 1 : w === 'BLUE' ? 2 : 3;
      return rank(a.worst) - rank(b.worst) || b.pct - a.pct;
    })
    .slice(0, 10);

  const dot = (w: Severity | 'OK') =>
    w === 'RED' ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Nghiêm trọng" />
    : w === 'AMBER' ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" title="Cần chú ý" />
    : w === 'BLUE' ? <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400" title="Theo dõi" />
    : <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Ổn định" />;

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Kpi label="Tổng dự án" value={total} sub={`${draft} nháp • ${returned} bị trả lại`} />
        <Kpi label="Đang trong luồng duyệt" value={inFlow} tone="blue" />
        <Kpi label={`Chờ tôi duyệt`} value={waitingMe} tone={waitingMe > 0 ? 'amber' : 'default'} sub={simUser.fullName} />
        <Kpi label="Hoàn tất" value={completed} tone="green" />
        <Kpi label="Cảnh báo" value={alerts.length} tone={redCount > 0 ? 'red' : alerts.length > 0 ? 'amber' : 'green'} sub={`${redCount} nghiêm trọng`} />
        <Kpi label="Biên LN dự kiến" value={`${portfolioMargin.toFixed(1)}%`} tone={portfolioMargin < THRESHOLDS.minMarginPct ? 'red' : 'green'} sub="toàn danh mục" />
      </div>

      {/* Ngân sách toàn danh mục */}
      <div className="border border-gray-200 rounded p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5"><Wallet size={13} className="text-blue-600" />Ngân sách toàn danh mục</h3>
          <span className="text-[11px] text-gray-600">
            Đã chi <b className={spentPct > 100 ? 'text-red-600' : 'text-amber-700'}>{fmtMoney(totalSpent)}</b> / xin <b className="text-blue-700">{fmtMoney(totalBudget)}</b>
            <span className={`ml-1.5 font-bold ${spentPct > 100 ? 'text-red-600' : 'text-gray-700'}`}>({totalBudget > 0 ? `${spentPct.toFixed(1)}%` : '—'})</span>
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${spentPct > 100 ? 'bg-red-500' : spentPct >= THRESHOLDS.nearBudgetPct ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${Math.min(100, spentPct)}%` }} />
        </div>
        {/* Phân bố trạng thái */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {stageDist.map(x => (
            <span key={x.status} className="text-[10px] font-semibold bg-gray-100 text-gray-600 rounded px-2 py-1">{x.label}: <b className="text-gray-800">{x.count}</b></span>
          ))}
        </div>
      </div>

      {/* Trung tâm cảnh báo */}
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-red-500" />Trung tâm cảnh báo ({alerts.length})
        </div>
        <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
          {alerts.length === 0 && <p className="text-[11px] text-gray-400 italic text-center py-6 flex items-center justify-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" />Không có cảnh báo nào — danh mục đang ổn định.</p>}
          {alerts.map((a, i) => {
            const st = SEV_STYLE[a.severity];
            return (
              <button key={i} onClick={() => onOpen(a.pakdId)} className={`w-full flex items-center gap-2.5 border rounded px-3 py-2 text-left hover:opacity-80 transition-opacity ${st.box}`}>
                <span className={st.text}>{a.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[11px] font-bold truncate ${st.text}`}><span className="font-mono">{a.pakdId}</span> — {a.title}</span>
                  <span className="block text-[10px] text-gray-500 truncate">{a.pakdName} • {a.detail}</span>
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${st.badge}`}>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Watchlist */}
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <Layers size={13} className="text-blue-600" />Danh sách theo dõi (top 10)
        </div>
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-left">
              <th className="px-3 py-2 font-semibold w-8 text-center">Đèn</th>
              <th className="px-3 py-2 font-semibold">Mã PAKD</th>
              <th className="px-3 py-2 font-semibold">Tên dự án</th>
              <th className="px-3 py-2 font-semibold">Giai đoạn</th>
              <th className="px-3 py-2 font-semibold">Trạng thái</th>
              <th className="px-3 py-2 font-semibold text-right">NS đã xin</th>
              <th className="px-3 py-2 font-semibold text-right">Đã chi</th>
              <th className="px-3 py-2 font-semibold text-right">% chi/NS</th>
              <th className="px-3 py-2 font-semibold w-10 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {watchRows.map(({ p, b, sp, pct, worst }) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50/40">
                <td className="px-3 py-2 text-center">{dot(worst)}</td>
                <td className="px-3 py-2"><button onClick={() => onOpen(p.id)} className="text-blue-600 font-semibold font-mono hover:underline">{p.id}</button></td>
                <td className="px-3 py-2 text-gray-800 max-w-[220px] truncate">{p.name}</td>
                <td className="px-3 py-2"><span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">{khCode(curPhase(p) - 1)}</span></td>
                <td className="px-3 py-2 text-gray-600">{PAKD_STATUS_LABEL[p.status as keyof typeof PAKD_STATUS_LABEL]}</td>
                <td className="px-3 py-2 text-right text-gray-700">{fmtMoney(b)}</td>
                <td className={`px-3 py-2 text-right font-semibold ${sp > b && b > 0 ? 'text-red-600' : 'text-amber-700'}`}>{fmtMoney(sp)}</td>
                <td className={`px-3 py-2 text-right font-bold ${pct > 100 ? 'text-red-600' : pct >= THRESHOLDS.nearBudgetPct ? 'text-amber-600' : 'text-gray-700'}`}>{b > 0 ? `${pct.toFixed(0)}%` : '—'}</td>
                <td className="px-3 py-2 text-center"><button title="Xem chi tiết" onClick={() => onOpen(p.id)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Eye size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px] text-gray-400 px-3 py-2">Sắp xếp: dự án có cảnh báo nghiêm trọng trước, sau đó theo % chi/NS. Ngưỡng: biên LN tối thiểu {THRESHOLDS.minMarginPct}% • sắp chạm trần {THRESHOLDS.nearBudgetPct}%.</p>
      </div>
    </div>
  );
};

// Đếm số cảnh báo (dùng cho badge trên tab)
export const countAlerts = (pakds: Pakd[]): number => buildAlerts(pakds).length;
