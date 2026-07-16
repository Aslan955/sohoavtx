import React from 'react';
import { Wallet, TrendingDown, TrendingUp, AlertTriangle, Clock, Layers, Users, Target, Eye, PieChart, Inbox } from 'lucide-react';
import { Pakd, costPlanOf } from './projectTypes';
import { PAKD_STATUS_LABEL } from './projectWorkflow';

const MIN_MARGIN = 15;   // biên LN tối thiểu (%)
const NEAR_BUDGET = 85;  // sắp chạm trần ngân sách (%)

const fmtB = (v: number) => v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(2)} tỷ` : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)} tr` : `${Math.round(v).toLocaleString('vi-VN')} đ`;
const pct = (v: number) => `${v.toFixed(0)}%`;
const daysSince = (dt?: string): number | null => {
  if (!dt) return null;
  const d = new Date(dt.replace(' ', 'T'));
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
};

// Gộp P&L toàn dự án từ các giai đoạn; fallback sang revenue/expectedCost nếu chưa nhập P&L.
interface Row {
  p: Pakd; hd: number; cost: number; profit: number; margin: number;
  budget: number; spent: number; burn: number;
}
function deriveRow(p: Pakd): Row {
  const plan = p.steps.reduce((a, s) => { const c = costPlanOf(s); return { contract: a.contract + c.contract, cost: a.cost + c.totalCost, profit: a.profit + c.profit }; }, { contract: 0, cost: 0, profit: 0 });
  const hd = plan.contract > 0 ? plan.contract : p.revenue;
  const cost = plan.cost > 0 ? plan.cost : (p.expectedCost || 0);
  const profit = hd - cost;
  const margin = hd > 0 ? (profit / hd) * 100 : 0;
  const budget = p.steps.reduce((s, st) => s + (st.productionBudget || 0) + (st.businessBudget || 0), 0) || cost;
  const spent = (p.accountingSpends || []).reduce((s, x) => s + x.production + x.business, 0);
  const burn = budget > 0 ? (spent / budget) * 100 : 0;
  return { p, hd, cost, profit, margin, budget, spent, burn };
}

const Kpi: React.FC<{ label: string; value: string; sub?: string; tone?: string; icon: React.ReactNode }> = ({ label, value, sub, tone, icon }) => (
  <div className="border border-gray-200 rounded-lg bg-white p-3 flex flex-col gap-1">
    <div className="flex items-center justify-between text-gray-400">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>{icon}
    </div>
    <div className={`text-lg font-bold ${tone || 'text-gray-800'}`}>{value}</div>
    {sub && <div className="text-[10px] text-gray-500">{sub}</div>}
  </div>
);

const Panel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }> = ({ title, icon, children, note }) => (
  <div className="border border-gray-200 rounded-lg bg-white">
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wide">
      {icon}{title}{note && <span className="ml-auto font-normal normal-case text-gray-400 text-[10px]">{note}</span>}
    </div>
    <div className="p-2">{children}</div>
  </div>
);

