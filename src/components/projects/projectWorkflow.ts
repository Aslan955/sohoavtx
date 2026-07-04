// State machine cho PAKD động + phiếu điều chỉnh chi phí. Không phụ thuộc UI.
import {
  Pakd, PakdStatus, UserRole, ApprovalAction, ApprovalRecord, AuditLogEntry,
  ChangeRequest, ChangeRequestStatus, CostChange, ProjectStep, BudgetAdjustment, BudgetAdjStatus, pakdTotalCost,
} from './projectTypes';

const nowStr = () => new Date().toISOString().replace('T', ' ').substring(0, 16);
export const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// ----- Nhãn hiển thị -----
export const PAKD_STATUS_LABEL: Record<PakdStatus, string> = {
  DRAFT: 'Nháp',
  PENDING_SALES_DIRECTOR: 'GĐ Kinh doanh',
  PENDING_BUSINESS_DIRECTOR: 'GĐ Khối',
  PENDING_ACCOUNTANT: 'Kế toán',
  PENDING_BOD: 'BOD',
  PENDING_IT: 'IT',
  COMPLETED: 'Hoàn tất',
  RETURNED: 'Bị trả lại',
};

export const CR_STATUS_LABEL: Record<ChangeRequestStatus, string> = {
  DRAFT: 'Nháp',
  PENDING_BUSINESS_DIRECTOR: 'GĐ Khối',
  PENDING_BOD: 'BOD',
  PENDING_ACCOUNTANT: 'Kế toán',
  APPROVED: 'Đã duyệt (đã áp dụng)',
  REJECTED: 'Từ chối',
};

// Luồng duyệt PAKD: AM(Sale) -> GĐ Kinh doanh -> GĐ Khối -> Kế toán -> BOD -> Hoàn tất
export const PAKD_PENDING_ROLE: Partial<Record<PakdStatus, UserRole>> = {
  PENDING_SALES_DIRECTOR: 'SALES_DIRECTOR',
  PENDING_BUSINESS_DIRECTOR: 'BUSINESS_DIRECTOR',
  PENDING_ACCOUNTANT: 'ACCOUNTANT',
  PENDING_BOD: 'BOD',
};

export const PAKD_FLOW: PakdStatus[] = [
  'DRAFT', 'PENDING_SALES_DIRECTOR', 'PENDING_BUSINESS_DIRECTOR', 'PENDING_ACCOUNTANT', 'PENDING_BOD', 'COMPLETED',
];

// Luồng duyệt phiếu điều chỉnh: GĐ Khối -> BOD -> Kế toán
export const CR_PENDING_ROLE: Partial<Record<ChangeRequestStatus, UserRole>> = {
  PENDING_BUSINESS_DIRECTOR: 'BUSINESS_DIRECTOR',
  PENDING_BOD: 'BOD',
  PENDING_ACCOUNTANT: 'ACCOUNTANT',
};

function pushAudit(log: AuditLogEntry[], pakd: Pakd, actor: string, role: UserRole, action: string, oldStatus: string | undefined, newStatus: string | undefined, note: string) {
  log.unshift({ id: rid('LOG'), pakdId: pakd.id, actor, role, action, oldStatus, newStatus, note, createdAt: nowStr() });
}

// ----- Quyền chỉnh sửa cấu trúc/chi phí trực tiếp -----
// Sale chỉ sửa trực tiếp khi PAKD chưa khóa và đang ở Nháp/Bị trả lại.
export function canEditDirect(pakd: Pakd, role: UserRole): boolean {
  // AM / GĐ Kinh doanh / GĐ Khối đều có thể tạo & sửa phương án ở trạng thái Nháp / Bị trả lại.
  return ['SALE', 'SALES_DIRECTOR', 'BUSINESS_DIRECTOR'].includes(role) && !pakd.locked && (pakd.status === 'DRAFT' || pakd.status === 'RETURNED');
}

