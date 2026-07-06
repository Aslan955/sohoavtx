import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Check, Wallet, Eye } from 'lucide-react';
import { Pakd, AccountingSpend } from './projectTypes';

const fmt = (v: number) => v.toLocaleString('vi-VN') + ' đ';
const rid = () => `ACS-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString().replace('T', ' ').substring(0, 16);

// Tổng chi thực tế đã import của 1 dự án
export const accountingTotal = (p: Pakd) => (p.accountingSpends || []).reduce((a, s) => ({ prod: a.prod + s.production, biz: a.biz + s.business }), { prod: 0, biz: 0 });
const lastUpdate = (p: Pakd) => (p.accountingSpends || []).map(s => s.at).sort().slice(-1)[0] || '';

// ---- CSV ----
const splitLine = (line: string, d: string): string[] => {
  const out: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else { if (ch === '"') q = true; else if (ch === d) { out.push(cur); cur = ''; } else cur += ch; }
  }
  out.push(cur); return out.map(c => c.trim());
};
const num = (v?: string) => { const n = Number((v || '').replace(/[^\d.-]/g, '')); return v && !isNaN(n) ? n : 0; };

interface ParsedRow { code: string; production: number; business: number; at: string }
const parseCsv = (text: string): ParsedRow[] => {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter(l => l.trim() !== '');
  if (lines.length === 0) return [];
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const rows: ParsedRow[] = [];
  lines.forEach((line, idx) => {
    const c = splitLine(line, delim);
    const first = (c[0] || '').toLowerCase();
    if (idx === 0 && (first.includes('mã dự án') || first.includes('ma du an') || first === 'mã dự án')) return; // header
    if (!c[0]) return;
    rows.push({ code: c[0], production: num(c[1]), business: num(c[2]), at: (c[3] || '').trim() });
  });
  return rows;
};

// Khớp 1 dòng import với dự án theo mã (mã tổng / mã PAKD / mã KD / mã SX)
const findPakd = (pakds: Pakd[], code: string): Pakd | undefined => {
  const k = code.trim().toLowerCase();
  return pakds.find(p => [p.masterCode, p.id, p.businessCode, p.productionCode].some(x => (x || '').toLowerCase() === k));
};

export const AccountingImportPage: React.FC<{
  pakds: Pakd[];
  onImport: (items: { pakdId: string; spend: AccountingSpend }[]) => void;
  simUser: { fullName: string; role: string };
}> = ({ pakds, onImport, simUser }) => {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const canImport = ['ACCOUNTANT', 'ADMIN'].includes(simUser.role);

  const rows = parseCsv(text);
  const preview = rows.map(r => ({ ...r, pakd: findPakd(pakds, r.code) }));
  const matched = preview.filter(r => r.pakd);
  const unmatched = preview.filter(r => !r.pakd);

  const onFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setText(String(reader.result || '')); setMsg(''); };
    reader.readAsText(f, 'utf-8');
  };

  const downloadTemplate = () => {
    const sample = [
      'Mã dự án,Chi sản xuất,Chi kinh doanh,Ngày update',
      '022.689,1500000000,800000000,2026-07-31',
      'KH0001.457,500000000,300000000,2026-07-31',
    ].join('\n');
    const blob = new Blob(['﻿' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mau-import-chi-thuc-te.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const apply = () => {
    if (matched.length === 0) { setMsg('Không có dòng nào khớp mã dự án để import.'); return; }
    const items = matched.map(r => ({
      pakdId: r.pakd!.id,
      spend: { id: rid(), at: r.at || now().substring(0, 10), production: r.production, business: r.business, by: simUser.fullName, importedAt: now() } as AccountingSpend,
    }));
    onImport(items);
    setText(''); setMsg(`Đã import ${items.length} dòng chi thực tế${unmatched.length ? ` (bỏ qua ${unmatched.length} dòng không khớp mã)` : ''}.`);
  };

  const Th: React.FC<{ children?: React.ReactNode; right?: boolean; center?: boolean; w?: string }> = ({ children, right, center, w }) => (
    <th className={`px-3 py-2 font-semibold border-r border-gray-200 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`} style={{ minWidth: w }}>{children}</th>
  );
  const Td: React.FC<{ children?: React.ReactNode; right?: boolean; center?: boolean; mono?: boolean; muted?: boolean }> = ({ children, right, center, mono, muted }) => (
    <td className={`px-3 py-2 border-r border-gray-200 ${right ? 'text-right' : center ? 'text-center' : 'text-left'} ${mono ? 'font-mono' : ''} ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{children}</td>
  );

  return (
    <div className="space-y-5">
      {/* Khu import */}
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <Wallet size={13} className="text-blue-600" />Import chi phí thực tế (Kế toán)
        </div>
        <div className="p-4 space-y-3">
          {!canImport && <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">Chỉ <b>Kế toán</b> mới được import chi thực tế. Bạn đang xem ở chế độ chỉ đọc.</div>}
          <div className="text-[11px] text-gray-600 bg-blue-50 border border-blue-100 rounded p-2.5 leading-relaxed">
            File <b>4 cột</b> theo thứ tự: <b>Mã dự án • Chi sản xuất • Chi kinh doanh • Ngày update</b>. Mã dự án khớp theo <b>Mã tổng</b> (vd 022.689 / KH0001.457) hoặc Mã PAKD. Mỗi tháng import 1 lần — hệ thống <b>cộng dồn</b> theo dự án.
          </div>
          {canImport && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 cursor-pointer">
                <FileSpreadsheet size={13} className="mr-1.5" />Chọn file CSV
                <input type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={e => onFile(e.target.files?.[0] || null)} />
              </label>
              <button onClick={downloadTemplate} className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"><Download size={13} className="mr-1.5" />Tải file mẫu</button>
            </div>
          )}
          {canImport && (
            <textarea value={text} onChange={e => { setText(e.target.value); setMsg(''); }} rows={4}
              placeholder={'Mã dự án,Chi sản xuất,Chi kinh doanh,Ngày update\n022.689,1500000000,800000000,2026-07-31'}
              className="w-full text-[11px] font-mono border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-y" />
          )}
          {msg && <div className="text-[11px] font-semibold text-green-700">{msg}</div>}

          {rows.length > 0 && canImport && (
            <div>
              <div className="text-[11px] font-semibold text-gray-600 mb-1">Xem trước ({matched.length} khớp{unmatched.length ? `, ${unmatched.length} không khớp` : ''}):</div>
              <div className="overflow-x-auto border border-gray-200 rounded max-h-56 overflow-y-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="bg-gray-100 sticky top-0"><tr className="text-gray-700"><Th>Mã dự án</Th><Th>Dự án</Th><Th right>Chi sản xuất</Th><Th right>Chi kinh doanh</Th><Th>Ngày update</Th></tr></thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${r.pakd ? '' : 'bg-red-50/60'}`}>
                        <Td mono>{r.code}</Td>
                        <Td>{r.pakd ? r.pakd.name : <span className="text-red-600 italic">không khớp mã dự án</span>}</Td>
                        <Td right>{fmt(r.production)}</Td><Td right>{fmt(r.business)}</Td><Td mono>{r.at || '—'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={apply} disabled={matched.length === 0} className={`mt-2 flex items-center px-3 py-1.5 text-white text-xs font-semibold rounded ${matched.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#007bff] hover:bg-blue-600'}`}>
                <Check size={13} className="mr-1" />Áp dụng ({matched.length} dòng)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tổng hợp chi thực tế theo dự án */}
      <div className="border border-gray-200 rounded">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide">Chi thực tế đã import theo dự án</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <Th w="36px" center>#</Th><Th w="100px">Mã tổng</Th><Th w="90px">Mã PAKD</Th><Th w="220px">Dự án</Th>
                <Th right w="130px">Chi sản xuất</Th><Th right w="130px">Chi kinh doanh</Th><Th right w="130px">Tổng chi</Th>
                <Th center w="70px">Số lần</Th><Th w="110px">Update gần nhất</Th>
              </tr>
            </thead>
            <tbody>
              {pakds.map((p, i) => {
                const t = accountingTotal(p);
                const n = (p.accountingSpends || []).length;
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50/40">
                    <Td center muted>{i + 1}</Td>
                    <Td mono>{p.masterCode || '—'}</Td>
                    <Td mono><span className="text-blue-600 font-semibold">{p.id}</span></Td>
                    <Td><span className="max-w-[220px] truncate inline-block">{p.name}</span></Td>
                    <Td right className="font-semibold text-amber-700">{n ? fmt(t.prod) : '—'}</Td>
                    <Td right className="font-semibold text-amber-700">{n ? fmt(t.biz) : '—'}</Td>
                    <Td right><b className="text-gray-800">{n ? fmt(t.prod + t.biz) : '—'}</b></Td>
                    <Td center muted>{n || '—'}</Td>
                    <Td mono muted>{lastUpdate(p) || '—'}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
