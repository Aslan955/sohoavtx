import React, { useState } from 'react';
import { Plus, Search, Eye, FileEdit, Trash2, X, Building2, Phone, Mail } from 'lucide-react';
import { Pakd } from './projectTypes';
import { DOMAINS } from './projectData';

// ===================== Kiểu dữ liệu khách hàng =====================
export interface Customer {
  id: string;
  code: string;          // Mã khách hàng (vd KH0001)
  name: string;          // Tên khách hàng / tổ chức
  taxCode?: string;      // Mã số thuế
  contactPerson?: string;// Người liên hệ
  phone?: string;
  email?: string;
  address?: string;
  domain?: string;       // Lĩnh vực
  note?: string;
  createdAt: string;
}

const now = () => new Date().toISOString().replace('T', ' ').substring(0, 16);
const rid = () => `CUS-${Math.random().toString(36).slice(2, 8)}`;

// Sinh mã khách hàng kế tiếp: KH0001, KH0002...
export const nextCustomerCode = (list: Customer[]): string => {
  const max = list.reduce((mx, c) => {
    const m = /^KH(\d+)$/.exec(c.code);
    return m ? Math.max(mx, Number(m[1])) : mx;
  }, 0);
  return `KH${String(max + 1).padStart(4, '0')}`;
};

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: rid(), code: 'KH0001', name: 'Tập đoàn Viễn thông Quân đội (Viettel)', taxCode: '0100109106', contactPerson: 'Trần Văn Hùng', phone: '024 6255 6789', email: 'hungtv@viettel.com.vn', address: 'Số 1 Trần Hữu Dực, Nam Từ Liêm, Hà Nội', domain: 'GOV', note: 'Khách hàng chiến lược', createdAt: '2026-05-01 09:00' },
  { id: rid(), code: 'KH0002', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN (BIDV)', taxCode: '0100150619', contactPerson: 'Nguyễn Thị Lan', phone: '0243 220 5544', email: 'lan.nt@bidv.com.vn', address: 'Tháp BIDV, 194 Trần Quang Khải, Hà Nội', domain: 'BFSI', createdAt: '2026-05-03 10:30' },
  { id: rid(), code: 'KH0003', name: 'Sở Thông tin và Truyền thông Bắc Ninh', taxCode: '2300112233', contactPerson: 'Lê Quốc Anh', phone: '0222 3822 100', email: 'stttt@bacninh.gov.vn', address: 'TP Bắc Ninh, Bắc Ninh', domain: 'GOV', createdAt: '2026-05-10 14:00' },
  { id: rid(), code: 'KH0004', name: 'Sở Giao thông Vận tải Hà Nội', taxCode: '0100234567', contactPerson: 'Phạm Minh Đức', phone: '0243 8222 111', email: 'sgtvt@hanoi.gov.vn', address: 'Số 2 Phùng Hưng, Hà Đông, Hà Nội', domain: 'GOV', createdAt: '2026-06-01 08:15' },
];

// ===================== Màn hình Quản lý khách hàng =====================
export const CustomersPage: React.FC<{ pakds: Pakd[]; canEdit: boolean; customers: Customer[]; setCustomers: React.Dispatch<React.SetStateAction<Customer[]>> }> = ({ pakds, canEdit, customers, setCustomers }) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);

  const projectCount = (c: Customer) => pakds.filter(p => p.customerCode === c.code || p.customerName.trim().toLowerCase() === c.name.trim().toLowerCase()).length;

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.taxCode || '').includes(search) || (c.contactPerson || '').toLowerCase().includes(q);
  });

  const save = (c: Customer) => {
    setCustomers(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]);
    setEditing(null);
  };
  const remove = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));

  const Th: React.FC<{ children?: React.ReactNode; w?: string; center?: boolean; right?: boolean }> = ({ children, w, center, right }) => (
    <th className={`px-3 py-2 font-semibold border-r border-gray-200 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`} style={{ minWidth: w }}>{children}</th>
  );
  const Td: React.FC<{ children?: React.ReactNode; center?: boolean; right?: boolean; mono?: boolean; muted?: boolean }> = ({ children, center, right, mono, muted }) => (
    <td className={`px-3 py-2 border-r border-gray-200 ${right ? 'text-right' : center ? 'text-center' : 'text-left'} ${mono ? 'font-mono' : ''} ${muted ? 'text-gray-500' : 'text-gray-700'}`}>{children}</td>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <Building2 size={16} className="text-blue-600" />Danh sách khách hàng ({customers.length})
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, mã KH, MST, người liên hệ..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded outline-none focus:border-blue-400" />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
          {canEdit && <button onClick={() => setEditing('new')} className="flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600"><Plus size={14} className="mr-1" />Thêm khách hàng</button>}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <Th w="36px" center>#</Th><Th w="90px">Mã KH</Th><Th w="240px">Tên khách hàng</Th>
              <Th w="110px">Mã số thuế</Th><Th w="140px">Người liên hệ</Th><Th w="120px">Điện thoại</Th>
              <Th w="180px">Email</Th><Th w="90px">Lĩnh vực</Th><Th w="70px" center>Số dự án</Th><Th w="90px" center>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className="border-b border-gray-200 hover:bg-blue-50/40">
                <Td center muted>{i + 1}</Td>
                <Td mono><button onClick={() => setViewing(c)} className="text-blue-600 font-semibold hover:underline">{c.code}</button></Td>
                <Td><span className="font-medium text-gray-800">{c.name}</span></Td>
                <Td mono>{c.taxCode || '—'}</Td>
                <Td>{c.contactPerson || '—'}</Td>
                <Td>{c.phone || '—'}</Td>
                <Td>{c.email || '—'}</Td>
                <Td>{c.domain ? <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{c.domain}</span> : '—'}</Td>
                <Td center><span className="font-semibold text-gray-700">{projectCount(c)}</span></Td>
                <Td center>
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setViewing(c)} title="Xem" className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Eye size={13} /></button>
                    {canEdit && <button onClick={() => setEditing(c)} title="Sửa" className="p-1 text-gray-500 hover:bg-gray-100 rounded"><FileEdit size={13} /></button>}
                    {canEdit && <button onClick={() => { if (window.confirm(`Xóa khách hàng ${c.code} — ${c.name}?`)) remove(c.id); }} title="Xóa" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>}
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center text-gray-400 py-10 text-xs">Không có khách hàng phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>

      {viewing && <CustomerView customer={viewing} projects={pakds.filter(p => p.customerCode === viewing.code || p.customerName.trim().toLowerCase() === viewing.name.trim().toLowerCase())} onClose={() => setViewing(null)} />}
      {editing && <CustomerModal initial={editing === 'new' ? null : editing} suggestedCode={nextCustomerCode(customers)} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
};