// ----- Nộp PAKD (AM / GĐ Kinh doanh / GĐ Khối) -----
export function submitPakd(pakd: Pakd, actor: string, log: AuditLogEntry[], role: UserRole = 'SALE'): { pakd: Pakd; error?: string } {
  if (pakd.status !== 'DRAFT' && pakd.status !== 'RETURNED') {
    return { pakd, error: 'Chỉ nộp được PAKD khi đang ở trạng thái Nháp hoặc Bị trả lại.' };
  }
  if (pakd.steps.length === 0) {
    return { pakd, error: 'PAKD cần có ít nhất 1 bước thực hiện trước khi nộp.' };
  }
  const old = pakd.status;
  // Ghi mốc "nộp trình duyệt" vào lịch sử phê duyệt để hiển thị đủ luồng từ người lập → BOD.
  const submitRecord: ApprovalRecord = {
    id: rid('AR'), stepLabel: 'Người lập nộp trình duyệt', role, actor, action: 'SUBMIT',
    comment: old === 'RETURNED' ? 'Chỉnh sửa & nộp lại sau khi bị trả lại.' : 'Nộp phương án vào hàng đợi phê duyệt.',
    oldStatus: old, newStatus: 'PENDING_SALES_DIRECTOR', createdAt: nowStr(),
  };
  const updated: Pakd = { ...pakd, status: 'PENDING_SALES_DIRECTOR', approvalHistory: [submitRecord, ...pakd.approvalHistory] };
  pushAudit(log, updated, actor, role, 'Nộp PAKD trình duyệt', old, updated.status, 'Nộp PAKD vào hàng đợi phê duyệt Giám đốc Kinh doanh.');
  return { pakd: updated };
}

// Các đuôi mã bị loại trừ (2 chữ số cuối) — không cấp cho mã dự án.
const EXCLUDED_CODE_SUFFIXES = [49, 53];

function generateCodes(pakd: Pakd): Pick<Pakd, 'masterCode' | 'businessCode' | 'productionCode'> {
  let seq = Math.floor(100 + Math.random() * 899);
  // Bỏ qua các mã có đuôi (2 chữ số cuối) nằm trong danh sách loại trừ.
  while (EXCLUDED_CODE_SUFFIXES.includes(seq % 100)) {
    seq = Math.floor(100 + Math.random() * 899);
  }
  const master = `022.${seq}`;
  return { masterCode: master, businessCode: `${master}.1`, productionCode: `${master}.2` };
}

const PAKD_NEXT_ON_APPROVE: Partial<Record<PakdStatus, PakdStatus>> = {
  PENDING_SALES_DIRECTOR: 'PENDING_BUSINESS_DIRECTOR',
  PENDING_BUSINESS_DIRECTOR: 'PENDING_ACCOUNTANT',
  PENDING_ACCOUNTANT: 'PENDING_BOD',
  PENDING_BOD: 'COMPLETED', // BOD duyệt là hoàn tất
};

