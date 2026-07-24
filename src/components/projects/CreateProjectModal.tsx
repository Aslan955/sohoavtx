import React, { useMemo, useState } from 'react';
import { Plus, X, Briefcase, FileEdit, ShieldCheck, Check } from 'lucide-react';
import { Pakd, ProjectKind, PROJECT_KIND_LABEL } from './projectTypes';
import { canBeParent, childOfKind } from './projectWorkflow';

type Choice = 'MAIN' | ProjectKind;

const OPTIONS: { key: Choice; title: string; desc: string; icon: React.ReactNode; accent: string }[] = [
  {
    key: 'MAIN', title: 'Dự án mới', desc: 'Cấp mã tổng mới kèm mã kinh doanh (.1) và mã sản xuất (.2).',
    icon: <Briefcase size={17} />, accent: 'blue',
  },
  {
    key: 'CR', title: 'Dự án CR', desc: 'Phát sinh thay đổi sau khi sản xuất xong. Mã = mã tổng của dự án cha + .3',
    icon: <FileEdit size={17} />, accent: 'purple',
  },
  {
    key: 'WARRANTY', title: 'Dự án Bảo hành', desc: 'Bảo hành sau bàn giao. Mã = mã tổng của dự án cha + .4',
    icon: <ShieldCheck size={17} />, accent: 'teal',
  },
];

const ACCENT: Record<string, { on: string; icon: string }> = {
  blue: { on: 'border-blue-500 bg-blue-50', icon: 'text-blue-600' },
  purple: { on: 'border-purple-500 bg-purple-50', icon: 'text-purple-600' },
  teal: { on: 'border-teal-500 bg-teal-50', icon: 'text-teal-600' },
};

export const CreateProjectModal: React.FC<{
  pakds: Pakd[];
  onClose: () => void;
  onCreateMain: () => void;
  onCreateChild: (parentId: string, kind: ProjectKind) => void;
}> = ({ pakds, onClose, onCreateMain, onCreateChild }) => {
  const [choice, setChoice] = useState<Choice>('MAIN');
  const [parentId, setParentId] = useState('');
  const [err, setErr] = useState('');

  // Dự án chính đã có mã tổng — ứng viên làm cha.
  const parents = useMemo(() => pakds.filter(canBeParent), [pakds]);

  // Với loại đang chọn, dự án nào đã mở rồi thì đánh dấu để người dùng biết trước khi bấm.
  const kind = choice === 'MAIN' ? null : choice;
  const takenBy = (p: Pakd) => (kind ? childOfKind(pakds, p.id, kind) : undefined);
  const available = kind ? parents.filter(p => !takenBy(p)) : parents;

  const selected = parents.find(p => p.id === parentId);
  const previewCode = kind && selected ? `${selected.masterCode}.${kind === 'CR' ? '3' : '4'}` : '';

  const submit = () => {
    if (choice === 'MAIN') { onCreateMain(); return; }
    if (!parentId) { setErr('Chọn dự án cha để lấy mã tổng.'); return; }
    onCreateChild(parentId, choice);
  };

  const pick = (c: Choice) => { setChoice(c); setErr(''); if (c === 'MAIN') setParentId(''); };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start border-b border-gray-200 px-5 py-3">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Tạo dự án</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Chọn loại dự án cần mở. Dự án tạo ra ở trạng thái <b>nháp</b>, sửa tiếp trước khi nộp duyệt.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={17} /></button>
        </div>

        <div className="p-5 space-y-3">
          {err && <p className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-200 rounded px-2 py-1.5">{err}</p>}

          <div className="space-y-2">
            {OPTIONS.map(o => {
              const on = choice === o.key;
              const a = ACCENT[o.accent];
              return (
                <button key={o.key} type="button" onClick={() => pick(o.key)}
                  className={`w-full flex items-start gap-3 text-left border rounded-lg px-3 py-2.5 transition-colors ${on ? a.on : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <span className={`mt-0.5 shrink-0 ${on ? a.icon : 'text-gray-400'}`}>{o.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-gray-800">{o.title}</span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">{o.desc}</span>
                  </span>
                  {on && <Check size={15} className={`shrink-0 mt-0.5 ${a.icon}`} />}
                </button>
              );
            })}
          </div>

          {kind && (
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              <label className="text-[11px] font-semibold text-gray-500">
                Dự án cha * <span className="text-gray-400 font-normal">(lấy mã tổng từ dự án này)</span>
              </label>
              {parents.length === 0 ? (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  Chưa có dự án nào được cấp mã tổng. Tạo và cấp mã cho dự án chính trước đã.
                </p>
              ) : available.length === 0 ? (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  Mọi dự án đều đã có {PROJECT_KIND_LABEL[kind]} rồi. Mỗi dự án chỉ mở được 1 CR và 1 Bảo hành.
                </p>
              ) : (
                <>
                  <select value={parentId} onChange={(e) => { setParentId(e.target.value); setErr(''); }}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-400">
                    <option value="">— Chọn dự án cha —</option>
                    {available.map(p => (
                      <option key={p.id} value={p.id}>{p.masterCode} — {p.name || '(chưa đặt tên)'}</option>
                    ))}
                  </select>
                  {previewCode && (
                    <p className="text-[10px] text-gray-500">
                      Mã {PROJECT_KIND_LABEL[kind]} sẽ là <b className="font-mono text-blue-700">{previewCode}</b>
                      <span className="text-gray-400"> — ngang hàng với {selected?.businessCode} và {selected?.productionCode}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
          <button type="button" onClick={submit} disabled={!!kind && available.length === 0}
            className="flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus size={13} className="mr-1" />Tạo {choice === 'MAIN' ? 'dự án' : PROJECT_KIND_LABEL[choice]}
          </button>
        </div>
      </div>
    </div>
  );
};
