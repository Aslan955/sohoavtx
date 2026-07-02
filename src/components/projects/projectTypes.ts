// Types cho module PLM — PAKD động (bước + chi phí) với khóa sau duyệt & phiếu điều chỉnh.
// Xem docs/ERD.md cho thiết kế bảng dữ liệu tương ứng khi triển khai backend thật.

export type UserRole = 'SALE' | 'SALES_DIRECTOR' | 'BUSINESS_DIRECTOR' | 'BOD' | 'ACCOUNTANT' | 'IT' | 'PRODUCTION' | 'ADMIN';

export interface SystemUser {
  id: string;
  fullName: string;
  role: UserRole;
  department?: string;
  username?: string;
  password?: string;
}

// Trạng thái PAKD — luồng tuyến tính luôn qua BOD.
export type PakdStatus =
  | 'DRAFT'
  | 'PENDING_SALES_DIRECTOR'
  | 'PENDING_BUSINESS_DIRECTOR'
  | 'PENDING_BOD'
  | 'PENDING_ACCOUNTANT'
  | 'PENDING_IT'
  | 'COMPLETED'
  | 'RETURNED'; // bị trả lại để Sale chỉnh & nộp lại

// Một khoản chi phí thuộc 1 bước.
export interface CostItem {
  id: string;
  name: string;
  costType: string; // loại chi phí: Nhân công, Thiết bị, Logistics, Thuế, Khác...
  amount: number; // Kinh doanh nhập (chi phí dự kiến)
  actualAmount?: number; // Kế toán duyệt chi
  versionAmounts?: number[]; // các bản điều chỉnh: [Ver2, Ver3, ...]
  note?: string;
}

// Một bước thực hiện (động) trong PAKD.
export interface ProjectStep {
  id: string;
  order: number;
  name: string;
  assignee: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  approvedBudget: number; // ngân sách duyệt chi cho bước này
  revenue?: number; // doanh thu bước này tạo ra (chỉ dùng cho phase tổng hợp)
  objective?: string; // mục tiêu của giai đoạn
  output?: string; // kết quả đầu ra của phase
  attachmentNote?: string; // tài liệu đính kèm (tên file / link) — cũ
  attachmentFiles?: { name: string; size: string }[]; // file đính kèm của giai đoạn
  budgetAdjustments?: BudgetAdjustment[]; // lịch sử/phiếu điều chỉnh ngân sách (cũ → mới, có luồng duyệt)
  businessBudget?: number; // I. Phân bổ ngân sách cho Kinh doanh
  productionBudget?: number; // II. Phân bổ ngân sách cho Sản xuất
  costItems: CostItem[]; // các khoản chi phí Kinh doanh
  productionCostItems?: CostItem[]; // các khoản chi phí Sản xuất
  productionInfo?: ProductionInfo; // thông tin dự án sản xuất của giai đoạn (GĐ Khối nhập)
  productionTasks?: ProductionTask[]; // đầu việc triển khai của giai đoạn (Khối SX nhập)
}

export type ApprovalAction = 'APPROVE' | 'REJECT';

export interface ApprovalRecord {
  id: string;
  stepLabel: string;
  role: UserRole;
  actor: string;
  action: ApprovalAction;
  comment: string;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
}

// ----- Phiếu điều chỉnh chi phí (change request) -----
export type ChangeOp = 'ADD' | 'EDIT' | 'DELETE';

export interface CostChange {
  id: string;
  op: ChangeOp;
  stepId: string;
  stepName: string;
  targetCostId?: string; // với EDIT/DELETE
  costName: string;
  costType: string;
  oldAmount?: number;
  newAmount?: number;
}

export type ChangeRequestStatus =
  | 'DRAFT'
  | 'PENDING_BUSINESS_DIRECTOR'
  | 'PENDING_BOD'
  | 'PENDING_ACCOUNTANT'
  | 'APPROVED'
  | 'REJECTED';

export interface ChangeRequest {
  id: string;
  pakdId: string;
  createdBy: string;
  createdAt: string;
  status: ChangeRequestStatus;
  reason: string;
  changes: CostChange[];
  approvalHistory: ApprovalRecord[];
}

// Ảnh chụp phiên bản PAKD mỗi khi áp dụng một phiếu điều chỉnh.
export interface PakdVersionSnapshot {
  version: number;
  createdAt: string;
  changeRequestId: string;
  reason: string;
  totalCostBefore: number;
  totalCostAfter: number;
}

// Thông tin gói thầu CNTT (đấu thầu)
export interface TenderInfo {
  packageCode: string; // Số hiệu/Mã gói thầu (TBMT), vd: TBMT-26.0456
  investor: string; // Chủ đầu tư / Bên mời thầu
  biddingMethod: string; // Hình thức lựa chọn nhà thầu
  fieldType: string; // Lĩnh vực gói thầu (Hàng hóa CNTT, Dịch vụ phi tư vấn...)
  contractType: string; // Loại hợp đồng (Trọn gói, Theo đơn giá điều chỉnh...)
  packagePrice: number; // Giá gói thầu (giá mời thầu) - VNĐ
  bidSecurity: number; // Bảo lãnh dự thầu - VNĐ
  closeDate: string; // Thời điểm đóng thầu
}