// ----- Phê duyệt PAKD (1 cấp) -----
export function approvePakd(pakd: Pakd, role: UserRole, action: ApprovalAction, comment: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const requiredRole = PAKD_PENDING_ROLE[pakd.status];
  if (!requiredRole) return { pakd, error: 'PAKD không ở trạng thái chờ phê duyệt.' };
  if (requiredRole !== role) return { pakd, error: 'Bạn không có quyền phê duyệt bước này.' };

  const old = pakd.status;
  const stepLabel = PAKD_STATUS_LABEL[pakd.status];
  const record: ApprovalRecord = {
    id: rid('AR'), stepLabel, role, actor, action,
    comment: comment.trim() || (action === 'APPROVE' ? 'Đồng ý phê duyệt.' : 'Trả lại, yêu cầu chỉnh sửa.'),
    oldStatus: old, newStatus: old, createdAt: nowStr(),
  };
  let updated: Pakd = { ...pakd, approvalHistory: [record, ...pakd.approvalHistory] };

  if (action === 'REJECT' || action === 'REQUEST_REVISION') {
    updated.status = 'RETURNED';
    record.newStatus = 'RETURNED';
    const label = action === 'REJECT' ? 'Từ chối' : 'Yêu cầu bổ sung thông tin';
    pushAudit(log, updated, actor, role, `${label} (${stepLabel})`, old, 'RETURNED', record.comment);
    return { pakd: updated };
  }

  // APPROVE
  const next = PAKD_NEXT_ON_APPROVE[pakd.status]!;
  updated.status = next;
  record.newStatus = next;

  // GĐ Khối duyệt -> sinh 3 mã + khóa chi phí
  if (pakd.status === 'PENDING_BUSINESS_DIRECTOR' && !updated.masterCode) {
    const codes = generateCodes(updated);
    updated = { ...updated, ...codes, locked: true };
    pushAudit(log, updated, 'SYSTEM', 'ADMIN', 'Sinh mã & khóa chi phí', old, next, `Mã tổng ${codes.masterCode}, Mã KD ${codes.businessCode}, Mã SX ${codes.productionCode}. Chi phí đã khóa — mọi thay đổi sau đây phải qua phiếu điều chỉnh.`);
  }

  // BOD duyệt (-> COMPLETED) -> hệ thống tự tạo dự án Jira
  if (pakd.status === 'PENDING_BOD') {
    const key = pakd.customerCode.substring(0, 6).toUpperCase();
    updated = { ...updated, jiraKey: key, jiraUrl: `https://vtx-jira.atlassian.net/projects/${key}` };
    pushAudit(log, updated, 'SYSTEM', 'ADMIN', 'Tạo dự án Jira', old, next, `Đã tạo project Jira ${key}.`);
  }

  pushAudit(log, updated, actor, role, `Phê duyệt (${stepLabel})`, old, next, record.comment);
  return { pakd: updated };
}

// ===================== Phiếu điều chỉnh chi phí =====================

export function createChangeRequest(pakd: Pakd, reason: string, changes: CostChange[], actor: string): { pakd: Pakd; error?: string } {
  if (!pakd.locked) return { pakd, error: 'PAKD chưa khóa, có thể sửa chi phí trực tiếp, không cần phiếu điều chỉnh.' };
  if (changes.length === 0) return { pakd, error: 'Phiếu điều chỉnh cần có ít nhất 1 thay đổi.' };
  const cr: ChangeRequest = {
    id: rid('CR'), pakdId: pakd.id, createdBy: actor, createdAt: nowStr(),
    status: 'PENDING_BUSINESS_DIRECTOR', reason, changes, approvalHistory: [],
  };
  return { pakd: { ...pakd, changeRequests: [cr, ...pakd.changeRequests] } };
}

const CR_NEXT_ON_APPROVE: Partial<Record<ChangeRequestStatus, ChangeRequestStatus>> = {
  PENDING_BUSINESS_DIRECTOR: 'PENDING_BOD',
  PENDING_BOD: 'PENDING_ACCOUNTANT',
  PENDING_ACCOUNTANT: 'APPROVED',
};

function applyChanges(pakd: Pakd, cr: ChangeRequest): Pakd {
  const before = pakdTotalCost(pakd);
  const steps: ProjectStep[] = pakd.steps.map(s => ({ ...s, costItems: [...s.costItems] }));

  for (const ch of cr.changes) {
    const step = steps.find(s => s.id === ch.stepId);
    if (!step) continue;
    if (ch.op === 'ADD') {
      step.costItems.push({ id: rid('CST'), name: ch.costName, costType: ch.costType, amount: ch.newAmount || 0 });
    } else if (ch.op === 'EDIT' && ch.targetCostId) {
      step.costItems = step.costItems.map(ci => ci.id === ch.targetCostId ? { ...ci, name: ch.costName || ci.name, costType: ch.costType || ci.costType, amount: ch.newAmount ?? ci.amount } : ci);
    } else if (ch.op === 'DELETE' && ch.targetCostId) {
      step.costItems = step.costItems.filter(ci => ci.id !== ch.targetCostId);
    }
  }

  const updated: Pakd = { ...pakd, steps };
  const after = pakdTotalCost(updated);
  updated.version = pakd.version + 1;
  updated.versionHistory = [
    { version: updated.version, createdAt: nowStr(), changeRequestId: cr.id, reason: cr.reason, totalCostBefore: before, totalCostAfter: after },
    ...pakd.versionHistory,
  ];
  return updated;
}