// ===================== Modal thêm/sửa =====================
const CustomerModal: React.FC<{ initial: Customer | null; suggestedCode: string; onClose: () => void; onSave: (c: Customer) => void }> = ({ initial, suggestedCode, onClose, onSave }) => {
  const [f, setF] = useState<Customer>(initial || { id: rid(), code: suggestedCode, name: '', taxCode: '', contactPerson: '', phone: '', email: '', address: '', domain: DOMAINS[0], note: '', createdAt: now() });
  const [err, setErr] = useState('');
  const inp = 'w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-400';
  const lab = 'text-[11px] font-semibold text-gray-500';
  const submit = () => {
    if (!f.name.trim()) { setErr('Nhập tên khách hàng.'); return; }
    if (!f.code.trim()) { setErr('Nhập mã khách hàng.'); return; }
    onSave({ ...f, name: f.name.trim(), code: f.code.trim().toUpperCase() });
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
          <h3 className="font-bold text-sm text-gray-900">{initial ? `Sửa khách hàng — ${initial.code}` : 'Thêm khách hàng mới'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        {err && <p className="text-xs text-red-600 font-medium px-5 pt-3">{err}</p>}
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className={lab}>Mã khách hàng *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className={`${inp} font-mono`} /></div>
          <div className="space-y-1"><label className={lab}>Lĩnh vực</label><select value={f.domain} onChange={e => setF({ ...f, domain: e.target.value })} className={inp}>{DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
          <div className="col-span-2 space-y-1"><label className={lab}>Tên khách hàng / Tổ chức *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Mã số thuế</label><input value={f.taxCode} onChange={e => setF({ ...f, taxCode: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Người liên hệ</label><input value={f.contactPerson} onChange={e => setF({ ...f, contactPerson: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Điện thoại</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inp} /></div>
          <div className="space-y-1"><label className={lab}>Email</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inp} /></div>
          <div className="col-span-2 space-y-1"><label className={lab}>Địa chỉ</label><input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className={inp} /></div>
          <div className="col-span-2 space-y-1"><label className={lab}>Ghi chú</label><textarea rows={2} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} className={inp} /></div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button onClick={onClose} className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50">Hủy</button>
          <button onClick={submit} className="flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600">Lưu</button>
        </div>
      </div>
    </div>
  );
};

// ===================== Popup xem chi tiết =====================
const CustomerView: React.FC<{ customer: Customer; projects: Pakd[]; onClose: () => void }> = ({ customer: c, projects, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2"><Building2 size={15} className="text-blue-600" />{c.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>
      <div className="p-5 space-y-3 text-[12px]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Row label="Mã khách hàng" value={c.code} mono />
          <Row label="Lĩnh vực" value={c.domain || '—'} />
          <Row label="Mã số thuế" value={c.taxCode || '—'} mono />
          <Row label="Người liên hệ" value={c.contactPerson || '—'} />
          <Row label="Điện thoại" value={c.phone || '—'} icon={<Phone size={11} />} />
          <Row label="Email" value={c.email || '—'} icon={<Mail size={11} />} />
        </div>
        <Row label="Địa chỉ" value={c.address || '—'} />
        {c.note && <Row label="Ghi chú" value={c.note} />}

        <div className="border-t border-gray-200 pt-3">
          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Dự án của khách hàng ({projects.length})</p>
          {projects.length === 0 ? <p className="text-[11px] text-gray-400 italic">Chưa có dự án.</p> : (
            <ul className="space-y-1">
              {projects.map(p => <li key={p.id} className="text-[11px] text-gray-700"><span className="font-mono text-blue-600 font-semibold">{p.id}</span> — {p.name} {p.masterCode && <span className="text-gray-400 font-mono">({p.masterCode})</span>}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string; mono?: boolean; icon?: React.ReactNode }> = ({ label, value, mono, icon }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className={`text-gray-800 flex items-center gap-1 ${mono ? 'font-mono' : ''}`}>{icon}{value}</p>
  </div>
);
