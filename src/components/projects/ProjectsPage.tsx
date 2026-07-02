import React, { useState } from 'react';
import {
  Plus, ChevronRight, ChevronDown, Search, Eye, Check, Ban, FileEdit, Lock, Trash2,
  Target, ArrowLeft, FileSpreadsheet, GitBranch, ChevronUp, MessageSquare, Send, X, LogOut, Layers, LogIn, CheckCircle2, Paperclip, History,
} from 'lucide-react';
import {
  Pakd, ApprovalAction, AuditLogEntry, ProjectStep, CostItem, CostChange, ProductionTask, ProductionInfo, PakdComment,
  stepCost, stepActualCost, pakdTotalCost, pakdActualCost,
} from './projectTypes';
import {
  INITIAL_PAKDS, SYSTEM_USERS, COST_TYPES, DOMAINS, BUSINESS_DIRECTORS, SALES_DIRECTORS, makePhases, khCode,
} from './projectData';
import {
  PAKD_STATUS_LABEL, CR_STATUS_LABEL, PAKD_PENDING_ROLE, CR_PENDING_ROLE, PAKD_FLOW,
  canEditDirect, submitPakd, approvePakd, createChangeRequest, approveChangeRequest,
  openOutsourceCode, hasOpenChangeRequest, rid,
  createBudgetAdjustment, decideBudgetAdjustment, BA_STATUS_LABEL, BA_PENDING_ROLE,
  requestPhaseAdvance, decidePhaseAdvance, ADV_STEPS, ADV_LABEL, ADV_PENDING_ROLE,
} from './projectWorkflow';

type ModuleTab = 'LIST' | 'APPROVALS' | 'CHANGES' | 'AUDIT';

const STATUS_DOT: Record<string, string> = {
  DRAFT: 'bg-gray-400', RETURNED: 'bg-red-500',
  PENDING_SALES_DIRECTOR: 'bg-orange-400', PENDING_BUSINESS_DIRECTOR: 'bg-orange-400', PENDING_BOD: 'bg-orange-400', PENDING_ACCOUNTANT: 'bg-orange-400',
  PENDING_IT: 'bg-sky-500', COMPLETED: 'bg-green-500',
};

const ROLE_LABEL: Record<string, string> = {
  SALE: 'AM (Account Manager)', SALES_DIRECTOR: 'GĐ Kinh doanh', BUSINESS_DIRECTOR: 'Giám đốc Khối', BOD: 'Ban Giám đốc (BOD)',
  ACCOUNTANT: 'Kế toán', IT: 'IT', PRODUCTION: 'Khối Sản xuất', ADMIN: 'Quản trị',
};

const fmtB = (v: number) => `${(v / 1000000000).toFixed(2)} tỷ`;
const fmtFull = (v: number) => v.toLocaleString('vi-VN') + ' đ';