// Phê duyệt một phiếu điều chỉnh (1 cấp). Khi qua hết Kế toán -> áp dụng vào PAKD.
export function approveChangeRequest(pakd: Pakd, crId: string, role: UserRole, action: ApprovalAction, comment: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const cr = pakd.changeRequests.find(c => c.id === crId);
  if (!cr) return { pakd, error: 'Không tìm thấy phiếu điều chỉnh.' };
  const requiredRole = CR_PENDING_ROLE[cr.status];
  if (!requiredRole) return { pakd, error: 'Phiếu điều chỉnh không ở trạng thái chờ duyệt.' };
  if (requiredRole !== role) return { pakd, error: 'Bạn không có quyền duyệt phiếu điều chỉnh ở bước này.' };

  const old = cr.status;
  const record: ApprovalRecord = {
    id: rid('AR'), stepLabel: CR_STATUS_LABEL[cr.status], role, actor, action,
    comment: comment.trim() || (action === 'APPROVE' ? 'Đồng ý.' : 'Từ chối.'),
    oldStatus: old, newStatus: old, createdAt: nowStr(),
  };

  let newStatus: ChangeRequestStatus = action === 'REJECT' ? 'REJECTED' : CR_NEXT_ON_APPROVE[cr.status]!;
  record.newStatus = newStatus;
  const updatedCr: ChangeRequest = { ...cr, status: newStatus, approvalHistory: [record, ...cr.approvalHistory] };

  let updatedPakd: Pakd = { ...pakd, changeRequests: pakd.changeRequests.map(c => c.id === crId ? updatedCr : c) };

  if (newStatus === 'APPROVED') {
    updatedPakd = applyChanges(updatedPakd, updatedCr);
    updatedPakd.changeRequests = updatedPakd.changeRequests.map(c => c.id === crId ? updatedCr : c);
    pushAudit(log, updatedPakd, actor, role, 'Áp dụng phiếu điều chỉnh chi phí', `v${pakd.version}`, `v${updatedPakd.version}`, `Phiếu ${crId} đã duyệt & áp dụng. Lý do: ${cr.reason}`);
  } else if (newStatus === 'REJECTED') {
    pushAudit(log, updatedPakd, actor, role, 'Từ chối phiếu điều chỉnh', CR_STATUS_LABEL[old], 'Từ chối', record.comment);
  } else {
    pushAudit(log, updatedPakd, actor, role, `Duyệt phiếu điều chỉnh (${CR_STATUS_LABEL[old]})`, CR_STATUS_LABEL[old], CR_STATUS_LABEL[newStatus], record.comment);
  }

  return { pakd: updatedPakd };
}

// ===================== Điều chỉnh ngân sách theo giai đoạn (GĐ Khối → BOD) =====================
export const BA_PENDING_ROLE: Record<string, UserRole> = {
  PENDING_BUSINESS_DIRECTOR: 'BUSINESS_DIRECTOR',
  PENDING_BOD: 'BOD',
};
export const BA_NEXT: Record<string, string> = {
  PENDING_BUSINESS_DIRECTOR: 'PENDING_BOD',
  PENDING_BOD: 'APPROVED',
};
export const BA_STATUS_LABEL: Record<string, string> = {
  PENDING_BUSINESS_DIRECTOR: 'Chờ GĐ Khối duyệt',
  PENDING_BOD: 'Chờ BOD duyệt',
  APPROVED: 'Đã duyệt (đã áp dụng)',
  REJECTED: 'Từ chối',
};

