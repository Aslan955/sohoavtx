// State machine cho PAKD động + phiếu điều chỉnh chi phí. Không phụ thuộc UI.
import {
  Pakd, PakdStatus, UserRole, ApprovalAction, ApprovalRecord, AuditLogEntry,
  ChangeRequest, ChangeRequestStatus, CostChange, ProjectStep, pakdTotalCost,
} from './projectTypes';

const nowStr = () => new Date().toISOString().replace('T', ' ').substring(0, 16);
export const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// ----- Nhãn hiển thị -----
export const PAKD_STATUS_LABEL: Record<PakdStatus, string> = {
  DRAFT: 'Nháp',
  PENDING_BUSINESS_DIRECTOR: 'GĐ Khối',
  PENDING_BOD: 'BOD',
  PENDING_ACCOUNTANT: 'Kế toán',
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

// Luồng duyệt PAKD tuyến tính: trạng thái -> role cần duyệt (bỏ bước IT)
export const PAKD_PENDING_ROLE: Partial<Record<PakdStatus, UserRole>> = {
  PENDING_BUSINESS_DIRECTOR: 'BUSINESS_DIRECTOR',
  PENDING_BOD: 'BOD',
  PENDING_ACCOUNTANT: 'ACCOUNTANT',
};

export const PAKD_FLOW: PakdStatus[] = [
  'DRAFT', 'PENDING_BUSINESS_DIRECTOR', 'PENDING_BOD', 'PENDING_ACCOUNTANT', 'COMPLETED',
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
  return role === 'SALE' && !pakd.locked && (pakd.status === 'DRAFT' || pakd.status === 'RETURNED');
}

// ----- Sale nộp PAKD -----
export function submitPakd(pakd: Pakd, actor: string, log: AuditLogEntry[]): { pakd: Pakd; error?: string } {
  if (pakd.status !== 'DRAFT' && pakd.status !== 'RETURNED') {
    return { pakd, error: 'Chỉ nộp được PAKD khi đang ở trạng thái Nháp hoặc Bị trả lại.' };
  }
  if (pakd.steps.length === 0) {
    return { pakd, error: 'PAKD cần có ít nhất 1 bước thực hiện trước khi nộp.' };
  }
  const old = pakd.status;
  const updated: Pakd = { ...pakd, status: 'PENDING_BUSINESS_DIRECTOR' };
  pushAudit(log, updated, actor, 'SALE', 'Nộp PAKD trình duyệt', old, updated.status, 'Sale nộp PAKD vào hàng đợi phê duyệt GĐ Khối.');
  return { pakd: updated };
}

function generateCodes(pakd: Pakd): Pick<Pakd, 'masterCode' | 'businessCode' | 'productionCode'> {
  const seq = Math.floor(100 + Math.random() * 899);
  const master = `022.${seq}`;
  return { masterCode: master, businessCode: `${master}.1`, productionCode: `${master}.2` };
}

const PAKD_NEXT_ON_APPROVE: Partial<Record<PakdStatus, PakdStatus>> = {
  PENDING_BUSINESS_DIRECTOR: 'PENDING_BOD',
  PENDING_BOD: 'PENDING_ACCOUNTANT',
  PENDING_ACCOUNTANT: 'COMPLETED', // Kế toán duyệt là hoàn tất (bỏ bước IT)
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

  if (action === 'REJECT') {
    updated.status = 'RETURNED';
    record.newStatus = 'RETURNED';
    pushAudit(log, updated, actor, role, `Trả lại (${stepLabel})`, old, 'RETURNED', record.comment);
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

  // Kế toán duyệt (-> COMPLETED) -> hệ thống tự tạo dự án Jira
  if (pakd.status === 'PENDING_ACCOUNTANT') {
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