const PakdStatusCell: React.FC<{ status: string }> = ({ status }) => (
  <div className="flex items-center space-x-1.5">
    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status] || 'bg-gray-400'}`} />
    <span className="text-[11px] font-medium text-gray-700">{PAKD_STATUS_LABEL[status as keyof typeof PAKD_STATUS_LABEL] || status}</span>
  </div>
);

export const ProjectsPage: React.FC = () => {
  const [pakds, setPakds] = useState<Pakd[]>(INITIAL_PAKDS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [moduleTab, setModuleTab] = useState<ModuleTab>('LIST');
  const [selectedId, setSelectedId] = useState('');
  const [simUser, setSimUser] = useState<typeof SYSTEM_USERS[number] | null>(() => {
    const id = typeof localStorage !== 'undefined' ? localStorage.getItem('plm_user') : null;
    return SYSTEM_USERS.find(u => u.id === id) || null;
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const current = pakds.find(p => p.id === selectedId);
  const setPakd = (id: string, fn: (p: Pakd) => Pakd) => setPakds(prev => prev.map(p => p.id === id ? fn(p) : p));

  const runAction = (id: string, fn: (p: Pakd, log: AuditLogEntry[]) => { pakd: Pakd; error?: string }) => {
    const target = pakds.find(p => p.id === id); if (!target) return;
    const log: AuditLogEntry[] = [];
    const { pakd, error: err } = fn(target, log);
    if (err) { setError(err); return; }
    setError(''); setComment('');
    setAuditLog(prev => [...log, ...prev]);
    setPakds(prev => prev.map(p => p.id === id ? pakd : p));
  };

  const login = (u: typeof SYSTEM_USERS[number]) => { localStorage.setItem('plm_user', u.id); setSimUser(u); };
  const logout = () => { localStorage.removeItem('plm_user'); setSimUser(null); };

  if (!simUser) return <LoginScreen onLogin={login} />;

  const pendingPakd = pakds.filter(p => PAKD_PENDING_ROLE[p.status] === simUser.role);
  const pendingCR = pakds.flatMap(p => p.changeRequests.filter(cr => CR_PENDING_ROLE[cr.status] === simUser.role).map(cr => ({ pakd: p, cr })));

  const counts = {
    ALL: pakds.length,
    ...Object.fromEntries(Object.keys(PAKD_STATUS_LABEL).map(s => [s, pakds.filter(p => p.status === s).length])),
  } as Record<string, number>;

  const filtered = pakds.filter(p => {
    const m = p.name.toLowerCase().includes(search.toLowerCase()) || p.customerName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.tender.packageCode.toLowerCase().includes(search.toLowerCase());
    return statusFilter === 'ALL' ? m : m && p.status === statusFilter;
  });

  return (
    <div className="p-4 bg-white m-4 rounded-sm shadow-sm min-w-[1000px] text-gray-800">
      {/* Breadcrumb + header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center text-sm">
          <Target size={16} className="text-gray-400 mr-2" />
          <span className="text-gray-500 font-medium">Home</span>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-gray-500 font-medium">Project Management</span>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">Quản lý PAKD đấu thầu</span>
          {current && (<><ChevronRight size={14} className="mx-2 text-gray-400" /><span className="text-blue-600 font-semibold">{current.id}</span></>)}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{simUser.fullName.split(' ').pop()?.[0]}</div>
            <div className="leading-tight">
              <div className="font-semibold text-gray-800">{simUser.fullName}</div>
              <div className="text-[10px] text-gray-400">{ROLE_LABEL[simUser.role]}</div>
            </div>
            <button onClick={logout} title="Đăng xuất" className="ml-1 text-gray-400 hover:text-red-600 flex items-center gap-1"><LogOut size={13} /></button>
          </div>
          {simUser.role === 'SALE' && !current && (
            <button onClick={() => setCreateOpen(true)} className="flex items-center px-4 py-1.5 bg-[#007bff] text-white text-sm font-semibold rounded shadow-sm hover:bg-blue-600 transition-all active:scale-95">
              <Plus size={16} className="mr-1" />Tạo dự án
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2 rounded flex items-center justify-between">
          <span>{error}</span><button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {current ? (
        <DetailView pakd={current} simUser={simUser} onBack={() => setSelectedId('')} setPakd={(fn) => setPakd(current.id, fn)}
          onSubmit={() => runAction(current.id, (p, l) => submitPakd(p, simUser.fullName, l))}
          onCreateCR={(reason, changes) => runAction(current.id, (p) => createChangeRequest(p, reason, changes, simUser.fullName))}
          onAddOutsource={(label) => runAction(current.id, (p, l) => openOutsourceCode(p, label, simUser.fullName, l))}
          onAddComment={(content) => setPakd(current.id, p => ({ ...p, comments: [...(p.comments || []), { id: rid('CM'), author: simUser.fullName, role: simUser.role, content, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) }] }))}
          onCreateBudgetAdj={(sid, after, reason) => runAction(current.id, (p, l) => createBudgetAdjustment(p, sid, after, reason, simUser.fullName, l))}
          onDecideBudgetAdj={(sid, adjId, action, comment) => runAction(current.id, (p, l) => decideBudgetAdjustment(p, sid, adjId, simUser.role, action, comment, simUser.fullName, l))}
          onDecide={(action, comment) => runAction(current.id, (p, l) => approvePakd(p, simUser.role, action, comment, simUser.fullName, l))}
          onRequestAdvance={(sid) => runAction(current.id, (p, l) => requestPhaseAdvance(p, sid, simUser.fullName, l))}
          onDecideAdvance={(sid, action, comment) => runAction(current.id, (p, l) => decidePhaseAdvance(p, sid, simUser.role, action, comment, simUser.fullName, l))} />
      ) : (
        <>
          {/* Module tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <ModTab label="Danh sách PAKD" active={moduleTab === 'LIST'} onClick={() => setModuleTab('LIST')} />
            <ModTab label="Hàng đợi duyệt" count={pendingPakd.length} active={moduleTab === 'APPROVALS'} onClick={() => setModuleTab('APPROVALS')} />
            <ModTab label="Phiếu điều chỉnh CP" count={pendingCR.length} active={moduleTab === 'CHANGES'} onClick={() => setModuleTab('CHANGES')} />
            <ModTab label="Nhật ký hệ thống" active={moduleTab === 'AUDIT'} onClick={() => setModuleTab('AUDIT')} />
          </div>

          {moduleTab === 'LIST' && (
            <ListView pakds={filtered} counts={counts} statusFilter={statusFilter} setStatusFilter={setStatusFilter} search={search} setSearch={setSearch} onOpen={setSelectedId} />
          )}
          {moduleTab === 'APPROVALS' && (
            <ApprovalQueue pakds={pendingPakd} simUser={simUser} comment={comment} setComment={setComment}
              onDecision={(id, a) => runAction(id, (p, l) => approvePakd(p, simUser.role, a, comment, simUser.fullName, l))}
              onOpen={setSelectedId} />
          )}
          {moduleTab === 'CHANGES' && (
            <ChangeQueue items={pendingCR} allPakds={pakds} comment={comment} setComment={setComment}
              onDecision={(pid, crid, a) => runAction(pid, (p, l) => approveChangeRequest(p, crid, simUser.role, a, comment, simUser.fullName, l))} />
          )}
          {moduleTab === 'AUDIT' && <AuditView log={auditLog} />}
        </>
      )}

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} creator={simUser.fullName}
        onCreate={(p) => { setPakds([p, ...pakds]); setSelectedId(p.id); setCreateOpen(false); }} />}
    </div>
  );
};

// ===================== LOGIN =====================
const LoginScreen: React.FC<{ onLogin: (u: typeof SYSTEM_USERS[number]) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const workflowUsers = SYSTEM_USERS.filter(u => ['SALE', 'SALES_DIRECTOR', 'BUSINESS_DIRECTOR', 'ACCOUNTANT', 'BOD'].includes(u.role));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = SYSTEM_USERS.find(x => x.username === username.trim() && x.password === password);
    if (!u) { setErr('Sai tài khoản hoặc mật khẩu.'); return; }
    onLogin(u);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* left form */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-1"><Layers className="text-blue-600" size={22} /><h1 className="text-lg font-black text-gray-900">IMIS — Quản lý PAKD</h1></div>
          <p className="text-xs text-gray-500 mb-6">Đăng nhập để thực hiện các bước duyệt & nhập thông tin.</p>
          {err && <p className="text-xs text-red-600 font-medium mb-3">{err}</p>}
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1"><label className="text-[11px] font-semibold text-gray-500">Tài khoản</label><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="vd: sale" className="w-full text-sm border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-400" /></div>
            <div className="space-y-1"><label className="text-[11px] font-semibold text-gray-500">Mật khẩu</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456" className="w-full text-sm border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-400" /></div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#007bff] text-white text-sm font-semibold py-2 rounded hover:bg-blue-600"><LogIn size={15} />Đăng nhập</button>
          </form>
        </div>
        {/* right quick accounts */}
        <div className="bg-gray-50 border-l border-gray-200 p-8">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-3">Tài khoản demo (bấm để đăng nhập nhanh)</p>
          <div className="space-y-2">
            {workflowUsers.map(u => (
              <button key={u.id} onClick={() => onLogin(u)} className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2 hover:border-blue-400 hover:bg-blue-50 text-left transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{u.fullName.split(' ').pop()?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{u.fullName}</div>
                  <div className="text-[10px] text-gray-500">{ROLE_LABEL[u.role]} • <span className="font-mono">{u.username}</span></div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-4">Mật khẩu chung: <b className="font-mono">123456</b></p>
        </div>
      </div>
    </div>
  );
};

// ===== small components =====
const ModTab: React.FC<{ label: string; count?: number; active: boolean; onClick: () => void }> = ({ label, count, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
    {label}{count !== undefined && count > 0 && <span className="ml-1.5 bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
  </button>
);

const Btn = {
  primary: 'flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors',
  ghost: 'flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors',
  green: 'flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors',
  red: 'flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors',
  purple: 'flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition-colors',
};

// ===================== LIST =====================
const ListView: React.FC<{
  pakds: Pakd[]; counts: Record<string, number>; statusFilter: string; setStatusFilter: (v: string) => void;
  search: string; setSearch: (v: string) => void; onOpen: (id: string) => void;
}> = ({ pakds, counts, statusFilter, setStatusFilter, search, setSearch, onOpen }) => (
  <div>
    {/* status filter tabs */}
    <div className="flex border-b border-gray-200 mb-3 overflow-x-auto">
      <FilterTab label="Tất cả" count={counts.ALL} active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
      {Object.keys(PAKD_STATUS_LABEL).filter(s => counts[s] > 0).map(s => (
        <FilterTab key={s} label={PAKD_STATUS_LABEL[s as keyof typeof PAKD_STATUS_LABEL]} count={counts[s]} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
      ))}
    </div>

    <div className="flex items-center justify-between mb-2">
      <button className={Btn.ghost}><FileSpreadsheet size={14} className="mr-1.5" />Export XLSX</button>
      <div className="relative w-64">
        <input type="text" placeholder="Tìm theo tên, mã PAKD, gói thầu..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-400 outline-none" />
        <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
      </div>
    </div>

    <div className="overflow-x-auto border border-gray-200 rounded">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <Th w="36px">#</Th><Th w="90px">Mã PAKD</Th><Th w="90px">Mã tổng</Th><Th w="220px">Tên dự án / gói thầu</Th>
            <Th w="110px">Số hiệu gói thầu</Th><Th w="180px">Chủ đầu tư</Th><Th w="120px">Hình thức</Th>
            <Th w="90px" right>Giá dự thầu</Th><Th w="90px" right>Tổng chi phí</Th><Th w="80px" right>LN (%)</Th>
            <Th w="120px">Trạng thái</Th><Th w="50px" center>Ver</Th><Th w="70px" center>Thao tác</Th>
          </tr>
        </thead>
        <tbody>
          {pakds.map((p, i) => {
            const total = pakdTotalCost(p); const profit = p.revenue - total;
            return (
              <tr key={p.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                <Td center muted>{i + 1}</Td>
                <Td><button onClick={() => onOpen(p.id)} className="text-blue-600 font-semibold hover:underline">{p.id}</button></Td>
                <Td mono>{p.masterCode ? <span className="text-gray-800 font-semibold">{p.masterCode}</span> : <span className="text-gray-300">—</span>}</Td>
                <Td><span className="text-gray-800 font-medium">{p.name}</span></Td>
                <Td mono>{p.tender.packageCode}</Td>
                <Td>{p.customerName}</Td>
                <Td>{p.tender.biddingMethod}</Td>
                <Td right>{fmtB(p.revenue)}</Td>
                <Td right>{fmtB(total)}</Td>
                <Td right><span className={profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{p.revenue ? ((profit / p.revenue) * 100).toFixed(1) : 0}%</span></Td>
                <Td><div className="flex items-center gap-1.5">{p.locked && <Lock size={11} className="text-orange-400" />}{hasOpenChangeRequest(p) && <FileEdit size={11} className="text-purple-500" />}<PakdStatusCell status={p.status} /></div></Td>
                <Td center mono>v{p.version}</Td>
                <Td center><button title="Xem chi tiết" onClick={() => onOpen(p.id)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Eye size={13} /></button></Td>
              </tr>
            );
          })}
          {pakds.length === 0 && <tr><td colSpan={13} className="text-center text-gray-400 py-10 text-xs">Không có PAKD phù hợp.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const FilterTab: React.FC<{ label: string; count: number; active: boolean; onClick: () => void }> = ({ label, count, active, onClick }) => (
  <button onClick={onClick} className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{label} ({count})</button>
);

const Th: React.FC<{ children?: React.ReactNode; w?: string; right?: boolean; center?: boolean }> = ({ children, w, right, center }) => (
  <th className={`px-3 py-2 font-semibold border-r border-gray-200 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`} style={{ minWidth: w }}>{children}</th>
);
const Td: React.FC<{ children?: React.ReactNode; right?: boolean; center?: boolean; muted?: boolean; mono?: boolean }> = ({ children, right, center, muted, mono }) => (
  <td className={`px-3 py-2 border-r border-gray-200 ${right ? 'text-right' : center ? 'text-center' : 'text-left'} ${muted ? 'text-gray-500' : 'text-gray-700'} ${mono ? 'font-mono' : ''}`}>{children}</td>
);

// ===================== DETAIL =====================
const DetailView: React.FC<{
  pakd: Pakd; simUser: any; onBack: () => void; setPakd: (fn: (p: Pakd) => Pakd) => void;
  onSubmit: () => void; onCreateCR: (reason: string, changes: CostChange[]) => void;
  onAddOutsource: (label: string) => void; onAddComment: (content: string) => void;
  onCreateBudgetAdj: (stepId: string, after: { business: number; production: number }, reason: string) => void;
  onDecideBudgetAdj: (stepId: string, adjId: string, action: ApprovalAction, comment: string) => void;
  onDecide: (action: ApprovalAction, comment: string) => void;
  onRequestAdvance: (stepId: string) => void;
  onDecideAdvance: (stepId: string, action: ApprovalAction, comment: string) => void;
}> = ({ pakd, simUser, onBack, setPakd, onSubmit, onCreateCR, onAddOutsource, onAddComment, onCreateBudgetAdj, onDecideBudgetAdj, onDecide, onRequestAdvance, onDecideAdvance }) => {
  const [decision, setDecision] = useState('');
  const isMyTurn = PAKD_PENDING_ROLE[pakd.status] === simUser.role;
  const editable = canEditDirect(pakd, simUser.role);
  const actualEditable = simUser.role === 'ACCOUNTANT' || simUser.role === 'ADMIN'; // Kế toán nhập chi phí thực tế
  const total = pakdTotalCost(pakd);
  const actualTotal = pakdActualCost(pakd);
  const profit = pakd.revenue - total;
  const [crOpen, setCrOpen] = useState(false);
  const [osLabel, setOsLabel] = useState('');
  const [sheet, setSheet] = useState<'BUSINESS' | 'PRODUCTION'>('BUSINESS');
  const [phaseIdx, setPhaseIdx] = useState(0); // KH01..KH06
  const [histIdx, setHistIdx] = useState<number | null>(null); // xem lịch sử ĐC ngân sách của giai đoạn
  const [showComments, setShowComments] = useState(false);
  const costVersions = pakd.costVersions || 0;
  const addVersionColumn = () => setPakd(p => ({ ...p, costVersions: (p.costVersions || 0) + 1 }));
  const currentPhase = pakd.currentPhase || 1;
  const setCurrentPhase = (n: number) => setPakd(p => ({ ...p, currentPhase: n }));
  const [adjusting, setAdjusting] = useState(false);
  // Sau khi khóa (đã duyệt V1), Sale mở "phiếu điều chỉnh" để bổ sung/đổi tên/xóa khoản chi phí ở cột V mới
  const costEditable = editable || (simUser.role === 'SALE' && adjusting);
  const startAdjust = () => { setAdjusting(true); if ((pakd.costVersions || 0) === 0) addVersionColumn(); };
  // Giai đoạn triển khai chỉ lập SAU KHI Kế toán duyệt (status đã sang Chờ IT / Hoàn tất)
  const afterAccounting = ['PENDING_BOD', 'PENDING_IT', 'COMPLETED'].includes(pakd.status);
  const prodEditable = afterAccounting;

  const updStep = (sid: string, patch: Partial<ProjectStep>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, ...patch } : s) }));
  // Thêm / xóa giai đoạn (KH có thể định nghĩa và cộng thêm tùy dự án)
  const addPhase = () => setPakd(p => ({ ...p, steps: [...p.steps, { id: khCode(p.steps.length), order: p.steps.length + 1, name: `Giai đoạn ${p.steps.length + 1}`, assignee: '', approvedBudget: 0, revenue: 0, costItems: [] }] }));
  const rmPhase = (idx: number) => setPakd(p => p.steps.length <= 6 ? p : { ...p, steps: p.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, id: khCode(i), order: i + 1 })) });
  const addCost = (sid: string, it: Omit<CostItem, 'id'>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, costItems: [...s.costItems, { id: rid('CST'), ...it }] } : s) }));
  const updCost = (sid: string, cid: string, patch: Partial<CostItem>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, costItems: s.costItems.map(c => c.id === cid ? { ...c, ...patch } : c) } : s) }));
  const rmCost = (sid: string, cid: string) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, costItems: s.costItems.filter(c => c.id !== cid) } : s) }));
  // khoản chi phí Sản xuất trong phase
  const addProdCost = (sid: string, it: Omit<CostItem, 'id'>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionCostItems: [...(s.productionCostItems || []), { id: rid('CST'), ...it }] } : s) }));
  const updProdCost = (sid: string, cid: string, patch: Partial<CostItem>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionCostItems: (s.productionCostItems || []).map(c => c.id === cid ? { ...c, ...patch } : c) } : s) }));
  const rmProdCost = (sid: string, cid: string) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionCostItems: (s.productionCostItems || []).filter(c => c.id !== cid) } : s) }));

  // production theo giai đoạn (Khối sản xuất + GĐ Khối)
  const stamp = () => new Date().toISOString().replace('T', ' ').substring(0, 16);
  const addTask = (sid: string) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionTasks: [...(s.productionTasks || []), { id: rid('PT'), name: 'Đầu việc mới', assignee: '', progress: 0, updatedAt: stamp() }] } : s) }));
  const updTask = (sid: string, tid: string, patch: Partial<ProductionTask>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionTasks: (s.productionTasks || []).map(t => t.id === tid ? { ...t, ...patch, updatedAt: stamp() } : t) } : s) }));
  const rmTask = (sid: string, tid: string) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionTasks: (s.productionTasks || []).filter(t => t.id !== tid) } : s) }));
  const updProdInfo = (sid: string, patch: Partial<ProductionInfo>) => setPakd(p => ({ ...p, steps: p.steps.map(s => s.id === sid ? { ...s, productionInfo: { ...(s.productionInfo || {}), ...patch } } : s) }));

  // Thông tin dự án sản xuất được nhập ở KH02. Chỉ chặn chuyển giai đoạn khi đang ở KH02 mà chưa nhập đủ.
  const kh02 = pakd.steps[1];
  const kh02InfoComplete = !!(kh02?.productionInfo?.projectManager && kh02?.productionInfo?.startDate && kh02?.productionInfo?.endDate);
  const advanceBlockedMsg = (currentPhase === 2 && !kh02InfoComplete)
    ? 'GĐ Khối chưa nhập đủ Thông tin dự án sản xuất ở KH02 (PM, ngày bắt đầu/kết thúc) — chưa thể chuyển giai đoạn.'
    : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className={Btn.ghost}><ArrowLeft size={14} className="mr-1.5" />Quay lại danh sách</button>
        <div className="flex items-center gap-2">
          {editable && (pakd.status === 'DRAFT' || pakd.status === 'RETURNED') && <button onClick={onSubmit} className={Btn.primary}>Nộp trình duyệt <ChevronRight size={14} className="ml-1" /></button>}
          {pakd.locked && simUser.role === 'SALE' && !adjusting && <button onClick={startAdjust} className={Btn.purple}><FileEdit size={14} className="mr-1.5" />Tạo phiếu điều chỉnh</button>}
          {adjusting && <button onClick={() => setAdjusting(false)} className={Btn.green}><Check size={14} className="mr-1.5" />Xong điều chỉnh</button>}
          <button onClick={() => setShowComments(v => !v)} className={showComments ? Btn.primary : Btn.ghost}><MessageSquare size={14} className="mr-1.5" />{showComments ? 'Ẩn ghi chú' : `Ghi chú (${(pakd.comments || []).length})`}</button>
        </div>
      </div>

      {/* Thanh phê duyệt khi tới lượt vai trò hiện tại */}
      {isMyTurn && (
        <div className="border border-amber-300 bg-amber-50 rounded p-3 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="text-xs font-semibold text-amber-800 shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Hồ sơ đang chờ <b>{ROLE_LABEL[simUser.role]}</b> ({simUser.fullName}) xử lý
          </div>
          <input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Ý kiến / lý do (tùy chọn)..." className="flex-1 text-xs border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-400" />
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { onDecide('APPROVE', decision); setDecision(''); }} className={Btn.green}><Check size={13} className="mr-1" />Duyệt</button>
            <button onClick={() => { onDecide('REQUEST_REVISION', decision); setDecision(''); }} className="flex items-center px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600"><FileEdit size={13} className="mr-1" />Cần bổ sung</button>
            <button onClick={() => { onDecide('REJECT', decision); setDecision(''); }} className={Btn.red}><Ban size={13} className="mr-1" />Từ chối</button>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-4 items-start ${showComments ? 'lg:grid-cols-[1fr_330px]' : ''}`}>
      <div className="space-y-4 min-w-0">
      {/* Title bar */}
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">{pakd.name}</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Mã PAKD <b className="text-blue-600">{pakd.id}</b> • Phiên bản v{pakd.version} • Người lập: {pakd.creator}</p>
          </div>
          <div className="flex items-center gap-2">
            {pakd.locked && <span className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-2 py-1 rounded"><Lock size={11} />ĐÃ KHÓA CHI PHÍ</span>}
            <PakdStatusCell status={pakd.status} />
          </div>
        </div>

        {/* Project codes (sinh sau khi GĐ Khối duyệt) */}
        <div className="px-4 py-3 border-b border-gray-200 bg-blue-50/40">
          <SectionTitle>Mã dự án (sinh tự động khi Giám đốc Khối duyệt)</SectionTitle>
          {pakd.masterCode ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <CodeBox label="Mã tổng" value={pakd.masterCode} />
                <CodeBox label="Mã kinh doanh" value={pakd.businessCode!} />
                <CodeBox label="Mã sản xuất" value={pakd.productionCode!} />
                <div className="bg-white border border-blue-200 rounded px-3 py-2">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Mã outsource ({pakd.outsourceCodes.length})</p>
                  {pakd.outsourceCodes.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">Chưa có</p>
                  ) : (
                    <div className="space-y-1 mt-0.5">
                      {pakd.outsourceCodes.map(o => (
                        <div key={o.id} title={o.label}><span className="text-xs font-bold font-mono text-blue-700 tracking-wider">{o.code}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {pakd.outsourceCodes.length > 0 && (
                <table className="w-full text-[11px] border-collapse border border-gray-200 rounded">
                  <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th w="130px">Mã outsource</Th><Th>Nội dung thuê ngoài</Th></tr></thead>
                  <tbody>{pakd.outsourceCodes.map(o => (<tr key={o.id} className="border-b border-gray-100"><Td mono><b className="text-blue-700">{o.code}</b></Td><Td>{o.label}</Td></tr>))}</tbody>
                </table>
              )}

              {simUser.role === 'SALE' && (
                <div className="flex items-center gap-2">
                  <input value={osLabel} onChange={(e) => setOsLabel(e.target.value)} placeholder="Nội dung thuê ngoài (mở mã con của mã sản xuất)..." className="flex-1 text-[11px] border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
                  <button onClick={() => { if (osLabel.trim()) { onAddOutsource(osLabel); setOsLabel(''); } }} className={Btn.primary}><Plus size={13} className="mr-1" />Mở mã outsource</button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 italic">Chưa cấp mã. Mã tổng / kinh doanh / sản xuất sẽ được sinh tự động ngay khi Giám đốc Khối phê duyệt PAKD.</p>
          )}
        </div>

        {/* progress stepper */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            {PAKD_FLOW.map((st, i) => {
              const curIdx = PAKD_FLOW.indexOf(pakd.status === 'RETURNED' ? 'DRAFT' : pakd.status);
              const done = curIdx > i; const cur = curIdx === i;
              return (
                <React.Fragment key={st}>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-green-500 text-white' : cur ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{done ? <Check size={12} /> : i + 1}</div>
                    <span className={`text-[9px] mt-1 ${cur ? 'text-blue-600 font-bold' : done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{PAKD_STATUS_LABEL[st]}</span>
                  </div>
                  {i < PAKD_FLOW.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
          {pakd.status === 'RETURNED' && <p className="text-[11px] text-red-600 font-medium mt-2">⚠ PAKD bị trả lại — Sale chỉnh sửa & nộp lại. Xem lý do ở mục Lịch sử duyệt.</p>}
        </div>

        {/* Thông tin cơ hội + tài chính */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-200">
          <div className="p-4 border-r border-gray-200">
            <SectionTitle>Thông tin cơ hội kinh doanh</SectionTitle>
            <dl className="text-[11px] divide-y divide-gray-100">
              <DRow label="Khách hàng" value={pakd.customerName} />
              <DRow label="Mã khách hàng" value={pakd.customerCode} mono />
              <DRow label="Giám đốc khối" value={pakd.businessDirector || '—'} />
              <DRow label="Giám đốc kinh doanh" value={pakd.salesDirector || '—'} />
              <DRow label="Domain" value={pakd.domain || '—'} />
              <DRow label="Người lập (Sale)" value={pakd.creator} />
              <DRow label="Thời gian thực hiện" value={pakd.projStart || pakd.projEnd ? `${pakd.projStart || '?'} → ${pakd.projEnd || '?'}` : '—'} />
              {pakd.tender.packageCode && <DRow label="Số hiệu gói thầu (TBMT)" value={pakd.tender.packageCode} mono />}
            </dl>
          </div>
          <div className="p-4">
            <SectionTitle>Tài chính</SectionTitle>
            <dl className="text-[11px] divide-y divide-gray-100">
              <DRow label="Giá trị hợp đồng dự kiến" value={fmtFull(pakd.expectedContractValue ?? pakd.revenue)} strong />
              <DRow label="Chi phí dự kiến (Sale nhập ban đầu)" value={fmtFull(pakd.expectedCost ?? 0)} />
              <DRow label="Chi phí kế hoạch theo bước (KD)" value={fmtFull(total)} className="text-red-600" />
              <DRow label="Chi phí thực tế (Kế toán)" value={fmtFull(actualTotal)} className="text-red-600" />
              <DRow label="Lợi nhuận dự kiến" value={`${fmtFull(profit)} (${pakd.revenue ? ((profit / pakd.revenue) * 100).toFixed(1) : 0}%)`} className={profit >= 0 ? 'text-green-600' : 'text-red-600'} strong />
            </dl>
          </div>
        </div>

        {/* Two sheets: Phương án kinh doanh (KH01-06) | Sản xuất (triển khai) */}
        <div>
          <div className="flex border-b border-gray-200 px-4 pt-2 bg-gray-50/60">
            <SheetTab label="Phương án kinh doanh (KH01–KH06)" active={sheet === 'BUSINESS'} onClick={() => setSheet('BUSINESS')} />
            <SheetTab label="Sản xuất — Triển khai" active={sheet === 'PRODUCTION'} onClick={() => setSheet('PRODUCTION')} />
          </div>

          {sheet === 'BUSINESS' && (
            <div className="p-4 space-y-4">
              {/* Bảng nhập thông tin các giai đoạn (dạng lưới) */}
              <PhaseTable pakd={pakd} editable={editable} currentPhase={currentPhase}
                onUpd={updStep} onShowHistory={(i) => setHistIdx(i)} phaseIdx={phaseIdx}
                onAddPhase={addPhase} onRmPhase={rmPhase} />
              <PhaseAdvancePanel pakd={pakd} currentPhase={currentPhase} simUser={simUser}
                onRequest={onRequestAdvance} onDecide={onDecideAdvance} />
            </div>
          )}

          {sheet === 'PRODUCTION' && (
            <ProductionSheet pakd={pakd} prodEditable={prodEditable} simRole={simUser.role} afterAccounting={afterAccounting}
              phaseIdx={phaseIdx} setPhaseIdx={setPhaseIdx} currentPhase={currentPhase}
              onUpdInfo={updProdInfo} onAdd={addTask} onUpd={updTask} onRm={rmTask}
              advanceBlockedMsg={advanceBlockedMsg} onCompletePhase={() => setCurrentPhase(Math.min(pakd.steps.length, currentPhase + 1))} />
          )}
        </div>
      </div>

      {/* version history */}
      {pakd.versionHistory.length > 0 && (
        <Panel title="Lịch sử phiên bản chi phí" icon={<GitBranch size={13} />}>
          <table className="w-full text-[11px] border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th w="50px">Ver</Th><Th>Lý do điều chỉnh</Th><Th w="160px" right>Trước → Sau</Th><Th w="120px">Thời gian</Th></tr></thead>
            <tbody>{pakd.versionHistory.map(v => (
              <tr key={v.version} className="border-b border-gray-100"><Td mono>v{v.version}</Td><Td>{v.reason}</Td><Td right>{fmtB(v.totalCostBefore)} → <b>{fmtB(v.totalCostAfter)}</b></Td><Td muted>{v.createdAt}</Td></tr>
            ))}</tbody>
          </table>
        </Panel>
      )}

      {/* change requests */}
      {pakd.changeRequests.length > 0 && (
        <Panel title="Phiếu điều chỉnh chi phí" icon={<FileEdit size={13} />}>
          {pakd.changeRequests.map(cr => (
            <div key={cr.id} className="border border-gray-100 rounded px-3 py-2 mb-2 text-[11px]">
              <div className="flex items-center justify-between"><span className="font-mono font-semibold text-purple-700">{cr.id}</span><span className="text-gray-600 font-medium">{CR_STATUS_LABEL[cr.status]}</span></div>
              <p className="text-gray-500 italic mt-0.5">Lý do: {cr.reason}</p>
              <p className="text-gray-500">{cr.changes.length} thay đổi • {cr.createdBy} • {cr.createdAt}</p>
            </div>
          ))}
        </Panel>
      )}

      {/* approval history */}
      {pakd.approvalHistory.length > 0 && (
        <Panel title="Lịch sử phê duyệt">
          <table className="w-full text-[11px] border-collapse">
            <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th>Bước</Th><Th w="140px">Người duyệt</Th><Th w="90px" center>Kết quả</Th><Th>Ý kiến</Th><Th w="120px">Thời gian</Th></tr></thead>
            <tbody>{pakd.approvalHistory.map(a => (
              <tr key={a.id} className="border-b border-gray-100"><Td>{a.stepLabel}</Td><Td>{a.actor} ({a.role})</Td><Td center><span className={a.action === 'APPROVE' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{a.action === 'APPROVE' ? 'Duyệt' : 'Trả lại'}</span></Td><Td><span className="italic text-gray-500">{a.comment}</span></Td><Td muted>{a.createdAt}</Td></tr>
            ))}</tbody>
          </table>
        </Panel>
      )}
      </div>

      {/* Right column: Trao đổi & Ghi chú */}
      {showComments && <CommentPanel comments={pakd.comments || []} onAdd={onAddComment} onClose={() => setShowComments(false)} />}
      </div>

      {crOpen && <ChangeRequestModal pakd={pakd} onClose={() => setCrOpen(false)} onSubmit={(r, c) => { onCreateCR(r, c); setCrOpen(false); }} />}
      {histIdx !== null && pakd.steps[histIdx] && (
        <BudgetHistoryModal step={pakd.steps[histIdx]} phaseCode={khCode(histIdx)} simUser={simUser} locked={pakd.locked} onClose={() => setHistIdx(null)}
          onCreate={(after, reason) => onCreateBudgetAdj(pakd.steps[histIdx].id, after, reason)}
          onDecide={(adjId, action, comment) => onDecideBudgetAdj(pakd.steps[histIdx].id, adjId, action, comment)} />
      )}
    </div>
  );
};

const CommentPanel: React.FC<{ comments: PakdComment[]; onAdd: (content: string) => void; onClose: () => void }> = ({ comments, onAdd, onClose }) => {
  const [text, setText] = useState('');
  const send = () => { if (text.trim()) { onAdd(text.trim()); setText(''); } };
  return (
    <div className="border border-gray-200 rounded lg:sticky lg:top-4">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-gray-700 uppercase tracking-wide">
        <span className="flex items-center gap-1.5"><MessageSquare size={13} />Trao đổi & Ghi chú ({comments.length})</span>
        <button onClick={onClose} title="Ẩn" className="text-gray-400 hover:text-gray-700"><X size={14} /></button>
      </div>
      <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">
        {comments.length === 0 ? <p className="text-[11px] text-gray-400 italic text-center py-4">Chưa có trao đổi nào. Hãy để lại ghi chú đầu tiên.</p> : comments.map(c => (
          <div key={c.id} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">{c.author.split(' ').pop()?.[0] || '?'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5"><span className="text-[11px] font-bold text-gray-800 truncate">{c.author}</span><span className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded">{c.role}</span></div>
              <p className="text-[11px] text-gray-700 whitespace-pre-wrap break-words">{c.content}</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">{c.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 p-2 space-y-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }} rows={2} placeholder="Nhập trao đổi / ghi chú... (Ctrl+Enter để gửi)" className="w-full text-[11px] border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-none" />
        <button onClick={send} className={`${Btn.primary} w-full justify-center`}><Send size={12} className="mr-1.5" />Gửi</button>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">{children}</h3>
);
const CodeBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white border border-blue-200 rounded px-3 py-2">
    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-bold font-mono text-blue-700 tracking-wider">{value}</p>
  </div>
);
const SheetTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${active ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{label}</button>
);

const PROD_INFO_FIELDS: { key: keyof ProductionInfo; label: string; type?: string; options?: string[]; required?: boolean }[] = [
  { key: 'workOrder', label: 'Work order' },
  { key: 'projectType', label: 'Project Type', options: ['Internal', 'External'] },
  { key: 'priority', label: 'Priority', options: ['High', 'Medium', 'Low'] },
  { key: 'size', label: 'Size', options: ['Small', 'Medium', 'Large'] },
  { key: 'department', label: 'Department' },
  { key: 'projectManager', label: 'Project Manager', required: true },
  { key: 'domain', label: 'Domain', options: ['GOV', 'BFSI', 'Telco', 'Enterprise', 'Khác'] },
  { key: 'customer', label: 'Customer' },
  { key: 'startDate', label: 'Start Date', type: 'date', required: true },
  { key: 'endDate', label: 'End Date', type: 'date', required: true },
  { key: 'status', label: 'Status', options: ['OPEN', 'RUNNING', 'CLOSED'] },
];

const ProductionSheet: React.FC<{
  pakd: Pakd; prodEditable: boolean; simRole: string; afterAccounting: boolean;
  phaseIdx: number; setPhaseIdx: (i: number) => void; currentPhase: number; onCompletePhase: () => void; advanceBlockedMsg?: string;
  onUpdInfo: (sid: string, patch: Partial<ProductionInfo>) => void;
  onAdd: (sid: string) => void; onUpd: (sid: string, tid: string, patch: Partial<ProductionTask>) => void; onRm: (sid: string, tid: string) => void;
}> = ({ pakd, prodEditable, simRole, afterAccounting, phaseIdx, setPhaseIdx, currentPhase, onCompletePhase, advanceBlockedMsg, onUpdInfo, onAdd, onUpd, onRm }) => {
  const step = pakd.steps[phaseIdx];
  const tasks = step?.productionTasks || [];
  const info = step?.productionInfo || {};
  const avg = tasks.length ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;
  const infoEditable = simRole === 'BUSINESS_DIRECTOR' || simRole === 'ADMIN'; // GĐ Khối nhập thông tin dự án SX
  const infoComplete = !!(info.projectManager && info.startDate && info.endDate);
  const inp = 'w-full text-[11px] border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400';

  if (!step) return null;
  return (
    <div className="p-4 space-y-3">
      {/* KH tabs — chạy theo giai đoạn giống bên Kinh doanh */}
      <div className="flex flex-wrap gap-1 border border-gray-200 rounded p-1 bg-gray-50 w-fit">
        {pakd.steps.map((s, i) => {
          const done = i + 1 < currentPhase;
          const isCur = i + 1 === currentPhase;
          return (
            <button key={s.id} onClick={() => setPhaseIdx(i)} title={s.name} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${phaseIdx === i ? 'bg-[#007bff] text-white' : done ? 'text-green-700 hover:bg-green-50' : isCur ? 'text-blue-700 hover:bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
              {done && <CheckCircle2 size={13} className={phaseIdx === i ? 'text-white' : 'text-green-600'} />}
              {isCur && <span className={`w-2 h-2 rounded-full ${phaseIdx === i ? 'bg-white' : 'bg-blue-500'} animate-pulse`} />}
              {khCode(i)}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-gray-500">Giai đoạn: <b className="text-blue-700">{khCode(phaseIdx)} — {step.name}</b>{phaseIdx + 1 < currentPhase && <span className="ml-2 text-green-700 font-semibold">✓ Đã hoàn thành</span>}{phaseIdx + 1 === currentPhase && <span className="ml-2 text-blue-700 font-semibold">● Đang thực hiện</span>}</p>
        {phaseIdx + 1 === currentPhase && currentPhase < pakd.steps.length && (
          <span className="text-[11px] text-gray-500 italic">Việc chuyển giai đoạn thực hiện ở tab <b>Phương án kinh doanh</b> (luồng duyệt AM → GĐ KD → GĐ Khối → Kế toán → BOD).</span>
        )}
      </div>

      {/* Thông tin dự án sản xuất — chỉ nhập ở KH02 */}
      {phaseIdx !== 1 && (
        <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2">Thông tin dự án sản xuất được nhập ở <button onClick={() => setPhaseIdx(1)} className="text-blue-600 font-semibold hover:underline">KH02 — Khảo sát, lập kế hoạch dự án</button>.</p>
      )}
      {phaseIdx === 1 && (
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Thông tin dự án sản xuất — KH02</span>
          {infoComplete
            ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-700"><CheckCircle2 size={12} />Đã nhập đủ</span>
            : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><Lock size={11} />Chưa đủ — chặn chuyển KH tiếp theo</span>}
        </div>
        <div className="p-3 space-y-3">
          {infoEditable
            ? <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-1.5">✏️ Bạn là <b>GĐ Khối</b>: nhập thông tin dự án sản xuất. Bắt buộc: <b>Project Manager, Start/End Date</b> — nhập đủ mới cho chuyển sang KH tiếp theo.</p>
            : <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-1.5">Thông tin do <b>Giám đốc Khối</b> nhập (đăng nhập tài khoản <b>gdkhoi</b> để chỉnh sửa).</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Project code (Mã sản xuất)</label>
              <p className="text-[11px] font-bold font-mono text-blue-700">{pakd.productionCode || 'Chưa cấp mã'}</p>
            </div>
            {PROD_INFO_FIELDS.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">{f.label}{f.required && ' *'}</label>
                {infoEditable ? (
                  f.options
                    ? <select value={(info[f.key] as string) || ''} onChange={(e) => onUpdInfo(step.id, { [f.key]: e.target.value })} className={inp}><option value="">-- Chọn --</option>{f.options.map(o => <option key={o}>{o}</option>)}</select>
                    : <input type={f.type || 'text'} value={(info[f.key] as string) || ''} onChange={(e) => onUpdInfo(step.id, { [f.key]: e.target.value })} className={inp} />
                ) : <p className="text-[11px] font-medium text-gray-700">{(info[f.key] as string) || '—'}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Đầu việc triển khai của giai đoạn */}
      <div className="flex items-center justify-between">
        <SectionTitle>Đầu việc triển khai — Khối Sản xuất ({tasks.length}) • Tiến độ TB {avg}%</SectionTitle>
        {prodEditable && <button onClick={() => onAdd(step.id)} className={Btn.primary}><Plus size={13} className="mr-1" />Thêm đầu việc</button>}
      </div>
      {!afterAccounting && <p className="text-[11px] text-amber-600 italic">⏳ Chưa mở triển khai. Khối Sản xuất chỉ lập đầu việc sau khi <b>Kế toán duyệt</b> (PAKD chuyển sang "Chờ IT").</p>}

      <table className="w-full text-[11px] border-collapse border border-gray-200 rounded">
        <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
          <Th w="34px" center>#</Th><Th>Đầu việc triển khai</Th><Th w="130px">Người phụ trách</Th>
          <Th w="120px">Bắt đầu</Th><Th w="120px">Kết thúc</Th><Th w="160px">Tiến độ</Th><Th w="120px">Ngày cập nhật</Th>{prodEditable && <Th w="40px" center></Th>}
        </tr></thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={t.id} className="border-b border-gray-100">
              <Td center muted>{i + 1}</Td>
              {prodEditable ? (<>
                <Td><input value={t.name} onChange={(e) => onUpd(step.id, t.id, { name: e.target.value })} className="w-full border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" /></Td>
                <Td><input value={t.assignee || ''} onChange={(e) => onUpd(step.id, t.id, { assignee: e.target.value })} className="w-full border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" /></Td>
                <Td><input type="date" value={t.startDate || ''} onChange={(e) => onUpd(step.id, t.id, { startDate: e.target.value })} className="w-full border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" /></Td>
                <Td><input type="date" value={t.endDate || ''} onChange={(e) => onUpd(step.id, t.id, { endDate: e.target.value })} className="w-full border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" /></Td>
                <Td><div className="flex items-center gap-2"><input type="number" min={0} max={100} value={t.progress} onChange={(e) => onUpd(step.id, t.id, { progress: Math.max(0, Math.min(100, Number(e.target.value))) })} className="w-16 border border-gray-200 rounded px-1.5 py-1 text-right outline-none focus:border-blue-400" /><ProgressBar v={t.progress} /></div></Td>
                <Td muted mono>{t.updatedAt || '—'}</Td>
                <Td center><button onClick={() => onRm(step.id, t.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={12} /></button></Td>
              </>) : (<>
                <Td><span className="font-medium text-gray-800">{t.name}</span></Td>
                <Td>{t.assignee || '—'}</Td>
                <Td muted>{t.startDate || '—'}</Td>
                <Td muted>{t.endDate || '—'}</Td>
                <Td><div className="flex items-center gap-2"><span className="w-9 text-right font-semibold">{t.progress}%</span><ProgressBar v={t.progress} /></div></Td>
                <Td muted mono>{t.updatedAt || '—'}</Td>
              </>)}
            </tr>
          ))}
          {tasks.length === 0 && <tr><td colSpan={prodEditable ? 8 : 7} className="text-[11px] text-gray-400 italic px-3 py-4 text-center">Chưa có đầu việc trong {khCode(phaseIdx)}.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const ProgressBar: React.FC<{ v: number }> = ({ v }) => (
  <div className="flex-1 min-w-[60px] bg-gray-100 h-2 rounded-full overflow-hidden"><div className={`h-full ${v >= 100 ? 'bg-green-500' : v > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${v}%` }} /></div>
);
const DRow: React.FC<{ label: string; value: string; mono?: boolean; strong?: boolean; className?: string }> = ({ label, value, mono, strong, className }) => (
  <div className="flex justify-between py-1.5 gap-4"><dt className="text-gray-500">{label}</dt><dd className={`text-right ${mono ? 'font-mono' : ''} ${strong ? 'font-bold' : 'font-medium'} ${className || 'text-gray-800'}`}>{value}</dd></div>
);
const Panel: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="border border-gray-200 rounded">
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-1.5 text-[11px] font-bold text-gray-700 uppercase tracking-wide">{icon}{title}</div>
    <div className="p-3">{children}</div>
  </div>
);

const CostTable: React.FC<{
  items: CostItem[]; editable: boolean; actualEditable: boolean; costVersions: number; phaseCode: string;
  onAdd: (it: Omit<CostItem, 'id'>) => void; onUpd: (cid: string, patch: Partial<CostItem>) => void; onRm: (cid: string) => void;
}> = ({ items, editable, actualEditable, costVersions, phaseCode, onAdd, onUpd, onRm }) => {
  const [cf, setCf] = useState({ name: '', costType: COST_TYPES[0], amount: 0 });
  const planned = items.reduce((s, c) => s + c.amount, 0);
  const approved = items.reduce((s, c) => s + (c.actualAmount || 0), 0);
  const verTotals = Array.from({ length: costVersions }, (_, k) => items.reduce((s, c) => s + (c.versionAmounts?.[k] || 0), 0));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse border border-gray-200 rounded">
        <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
          <Th>Khoản chi phí dự kiến</Th><Th w="130px">Loại</Th>
          <Th w="115px" right>CP dự kiến V1</Th>
          {Array.from({ length: costVersions }, (_, k) => <Th key={k} w="110px" right>Điều chỉnh V{k + 2}</Th>)}
          <Th w="120px" right>Kế toán duyệt chi</Th>
          {editable && <Th w="36px" center></Th>}
        </tr></thead>
        <tbody>
          {items.map(c => {
            const approvedC = c.actualAmount || 0; const d = approvedC - c.amount;
            return (
              <tr key={c.id} className="border-b border-gray-100">
                {editable ? <Td><input value={c.name} onChange={(e) => onUpd(c.id, { name: e.target.value })} className="w-full border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" /></Td> : <Td>{c.name}</Td>}
                {editable ? <Td><select value={c.costType} onChange={(e) => onUpd(c.id, { costType: e.target.value })} className="w-full border border-gray-200 rounded px-1 py-1 outline-none">{COST_TYPES.map(t => <option key={t}>{t}</option>)}</select></Td> : <Td muted>{c.costType}</Td>}
                {/* V1 - lần đầu */}
                {editable ? <Td right><input type="number" value={c.amount} onChange={(e) => onUpd(c.id, { amount: Number(e.target.value) })} className="w-full border border-gray-200 rounded px-1.5 py-1 text-right outline-none focus:border-blue-400" /></Td> : <Td right><b>{fmtFull(c.amount)}</b></Td>}
                {/* V2, V3... - các lần điều chỉnh */}
                {Array.from({ length: costVersions }, (_, k) => {
                  const va = c.versionAmounts?.[k] || 0;
                  return editable
                    ? <Td key={k} right><input type="number" value={va} onChange={(e) => { const arr = [...(c.versionAmounts || [])]; while (arr.length < costVersions) arr.push(0); arr[k] = Number(e.target.value); onUpd(c.id, { versionAmounts: arr }); }} className="w-full border border-purple-200 bg-purple-50/40 rounded px-1.5 py-1 text-right outline-none focus:border-purple-400" /></Td>
                    : <Td key={k} right>{va ? <b className="text-purple-700">{fmtFull(va)}</b> : <span className="text-gray-300">—</span>}</Td>;
                })}
                {/* Kế toán duyệt chi */}
                {actualEditable ? <Td right><input type="number" value={approvedC} onChange={(e) => onUpd(c.id, { actualAmount: Number(e.target.value) })} className="w-full border border-amber-300 bg-amber-50 rounded px-1.5 py-1 text-right outline-none focus:border-amber-500" /></Td>
                  : <Td right>{approvedC ? <span className={d > 0 ? 'text-red-600 font-semibold' : 'font-semibold'}>{fmtFull(approvedC)}</span> : <span className="text-gray-300">—</span>}</Td>}
                {editable && <Td center><button onClick={() => onRm(c.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={12} /></button></Td>}
              </tr>
            );
          })}
          {items.length === 0 && <tr><td colSpan={4 + costVersions + (editable ? 1 : 0)} className="text-[11px] text-gray-400 italic px-3 py-3 text-center">Chưa có khoản chi phí.</td></tr>}
          <tr className="bg-gray-50 font-semibold border-t border-gray-200">
            <Td>Tổng</Td><Td></Td>
            <Td right>{fmtFull(planned)}</Td>
            {verTotals.map((vt, k) => <Td key={k} right><span className="text-purple-700">{fmtFull(vt)}</span></Td>)}
            <Td right><span className={approved > planned ? 'text-red-600' : ''}>{fmtFull(approved)}</span></Td>
            {editable && <Td></Td>}
          </tr>
          {editable && (
            <tr className="bg-gray-50/60">
              <Td><input value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} placeholder="Tên khoản chi phí" className="w-full border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" /></Td>
              <Td><select value={cf.costType} onChange={(e) => setCf({ ...cf, costType: e.target.value })} className="w-full border border-gray-200 rounded px-1 py-1 outline-none">{COST_TYPES.map(t => <option key={t}>{t}</option>)}</select></Td>
              <Td right><input type="number" value={cf.amount} onChange={(e) => setCf({ ...cf, amount: Number(e.target.value) })} placeholder="0" className="w-full border border-gray-200 rounded px-1.5 py-1 text-right outline-none focus:border-blue-400" /></Td>
              {Array.from({ length: costVersions }, (_, k) => <Td key={k}></Td>)}
              <Td right><span className="text-gray-300 text-[10px]">KT duyệt sau</span></Td>
              <Td center><button onClick={() => { if (cf.name.trim()) { onAdd(cf); setCf({ name: '', costType: COST_TYPES[0], amount: 0 }); } }} className="bg-[#007bff] text-white rounded p-1 hover:bg-blue-600"><Plus size={13} /></button></Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const AllocHeader: React.FC<{ roman: string; title: string; color: string; budget: number; editable: boolean; onChange: (v: number) => void; allocated: number; pct: number }> = ({ roman, title, color, budget, editable, onChange, allocated, pct }) => (
  <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded border ${color}`}>
    <span className="text-xs font-bold">{roman}. {title} <span className="font-black">({pct.toFixed(0)}%)</span></span>
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-gray-500">Phân bổ:</span>
      {editable
        ? <input type="number" value={budget} onChange={(e) => onChange(Number(e.target.value))} className="w-40 border border-gray-300 rounded px-2 py-1 text-right font-bold outline-none focus:border-blue-400" />
        : <b className="text-gray-800">{fmtFull(budget)}</b>}
      <span className="text-gray-400">| Đã lập:</span>
      <b className={allocated > budget && budget > 0 ? 'text-red-600' : 'text-gray-700'}>{fmtFull(allocated)}</b>
    </div>
  </div>
);

// Ô đính kèm file cho từng giai đoạn (mock: lưu tên + dung lượng file)
const fmtSize = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
const AttachCell: React.FC<{ step: ProjectStep; editable: boolean; onUpd: (patch: Partial<ProjectStep>) => void }> = ({ step, editable, onUpd }) => {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const files = step.attachmentFiles || [];
  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const added = Array.from(list).map(f => ({ name: f.name, size: fmtSize(f.size) }));
    onUpd({ attachmentFiles: [...files, ...added] });
    if (fileRef.current) fileRef.current.value = '';
  };
  const rm = (idx: number) => onUpd({ attachmentFiles: files.filter((_, i) => i !== idx) });
  return (
    <div className="space-y-1">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
          <Paperclip size={10} className="text-gray-400 shrink-0" />
          <span className="flex-1 truncate text-[10px] font-medium text-gray-700" title={f.name}>{f.name}</span>
          <span className="text-[9px] text-gray-400 shrink-0">{f.size}</span>
          {editable && <button onClick={() => rm(i)} className="text-gray-400 hover:text-red-600 shrink-0"><X size={10} /></button>}
        </div>
      ))}
      {files.length === 0 && !editable && <span className="text-gray-300">—</span>}
      {editable && (
        <>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-semibold"><Paperclip size={10} />Đính kèm file</button>
        </>
      )}
    </div>
  );
};

// ===================== Modal lịch sử & điều chỉnh ngân sách (duyệt GĐ Khối → BOD) =====================
const BADiff: React.FC<{ before: number; after: number }> = ({ before, after }) => (
  <span>{fmtFull(before)} → <b className={after > before ? 'text-red-600' : after < before ? 'text-green-600' : ''}>{fmtFull(after)}</b></span>
);

const BudgetHistoryModal: React.FC<{
  step: ProjectStep; phaseCode: string; simUser: any; locked: boolean; onClose: () => void;
  onCreate: (after: { business: number; production: number }, reason: string) => void;
  onDecide: (adjId: string, action: ApprovalAction, comment: string) => void;
}> = ({ step, phaseCode, simUser, locked, onClose, onCreate, onDecide }) => {
  const list = step.budgetAdjustments || [];
  const curBiz = step.businessBudget || 0, curProd = step.productionBudget || 0;
  const [creating, setCreating] = useState(false);
  const [nb, setNb] = useState(curBiz);
  const [np, setNp] = useState(curProd);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const inp = 'w-full text-xs border border-gray-300 rounded px-2 py-1.5 text-right outline-none focus:border-blue-400';
  const canCreate = (simUser.role === 'SALE' || simUser.role === 'BUSINESS_DIRECTOR') && locked && !list.some(a => ['PENDING_BUSINESS_DIRECTOR', 'PENDING_ACCOUNTANT', 'PENDING_BOD'].includes(a.status));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2"><History size={15} className="text-blue-600" />Điều chỉnh ngân sách — {phaseCode} ({step.name})</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
            Ngân sách hiện tại: KD <b>{fmtFull(curBiz)}</b> • SX <b>{fmtFull(curProd)}</b> • Tổng <b className="text-blue-700">{fmtFull(curBiz + curProd)}</b>. Luồng duyệt: <b>GĐ Khối → BOD</b>.
          </div>

          {canCreate && !creating && <button onClick={() => { setNb(curBiz); setNp(curProd); setCreating(true); }} className={Btn.primary}><Plus size={13} className="mr-1" />Tạo phiếu điều chỉnh ngân sách</button>}
          {creating && (
            <div className="border border-purple-200 bg-purple-50/40 rounded p-3 space-y-2">
              <p className="text-[11px] font-bold text-purple-700 uppercase">Phiếu điều chỉnh mới (cũ → mới)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500">NS Kinh doanh mới</label><input type="number" value={nb} onChange={(e) => setNb(Number(e.target.value))} className={inp} /><p className="text-[10px] text-gray-400 text-right">cũ: {fmtFull(curBiz)}</p></div>
                <div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500">NS Sản xuất mới</label><input type="number" value={np} onChange={(e) => setNp(Number(e.target.value))} className={inp} /><p className="text-[10px] text-gray-400 text-right">cũ: {fmtFull(curProd)}</p></div>
              </div>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Lý do điều chỉnh..." className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
              <div className="flex gap-2">
                <button onClick={() => { onCreate({ business: nb, production: np }, reason); setCreating(false); setReason(''); }} className={Btn.purple}>Nộp phiếu (→ GĐ Khối)</button>
                <button onClick={() => setCreating(false)} className={Btn.ghost}>Hủy</button>
              </div>
            </div>
          )}

          {list.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-6">Chưa có phiếu điều chỉnh ngân sách nào.</p>
          ) : (
            <div className="space-y-2">
              {list.map((a, i) => {
                const canDecide = BA_PENDING_ROLE[a.status] === simUser.role;
                return (
                  <div key={a.id} className="border border-gray-200 rounded">
                    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold">Lần {list.length - i} • {a.createdAt} • {a.requestedBy}</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${a.status === 'APPROVED' ? 'bg-green-100 text-green-700' : a.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{BA_STATUS_LABEL[a.status]}</span>
                    </div>
                    <div className="p-3 text-[11px] space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>NS Kinh doanh: <BADiff before={a.before.business} after={a.after.business} /></div>
                        <div>NS Sản xuất: <BADiff before={a.before.production} after={a.after.production} /></div>
                        <div>Tổng: <BADiff before={a.before.business + a.before.production} after={a.after.business + a.after.production} /></div>
                      </div>
                      <p className="text-gray-500 italic">Lý do: {a.reason}</p>
                      {a.approvals.length > 0 && (
                        <div className="text-gray-500 space-y-0.5">
                          {a.approvals.map((ap, k) => <div key={k}>• {ap.at} — <b>{ap.actor}</b> ({ROLE_LABEL[ap.role]}): <span className={ap.action === 'APPROVE' ? 'text-green-600' : 'text-red-600'}>{ap.action === 'APPROVE' ? 'Duyệt' : 'Từ chối'}</span>{ap.comment ? ` — ${ap.comment}` : ''}</div>)}
                        </div>
                      )}
                      {canDecide && (
                        <div className="flex items-center gap-2 pt-1">
                          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ý kiến..." className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-400" />
                          <button onClick={() => { onDecide(a.id, 'APPROVE', comment); setComment(''); }} className={Btn.green}><Check size={12} className="mr-1" />Duyệt</button>
                          <button onClick={() => { onDecide(a.id, 'REJECT', comment); setComment(''); }} className={Btn.red}><Ban size={12} className="mr-1" />Từ chối</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[10px] text-gray-400">AM / Giám đốc khối muốn đổi ngân sách phải tạo đề xuất; hiển thị <b>cũ → mới</b> và phải qua duyệt <b>GĐ Khối → BOD</b> mới được áp dụng.</p>
        </div>
      </div>
    </div>
  );
};

// ===================== Panel duyệt chuyển giai đoạn (AM → GĐ KD → GĐ Khối → Kế toán → BOD) =====================
const PhaseAdvancePanel: React.FC<{
  pakd: Pakd; currentPhase: number; simUser: any;
  onRequest: (stepId: string) => void; onDecide: (stepId: string, action: ApprovalAction, comment: string) => void;
}> = ({ pakd, currentPhase, simUser, onRequest, onDecide }) => {
  const step = pakd.steps[currentPhase - 1];
  const [comment, setComment] = useState('');
  if (!step) return null;
  const isLast = currentPhase >= pakd.steps.length;
  const adv = step.advanceStatus;
  const pendingRole = adv ? ADV_PENDING_ROLE[adv] : null;
  const canRequest = simUser.role === 'SALE' && !adv && !isLast;
  const canDecide = adv && pendingRole === simUser.role;
  const doneRoles = (step.advanceApprovals || []).filter(a => a.action === 'APPROVE').map(a => a.role);

  return (
    <div className="border border-gray-200 rounded">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
        <ChevronRight size={13} className="text-blue-600" />Duyệt chuyển giai đoạn — {khCode(currentPhase - 1)} → {isLast ? '(giai đoạn cuối)' : khCode(currentPhase)}
      </div>
      <div className="p-4 space-y-3">
        {isLast ? (
          <p className="text-[11px] text-gray-500 italic">Đây là giai đoạn cuối ({khCode(currentPhase - 1)} — {step.name}), không có bước chuyển tiếp.</p>
        ) : (<>
          {/* mini stepper */}
          <div className="flex items-center">
            {['AM (đề nghị)', ...ADV_STEPS.map(s => ADV_LABEL[s])].map((label, i) => {
              const done = adv ? (i === 0 || doneRoles.includes(ADV_PENDING_ROLE[ADV_STEPS[i - 1]])) : false;
              const isCur = adv ? ADV_STEPS[i - 1] === adv : false;
              const started = !!adv;
              const ok = i === 0 ? started : done;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ok ? 'bg-green-500 text-white' : isCur ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{ok ? <Check size={12} /> : i + 1}</div>
                    <span className={`text-[9px] mt-1 ${isCur ? 'text-blue-600 font-bold' : ok ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {i < ADV_STEPS.length && <div className={`flex-1 h-0.5 mx-1 ${(adv && doneRoles.includes(ADV_PENDING_ROLE[ADV_STEPS[i]])) || (i === 0 && started) ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {!adv && <p className="text-[11px] text-gray-500">Chưa có đề nghị chuyển giai đoạn. {canRequest ? 'AM bấm nút bên dưới để trình duyệt.' : 'Chờ AM tạo đề nghị.'}</p>}
          {adv && <p className="text-[11px] text-amber-700">Đang chờ <b>{ADV_LABEL[adv]}</b> duyệt.</p>}

          {/* history */}
          {(step.advanceApprovals || []).length > 0 && (
            <div className="text-[11px] text-gray-500 space-y-0.5 border border-gray-100 rounded p-2 bg-gray-50/50">
              {step.advanceApprovals!.map((a, k) => <div key={k}>• {a.at} — <b>{a.actor}</b> ({ROLE_LABEL[a.role]}): <span className={a.action === 'APPROVE' ? 'text-green-600' : 'text-red-600'}>{a.action === 'APPROVE' ? 'Duyệt' : a.action === 'REJECT' ? 'Từ chối' : 'Yêu cầu bổ sung'}</span>{a.comment ? ` — ${a.comment}` : ''}</div>)}
            </div>
          )}

          {canRequest && <button onClick={() => onRequest(step.id)} className={Btn.primary}><ChevronRight size={13} className="mr-1" />Đề nghị hoàn thành & chuyển {khCode(currentPhase)}</button>}
          {canDecide && (
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 border border-amber-200 bg-amber-50 rounded p-2">
              <span className="text-[11px] font-semibold text-amber-800 shrink-0">Tới lượt {ROLE_LABEL[simUser.role]} duyệt:</span>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ý kiến..." className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { onDecide(step.id, 'APPROVE', comment); setComment(''); }} className={Btn.green}><Check size={12} className="mr-1" />Duyệt</button>
                <button onClick={() => { onDecide(step.id, 'REQUEST_REVISION', comment); setComment(''); }} className="flex items-center px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600">Cần bổ sung</button>
                <button onClick={() => { onDecide(step.id, 'REJECT', comment); setComment(''); }} className={Btn.red}><Ban size={12} className="mr-1" />Từ chối</button>
              </div>
            </div>
          )}
        </>)}
      </div>
    </div>
  );
};

// ===================== Bảng nhập thông tin các giai đoạn (dạng lưới Excel) =====================
const PhaseTable: React.FC<{
  pakd: Pakd; editable: boolean; currentPhase: number; phaseIdx: number;
  onUpd: (sid: string, patch: Partial<ProjectStep>) => void;
  onShowHistory: (idx: number) => void; onAddPhase: () => void; onRmPhase: (idx: number) => void;
}> = ({ pakd, editable, currentPhase, phaseIdx, onUpd, onShowHistory, onAddPhase, onRmPhase }) => {
  const steps = pakd.steps;
  const lastIdx = steps.length - 1;
  const revenue = steps[lastIdx]?.revenue || 0;
  const totSX = steps.reduce((s, st) => s + (st.productionBudget || 0), 0);
  const totKD = steps.reduce((s, st) => s + (st.businessBudget || 0), 0);
  const grand = totSX + totKD;
  const inp = 'w-full border border-gray-200 rounded px-1.5 py-1 text-[11px] outline-none focus:border-blue-400';
  const numInp = `${inp} text-right`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionTitle>Thông tin các giai đoạn ({steps.length}) — giai đoạn hiện tại: {khCode(currentPhase - 1)}</SectionTitle>
        {editable && <button onClick={onAddPhase} className={Btn.primary}><Plus size={13} className="mr-1" />Thêm giai đoạn ({khCode(steps.length)})</button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300 text-center" style={{ minWidth: '58px' }}>Hiện tại</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300 text-left" style={{ minWidth: '130px' }}>Giai đoạn</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300" style={{ minWidth: '105px' }}>Bắt đầu</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300" style={{ minWidth: '105px' }}>Kết thúc</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300" style={{ minWidth: '260px' }}>Mục tiêu</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300" style={{ minWidth: '260px' }}>Kết quả đầu ra</th>
              <th colSpan={3} className="px-2 py-1.5 font-semibold border-r border-b border-gray-300 text-center">Ngân sách (đ)</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300" style={{ minWidth: '130px' }}>Tài liệu đính kèm</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300 text-right" style={{ minWidth: '120px' }}>Doanh thu dự kiến</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold border-r border-gray-300 text-right" style={{ minWidth: '85px' }}>% Chi phí/DT</th>
              <th rowSpan={2} className="px-2 py-1.5 font-semibold text-center" style={{ minWidth: '70px' }}>Lịch sử NS</th>
            </tr>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
              <th className="px-2 py-1 font-semibold border-r border-gray-300 text-right" style={{ minWidth: '105px' }}>Sản xuất</th>
              <th className="px-2 py-1 font-semibold border-r border-gray-300 text-right" style={{ minWidth: '105px' }}>Kinh doanh</th>
              <th className="px-2 py-1 font-semibold border-r border-gray-300 text-right" style={{ minWidth: '110px' }}>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const rowTotal = (s.productionBudget || 0) + (s.businessBudget || 0);
              const done = i + 1 < currentPhase; const isCur = i + 1 === currentPhase;
              const isLast = i === lastIdx;
              return (
                <tr key={s.id} className={`border-b border-gray-200 ${isCur ? 'bg-blue-50/70' : phaseIdx === i ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                  <Td center>
                    {done
                      ? <span title="Đã hoàn thành" className="inline-flex"><CheckCircle2 size={16} className="text-green-600" /></span>
                      : isCur
                        ? <span title={`Đang ở ${khCode(i)}`} className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-black animate-pulse">●</span>
                        : <span className="text-gray-300">—</span>}
                  </Td>
                  <Td>
                    <span className="font-bold text-gray-800">{khCode(i)}</span>
                    {editable ? <input value={s.name} onChange={(e) => onUpd(s.id, { name: e.target.value })} className={`${inp} mt-1`} title="Định nghĩa tên giai đoạn" /> : <span className="text-gray-500 block">{s.name}</span>}
                  </Td>
                  <Td>{editable ? <input type="date" value={s.startDate || ''} onChange={(e) => onUpd(s.id, { startDate: e.target.value })} className={inp} /> : (s.startDate || '—')}</Td>
                  <Td>{editable ? <input type="date" value={s.endDate || ''} onChange={(e) => onUpd(s.id, { endDate: e.target.value })} className={inp} /> : (s.endDate || '—')}</Td>
                  <Td>{editable ? <textarea rows={3} value={s.objective || ''} onChange={(e) => onUpd(s.id, { objective: e.target.value })} className={`${inp} resize-y`} /> : <span className="whitespace-pre-wrap">{s.objective || '—'}</span>}</Td>
                  <Td>{editable ? <textarea rows={3} value={s.output || ''} onChange={(e) => onUpd(s.id, { output: e.target.value })} className={`${inp} resize-y`} /> : <span className="whitespace-pre-wrap">{s.output || '—'}</span>}</Td>
                  <Td right>{editable ? <input type="number" value={s.productionBudget || 0} onChange={(e) => onUpd(s.id, { productionBudget: Number(e.target.value) })} className={numInp} /> : fmtFull(s.productionBudget || 0)}</Td>
                  <Td right>{editable ? <input type="number" value={s.businessBudget || 0} onChange={(e) => onUpd(s.id, { businessBudget: Number(e.target.value) })} className={numInp} /> : fmtFull(s.businessBudget || 0)}</Td>
                  <Td right><b>{fmtFull(rowTotal)}</b></Td>
                  <Td><AttachCell step={s} editable={editable} onUpd={(patch) => onUpd(s.id, patch)} /></Td>
                  {/* Doanh thu dự kiến — chỉ nhập ở dòng cuối (ô vàng) */}
                  <Td right>{isLast
                    ? (editable ? <input type="number" value={s.revenue || 0} onChange={(e) => onUpd(s.id, { revenue: Number(e.target.value) })} className={`${numInp} bg-yellow-100 border-yellow-400 font-bold`} /> : <b className="bg-yellow-100 px-1.5 py-0.5 rounded">{fmtFull(s.revenue || 0)}</b>)
                    : <span className="text-gray-300">—</span>}</Td>
                  <Td right>{isLast && revenue > 0 ? <b>{((rowTotal / revenue) * 100).toFixed(0)}%</b> : <span className="text-gray-300">—</span>}</Td>
                  <Td center>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onShowHistory(i)} title="Lịch sử điều chỉnh ngân sách" className="relative p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <History size={13} />
                        {(s.budgetAdjustments?.length || 0) > 0 && <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{s.budgetAdjustments!.length}</span>}
                      </button>
                      {editable && i >= 6 && <button onClick={() => onRmPhase(i)} title="Xóa giai đoạn" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>}
                    </div>
                  </Td>
                </tr>
              );
            })}
            {/* Tổng */}
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
              <Td></Td><Td>Tổng</Td><Td></Td><Td></Td><Td></Td><Td></Td>
              <Td right>{fmtFull(totSX)}</Td>
              <Td right>{fmtFull(totKD)}</Td>
              <Td right>{fmtFull(grand)}</Td>
              <Td></Td>
              <Td right>{revenue ? fmtFull(revenue) : '—'}</Td>
              <Td right>{revenue > 0 ? <span className={grand / revenue > 1 ? 'text-red-600' : 'text-green-700'}>{((grand / revenue) * 100).toFixed(0)}%</span> : '—'}</Td>
              <Td></Td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-400">Doanh thu dự kiến nhập ở <b>dòng cuối</b> (ô vàng) • Giai đoạn có thể định nghĩa lại tên và thêm mới ({khCode(steps.length)}...).</p>
    </div>
  );
};

const PhaseSheet: React.FC<{
  step: ProjectStep; phaseCode: string; editable: boolean; costEditable: boolean; actualEditable: boolean; showRevenue: boolean;
  isCurrentPhase: boolean; isDonePhase: boolean; canSetPhase: boolean; advanceBlockedMsg?: string; onSetCurrent: () => void; onCompletePhase: () => void;
  costVersions: number; onAddVersion: () => void; canAddVersion: boolean;
  onUpd: (patch: Partial<ProjectStep>) => void;
  onAddCost: (it: Omit<CostItem, 'id'>) => void; onUpdCost: (cid: string, patch: Partial<CostItem>) => void; onRmCost: (cid: string) => void;
  onAddProdCost: (it: Omit<CostItem, 'id'>) => void; onUpdProdCost: (cid: string, patch: Partial<CostItem>) => void; onRmProdCost: (cid: string) => void;
}> = ({ step, phaseCode, editable, costEditable, actualEditable, showRevenue, isCurrentPhase, isDonePhase, canSetPhase, advanceBlockedMsg, onSetCurrent, onCompletePhase, costVersions, onAddVersion, canAddVersion, onUpd, onAddCost, onUpdCost, onRmCost, onAddProdCost, onUpdProdCost, onRmProdCost }) => {
  const bizPlanned = stepCost(step);
  const prodItems = step.productionCostItems || [];
  const prodPlanned = prodItems.reduce((s, c) => s + c.amount, 0);
  const bizBudget = step.businessBudget || 0;
  const prodBudget = step.productionBudget || 0;
  const totalBudget = bizBudget + prodBudget;
  const bizPct = totalBudget > 0 ? (bizBudget / totalBudget) * 100 : 0;
  const prodPct = totalBudget > 0 ? (prodBudget / totalBudget) * 100 : 0;

  return (
    <div className="border border-gray-200 rounded">
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap">
        <span className="w-8 h-5 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{phaseCode}</span>
        {editable ? <input value={step.name} onChange={(e) => onUpd({ name: e.target.value })} className="flex-1 min-w-[200px] text-xs font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-400" /> : <span className="flex-1 min-w-[200px] text-xs font-bold text-gray-800">{step.name}</span>}
        <span className="text-[11px] text-gray-600 shrink-0">Tổng phân bổ: <b className="text-blue-700 text-xs">{fmtFull(totalBudget)}</b> <span className="text-gray-400">(KD {bizPct.toFixed(0)}% • SX {prodPct.toFixed(0)}%)</span></span>
        {canAddVersion && <button onClick={onAddVersion} className="ml-auto flex items-center gap-1 text-[11px] text-blue-600 hover:underline"><Plus size={12} />Thêm lần điều chỉnh (V{costVersions + 2})</button>}
      </div>

      {/* Trạng thái giai đoạn */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 border-b border-gray-200 text-[11px] ${isDonePhase ? 'bg-green-50' : isCurrentPhase ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <span className="flex items-center gap-1.5 font-semibold">
          {isDonePhase ? <><CheckCircle2 size={14} className="text-green-600" /><span className="text-green-700">Đã hoàn thành</span></>
            : isCurrentPhase ? <><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /><span className="text-blue-700">Đang thực hiện</span></>
            : <span className="text-gray-500">Chưa tới giai đoạn này</span>}
        </span>
        {canSetPhase && (
          <div className="flex items-center gap-2">
            {!isCurrentPhase && !isDonePhase && <button onClick={onSetCurrent} className="text-blue-600 hover:underline font-semibold">Đặt là giai đoạn hiện tại</button>}
            {isCurrentPhase && (advanceBlockedMsg
              ? <span className="flex items-center gap-1 text-amber-700" title={advanceBlockedMsg}><Lock size={12} />{advanceBlockedMsg}</span>
              : <button onClick={onCompletePhase} className="flex items-center gap-1 text-green-700 hover:underline font-semibold"><CheckCircle2 size={13} />Hoàn thành, chuyển giai đoạn sau</button>)}
          </div>
        )}
      </div>

      <div className="p-3 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Lbl label="Người phụ trách" value={step.assignee} editable={editable} onChange={(v) => onUpd({ assignee: v })} />
          <Lbl label="Ngày bắt đầu" type="date" value={step.startDate || ''} editable={editable} onChange={(v) => onUpd({ startDate: v })} />
          <Lbl label="Ngày kết thúc" type="date" value={step.endDate || ''} editable={editable} onChange={(v) => onUpd({ endDate: v })} />
          {showRevenue && <NumLbl label="Doanh thu tạo ra (đ)" value={step.revenue || 0} editable={editable} onChange={(v) => onUpd({ revenue: v })} strong="text-blue-700" />}
        </div>

        {/* I. Phân bổ ngân sách Kinh doanh */}
        <div className="space-y-2">
          <AllocHeader roman="I" title="Phân bổ ngân sách Kinh doanh" color="bg-blue-50 border-blue-200 text-blue-800" budget={bizBudget} editable={editable} onChange={(v) => onUpd({ businessBudget: v })} allocated={bizPlanned} pct={bizPct} />
          <CostTable items={step.costItems} editable={costEditable} actualEditable={actualEditable} costVersions={costVersions} phaseCode={phaseCode} onAdd={onAddCost} onUpd={onUpdCost} onRm={onRmCost} />
        </div>

        {/* II. Phân bổ ngân sách Sản xuất */}
        <div className="space-y-2">
          <AllocHeader roman="II" title="Phân bổ ngân sách Sản xuất" color="bg-emerald-50 border-emerald-200 text-emerald-800" budget={prodBudget} editable={editable} onChange={(v) => onUpd({ productionBudget: v })} allocated={prodPlanned} pct={prodPct} />
          <CostTable items={prodItems} editable={costEditable} actualEditable={actualEditable} costVersions={costVersions} phaseCode={phaseCode} onAdd={onAddProdCost} onUpd={onUpdProdCost} onRm={onRmProdCost} />
        </div>

        <p className="text-[10px] text-gray-400"><b>V1</b> là chi phí dự kiến lần đầu • <b className="text-purple-700">V2, V3…</b> là các lần điều chỉnh • <b>Kế toán duyệt chi</b> do Kế toán nhập.</p>

        {!showRevenue && (
          <div className="border border-gray-200 rounded">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide">Kết quả đầu ra</div>
            <div className="p-3">
              {editable
                ? <textarea value={step.output || ''} onChange={(e) => onUpd({ output: e.target.value })} rows={3} placeholder={`Mô tả kết quả đầu ra / sản phẩm bàn giao của ${phaseCode}...`} className="w-full text-xs border border-gray-300 rounded px-2.5 py-2 outline-none focus:border-blue-400" />
                : <p className="text-xs text-gray-700 whitespace-pre-wrap">{step.output || <span className="text-gray-400 italic">Chưa nhập kết quả đầu ra.</span>}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NumLbl: React.FC<{ label: string; value: number; editable: boolean; onChange: (v: number) => void; strong?: string }> = ({ label, value, editable, onChange, strong }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-semibold text-gray-400 uppercase">{label}</label>
    {editable ? <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full text-[11px] border border-gray-200 rounded px-2 py-1.5 text-right outline-none focus:border-blue-400" /> : <p className={`text-[11px] font-bold ${strong || 'text-gray-700'}`}>{fmtFull(value)}</p>}
  </div>
);

const Lbl: React.FC<{ label: string; value: string; editable: boolean; onChange: (v: string) => void; type?: string }> = ({ label, value, editable, onChange, type = 'text' }) => (
  <div className="space-y-1"><label className="text-[10px] font-semibold text-gray-400 uppercase">{label}</label>{editable ? <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-[11px] border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" /> : <p className="text-[11px] font-medium text-gray-700">{value || '—'}</p>}</div>
);

// ===================== APPROVAL QUEUE =====================
const ApprovalQueue: React.FC<{ pakds: Pakd[]; simUser: any; comment: string; setComment: (v: string) => void; onDecision: (id: string, a: ApprovalAction) => void; onOpen: (id: string) => void }> = ({ pakds, simUser, comment, setComment, onDecision, onOpen }) => (
  <div>
    <p className="text-xs text-gray-500 mb-2">Hồ sơ đang chờ vai trò <b className="text-blue-600">{simUser.role}</b> phê duyệt. Nhập ý kiến (nếu có) rồi bấm Duyệt / Trả lại.</p>
    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ý kiến phê duyệt / lý do trả lại (áp dụng cho thao tác bấm)..." rows={2} className="w-full text-xs border border-gray-300 rounded p-2 mb-3 outline-none focus:border-blue-400" />
    <div className="overflow-x-auto border border-gray-200 rounded">
      <table className="w-full text-[11px] border-collapse">
        <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th w="36px">#</Th><Th w="90px">Mã PAKD</Th><Th w="240px">Tên dự án</Th><Th w="180px">Chủ đầu tư</Th><Th w="90px" right>Giá dự thầu</Th><Th w="90px" right>Chi phí</Th><Th w="130px">Bước chờ</Th><Th w="150px" center>Thao tác</Th></tr></thead>
        <tbody>
          {pakds.map((p, i) => (
            <tr key={p.id} className="border-b border-gray-200 hover:bg-blue-50">
              <Td center muted>{i + 1}</Td>
              <Td><button onClick={() => onOpen(p.id)} className="text-blue-600 font-semibold hover:underline">{p.id}</button></Td>
              <Td>{p.name}</Td><Td>{p.customerName}</Td>
              <Td right>{fmtB(p.revenue)}</Td><Td right>{fmtB(pakdTotalCost(p))}</Td>
              <Td>{PAKD_STATUS_LABEL[p.status as keyof typeof PAKD_STATUS_LABEL]}</Td>
              <Td center>
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onDecision(p.id, 'APPROVE')} className="flex items-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"><Check size={12} className="mr-1" />Duyệt</button>
                  <button onClick={() => onDecision(p.id, 'REJECT')} className="flex items-center px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"><Ban size={12} className="mr-1" />Trả lại</button>
                </div>
              </Td>
            </tr>
          ))}
          {pakds.length === 0 && <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-xs">Không có hồ sơ chờ bạn duyệt.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

// ===================== CHANGE QUEUE =====================
const ChangeQueue: React.FC<{ items: { pakd: Pakd; cr: any }[]; allPakds: Pakd[]; comment: string; setComment: (v: string) => void; onDecision: (pid: string, crid: string, a: ApprovalAction) => void }> = ({ items, allPakds, comment, setComment, onDecision }) => {
  const all = allPakds.flatMap(p => p.changeRequests.map(cr => ({ pakd: p, cr })));
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-500 mb-2">Phiếu điều chỉnh chờ bạn duyệt. Luồng: GĐ Khối → BOD → Kế toán (cấp cuối duyệt sẽ tự áp dụng & tạo phiên bản mới).</p>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ý kiến..." rows={2} className="w-full text-xs border border-gray-300 rounded p-2 mb-3 outline-none focus:border-blue-400" />
        {items.length === 0 ? <p className="text-xs text-gray-400 italic border border-gray-200 rounded py-6 text-center">Không có phiếu chờ bạn duyệt.</p> : items.map(({ pakd, cr }) => (
          <div key={cr.id} className="border border-gray-200 rounded mb-3">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between text-[11px]">
              <span><span className="font-mono font-bold text-purple-700">{cr.id}</span> • {pakd.id} — {pakd.name}</span>
              <span className="font-medium text-gray-600">{CR_STATUS_LABEL[cr.status as keyof typeof CR_STATUS_LABEL]}</span>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-gray-500 italic">Lý do: {cr.reason}</p>
              <ChangeTable changes={cr.changes} />
              <div className="flex gap-2">
                <button onClick={() => onDecision(pakd.id, cr.id, 'APPROVE')} className={Btn.green}><Check size={12} className="mr-1" />Duyệt</button>
                <button onClick={() => onDecision(pakd.id, cr.id, 'REJECT')} className={Btn.red}><Ban size={12} className="mr-1" />Từ chối</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Panel title="Tất cả phiếu điều chỉnh">
        <table className="w-full text-[11px] border-collapse">
          <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th w="90px">Mã phiếu</Th><Th w="90px">PAKD</Th><Th>Lý do</Th><Th w="80px" center>Số TĐ</Th><Th w="140px">Trạng thái</Th></tr></thead>
          <tbody>{all.length === 0 ? <tr><td colSpan={5} className="text-center text-gray-400 py-6 text-xs">Chưa có phiếu nào.</td></tr> : all.map(({ pakd, cr }) => (
            <tr key={cr.id} className="border-b border-gray-100"><Td mono><span className="text-purple-700 font-semibold">{cr.id}</span></Td><Td mono>{pakd.id}</Td><Td>{cr.reason}</Td><Td center>{cr.changes.length}</Td><Td>{CR_STATUS_LABEL[cr.status as keyof typeof CR_STATUS_LABEL]}</Td></tr>
          ))}</tbody>
        </table>
      </Panel>
    </div>
  );
};

const ChangeTable: React.FC<{ changes: CostChange[] }> = ({ changes }) => (
  <table className="w-full text-[11px] border-collapse border border-gray-200">
    <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th w="60px" center>Thao tác</Th><Th>Bước / Khoản chi phí</Th><Th w="120px">Loại</Th><Th w="160px" right>Giá trị</Th></tr></thead>
    <tbody>{changes.map(ch => (
      <tr key={ch.id} className="border-b border-gray-100">
        <Td center><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ch.op === 'ADD' ? 'bg-green-100 text-green-700' : ch.op === 'EDIT' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{ch.op === 'ADD' ? 'THÊM' : ch.op === 'EDIT' ? 'SỬA' : 'XÓA'}</span></Td>
        <Td><span className="text-gray-400">[{ch.stepName}]</span> {ch.costName}</Td>
        <Td muted>{ch.costType}</Td>
        <Td right>{ch.op === 'EDIT' ? <>{ch.oldAmount?.toLocaleString('vi-VN')} → <b>{ch.newAmount?.toLocaleString('vi-VN')}</b></> : ch.op === 'ADD' ? <b className="text-green-700">+{ch.newAmount?.toLocaleString('vi-VN')}</b> : <s className="text-red-600">{ch.oldAmount?.toLocaleString('vi-VN')}</s>}</Td>
      </tr>
    ))}</tbody>
  </table>
);

// ===================== AUDIT =====================
const AuditView: React.FC<{ log: AuditLogEntry[] }> = ({ log }) => (
  <div className="overflow-x-auto border border-gray-200 rounded">
    <table className="w-full text-[11px] border-collapse">
      <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-600"><Th w="36px">#</Th><Th w="90px">PAKD</Th><Th w="200px">Hành động</Th><Th w="160px">Người thực hiện</Th><Th>Ghi chú</Th><Th w="120px">Thời gian</Th></tr></thead>
      <tbody>
        {log.length === 0 ? <tr><td colSpan={6} className="text-center text-gray-400 py-10 text-xs">Chưa có hoạt động nào trong phiên này.</td></tr> : log.map((l, i) => (
          <tr key={l.id} className="border-b border-gray-100 hover:bg-blue-50">
            <Td center muted>{i + 1}</Td><Td mono><span className="text-blue-600 font-semibold">{l.pakdId}</span></Td>
            <Td>{l.action}{l.oldStatus && l.newStatus && <span className="text-gray-400"> ({l.oldStatus}→{l.newStatus})</span>}</Td>
            <Td>{l.actor} ({l.role})</Td><Td><span className="italic text-gray-500">{l.note}</span></Td><Td muted>{l.createdAt}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===================== CREATE MODAL =====================
const CreateModal: React.FC<{ onClose: () => void; creator: string; onCreate: (p: Pakd) => void }> = ({ onClose, creator, onCreate }) => {
  const [f, setF] = useState({
    name: '', customerName: '', customerCode: '', businessDirector: BUSINESS_DIRECTORS[0], salesDirector: SALES_DIRECTORS[0], domain: DOMAINS[0],
    projStart: '', projEnd: '', expectedContractValue: 0, expectedCost: 0,
  });
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.customerName.trim() || !f.businessDirector.trim()) { setErr('Cần nhập Tên dự án, Tên khách hàng và Giám đốc khối.'); return; }
    if (f.expectedContractValue <= 0) { setErr('Giá trị hợp đồng dự kiến phải > 0.'); return; }
    onCreate({
      id: `PAKD-${Math.floor(100 + Math.random() * 899)}`, name: f.name, customerName: f.customerName,
      customerCode: f.customerCode.trim().toUpperCase() || f.customerName.slice(0, 4).toUpperCase(),
      creator, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16), status: 'DRAFT',
      businessDirector: f.businessDirector, salesDirector: f.salesDirector, domain: f.domain, projStart: f.projStart, projEnd: f.projEnd,
      expectedContractValue: f.expectedContractValue, expectedCost: f.expectedCost,
      tender: { packageCode: '', investor: f.customerName, biddingMethod: '', fieldType: '', contractType: '', packagePrice: f.expectedContractValue, bidSecurity: 0, closeDate: '' },
      revenue: f.expectedContractValue, steps: makePhases(), costVersions: 0, productionTasks: [], outsourceCodes: [], locked: false, version: 1, approvalHistory: [], changeRequests: [], versionHistory: [],
    });
  };
  const inp = 'w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-400';
  const lab = 'text-[11px] font-semibold text-gray-500';
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded shadow-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
          <h3 className="font-bold text-sm text-gray-900">Tạo Dự án</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {err && <p className="text-xs text-red-600 font-medium px-5 pt-3">{err}</p>}
        <form onSubmit={submit} className="p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><label className={lab}>Tên dự án *</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Tên khách hàng *</label><input value={f.customerName} onChange={(e) => setF({ ...f, customerName: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Mã khách hàng</label><input value={f.customerCode} onChange={(e) => setF({ ...f, customerCode: e.target.value })} placeholder="Tự sinh nếu để trống" className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Giám đốc khối *</label><select value={f.businessDirector} onChange={(e) => setF({ ...f, businessDirector: e.target.value })} className={inp}>{BUSINESS_DIRECTORS.map(d => <option key={d}>{d}</option>)}</select></div>
          <div className="space-y-1"><label className={lab}>Giám đốc kinh doanh</label><select value={f.salesDirector} onChange={(e) => setF({ ...f, salesDirector: e.target.value })} className={inp}>{SALES_DIRECTORS.map(d => <option key={d}>{d}</option>)}</select></div>
          <div className="space-y-1"><label className={lab}>Domain</label><select value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })} className={inp}>{DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
          <div className="space-y-1"><label className={lab}>Người lập (Sale)</label><input value={creator} disabled className={`${inp} bg-gray-50 text-gray-500`} /></div>
          <div className="space-y-1"><label className={lab}>Thời gian bắt đầu</label><input type="date" value={f.projStart} onChange={(e) => setF({ ...f, projStart: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Thời gian kết thúc</label><input type="date" value={f.projEnd} onChange={(e) => setF({ ...f, projEnd: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Giá trị hợp đồng dự kiến (VNĐ) *</label><input type="number" value={f.expectedContractValue} onChange={(e) => setF({ ...f, expectedContractValue: Number(e.target.value) })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Chi phí dự kiến bỏ ra (VNĐ)</label><input type="number" value={f.expectedCost} onChange={(e) => setF({ ...f, expectedCost: Number(e.target.value) })} className={inp} /></div>
          <div className="col-span-2 space-y-1">
            <label className={lab}>Lợi nhuận dự kiến (tự tính)</label>
            {(() => { const p = f.expectedContractValue - f.expectedCost; const m = f.expectedContractValue > 0 ? (p / f.expectedContractValue) * 100 : 0; return (
              <div className={`w-full text-xs font-bold border rounded px-2.5 py-1.5 ${p >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {p.toLocaleString('vi-VN')} đ ({m.toFixed(1)}%)
              </div>
            ); })()}
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-gray-100 mt-1">
            <button type="button" onClick={onClose} className={Btn.ghost}>Hủy</button>
            <button type="submit" className={Btn.primary}>Tạo dự án</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================== CHANGE REQUEST MODAL =====================
const ChangeRequestModal: React.FC<{ pakd: Pakd; onClose: () => void; onSubmit: (reason: string, changes: CostChange[]) => void }> = ({ pakd, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [changes, setChanges] = useState<CostChange[]>([]);
  const [op, setOp] = useState<'ADD' | 'EDIT' | 'DELETE'>('EDIT');
  const [stepId, setStepId] = useState(pakd.steps[0]?.id || '');
  const [costId, setCostId] = useState('');
  const [name, setName] = useState('');
  const [costType, setCostType] = useState(COST_TYPES[0]);
  const [newAmount, setNewAmount] = useState(0);
  const [err, setErr] = useState('');
  const step = pakd.steps.find(s => s.id === stepId);
  const target = step?.costItems.find(c => c.id === costId);
  const inp = 'text-xs border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400';

  const add = () => {
    if (!step) { setErr('Chọn bước.'); return; }
    if (op !== 'ADD' && !target) { setErr('Chọn khoản chi phí.'); return; }
    if (op === 'ADD' && !name.trim()) { setErr('Nhập tên khoản mới.'); return; }
    setChanges([...changes, { id: rid('CH'), op, stepId: step.id, stepName: step.name, targetCostId: op === 'ADD' ? undefined : target!.id, costName: op === 'ADD' ? name : (name || target!.name), costType: op === 'ADD' ? costType : target!.costType, oldAmount: op === 'ADD' ? undefined : target!.amount, newAmount: op === 'DELETE' ? undefined : newAmount }]);
    setErr(''); setName(''); setNewAmount(0); setCostId('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2"><FileEdit size={15} className="text-purple-600" />Phiếu điều chỉnh chi phí — {pakd.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {err && <p className="text-xs text-red-600 font-medium">{err}</p>}
          <div className="space-y-1"><label className="text-[11px] font-semibold text-gray-500">Lý do điều chỉnh *</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-400" /></div>

          <div className="border border-gray-200 rounded p-3 bg-gray-50/50 space-y-2">
            <p className="text-[11px] font-bold text-gray-600 uppercase">Thêm dòng thay đổi</p>
            <div className="grid grid-cols-2 gap-2">
              <select value={op} onChange={(e) => { setOp(e.target.value as any); setCostId(''); }} className={inp}><option value="ADD">Thêm khoản</option><option value="EDIT">Sửa khoản</option><option value="DELETE">Xóa khoản</option></select>
              <select value={stepId} onChange={(e) => { setStepId(e.target.value); setCostId(''); }} className={inp}>{pakd.steps.map(s => <option key={s.id} value={s.id}>{s.order}. {s.name}</option>)}</select>
            </div>
            {op !== 'ADD' && <select value={costId} onChange={(e) => setCostId(e.target.value)} className={`${inp} w-full`}><option value="">-- Chọn khoản chi phí --</option>{step?.costItems.map(c => <option key={c.id} value={c.id}>{c.name} ({c.amount.toLocaleString('vi-VN')} đ)</option>)}</select>}
            {op !== 'DELETE' && (
              <div className="grid grid-cols-3 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={op === 'ADD' ? 'Tên khoản mới' : 'Tên mới (trống=giữ)'} className={inp} />
                {op === 'ADD' && <select value={costType} onChange={(e) => setCostType(e.target.value)} className={inp}>{COST_TYPES.map(t => <option key={t}>{t}</option>)}</select>}
                <input type="number" value={newAmount} onChange={(e) => setNewAmount(Number(e.target.value))} placeholder="Số tiền mới" className={inp} />
              </div>
            )}
            <button onClick={add} className={Btn.ghost}><Plus size={13} className="mr-1" />Thêm vào phiếu</button>
          </div>

          {changes.length > 0 && <ChangeTable changes={changes} />}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button onClick={onClose} className={Btn.ghost}>Hủy</button>
            <button onClick={() => { if (!reason.trim()) { setErr('Nhập lý do.'); return; } if (changes.length === 0) { setErr('Thêm ít nhất 1 thay đổi.'); return; } onSubmit(reason, changes); }} className={Btn.purple}>Nộp phiếu (→ GĐ Khối)</button>
          </div>
        </div>
      </div>
    </div>
  );
};