export function createBudgetAdjustment(pakd: Pakd, stepId: string, after: { business: number; production: number }, reason: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const step = pakd.steps.find(s => s.id === stepId);
  if (!step) return { pakd, error: 'Không tìm thấy giai đoạn.' };
  if (!reason.trim()) return { pakd, error: 'Nhập lý do điều chỉnh ngân sách.' };
  const before = { business: step.businessBudget || 0, production: step.productionBudget || 0 };
  if (before.business === after.business && before.production === after.production) return { pakd, error: 'Ngân sách mới không thay đổi so với hiện tại.' };
  if ((step.budgetAdjustments || []).some(a => ['PENDING_BUSINESS_DIRECTOR', 'PENDING_ACCOUNTANT', 'PENDING_BOD'].includes(a.status)))
    return { pakd, error: 'Giai đoạn đang có phiếu điều chỉnh ngân sách chờ duyệt.' };
  const adj = { id: rid('BA'), createdAt: nowStr(), requestedBy: actor, reason, before, after, status: 'PENDING_BUSINESS_DIRECTOR' as const, approvals: [] };
  const updated: Pakd = { ...pakd, steps: pakd.steps.map(s => s.id === stepId ? { ...s, budgetAdjustments: [adj, ...(s.budgetAdjustments || [])] } : s) };
  pushAudit(log, updated, actor, 'SALE', 'Tạo phiếu điều chỉnh ngân sách', undefined, undefined, `[${step.name}] ${fmt(before.business + before.production)} → ${fmt(after.business + after.production)}. Lý do: ${reason}`);
  return { pakd: updated };
}

export function decideBudgetAdjustment(pakd: Pakd, stepId: string, adjId: string, role: UserRole, action: ApprovalAction, comment: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const step = pakd.steps.find(s => s.id === stepId);
  const adj = step?.budgetAdjustments?.find(a => a.id === adjId);
  if (!step || !adj) return { pakd, error: 'Không tìm thấy phiếu điều chỉnh.' };
  if (BA_PENDING_ROLE[adj.status] !== role) return { pakd, error: 'Bạn không có quyền duyệt phiếu ở bước này.' };
  const newStatus = action === 'REJECT' ? 'REJECTED' : BA_NEXT[adj.status];
  const newAdj = { ...adj, status: newStatus as any, approvals: [...adj.approvals, { role, actor, action, at: nowStr(), comment }] };
  let updated: Pakd = { ...pakd, steps: pakd.steps.map(s => s.id === stepId ? { ...s, budgetAdjustments: (s.budgetAdjustments || []).map(a => a.id === adjId ? newAdj : a) } : s) };
  if (newStatus === 'APPROVED') {
    updated = { ...updated, steps: updated.steps.map(s => s.id === stepId ? { ...s, businessBudget: adj.after.business, productionBudget: adj.after.production } : s) };
    pushAudit(log, updated, actor, role, 'Áp dụng điều chỉnh ngân sách', undefined, undefined, `[${step.name}] ${fmt(adj.before.business + adj.before.production)} → ${fmt(adj.after.business + adj.after.production)}`);
  } else {
    pushAudit(log, updated, actor, role, action === 'REJECT' ? 'Từ chối phiếu điều chỉnh ngân sách' : `Duyệt phiếu điều chỉnh ngân sách (${BA_STATUS_LABEL[adj.status]})`, undefined, undefined, `[${step.name}] ${comment || ''}`);
  }
  return { pakd: updated };
}

const fmt = (v: number) => v.toLocaleString('vi-VN') + ' đ';

