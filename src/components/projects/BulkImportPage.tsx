import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, Check, Layers, AlertTriangle, GitBranch } from 'lucide-react';
import { Pakd, PakdStatus, ProductionInfo } from './projectTypes';
import { makePhases } from './projectData';
import { generateCodes, PhaseImportPatch } from './projectWorkflow';
import { Customer } from './CustomersPage';

const fmt = (v: number) => v.toLocaleString('vi-VN') + ' đ';
const rid = () => `PAKD-${Math.floor(100 + Math.random() * 899)}`;
const now = () => new Date().toISOString().replace('T', ' ').substring(0, 16);
const num = (v: unknown): number => {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
};
const str = (v: unknown): string => String(v ?? '').trim();

// ---- Ánh xạ tên cột (khớp mềm theo từ khóa, không phụ thuộc thứ tự) ----
const FIELD_KEYS: Record<string, string[]> = {
  legacyCode: ['mã dự án (cũ)', 'ma du an cu', 'project code'],
  name: ['tên dự án', 'ten du an', 'project name'],
  customerCode: ['mã khách hàng', 'ma khach hang'],
  customerName: ['tên khách hàng', 'ten khach hang', 'customer'],
  domain: ['lĩnh vực', 'linh vuc', 'domain'],
  salesDirector: ['giám đốc kinh doanh', 'giam doc kinh doanh'],
  businessDirector: ['giám đốc khối', 'giam doc khoi'],
  pm: ['pm', 'quản lý dự án', 'project manager'],
  creator: ['người lập', 'nguoi lap'],
  createdAt: ['ngày tạo', 'ngay tao', 'creation'],
  projStart: ['bắt đầu', 'bat dau', 'start'],
  projEnd: ['kết thúc', 'ket thuc', 'end'],
  contractValue: ['giá trị hợp đồng', 'gia tri hop dong', 'bac'],
  expectedCost: ['chi phí dự kiến', 'chi phi du kien', 'development cost'],
  actualCost: ['chi phí thực tế', 'chi phi thuc te', 'actual'],
  priority: ['ưu tiên', 'uu tien', 'priority'],
  size: ['quy mô', 'quy mo', 'size'],
  projectType: ['loại dự án', 'loai du an', 'type'],
  department: ['phòng ban', 'phong ban', 'department'],
  status: ['trạng thái', 'trang thai', 'status'],
  note: ['ghi chú', 'ghi chu', 'note'],
};

// Với mỗi field, tìm chỉ số cột trong hàng header
function resolveColumns(header: string[]): Record<string, number> {
  const norm = header.map(h => str(h).toLowerCase());
  const map: Record<string, number> = {};
  for (const [field, keys] of Object.entries(FIELD_KEYS)) {
    let idx = norm.findIndex(h => keys.some(k => h === k));
    if (idx < 0) idx = norm.findIndex(h => keys.some(k => h.includes(k)));
    map[field] = idx;
  }
  return map;
}

export interface ImportRow {
  raw: unknown[];
  legacyCode: string; name: string; customerCode: string; customerName: string; domain: string;
  salesDirector: string; businessDirector: string; pm: string; creator: string;
  createdAt: string; projStart: string; projEnd: string;
  contractValue: number; expectedCost: number; actualCost: number;
  priority: string; size: string; projectType: string; department: string; status: string; note: string;
  errors: string[];
  customerNew: boolean; // mã KH chưa có trong danh mục
}

// ---- Đọc file (xlsx / csv) bằng SheetJS ----
function parseWorkbook(wb: XLSX.WorkBook): unknown[][] {
  const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('import')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false, defval: '' });
}

const PAKD_STATUS_OPTIONS: { value: PakdStatus; label: string }[] = [
  { value: 'COMPLETED', label: 'Hoàn tất (dữ liệu lịch sử đã duyệt)' },
  { value: 'DRAFT', label: 'Nháp (Sale sẽ chỉnh & nộp duyệt sau)' },
];