export const BusinessDirectorDashboard: React.FC<{
  pakds: Pakd[]; simUser: { role: string; fullName: string }; onOpen: (id: string) => void;
}> = ({ pakds, simUser, onOpen }) => {
  const isAdmin = simUser.role === 'ADMIN';
  const mine = pakds.filter(p => (p.businessDirector || '').includes(simUser.fullName));
  const scoped = isAdmin ? pakds : (mine.length ? mine : pakds);
  const scopeNote = isAdmin ? 'Toàn bộ dự án (Admin)' : (mine.length ? `Khối của ${simUser.fullName}` : 'Chưa gán GĐ Khối cho dự án nào — đang hiển thị toàn bộ');

  const rows = scoped.map(deriveRow);
  const totHD = rows.reduce((s, r) => s + r.hd, 0);
  const totProfit = rows.reduce((s, r) => s + r.profit, 0);
  const avgMargin = totHD > 0 ? (totProfit / totHD) * 100 : 0;
  const totBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totSpent = rows.reduce((s, r) => s + r.spent, 0);
  const burn = totBudget > 0 ? (totSpent / totBudget) * 100 : 0;
  const running = scoped.filter(p => p.status === 'COMPLETED').length;
  const pendingMe = scoped.filter(p => p.status === 'PENDING_BUSINESS_DIRECTOR');
  const risky = rows.filter(r => (r.hd > 0 && r.margin < MIN_MARGIN) || (r.budget > 0 && r.spent > r.budget));

  const lowMargin = rows.filter(r => r.hd > 0).sort((a, b) => a.margin - b.margin).slice(0, 6);
  const budgetRisk = rows.filter(r => r.spent > 0).sort((a, b) => b.burn - a.burn).slice(0, 6);

  // Tải theo PM
  const pmMap = new Map<string, { count: number; hd: number }>();
  rows.forEach(r => {
    const pm = r.p.businessPM || r.p.pmName || r.p.productionPM || '— Chưa gán PM';
    const cur = pmMap.get(pm) || { count: 0, hd: 0 };
    pmMap.set(pm, { count: cur.count + 1, hd: cur.hd + r.hd });
  });
  const pmLoad = [...pmMap.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);

  // Cơ cấu theo domain
  const domMap = new Map<string, { count: number; hd: number; profit: number }>();
  rows.forEach(r => {
    const d = r.p.domain || 'Khác';
    const cur = domMap.get(d) || { count: 0, hd: 0, profit: 0 };
    domMap.set(d, { count: cur.count + 1, hd: cur.hd + r.hd, profit: cur.profit + r.profit });
  });
  const domains = [...domMap.entries()].sort((a, b) => b[1].hd - a[1].hd);

  const marginTone = (m: number) => m < 0 ? 'text-red-600' : m < MIN_MARGIN ? 'text-orange-600' : 'text-green-700';
  const burnTone = (r: Row) => r.spent > r.budget && r.budget > 0 ? 'text-red-600' : r.burn >= NEAR_BUDGET ? 'text-orange-600' : 'text-gray-700';
  const Th: React.FC<{ children?: React.ReactNode; right?: boolean }> = ({ children, right }) => <th className={`px-2 py-1.5 font-semibold border-b border-gray-200 ${right ? 'text-right' : 'text-left'}`}>{children}</th>;
  const nameCell = (p: Pakd) => (
    <button onClick={() => onOpen(p.id)} className="text-left hover:underline">
      <span className="font-mono text-[10px] text-blue-600">{p.masterCode || p.id}</span>
      <span className="block max-w-[220px] truncate text-gray-700">{p.name}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] text-gray-500">
        <Target size={13} className="text-blue-600" /><b className="text-gray-700">Tổng quan điều hành khối</b>
        <span className="ml-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{scopeNote}</span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Kpi label="Dự án khối" value={String(scoped.length)} sub={`${running} đang chạy`} icon={<Layers size={14} />} />
        <Kpi label="Tổng giá trị HĐ" value={fmtB(totHD)} icon={<Wallet size={14} />} />
        <Kpi label="LN gộp dự kiến" value={fmtB(totProfit)} sub={`Biên TB ${pct(avgMargin)}`} tone={totProfit >= 0 ? 'text-green-700' : 'text-red-600'} icon={<TrendingUp size={14} />} />
        <Kpi label="Đã chi / Kế hoạch" value={pct(burn)} sub={`${fmtB(totSpent)} / ${fmtB(totBudget)}`} tone={burn >= NEAR_BUDGET ? 'text-orange-600' : 'text-gray-800'} icon={<PieChart size={14} />} />
        <Kpi label="Chờ tôi duyệt" value={String(pendingMe.length)} sub="hồ sơ tồn đọng" tone={pendingMe.length ? 'text-blue-700' : 'text-gray-800'} icon={<Inbox size={14} />} />
        <Kpi label="Dự án rủi ro" value={String(risky.length)} sub="biên thấp / vượt NS" tone={risky.length ? 'text-red-600' : 'text-green-700'} icon={<AlertTriangle size={14} />} />
      </div>

      {/* Hàng đợi duyệt của tôi */}
      <Panel title="Hàng đợi chờ tôi duyệt" icon={<Inbox size={13} className="text-blue-600" />} note={`${pendingMe.length} hồ sơ`}>
        {pendingMe.length === 0
          ? <div className="text-[11px] text-gray-400 italic px-2 py-3 text-center">Không có hồ sơ nào chờ bạn duyệt. 👍</div>
          : (
            <table className="w-full text-[11px] border-collapse">
              <thead className="text-gray-600"><tr><Th>Dự án</Th><Th right>Giá trị HĐ</Th><Th right>Biên LN</Th><Th right>Tuổi hồ sơ</Th><Th right></Th></tr></thead>
              <tbody>
                {pendingMe.map(p => {
                  const r = deriveRow(p); const age = daysSince(p.approvalHistory[0]?.createdAt);
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50/40">
                      <td className="px-2 py-1.5">{nameCell(p)}</td>
                      <td className="px-2 py-1.5 text-right">{fmtB(r.hd)}</td>
                      <td className={`px-2 py-1.5 text-right font-semibold ${marginTone(r.margin)}`}>{pct(r.margin)}</td>
                      <td className={`px-2 py-1.5 text-right ${age !== null && age >= 3 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{age !== null ? `${age} ngày` : '—'}</td>
                      <td className="px-2 py-1.5 text-right"><button onClick={() => onOpen(p.id)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Eye size={13} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Biên LN thấp nhất */}
        <Panel title="Biên lợi nhuận thấp nhất" icon={<TrendingDown size={13} className="text-red-500" />} note={`ngưỡng ${MIN_MARGIN}%`}>
          <table className="w-full text-[11px] border-collapse">
            <thead className="text-gray-600"><tr><Th>Dự án</Th><Th right>Giá trị HĐ</Th><Th right>Chi phí</Th><Th right>LN</Th><Th right>Biên</Th></tr></thead>
            <tbody>
              {lowMargin.map(r => (
                <tr key={r.p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1.5">{nameCell(r.p)}</td>
                  <td className="px-2 py-1.5 text-right">{fmtB(r.hd)}</td>
                  <td className="px-2 py-1.5 text-right text-gray-500">{fmtB(r.cost)}</td>
                  <td className={`px-2 py-1.5 text-right ${r.profit < 0 ? 'text-red-600' : 'text-gray-700'}`}>{fmtB(r.profit)}</td>
                  <td className={`px-2 py-1.5 text-right font-bold ${marginTone(r.margin)}`}>{pct(r.margin)}</td>
                </tr>
              ))}
              {lowMargin.length === 0 && <tr><td colSpan={5} className="px-2 py-3 text-center text-gray-400 italic">Chưa có dữ liệu giá trị HĐ.</td></tr>}
            </tbody>
          </table>
        </Panel>

        {/* Ngân sách vs thực chi */}
        <Panel title="Ngân sách vs Thực chi" icon={<Wallet size={13} className="text-orange-500" />} note={`cảnh báo ≥ ${NEAR_BUDGET}%`}>
          <table className="w-full text-[11px] border-collapse">
            <thead className="text-gray-600"><tr><Th>Dự án</Th><Th right>Kế hoạch</Th><Th right>Đã chi</Th><Th right>% NS</Th></tr></thead>
            <tbody>
              {budgetRisk.map(r => (
                <tr key={r.p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1.5">{nameCell(r.p)}</td>
                  <td className="px-2 py-1.5 text-right text-gray-500">{fmtB(r.budget)}</td>
                  <td className="px-2 py-1.5 text-right">{fmtB(r.spent)}</td>
                  <td className={`px-2 py-1.5 text-right font-bold ${burnTone(r)}`}>{pct(r.burn)}{r.spent > r.budget && r.budget > 0 && <AlertTriangle size={11} className="inline ml-1 -mt-0.5" />}</td>
                </tr>
              ))}
              {budgetRisk.length === 0 && <tr><td colSpan={4} className="px-2 py-3 text-center text-gray-400 italic">Chưa có chi thực tế nào được Kế toán import.</td></tr>}
            </tbody>
          </table>
        </Panel>

        {/* Tải theo PM */}
        <Panel title="Tải công việc theo PM" icon={<Users size={13} className="text-blue-600" />} note={`${pmMap.size} PM`}>
          <table className="w-full text-[11px] border-collapse">
            <thead className="text-gray-600"><tr><Th>PM</Th><Th right>Số dự án</Th><Th right>Tổng giá trị HĐ</Th></tr></thead>
            <tbody>
              {pmLoad.map(([pm, v]) => (
                <tr key={pm} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1.5 text-gray-700">{pm}</td>
                  <td className="px-2 py-1.5 text-right"><span className={`inline-block min-w-[22px] rounded px-1.5 font-semibold ${v.count >= 4 ? 'bg-orange-100 text-orange-700' : 'text-gray-700'}`}>{v.count}</span></td>
                  <td className="px-2 py-1.5 text-right text-gray-600">{fmtB(v.hd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Cơ cấu theo domain */}
        <Panel title="Cơ cấu theo lĩnh vực (Domain)" icon={<PieChart size={13} className="text-emerald-600" />}>
          <table className="w-full text-[11px] border-collapse">
            <thead className="text-gray-600"><tr><Th>Domain</Th><Th right>Dự án</Th><Th right>Giá trị HĐ</Th><Th right>LN</Th></tr></thead>
            <tbody>
              {domains.map(([d, v]) => (
                <tr key={d} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1.5 text-gray-700">{d}</td>
                  <td className="px-2 py-1.5 text-right">{v.count}</td>
                  <td className="px-2 py-1.5 text-right">{fmtB(v.hd)}</td>
                  <td className={`px-2 py-1.5 text-right ${v.profit < 0 ? 'text-red-600' : 'text-green-700'}`}>{fmtB(v.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};