// Mở mã outsource — mã con của mã sản xuất (chỉ khi đã có mã sản xuất, không trùng).
export function openOutsourceCode(pakd: Pakd, label: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  if (!pakd.productionCode) return { pakd, error: 'Chưa có mã sản xuất để mở mã outsource.' };
  if (!label.trim()) return { pakd, error: 'Nhập nội dung thuê ngoài cho mã outsource.' };
  const next = pakd.outsourceCodes.length + 1;
  const code = `${pakd.productionCode}.${next}`;
  if (pakd.outsourceCodes.some(o => o.code === code)) return { pakd, error: 'Mã outsource đã tồn tại.' };
  const updated: Pakd = { ...pakd, outsourceCodes: [...pakd.outsourceCodes, { id: rid('OS'), code, label }] };
  pushAudit(log, updated, actor, 'SALE', 'Mở mã outsource', undefined, undefined, `Mã ${code} — ${label}`);
  return { pakd: updated };
}

// PAKD đang có phiếu điều chỉnh mở (đang chờ duyệt)?
export function hasOpenChangeRequest(pakd: Pakd): boolean {
  return pakd.changeRequests.some(c => ['PENDING_BUSINESS_DIRECTOR', 'PENDING_BOD', 'PENDING_ACCOUNTANT'].includes(c.status));
}


// ===================== Duyệt chuyển giai đoạn (AM → GĐ Kinh doanh → GĐ Khối → Kế toán → BOD) =====================
type AdvStatus = 'PENDING_SALES_DIRECTOR' | 'PENDING_BUSINESS_DIRECTOR' | 'PENDING_ACCOUNTANT' | 'PENDING_BOD';
export const ADV_STEPS: AdvStatus[] = ['PENDING_SALES_DIRECTOR', 'PENDING_BUSINESS_DIRECTOR', 'PENDING_ACCOUNTANT', 'PENDING_BOD'];
export const ADV_LABEL: Record<AdvStatus, string> = {
  PENDING_SALES_DIRECTOR: 'GĐ Kinh doanh', PENDING_BUSINESS_DIRECTOR: 'GĐ Khối', PENDING_ACCOUNTANT: 'Kế toán', PENDING_BOD: 'BOD',
};
export const ADV_PENDING_ROLE: Record<AdvStatus, UserRole> = {
  PENDING_SALES_DIRECTOR: 'SALES_DIRECTOR', PENDING_BUSINESS_DIRECTOR: 'BUSINESS_DIRECTOR', PENDING_ACCOUNTANT: 'ACCOUNTANT', PENDING_BOD: 'BOD',
};
const ADV_NEXT: Record<AdvStatus, AdvStatus | null> = {
  PENDING_SALES_DIRECTOR: 'PENDING_BUSINESS_DIRECTOR', PENDING_BUSINESS_DIRECTOR: 'PENDING_ACCOUNTANT', PENDING_ACCOUNTANT: 'PENDING_BOD', PENDING_BOD: null,
};

export function requestPhaseAdvance(pakd: Pakd, stepId: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const step = pakd.steps.find(s => s.id === stepId);
  if (!step) return { pakd, error: 'Không tìm thấy giai đoạn.' };
  if (step.order >= pakd.steps.length) return { pakd, error: 'Đây là giai đoạn cuối, không có giai đoạn kế tiếp.' };
  if (step.advanceStatus) return { pakd, error: 'Đang có đề nghị chuyển giai đoạn chờ duyệt.' };
  const updated: Pakd = { ...pakd, steps: pakd.steps.map(s => s.id === stepId ? { ...s, advanceStatus: 'PENDING_SALES_DIRECTOR', advanceApprovals: [] } : s) };
  pushAudit(log, updated, actor, 'SALE', `Đề nghị chuyển giai đoạn (${step.name} → giai đoạn kế tiếp)`, undefined, undefined, 'AM đề nghị hoàn thành giai đoạn, trình duyệt chuyển bước.');
  return { pakd: updated };
}