// ================= Chế độ 2: import ngân sách giai đoạn hàng loạt =================
const PHASE_KEYS: Record<string, string[]> = {
  projectCode: ['mã dự án', 'mã tổng', 'ma du an', 'ma tong', 'project code', 'mã pakd', 'ma pakd'],
  phaseCode: ['mã giai đoạn', 'ma giai doan', 'giai đoạn', 'giai doan', 'phase', 'kh'],
  name: ['tên giai đoạn', 'ten giai doan'],
  start: ['bắt đầu', 'bat dau', 'start'],
  end: ['kết thúc', 'ket thuc', 'end'],
  objective: ['mục tiêu', 'muc tieu', 'objective'],
  output: ['kết quả', 'ket qua', 'output', 'đầu ra'],
  prodBudget: ['sản xuất', 'san xuat', 'ns sx', 'production'],
  bizBudget: ['kinh doanh', 'ns kd', 'business'],
};
function resolvePhaseCols(header: string[]): Record<string, number> {
  const norm = header.map(h => str(h).toLowerCase());
  const map: Record<string, number> = {};
  for (const [field, keys] of Object.entries(PHASE_KEYS)) {
    let idx = norm.findIndex(h => keys.some(k => h === k));
    if (idx < 0) idx = norm.findIndex(h => keys.some(k => h.includes(k)));
    map[field] = idx;
  }
  return map;
}
// "KH01" | "KH1" | "1" -> 0-based index; '' -> -1 (dùng thứ tự dòng)
function phaseIndexOf(v: string): number {
  const s = str(v).toUpperCase().replace(/\s/g, '');
  if (!s) return -1;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) - 1 : -1;
}
const findPakd = (pakds: Pakd[], code: string): Pakd | undefined => {
  const k = str(code).toLowerCase();
  return pakds.find(p => [p.masterCode, p.id, p.businessCode, p.productionCode].some(x => (x || '').toLowerCase() === k));
};

interface PhaseGroup {
  code: string; pakd?: Pakd; patches: PhaseImportPatch[]; count: number;
  willReapprove: boolean; // true = đã chốt/đang duyệt → tạo V mới & duyệt lại
}

