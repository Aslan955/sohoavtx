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

// ----- Bảng phân bổ chi phí P&L theo giai đoạn (thay cách nhập cost item tự do) -----
export type CostLineCategory = 'RND' | 'SX' | 'KD' | 'AUDIT' | 'FINANCE' | 'OVERHEAD';
export type CostLineBasis = 'INPUT' | 'PCT_CONTRACT' | 'PCT_NET'; // nhập tay | % giá trị HĐ | % giá trị net

export interface CostLine {
  id: string;
  label: string;
  category: CostLineCategory;
  basis: CostLineBasis;
  percent?: number; // % khi basis là PCT_*
  amount?: number;  // số tiền khi basis là INPUT
  note?: string;    // hướng dẫn / ghi chú
  fixed?: boolean;  // dòng chuẩn của biểu mẫu — không cho xóa
}

// Giá trị 1 dòng theo cơ sở tính
export const costLineAmount = (l: CostLine, contract: number, net: number): number =>
  l.basis === 'INPUT' ? (l.amount || 0)
    : l.basis === 'PCT_CONTRACT' ? ((l.percent || 0) / 100) * contract
      : ((l.percent || 0) / 100) * net;

export interface CostPlanSummary {
  contract: number; rnd: number; net: number;
  sx: number; kd: number; audit: number; finance: number; overhead: number;
  totalCost: number; profit: number; margin: number; // margin = LN / HĐ
}

// Tổng hợp P&L của 1 giai đoạn từ contractBeforeVat + costLines
export const costPlanOf = (step: { contractBeforeVat?: number; costLines?: CostLine[] }): CostPlanSummary => {
  const contract = step.contractBeforeVat || 0;
  const lines = step.costLines || [];
  const rndLine = lines.find(l => l.category === 'RND');
  const rnd = rndLine ? costLineAmount(rndLine, contract, 0) : 0;
  const net = contract - rnd;
  const sum = (cat: CostLineCategory) => lines.filter(l => l.category === cat).reduce((s, l) => s + costLineAmount(l, contract, net), 0);
  const sx = sum('SX'), kd = sum('KD'), audit = sum('AUDIT'), finance = sum('FINANCE'), overhead = sum('OVERHEAD');
  const totalCost = sx + kd + audit + finance + overhead;
  const profit = net - totalCost;
  return { contract, rnd, net, sx, kd, audit, finance, overhead, totalCost, profit, margin: contract > 0 ? (profit / contract) * 100 : 0 };
};

// ----- Hạng mục chi phí & phân bổ ngân sách theo giai đoạn -----
// Tổng (Excel) = số gốc lấy từ file PAKD; alloc = phân bổ số đó cho từng giai đoạn KH.
// kind PRODUCTION/BUSINESS được đồng bộ ngược lại productionBudget/businessBudget của giai đoạn
// để bảng giai đoạn (Overview) luôn khớp; OTHER là hạng mục tự thêm (vd CP dự phòng kiểm toán).
export type BudgetCategoryKind = 'PRODUCTION' | 'BUSINESS' | 'OTHER';

export interface BudgetCategory {
  id: string;
  label: string;
  sub?: string;              // nhãn phụ hiển thị dưới tên
  group?: string;            // nhóm hiển thị (vd "Chi phí sản xuất / phát triển dự án")
  note?: string;             // ghi chú/cách tính lấy từ file PAKD
  kind: BudgetCategoryKind;  // PRODUCTION/BUSINESS được đồng bộ về ngân sách giai đoạn
  excelTotal: number;        // Tổng (Excel) — mục tiêu cần phân bổ đủ
  alloc: number[];           // phân bổ theo chỉ số giai đoạn (KH01 = [0])
  approved?: number;         // Kế toán duyệt chi cho hạng mục này
}

export const catAllocated = (c: BudgetCategory): number => (c.alloc || []).reduce((s, v) => s + (v || 0), 0);

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
  // Đề nghị chuyển sang giai đoạn kế tiếp — luồng GĐ Kinh doanh → GĐ Khối → Kế toán → BOD
  advanceStatus?: 'PENDING_SALES_DIRECTOR' | 'PENDING_BUSINESS_DIRECTOR' | 'PENDING_ACCOUNTANT' | 'PENDING_BOD';
  advanceApprovals?: { role: UserRole; actor: string; action: ApprovalAction; at: string; comment?: string }[];
  // Số tiền thực tế đã chi cho giai đoạn (AM/GĐ KD/GĐ Khối cập nhật nhiều lần, có log)
  actualSpent?: number;
  // amount = khoản chi của lần đó; edited = dòng điều chỉnh sửa lại tổng (có thể âm); locked = đã qua duyệt, không sửa được nữa
  spentLog?: { at: string; by: string; role: UserRole; amount: number; edited?: boolean; locked?: boolean }[];
  businessBudget?: number; // I. Phân bổ ngân sách cho Kinh doanh (đồng bộ = tổng nhóm KD của costLines)
  productionBudget?: number; // II. Phân bổ ngân sách cho Sản xuất (đồng bộ = tổng nhóm SX của costLines)
  contractBeforeVat?: number; // Giá trị ký hợp đồng trước VAT của giai đoạn (dòng 1 bảng P&L)
  costLines?: CostLine[]; // bảng phân bổ chi phí P&L (R&D, CP SX, CP KD, kiểm toán, tài chính, vận hành)
  costItems: CostItem[]; // các khoản chi phí Kinh doanh
  productionCostItems?: CostItem[]; // các khoản chi phí Sản xuất
  productionInfo?: ProductionInfo; // thông tin dự án sản xuất của giai đoạn (GĐ Khối nhập)
  productionTasks?: ProductionTask[]; // đầu việc triển khai của giai đoạn (Khối SX nhập)
}