export function decidePhaseAdvance(pakd: Pakd, stepId: string, role: UserRole, action: ApprovalAction, comment: string, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const step = pakd.steps.find(s => s.id === stepId);
  if (!step || !step.advanceStatus) return { pakd, error: 'Không có đề nghị chuyển giai đoạn.' };
  const st = step.advanceStatus as AdvStatus;
  if (ADV_PENDING_ROLE[st] !== role) return { pakd, error: 'Bạn không có quyền duyệt bước này.' };
  const approvals = [...(step.advanceApprovals || []), { role, actor, action, at: nowStr(), comment }];

  if (action === 'REJECT' || action === 'REQUEST_REVISION') {
    const label = action === 'REJECT' ? 'Từ chối' : 'Yêu cầu bổ sung';
    const updated: Pakd = { ...pakd, steps: pakd.steps.map(s => s.id === stepId ? { ...s, advanceStatus: undefined, advanceApprovals: approvals } : s) };
    pushAudit(log, updated, actor, role, `${label} chuyển giai đoạn (${step.name})`, undefined, undefined, comment || '');
    return { pakd: updated };
  }

  const next = ADV_NEXT[st];
  if (next) {
    const updated: Pakd = { ...pakd, steps: pakd.steps.map(s => s.id === stepId ? { ...s, advanceStatus: next, advanceApprovals: approvals } : s) };
    pushAudit(log, updated, actor, role, `Duyệt chuyển giai đoạn (${ADV_LABEL[st]}) — ${step.name}`, ADV_LABEL[st], ADV_LABEL[next], comment || '');
    return { pakd: updated };
  }
  // BOD duyệt cuối -> chuyển sang giai đoạn kế tiếp
  const updated: Pakd = {
    ...pakd,
    currentPhase: step.order + 1,
    steps: pakd.steps.map(s => s.id === stepId ? { ...s, advanceStatus: undefined, advanceApprovals: approvals } : s),
  };
  pushAudit(log, updated, actor, role, `Duyệt hoàn tất — chuyển sang giai đoạn kế tiếp (KH${String(step.order + 1).padStart(2, '0')})`, undefined, undefined, 'Đủ GĐ Kinh doanh → GĐ Khối → Kế toán → BOD.');
  return { pakd: updated };
}

// ===================== Phiếu điều chỉnh phương án — mở lại & duyệt lại từ đầu =====================
export function revisePlan(pakd: Pakd, reason: string, actor: string, role: UserRole, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  if (pakd.status === 'DRAFT') return { pakd, error: 'PAKD đang ở Nháp — có thể sửa trực tiếp, không cần phiếu điều chỉnh.' };
  if (!reason.trim()) return { pakd, error: 'Nhập lý do điều chỉnh phương án.' };
  const fromStatus = PAKD_STATUS_LABEL[pakd.status];
  const snapshot = pakd.steps.map((s, i) => ({
    code: `KH${String(i + 1).padStart(2, '0')}`, name: s.name, start: s.startDate, end: s.endDate,
    objective: s.objective, output: s.output, biz: s.businessBudget || 0, prod: s.productionBudget || 0, revenue: s.revenue || 0,
  }));
  const rev = { id: rid('REV'), at: nowStr(), by: actor, role, reason, fromStatus, version: pakd.version, snapshot };
  const updated: Pakd = {
    ...pakd,
    status: 'DRAFT',
    locked: false,
    version: pakd.version + 1,
    planRevisions: [rev, ...(pakd.planRevisions || [])],
  };
  pushAudit(log, updated, actor, role, 'Tạo phiếu điều chỉnh phương án — mở lại chỉnh sửa, duyệt lại từ đầu', fromStatus, 'Nháp', reason);
  return { pakd: updated };
}

// ===================== Cập nhật chi thực tế đã chi cho giai đoạn (AM/GĐ KD/GĐ Khối) =====================
// Mỗi lần cập nhật là một KHOẢN CHI của lần đó (increment). Tổng chi = cộng dồn các lần.
export function updateActualSpent(pakd: Pakd, stepId: string, increment: number, actor: string, role: UserRole, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  const step = pakd.steps.find(s => s.id === stepId);
  if (!step) return { pakd, error: 'Không tìm thấy giai đoạn.' };
  if (!increment || increment === 0) return { pakd }; // không ghi khoản 0
  const prev = step.actualSpent || 0;
  const total = prev + increment;
  const entry = { at: nowStr(), by: actor, role, amount: increment };
  const updated: Pakd = { ...pakd, steps: pakd.steps.map(s => s.id === stepId ? { ...s, actualSpent: total, spentLog: [entry, ...(s.spentLog || [])] } : s) };
  pushAudit(log, updated, actor, role, `Cập nhật chi thực tế (${step.name})`, undefined, undefined, `Lần ${(step.spentLog?.length || 0) + 1}: +${increment.toLocaleString('vi-VN')} đ → tổng ${total.toLocaleString('vi-VN')} đ`);
  return { pakd: updated };
}