export const BulkImportPage: React.FC<{
  customers: Customer[];
  pakds: Pakd[];
  onImport: (pakds: Pakd[], newCustomers: Customer[]) => void;
  onImportPhases: (groups: { pakdId: string; patches: PhaseImportPatch[] }[], reason: string) => void;
  simUser: { fullName: string; role: string };
}> = ({ customers, pakds, onImport, onImportPhases, simUser }) => {
  const [mode, setMode] = useState<'CREATE' | 'PHASES'>('CREATE');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [msg, setMsg] = useState('');
  const [importStatus, setImportStatus] = useState<PakdStatus>('COMPLETED');
  // Chế độ giai đoạn
  const [phaseGroups, setPhaseGroups] = useState<PhaseGroup[]>([]);
  const [phaseFile, setPhaseFile] = useState('');
  const [phaseReason, setPhaseReason] = useState('');
  const [phaseMsg, setPhaseMsg] = useState('');
  const canImport = ['SALE', 'SALES_DIRECTOR', 'BUSINESS_DIRECTOR', 'ADMIN'].includes(simUser.role);

  const buildRows = (aoa: unknown[][]) => {
    if (!aoa.length) { setMsg('File rỗng hoặc không đọc được sheet dữ liệu.'); setRows([]); return; }
    const header = aoa[0].map(str);
    const col = resolveColumns(header);
    if (col.name < 0) { setMsg('Không tìm thấy cột "Tên dự án". Kiểm tra lại file mẫu.'); setRows([]); return; }
    const custByCode = new Map<string, Customer>(customers.map(c => [c.code.toLowerCase(), c] as [string, Customer]));
    const out: ImportRow[] = [];
    for (let i = 1; i < aoa.length; i++) {
      const r = aoa[i];
      const g = (f: string): unknown => (col[f] >= 0 ? r[col[f]] : '');
      const name = str(g('name'));
      const customerCode = str(g('customerCode'));
      const legacyCode = str(g('legacyCode'));
      if (!name && !customerCode && !legacyCode) continue; // bỏ dòng trống
      const cust = custByCode.get(customerCode.toLowerCase());
      const customerName = str(g('customerName')) || cust?.name || '';
      const errors: string[] = [];
      if (!name) errors.push('Thiếu Tên dự án');
      if (!customerCode) errors.push('Thiếu Mã khách hàng');
      out.push({
        raw: r as unknown[], legacyCode, name, customerCode,
        customerName: cust?.name || customerName,
        domain: str(g('domain')) || cust?.domain || '',
        salesDirector: str(g('salesDirector')), businessDirector: str(g('businessDirector')),
        pm: str(g('pm')), creator: str(g('creator')) || simUser.fullName,
        createdAt: str(g('createdAt')), projStart: str(g('projStart')), projEnd: str(g('projEnd')),
        contractValue: num(g('contractValue')), expectedCost: num(g('expectedCost')), actualCost: num(g('actualCost')),
        priority: str(g('priority')), size: str(g('size')), projectType: str(g('projectType')),
        department: str(g('department')), status: str(g('status')) || 'OPEN', note: str(g('note')),
        errors, customerNew: !!customerCode && !cust,
      });
    }
    setRows(out);
    setMsg('');
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    const isCsv = /\.csv$/i.test(f.name) || f.type === 'text/csv';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = isCsv ? XLSX.read(reader.result, { type: 'string' }) : XLSX.read(reader.result, { type: 'array' });
        buildRows(parseWorkbook(wb));
      } catch (e) {
        setMsg('Không đọc được file: ' + (e as Error).message); setRows([]);
      }
    };
    if (isCsv) reader.readAsText(f, 'utf-8'); else reader.readAsArrayBuffer(f);
  };

  const valid = rows.filter(r => r.errors.length === 0);
  const invalid = rows.filter(r => r.errors.length > 0);
  const newCustCodes = Array.from(new Set(valid.filter(r => r.customerNew).map(r => r.customerCode)));

  const toPakd = (r: ImportRow): Pakd => {
    const codes = generateCodes(r.customerCode);
    const steps = makePhases();
    const prod: ProductionInfo = {
      department: r.department, priority: r.priority, size: r.size, projectType: r.projectType,
      projectManager: r.pm, customer: r.customerName, domain: r.domain,
      startDate: r.projStart, endDate: r.projEnd, status: r.status,
    };
    steps[0] = { ...steps[0], productionInfo: prod, startDate: r.projStart, endDate: r.projEnd, assignee: r.pm, actualSpent: r.actualCost || undefined };
    return {
      id: rid(), name: r.name, customerName: r.customerName, customerCode: r.customerCode,
      creator: r.creator, createdAt: r.createdAt || now(), status: importStatus,
      businessDirector: r.businessDirector || undefined, salesDirector: r.salesDirector || undefined,
      domain: r.domain || undefined, projStart: r.projStart || undefined, projEnd: r.projEnd || undefined,
      expectedContractValue: r.contractValue, expectedCost: r.expectedCost,
      pmName: r.pm || undefined, businessPM: r.pm || undefined, productionPM: r.pm || undefined,
      ...codes,
      tender: { packageCode: r.legacyCode, investor: r.customerName, biddingMethod: '', fieldType: '', contractType: '', packagePrice: r.contractValue, bidSecurity: 0, closeDate: '' },
      revenue: r.contractValue, steps, costVersions: 0, currentPhase: 1, productionTasks: [], outsourceCodes: [],
      locked: importStatus === 'COMPLETED', version: 1, approvalHistory: [], changeRequests: [], versionHistory: [],
    };
  };

  const apply = () => {
    if (valid.length === 0) { setMsg('Không có dòng hợp lệ để import.'); return; }
    const pakds = valid.map(toPakd);
    const newCustomers: Customer[] = newCustCodes.map(code => {
      const src = valid.find(r => r.customerCode === code)!;
      return { id: `CUS-${Math.random().toString(36).slice(2, 8)}`, code, name: src.customerName || code, domain: src.domain || '', createdAt: now() } as Customer;
    });
    onImport(pakds, newCustomers);
    setRows([]); setFileName('');
    setMsg(`Đã import ${pakds.length} PAKD${newCustomers.length ? `, tạo mới ${newCustomers.length} khách hàng` : ''}${invalid.length ? ` (bỏ qua ${invalid.length} dòng lỗi)` : ''}.`);
  };

  // ---- Chế độ giai đoạn: parse long-format (mỗi dòng = 1 giai đoạn của 1 dự án) ----
  const buildPhases = (aoa: unknown[][]) => {
    if (!aoa.length) { setPhaseMsg('File rỗng hoặc không đọc được sheet.'); setPhaseGroups([]); return; }
    const header = aoa[0].map(str);
    const col = resolvePhaseCols(header);
    if (col.projectCode < 0) { setPhaseMsg('Không tìm thấy cột "Mã dự án". Kiểm tra lại file mẫu.'); setPhaseGroups([]); return; }
    const groups = new Map<string, PhaseImportPatch[]>();
    const order = new Map<string, number>(); // đếm dòng để suy index khi thiếu mã giai đoạn
    for (let i = 1; i < aoa.length; i++) {
      const r = aoa[i];
      const g = (f: string): unknown => (col[f] >= 0 ? r[col[f]] : '');
      const code = str(g('projectCode'));
      if (!code) continue;
      let idx = phaseIndexOf(str(g('phaseCode')));
      const seen = order.get(code) ?? 0;
      if (idx < 0) idx = seen; // không có mã giai đoạn → theo thứ tự dòng
      order.set(code, seen + 1);
      const patch: PhaseImportPatch = { index: idx };
      const name = str(g('name')); if (name) patch.name = name;
      const start = str(g('start')); if (start) patch.startDate = start;
      const end = str(g('end')); if (end) patch.endDate = end;
      const obj = str(g('objective')); if (obj) patch.objective = obj;
      const out = str(g('output')); if (out) patch.output = out;
      if (col.prodBudget >= 0 && str(g('prodBudget')) !== '') patch.productionBudget = num(g('prodBudget'));
      if (col.bizBudget >= 0 && str(g('bizBudget')) !== '') patch.businessBudget = num(g('bizBudget'));
      groups.set(code, [...(groups.get(code) || []), patch]);
    }
    const out: PhaseGroup[] = Array.from(groups.entries()).map(([code, patches]) => {
      const pakd = findPakd(pakds, code);
      const editable = pakd ? (pakd.status === 'DRAFT' || (pakd.status === 'RETURNED' && !pakd.locked)) : false;
      return { code, pakd, patches, count: patches.length, willReapprove: !!pakd && !editable };
    });
    setPhaseGroups(out); setPhaseMsg('');
  };

  const onPhaseFile = (f: File | null) => {
    if (!f) return;
    setPhaseFile(f.name);
    const isCsv = /\.csv$/i.test(f.name) || f.type === 'text/csv';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = isCsv ? XLSX.read(reader.result, { type: 'string' }) : XLSX.read(reader.result, { type: 'array' });
        const sn = wb.SheetNames.find(n => /giai|phase|ngan|ngân/i.test(n)) || wb.SheetNames[0];
        buildPhases(XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sn], { header: 1, raw: false, defval: '' }));
      } catch (e) { setPhaseMsg('Không đọc được file: ' + (e as Error).message); setPhaseGroups([]); }
    };
    if (isCsv) reader.readAsText(f, 'utf-8'); else reader.readAsArrayBuffer(f);
  };

  const downloadPhaseTemplate = () => {
    const sample = pakds[0];
    const code = sample?.masterCode || sample?.id || '022.689';
    const head = ['Mã dự án', 'Mã giai đoạn', 'Tên giai đoạn', 'Bắt đầu', 'Kết thúc', 'Mục tiêu', 'Kết quả đầu ra', 'NS Sản xuất', 'NS Kinh doanh'];
    const lines = [head.join(',')];
    ['KH01', 'KH02'].forEach((kh, i) =>
      lines.push([code, kh, `Giai đoạn ${i + 1}`, '2026-05-10', '2026-06-30', 'Mục tiêu...', 'Kết quả...', String((i + 1) * 1000000000), String((i + 1) * 500000000)].join(',')));
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mau-import-ngan-sach-giai-doan.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const phaseMatched = phaseGroups.filter(g => g.pakd);
  const phaseUnmatched = phaseGroups.filter(g => !g.pakd);
  const needReason = phaseMatched.some(g => g.willReapprove);

  const applyPhases = () => {
    if (phaseMatched.length === 0) { setPhaseMsg('Không có dự án nào khớp mã để import.'); return; }
    if (needReason && !phaseReason.trim()) { setPhaseMsg('Nhập lý do điều chỉnh (có dự án đã chốt sẽ phải duyệt lại).'); return; }
    onImportPhases(phaseMatched.map(g => ({ pakdId: g.pakd!.id, patches: g.patches })), phaseReason.trim());
    const reappr = phaseMatched.filter(g => g.willReapprove).length;
    setPhaseGroups([]); setPhaseFile(''); setPhaseReason('');
    setPhaseMsg(`Đã import ngân sách cho ${phaseMatched.length} dự án${reappr ? ` (${reappr} dự án tạo phiên bản mới & nộp duyệt lại)` : ''}${phaseUnmatched.length ? `; bỏ qua ${phaseUnmatched.length} mã không khớp` : ''}.`);
  };

  const Th: React.FC<{ children?: React.ReactNode; right?: boolean }> = ({ children, right }) => (
    <th className={`px-2.5 py-2 font-semibold border-r border-gray-200 whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>{children}</th>
  );
  const Td: React.FC<{ children?: React.ReactNode; right?: boolean; mono?: boolean; muted?: boolean }> = ({ children, right, mono, muted }) => (
    <td className={`px-2.5 py-1.5 border-r border-gray-200 whitespace-nowrap ${right ? 'text-right' : 'text-left'} ${mono ? 'font-mono' : ''} ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{children}</td>
  );

  const modeBtn = (m: 'CREATE' | 'PHASES', label: string, icon: React.ReactNode) => (
    <button onClick={() => setMode(m)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border ${mode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{icon}{label}</button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {modeBtn('CREATE', 'Tạo PAKD mới', <Layers size={13} />)}
        {modeBtn('PHASES', 'Ngân sách giai đoạn', <GitBranch size={13} />)}
      </div>

      {mode === 'CREATE' && (
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <Layers size={13} className="text-blue-600" />Import phương án kinh doanh hàng loạt
        </div>
        <div className="p-4 space-y-3">
          {!canImport && <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">Chỉ <b>Sale / Giám đốc / Admin</b> mới được import PAKD. Bạn đang xem ở chế độ chỉ đọc.</div>}
          <div className="text-[11px] text-gray-600 bg-blue-50 border border-blue-100 rounded p-2.5 leading-relaxed">
            Tải file Excel theo <b>mẫu MAU_IMPORT_DU_AN.xlsx</b> (sheet <b>Import_DuAn</b>). Mỗi dòng tạo 1 PAKD.
            Cột bắt buộc: <b>Tên dự án</b>, <b>Mã khách hàng</b>. Mã khách hàng chưa có sẽ được <b>tạo mới tự động</b> trong danh mục.
            Mã tổng dự án (022.xxx) do hệ thống tự sinh; mã cũ được lưu ở ô "Mã gói thầu" để truy vết.
          </div>
          {canImport && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 cursor-pointer">
                <FileSpreadsheet size={13} className="mr-1.5" />Chọn file Excel (.xlsx / .csv)
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => onFile(e.target.files?.[0] || null)} />
              </label>
              {fileName && <span className="text-[11px] text-gray-500 flex items-center gap-1"><Upload size={12} />{fileName}</span>}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <span className="font-semibold">Trạng thái sau import:</span>
                <select value={importStatus} onChange={e => setImportStatus(e.target.value as PakdStatus)} className="text-[11px] border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-400">
                  {PAKD_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}
          {msg && <div className="text-[11px] font-semibold text-green-700">{msg}</div>}

          {rows.length > 0 && canImport && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="font-semibold text-gray-700">Xem trước: {rows.length} dòng</span>
                <span className="text-green-700 font-semibold">{valid.length} hợp lệ</span>
                {invalid.length > 0 && <span className="text-red-600 font-semibold flex items-center gap-1"><AlertTriangle size={12} />{invalid.length} lỗi</span>}
                {newCustCodes.length > 0 && <span className="text-blue-600 font-semibold">+{newCustCodes.length} khách hàng mới</span>}
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded max-h-72 overflow-y-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="bg-gray-100 sticky top-0"><tr className="text-gray-700">
                    <Th>#</Th><Th>Tên dự án</Th><Th>Mã KH</Th><Th>Khách hàng</Th><Th>PM</Th>
                    <Th right>Giá trị HĐ</Th><Th right>CP dự kiến</Th><Th>Ưu tiên</Th><Th>Quy mô</Th><Th>Trạng thái</Th><Th>Kiểm tra</Th>
                  </tr></thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${r.errors.length ? 'bg-red-50/60' : ''}`}>
                        <Td muted>{i + 1}</Td>
                        <Td>{r.name || <span className="text-red-500 italic">—</span>}</Td>
                        <Td mono>{r.customerCode || '—'}{r.customerNew && <span className="ml-1 text-[9px] text-blue-600 font-semibold">MỚI</span>}</Td>
                        <Td muted>{r.customerName || '—'}</Td>
                        <Td muted>{r.pm || '—'}</Td>
                        <Td right>{r.contractValue ? fmt(r.contractValue) : '—'}</Td>
                        <Td right>{r.expectedCost ? fmt(r.expectedCost) : '—'}</Td>
                        <Td muted>{r.priority || '—'}</Td>
                        <Td muted>{r.size || '—'}</Td>
                        <Td muted>{r.status || '—'}</Td>
                        <Td>{r.errors.length ? <span className="text-red-600">{r.errors.join('; ')}</span> : <span className="text-green-600 flex items-center gap-0.5"><Check size={11} />OK</span>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={apply} disabled={valid.length === 0} className={`flex items-center px-4 py-1.5 text-white text-xs font-semibold rounded ${valid.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#007bff] hover:bg-blue-600'}`}>
                <Check size={13} className="mr-1" />Import {valid.length} PAKD
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {mode === 'PHASES' && (
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <GitBranch size={13} className="text-blue-600" />Import ngân sách giai đoạn hàng loạt (KH01…)
        </div>
        <div className="p-4 space-y-3">
          {!canImport && <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">Chỉ <b>Sale / Giám đốc / Admin</b> mới được import. Bạn đang xem ở chế độ chỉ đọc.</div>}
          <div className="text-[11px] text-gray-600 bg-blue-50 border border-blue-100 rounded p-2.5 leading-relaxed">
            Mỗi dòng = <b>1 giai đoạn của 1 dự án</b>. Cột: <b>Mã dự án • Mã giai đoạn (KH01…) • Tên • Bắt đầu • Kết thúc • Mục tiêu • Kết quả đầu ra • NS Sản xuất • NS Kinh doanh</b>.
            Khớp theo <b>Mã tổng / Mã PAKD / Mã KD / Mã SX</b>. Dự án đang <b>Nháp</b> → cập nhật trực tiếp; dự án <b>đã chốt / đang duyệt</b> → tạo <b>phiên bản mới (V+1)</b>, đóng băng bản cũ và <b>nộp duyệt lại từ đầu</b>.
          </div>
          {canImport && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 cursor-pointer">
                <FileSpreadsheet size={13} className="mr-1.5" />Chọn file Excel (.xlsx / .csv)
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => onPhaseFile(e.target.files?.[0] || null)} />
              </label>
              {phaseFile && <span className="text-[11px] text-gray-500 flex items-center gap-1"><Upload size={12} />{phaseFile}</span>}
              <button onClick={downloadPhaseTemplate} className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"><Download size={13} className="mr-1.5" />Tải file mẫu</button>
            </div>
          )}
          {canImport && needReason && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600">Lý do điều chỉnh <span className="text-red-500">*</span> <span className="font-normal text-gray-400">(áp cho các dự án đã chốt phải duyệt lại)</span></label>
              <input value={phaseReason} onChange={e => { setPhaseReason(e.target.value); setPhaseMsg(''); }} placeholder="VD: Cập nhật lại phân bổ ngân sách theo phê duyệt mới…"
                className="w-full text-[11px] border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-400" />
            </div>
          )}
          {phaseMsg && <div className="text-[11px] font-semibold text-green-700">{phaseMsg}</div>}

          {phaseGroups.length > 0 && canImport && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="font-semibold text-gray-700">Xem trước: {phaseGroups.length} dự án</span>
                <span className="text-green-700 font-semibold">{phaseMatched.length} khớp</span>
                {phaseUnmatched.length > 0 && <span className="text-red-600 font-semibold flex items-center gap-1"><AlertTriangle size={12} />{phaseUnmatched.length} không khớp</span>}
                {needReason && <span className="text-orange-600 font-semibold">{phaseMatched.filter(g => g.willReapprove).length} sẽ duyệt lại</span>}
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded max-h-72 overflow-y-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="bg-gray-100 sticky top-0"><tr className="text-gray-700">
                    <Th>#</Th><Th>Mã dự án</Th><Th>Dự án</Th><Th right>Số giai đoạn</Th><Th>Trạng thái</Th><Th>Xử lý</Th>
                  </tr></thead>
                  <tbody>
                    {phaseGroups.map((g, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${g.pakd ? '' : 'bg-red-50/60'}`}>
                        <Td muted>{i + 1}</Td>
                        <Td mono>{g.code}</Td>
                        <Td>{g.pakd ? g.pakd.name : <span className="text-red-600 italic">không khớp mã dự án</span>}</Td>
                        <Td right>{g.count}</Td>
                        <Td muted>{g.pakd ? g.pakd.status : '—'}</Td>
                        <Td>{!g.pakd ? <span className="text-red-500">bỏ qua</span> : g.willReapprove
                          ? <span className="text-orange-600 font-semibold">Tạo V+1 & duyệt lại</span>
                          : <span className="text-green-600">Cập nhật trực tiếp</span>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={applyPhases} disabled={phaseMatched.length === 0} className={`flex items-center px-4 py-1.5 text-white text-xs font-semibold rounded ${phaseMatched.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#007bff] hover:bg-blue-600'}`}>
                <Check size={13} className="mr-1" />Import cho {phaseMatched.length} dự án
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