export type ApprovalAction = 'APPROVE' | 'REJECT' | 'REQUEST_REVISION';

export interface ApprovalRecord {
  id: string;
  stepLabel: string;
  role: UserRole;
  actor: string;
  action: ApprovalAction | 'SUBMIT' | 'RESTART'; // SUBMIT = nộp trình duyệt; RESTART = làm lại từ đầu
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
  planRevisions?: PlanRevision[]; // lịch sử phiếu điều chỉnh phương án (mở lại duyệt từ đầu)
  planChangeLogs?: PlanChangeLog[]; // log điều chỉnh trực tiếp phương án sau khi hoàn tất (cũ → mới)
  versionSnaps?: PlanVersionSnap[]; // ảnh chụp các phiên bản đã chốt (xem lại read-only)
  pendingAdjustReason?: string; // lý do điều chỉnh đang chờ duyệt lại (hiển thị cho các cấp duyệt), xóa khi hoàn tất
  isKeyProject?: boolean; // dự án trọng điểm (đánh dấu để ưu tiên theo dõi)
  department?: string;    // Phòng ban / Khối phụ trách
  projectType?: string;   // Loại dự án (Fixed Cost / R&D / ODC / Staffing...)
  followers?: string;     // Người theo dõi (danh sách, phân tách bằng dấu phẩy)
  contractSigned?: boolean; // Hợp đồng đã ký hay chưa
  businessPM?: string;    // PM (quản trị dự án) phụ trách mã kinh doanh
  productionPM?: string;  // PM phụ trách mã sản xuất
  accountingSpends?: AccountingSpend[]; // chi thực tế do Kế toán import hàng tháng (theo dự án)
  budgetCategories?: BudgetCategory[];  // hạng mục chi phí + phân bổ ngân sách theo giai đoạn
  editingRole?: UserRole; // vai trò đang sửa phương án khi PAKD đang duyệt (tạm dừng duyệt)
  editingSnapshot?: PlanStepSnap[]; // ảnh chụp trước khi sửa (để tạo diff phiên bản)
}

export interface PlanStepSnap {
  code: string; name: string; start?: string; end?: string; objective?: string; output?: string;
  biz: number; prod: number; revenue: number;
}

// Ảnh chụp toàn bộ phương án tại một phiên bản đã chốt (để xem lại read-only).
export interface PlanVersionSnap {
  version: number;
  at: string;
  by: string;
  reason?: string; // lý do của lần điều chỉnh tạo ra phiên bản kế tiếp
  steps: PlanStepSnap[];
}

// Log một thay đổi trên phương án khi điều chỉnh trực tiếp (sau khi PAKD hoàn tất) — lưu dữ liệu cũ → mới.
export interface PlanChangeLog {
  id: string;
  version: number;  // phiên bản điều chỉnh (Ver 1, Ver 2...) — mỗi lần gửi duyệt điều chỉnh là 1 phiên bản
  at: string;
  by: string;
  role: UserRole;
  reason: string;   // lý do điều chỉnh (bắt buộc nhập khi tạo phiếu)
  stepCode: string; // KH01.. hoặc 'Chung' nếu ở cấp phương án
  field: string;    // tên trường bị đổi (Mục tiêu, NS Kinh doanh...)
  before: string;   // giá trị cũ (đã định dạng)
  after: string;    // giá trị sau thay đổi (đã định dạng)
}
export interface PlanRevision {
  id: string;
  at: string;
  by: string;
  role: UserRole;
  reason: string;
  fromStatus: string; // trạng thái trước khi mở lại
  version: number; // số phiên bản bị thay thế bởi lần điều chỉnh này
  snapshot: PlanStepSnap[]; // ảnh chụp nội dung phương án tại thời điểm điều chỉnh
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

// Một dòng chi thực tế do Kế toán import (mỗi tháng 1 dòng / dự án).
export interface AccountingSpend {
  id: string;
  at: string;         // ngày update (từ file import)
  production: number; // chi sản xuất
  business: number;   // chi kinh doanh
  by?: string;        // người import (Kế toán)
  importedAt?: string;// thời điểm thực hiện import
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