// ===================== Sửa phương án khi ĐANG DUYỆT — duyệt lại từ bước người sửa =====================
const EDIT_RESUME_STATUS: Partial<Record<UserRole, PakdStatus>> = {
  SALE: 'PENDING_SALES_DIRECTOR',          // AM sửa -> duyệt lại từ GĐ Kinh doanh
  SALES_DIRECTOR: 'PENDING_SALES_DIRECTOR', // GĐ KD sửa -> duyệt lại từ bước GĐ KD
  BUSINESS_DIRECTOR: 'PENDING_BUSINESS_DIRECTOR', // GĐ Khối sửa -> duyệt lại từ bước GĐ Khối
};
const EDIT_ALLOWED_ROLES: UserRole[] = ['SALE', 'SALES_DIRECTOR', 'BUSINESS_DIRECTOR'];

export function canEditPlanNow(pakd: Pakd, role: UserRole): boolean {
  return pakd.editingRole === role;
}

export function startEditDuringApproval(pakd: Pakd, role: UserRole, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  if (!EDIT_ALLOWED_ROLES.includes(role)) return { pakd, error: 'Chỉ AM / GĐ Kinh doanh / GĐ Khối được sửa phương án.' };
  if (!PAKD_PENDING_ROLE[pakd.status]) return { pakd, error: 'Chỉ sửa khi PAKD đang chờ duyệt.' };
  if (pakd.editingRole) return { pakd, error: `Phương án đang được ${pakd.editingRole} chỉnh sửa.` };
  const snapshot = pakd.steps.map((s, i) => ({ code: `KH${String(i + 1).padStart(2, '0')}`, name: s.name, start: s.startDate, end: s.endDate, objective: s.objective, output: s.output, biz: s.businessBudget || 0, prod: s.productionBudget || 0, revenue: s.revenue || 0 }));
  const updated: Pakd = { ...pakd, editingRole: role, editingSnapshot: snapshot, locked: false };
  pushAudit(log, updated, actor, role, 'Bắt đầu sửa phương án (đang duyệt)', PAKD_STATUS_LABEL[pakd.status], PAKD_STATUS_LABEL[pakd.status], 'Tạm dừng duyệt để chỉnh sửa thông tin.');
  return { pakd: updated };
}

export function submitEditDuringApproval(pakd: Pakd, role: UserRole, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  if (pakd.editingRole !== role) return { pakd, error: 'Bạn không đang ở chế độ sửa phương án.' };
  const resume = EDIT_RESUME_STATUS[role]!;
  const old = pakd.status;
  const rev = { id: rid('REV'), at: nowStr(), by: actor, role, reason: `Sửa phương án khi đang duyệt — duyệt lại từ bước ${PAKD_STATUS_LABEL[resume]}`, fromStatus: PAKD_STATUS_LABEL[old], version: pakd.version, snapshot: pakd.editingSnapshot || [] };
  const updated: Pakd = { ...pakd, editingRole: undefined, editingSnapshot: undefined, status: resume, version: pakd.version + 1, planRevisions: [rev, ...(pakd.planRevisions || [])] };
  pushAudit(log, updated, actor, role, 'Sửa phương án & yêu cầu duyệt lại', PAKD_STATUS_LABEL[old], PAKD_STATUS_LABEL[resume], `Duyệt lại từ bước ${PAKD_STATUS_LABEL[resume]}.`);
  return { pakd: updated };
}