export interface Pakd {
  id: string;
  name: string;
  customerName: string;
  customerCode: string;
  creator: string;
  createdAt: string;
  status: PakdStatus;
  // Thông tin cơ hội (Sale nhập khi khởi tạo)
  pmName?: string; // Người quản lý dự án (nhập ở giai đoạn sản xuất)
  businessDirector?: string; // Giám đốc khối
  salesDirector?: string; // Giám đốc kinh doanh
  domain?: string; // Lĩnh vực: GOV / Giải pháp dịch vụ / Healthcare...
  projStart?: string; // Thời gian bắt đầu
  projEnd?: string; // Thời gian kết thúc
  expectedContractValue?: number; // Giá trị hợp đồng dự kiến
  expectedCost?: number; // Chi phí dự kiến bỏ ra
  tender: TenderInfo;
  revenue: number; // Giá dự thầu (doanh thu dự kiến)
  steps: ProjectStep[]; // 6 phương án chi phí KH01..KH06 (Kinh doanh)
  currentPhase?: number; // giai đoạn hiện tại (1..6); các KH < giá trị này coi như đã hoàn thành
  costVersions?: number; // số cột điều chỉnh đang hiển thị (0 = chỉ dự kiến; 1 = có Ver2; 2 = có Ver2,Ver3...)
  productionTasks: ProductionTask[]; // giai đoạn triển khai của Khối sản xuất
  locked: boolean; // bảng chi phí bị khóa sau khi GĐ Khối duyệt
  version: number;
  masterCode?: string;
  businessCode?: string;
  productionCode?: string;
  outsourceCodes: OutsourceCode[]; // mã con của mã sản xuất, vd 022.689.2.1
  jiraKey?: string;
  jiraUrl?: string;
  approvalHistory: ApprovalRecord[];
  changeRequests: ChangeRequest[];
  versionHistory: PakdVersionSnapshot[];
  comments?: PakdComment[];
}

// Giai đoạn triển khai do Khối sản xuất tạo (tách khỏi chi phí kinh doanh)
export interface ProductionTask {
  id: string;
  name: string; // Đầu việc triển khai
  assignee?: string;
  startDate?: string;
  endDate?: string;
  progress: number; // tiến độ hoàn thành %
  updatedAt?: string; // ngày cập nhật dữ liệu gần nhất
}

// Thông tin dự án sản xuất theo từng giai đoạn KH — GĐ Khối nhập
// (mã dự án lấy tự động từ productionCode đã sinh, không nhập tay)
export interface ProductionInfo {
  workOrder?: string;
  projectType?: string; // Internal / External...
  priority?: string; // High / Medium / Low
  size?: string; // Small / Medium / Large
  department?: string;
  projectManager?: string;
  domain?: string; // GOV / BFSI...
  customer?: string;
  startDate?: string;
  endDate?: string;
  status?: string; // OPEN / RUNNING / CLOSED
}

export type BudgetAdjStatus = 'PENDING_BUSINESS_DIRECTOR' | 'PENDING_ACCOUNTANT' | 'PENDING_BOD' | 'APPROVED' | 'REJECTED';

export interface BudgetAdjustment {
  id: string;
  createdAt: string;
  requestedBy: string;
  reason: string;
  before: { business: number; production: number };
  after: { business: number; production: number };
  status: BudgetAdjStatus;
  approvals: { role: UserRole; actor: string; action: ApprovalAction; at: string; comment?: string }[];
}

export interface OutsourceCode {
  id: string;
  code: string; // vd 022.689.2.1
  label: string; // nội dung thuê ngoài
}

export interface PakdComment {
  id: string;
  author: string;
  role: UserRole;
  content: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  pakdId: string;
  actor: string;
  role: UserRole;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  note: string;
  createdAt: string;
}

// ----- Helpers tính tổng -----
export const stepCost = (step: ProjectStep): number => step.costItems.reduce((s, c) => s + c.amount, 0); // kế hoạch (KD)
export const stepActualCost = (step: ProjectStep): number => step.costItems.reduce((s, c) => s + (c.actualAmount || 0), 0); // thực tế (Kế toán)
export const pakdTotalCost = (pakd: Pakd): number => pakd.steps.reduce((s, st) => s + stepCost(st), 0);
export const pakdActualCost = (pakd: Pakd): number => pakd.steps.reduce((s, st) => s + stepActualCost(st), 0);
export const pakdStepRevenue = (pakd: Pakd): number => pakd.steps.reduce((s, st) => s + (st.revenue || 0), 0);
