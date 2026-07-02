import { Pakd, ProjectStep, SystemUser } from './projectTypes';

// 6 phương án chi phí chuẩn KH01..KH06
export const PHASE_DEFAULT_NAMES = [
  'Hình thành cơ hội',
  'Khảo sát, lập kế hoạch dự án',
  'Lựa chọn nhà thầu',
  'Tổ chức lựa chọn nhà thầu',
  'Ký hợp đồng',
  'Đóng dự án, Kiểm toán',
];

export function makePhases(): ProjectStep[] {
  return PHASE_DEFAULT_NAMES.map((name, i) => ({
    id: `KH0${i + 1}`, order: i + 1, name, assignee: '', approvedBudget: 0, revenue: 0, costItems: [],
  }));
}

// Mã giai đoạn: KH01, KH02, ... KH10...
export const khCode = (i: number) => `KH${String(i + 1).padStart(2, '0')}`;

// Chuẩn hóa: đảm bảo mỗi PAKD có tối thiểu 6 phase KH01..KH06 (giữ phase thêm & tên tự định nghĩa)
export function normalizePhases(p: Pakd): Pakd {
  const total = Math.max(6, p.steps.length);
  const steps: ProjectStep[] = [];
  for (let i = 0; i < total; i++) {
    const existing = p.steps[i];
    steps.push(existing
      ? { ...existing, id: khCode(i), order: i + 1, name: existing.name && !existing.name.startsWith('Chi phí ') ? existing.name : (PHASE_DEFAULT_NAMES[i] || existing.name) }
      : { id: khCode(i), order: i + 1, name: PHASE_DEFAULT_NAMES[i] || `Giai đoạn ${i + 1}`, assignee: '', approvedBudget: 0, revenue: 0, costItems: [] });
  }
  // Di trú: đầu việc triển khai cấp PAKD (cũ) chuyển vào giai đoạn hiện tại
  if (p.productionTasks?.length && !steps.some(s => s.productionTasks?.length)) {
    const idx = Math.min(5, Math.max(0, (p.currentPhase || 1) - 1));
    steps[idx] = { ...steps[idx], productionTasks: p.productionTasks };
  }
  return { ...p, steps, productionTasks: [] };
}

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'U1', fullName: 'Lê Thu Trang', role: 'SALE', department: 'Sale', username: 'sale', password: '123456' },
  { id: 'U2', fullName: 'Nguyễn Tiến Dũng', role: 'BUSINESS_DIRECTOR', department: 'Khối Giải pháp Doanh nghiệp', username: 'gdkhoi', password: '123456' },
  { id: 'U3', fullName: 'Phạm Minh Hải', role: 'BOD', department: 'Ban Giám đốc', username: 'bod', password: '123456' },
  { id: 'U4', fullName: 'Lê Thị Mai', role: 'ACCOUNTANT', department: 'Kế toán', username: 'ketoan', password: '123456' },
  { id: 'U5', fullName: 'Đặng Quốc Anh', role: 'IT', department: 'IT', username: 'it', password: '123456' },
  { id: 'U7', fullName: 'Vũ Đình Phúc', role: 'PRODUCTION', department: 'Khối Sản xuất', username: 'sanxuat', password: '123456' },
  { id: 'U6', fullName: 'Admin Hệ thống', role: 'ADMIN', department: 'IT', username: 'admin', password: '123456' },
];

// Loại chi phí điển hình của một gói thầu CNTT
export const COST_TYPES = [
  'Phần cứng/Thiết bị',
  'Bản quyền phần mềm',
  'Nhân công triển khai',
  'Dịch vụ kỹ thuật/Tích hợp',
  'Bảo hành/Bảo trì',
  'Đào tạo & Chuyển giao',
  'Khảo sát/Tư vấn',
  'Thuế VAT',
  'Chi phí quản lý dự án',
  'Dự phòng',
];

export const DOMAINS = ['GOV', 'Giải pháp dịch vụ', 'Healthcare', 'BFSI', 'Telco', 'Enterprise', 'Education', 'Khác'];
export const BUSINESS_DIRECTORS = [
  'Nguyễn Tiến Dũng (GĐ Khối GPDN)',
  'Trần Quốc Bảo (GĐ Khối Hạ tầng)',
  'Lê Hoàng Sơn (GĐ Khối Viễn thông)',
  'Phạm Thu Hà (GĐ Khối Y tế số)',
];
export const SALES_DIRECTORS = [
  'Đỗ Mạnh Cường (GĐ Kinh doanh Miền Bắc)',
  'Vũ Thị Lan (GĐ Kinh doanh Miền Trung)',
  'Ngô Anh Tú (GĐ Kinh doanh Miền Nam)',
  'Bùi Khánh Linh (GĐ Kinh doanh Khối CQNN)',
];
export const BIDDING_METHODS = ['Đấu thầu rộng rãi', 'Chào hàng cạnh tranh', 'Chỉ định thầu', 'Đấu thầu hạn chế'];
export const FIELD_TYPES = ['Hàng hóa CNTT', 'Dịch vụ phi tư vấn', 'Dịch vụ tư vấn', 'Xây lắp hạ tầng CNTT', 'Hỗn hợp'];
export const CONTRACT_TYPES = ['Trọn gói', 'Theo đơn giá điều chỉnh', 'Theo đơn giá cố định'];

export const CUSTOMERS = [
  { code: 'VIETTEL', name: 'Tập đoàn Viễn thông Quân đội (Viettel)' },
  { code: 'SSTT_BN', name: 'Sở Thông tin và Truyền thông Bắc Ninh' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN (BIDV)' },
  { code: 'SGTVT_HN', name: 'Sở Giao thông Vận tải Hà Nội' },
];

const RAW_PAKDS: Pakd[] = [
  {
    id: 'PAKD-689',
    name: 'Hệ thống Truyền thông Hợp nhất VTX 2026',
    customerName: 'Tập đoàn Viễn thông Quân đội (Viettel)',
    customerCode: 'VIETTEL',
    creator: 'Lê Thu Trang',
    createdAt: '2026-05-10 09:30',
    status: 'COMPLETED',
    tender: { packageCode: 'TBMT-26.0456', investor: 'Tập đoàn Viễn thông Quân đội (Viettel)', biddingMethod: 'Đấu thầu rộng rãi', fieldType: 'Hàng hóa CNTT', contractType: 'Trọn gói', packagePrice: 47000000000, bidSecurity: 700000000, closeDate: '2026-04-28' },
    revenue: 45000000000,
    locked: true,
    version: 2,
    costVersions: 1,
    currentPhase: 5,
    masterCode: '022.689',
    businessCode: '022.689.1',
    productionCode: '022.689.2',
    outsourceCodes: [
      { id: 'OS1', code: '022.689.2.1', label: 'Thuê ngoài thi công kéo cáp & lắp đặt' },
      { id: 'OS2', code: '022.689.2.2', label: 'Thuê đối tác đào tạo chuyển giao' },
    ],
    productionTasks: [
      { id: 'PT1', name: 'Chuẩn bị mặt bằng & hạ tầng phòng máy', assignee: 'Vũ Đình Phúc', startDate: '2026-06-05', endDate: '2026-06-30', progress: 100, updatedAt: '2026-06-30 17:00' },
      { id: 'PT2', name: 'Lắp đặt & cấu hình thiết bị mạng lõi', assignee: 'Tổ Hạ tầng', startDate: '2026-07-16', endDate: '2026-09-30', progress: 60, updatedAt: '2026-08-20 09:30' },
      { id: 'PT3', name: 'Tích hợp phần mềm & kiểm thử', assignee: 'Tổ Phần mềm', startDate: '2026-10-01', endDate: '2026-12-15', progress: 10, updatedAt: '2026-08-15 14:00' },
    ],
    jiraKey: 'VIETTE',
    jiraUrl: 'https://vtx-jira.atlassian.net/projects/VIETTE',
    steps: [
      {
        id: 'S1', order: 1, name: 'Chi phí Kinh doanh', assignee: 'Lê Thu Trang (Sale)', startDate: '2026-05-10', endDate: '2026-06-30', note: 'Chi phí phát triển cơ hội, làm hồ sơ thầu và bán hàng',
        approvedBudget: 4500000000, revenue: 15000000000, businessBudget: 5000000000, productionBudget: 1000000000,
        budgetAdjustments: [
          { id: 'BA-001', createdAt: '2026-05-13 15:00', requestedBy: 'Lê Thu Trang', reason: 'Tăng NS kinh doanh để mở rộng tiếp thị', before: { business: 4000000000, production: 1000000000 }, after: { business: 5000000000, production: 1000000000 }, status: 'APPROVED', approvals: [
            { role: 'BUSINESS_DIRECTOR', actor: 'Nguyễn Tiến Dũng', action: 'APPROVE', at: '2026-05-13 16:00' },
            { role: 'ACCOUNTANT', actor: 'Lê Thị Mai', action: 'APPROVE', at: '2026-05-14 09:00' },
            { role: 'BOD', actor: 'Phạm Minh Hải', action: 'APPROVE', at: '2026-05-14 11:00' },
          ] },
        ],
        productionInfo: { workOrder: 'WO-2026-045', projectType: 'External', priority: 'High', size: 'Large', department: 'SX - Telco', projectManager: 'V00914 - Trần Minh Quang', domain: 'GOV', customer: 'Viettel', startDate: '2026-06-01', endDate: '2026-07-15', status: 'CLOSED' },
        costItems: [
          { id: 'C1', name: 'Chi phí đội bán hàng & tư vấn giải pháp', costType: 'Nhân công triển khai', amount: 1800000000, versionAmounts: [2000000000], actualAmount: 1900000000 },
          { id: 'C2', name: 'Chi phí lập hồ sơ thầu & bảo lãnh dự thầu', costType: 'Chi phí quản lý dự án', amount: 700000000, versionAmounts: [750000000], actualAmount: 700000000 },
          { id: 'C3', name: 'Chi phí tiếp thị & quan hệ khách hàng', costType: 'Khác', amount: 900000000, versionAmounts: [850000000], actualAmount: 850000000 },
          { id: 'C4', name: 'Hoa hồng môi giới / đối tác', costType: 'Khác', amount: 1100000000, versionAmounts: [1050000000], actualAmount: 1000000000 },
        ],
      },
      {
        id: 'S2', order: 2, name: 'Chi phí Sản xuất', assignee: 'Trần Minh Quang (PM)', startDate: '2026-07-01', endDate: '2027-02-28', note: 'Chi phí phát triển, triển khai và bảo hành phần mềm',
        approvedBudget: 18200000000, revenue: 30000000000, businessBudget: 4000000000, productionBudget: 15000000000,
        productionInfo: { workOrder: 'WO-2026-052', projectType: 'External', priority: 'High', size: 'Large', department: 'SX - Telco', projectManager: 'V00914 - Trần Minh Quang', domain: 'GOV', customer: 'Viettel', startDate: '2026-07-16', endDate: '2026-10-30', status: 'RUNNING' },
        costItems: [
          { id: 'C5', name: 'Nhân công phát triển phần mềm', costType: 'Nhân công triển khai', amount: 9000000000, versionAmounts: [9500000000], actualAmount: 9600000000 },
          { id: 'C6', name: 'Bản quyền phần mềm & công cụ phát triển', costType: 'Bản quyền phần mềm', amount: 3500000000, versionAmounts: [3500000000], actualAmount: 3500000000 },
          { id: 'C7', name: 'Hạ tầng máy chủ / Cloud', costType: 'Phần cứng/Thiết bị', amount: 2800000000, versionAmounts: [3000000000], actualAmount: 2900000000 },
          { id: 'C8', name: 'Kiểm thử & đảm bảo chất lượng (QA)', costType: 'Dịch vụ kỹ thuật/Tích hợp', amount: 1200000000, versionAmounts: [1200000000], actualAmount: 0 },
          { id: 'C9', name: 'Triển khai & đào tạo chuyển giao', costType: 'Đào tạo & Chuyển giao', amount: 900000000, versionAmounts: [1000000000], actualAmount: 0 },
          { id: 'C10', name: 'Bảo hành phần mềm 12 tháng', costType: 'Bảo hành/Bảo trì', amount: 800000000, versionAmounts: [800000000], actualAmount: 0 },
        ],
      },
    ],
    approvalHistory: [
      { id: 'AR1', stepLabel: 'Chờ GĐ Khối', role: 'BUSINESS_DIRECTOR', actor: 'Nguyễn Tiến Dũng', action: 'APPROVE', comment: 'Thông qua, hiệu quả đầu tư tốt.', oldStatus: 'PENDING_BUSINESS_DIRECTOR', newStatus: 'PENDING_BOD', createdAt: '2026-05-12 14:20' },
      { id: 'AR2', stepLabel: 'Chờ BOD', role: 'BOD', actor: 'Phạm Minh Hải', action: 'APPROVE', comment: 'Phê duyệt.', oldStatus: 'PENDING_BOD', newStatus: 'PENDING_ACCOUNTANT', createdAt: '2026-05-14 11:00' },
      { id: 'AR3', stepLabel: 'Chờ Kế toán', role: 'ACCOUNTANT', actor: 'Lê Thị Mai', action: 'APPROVE', comment: 'Ngân sách hợp lệ.', oldStatus: 'PENDING_ACCOUNTANT', newStatus: 'PENDING_IT', createdAt: '2026-05-15 16:45' },
      { id: 'AR4', stepLabel: 'Chờ IT', role: 'IT', actor: 'Đặng Quốc Anh', action: 'APPROVE', comment: 'Đã tạo Jira.', oldStatus: 'PENDING_IT', newStatus: 'COMPLETED', createdAt: '2026-05-16 09:00' },
    ],
    changeRequests: [
      {
        id: 'CR-001', pakdId: 'PAKD-689', createdBy: 'Lê Thu Trang', createdAt: '2026-06-20 10:00', status: 'APPROVED',
        reason: 'Tỷ giá nhập khẩu tăng, cần điều chỉnh chi phí thiết bị mạng lõi.',
        changes: [
          { id: 'CH1', op: 'EDIT', stepId: 'S2', stepName: 'Cung cấp & lắp đặt thiết bị', targetCostId: 'C3', costName: 'Thiết bị mạng lõi', costType: 'Thiết bị', oldAmount: 11500000000, newAmount: 12000000000 },
        ],
        approvalHistory: [
          { id: 'CRAR1', stepLabel: 'Chờ GĐ Khối', role: 'BUSINESS_DIRECTOR', actor: 'Nguyễn Tiến Dũng', action: 'APPROVE', comment: 'OK.', oldStatus: 'PENDING_BUSINESS_DIRECTOR', newStatus: 'PENDING_BOD', createdAt: '2026-06-21 09:00' },
          { id: 'CRAR2', stepLabel: 'Chờ BOD', role: 'BOD', actor: 'Phạm Minh Hải', action: 'APPROVE', comment: 'Đồng ý.', oldStatus: 'PENDING_BOD', newStatus: 'PENDING_ACCOUNTANT', createdAt: '2026-06-21 14:00' },
          { id: 'CRAR3', stepLabel: 'Chờ Kế toán', role: 'ACCOUNTANT', actor: 'Lê Thị Mai', action: 'APPROVE', comment: 'Cập nhật ngân sách.', oldStatus: 'PENDING_ACCOUNTANT', newStatus: 'APPROVED', createdAt: '2026-06-22 10:00' },
        ],
      },
    ],
    versionHistory: [
      { version: 2, createdAt: '2026-06-22 10:00', changeRequestId: 'CR-001', reason: 'Tỷ giá nhập khẩu tăng', totalCostBefore: 21800000000, totalCostAfter: 22300000000 },
    ],
  },
  {
    id: 'PAKD-104',
    name: 'Hệ thống Camera AI giám sát giao thông đô thị',
    customerName: 'Sở Giao thông Vận tải Hà Nội',
    customerCode: 'SGTVT_HN',
    creator: 'Lê Thu Trang',
    createdAt: '2026-06-15 15:00',
    status: 'PENDING_BOD',
    tender: { packageCode: 'TBMT-26.0712', investor: 'Sở Giao thông Vận tải Hà Nội', biddingMethod: 'Đấu thầu rộng rãi', fieldType: 'Hỗn hợp', contractType: 'Theo đơn giá điều chỉnh', packagePrice: 29500000000, bidSecurity: 450000000, closeDate: '2026-06-10' },
    revenue: 28000000000,
    locked: true,
    version: 1,
    masterCode: '022.104',
    businessCode: '022.104.1',
    productionCode: '022.104.2',
    outsourceCodes: [],
    productionTasks: [],
    steps: [
      {
        id: 'S1', order: 1, name: 'Khảo sát tuyến & lắp đặt camera', assignee: 'Nguyễn Văn B', startDate: '2026-09-01', endDate: '2026-11-30',
        approvedBudget: 0,
        costItems: [
          { id: 'C1', name: 'Thiết bị camera AI', costType: 'Thiết bị', amount: 9000000000 },
          { id: 'C2', name: 'Nhân công lắp đặt', costType: 'Nhân công', amount: 2500000000 },
        ],
      },
      {
        id: 'S2', order: 2, name: 'Phần mềm AI & trung tâm điều hành', assignee: 'Đội phần mềm', startDate: '2026-10-01', endDate: '2027-01-31',
        approvedBudget: 0,
        costItems: [
          { id: 'C3', name: 'Phát triển phần mềm AI', costType: 'Nhân công', amount: 4500000000 },
          { id: 'C4', name: 'Máy chủ & hạ tầng trung tâm', costType: 'Thiết bị', amount: 3000000000 },
        ],
      },
    ],
    approvalHistory: [
      { id: 'AR1', stepLabel: 'Chờ GĐ Khối', role: 'BUSINESS_DIRECTOR', actor: 'Nguyễn Tiến Dũng', action: 'APPROVE', comment: 'Thông qua, chuyển BOD.', oldStatus: 'PENDING_BUSINESS_DIRECTOR', newStatus: 'PENDING_BOD', createdAt: '2026-06-18 10:45' },
    ],
    changeRequests: [],
    versionHistory: [],
  },
  {
    id: 'PAKD-110',
    name: 'Nâng cấp hệ thống Core Banking & sao lưu dữ liệu',
    customerName: 'Ngân hàng TMCP Đầu tư và Phát triển VN (BIDV)',
    customerCode: 'BIDV',
    creator: 'Lê Thu Trang',
    createdAt: '2026-06-22 09:00',
    status: 'PENDING_ACCOUNTANT',
    tender: { packageCode: 'TBMT-26.0820', investor: 'Ngân hàng TMCP Đầu tư và Phát triển VN (BIDV)', biddingMethod: 'Đấu thầu rộng rãi', fieldType: 'Hàng hóa CNTT', contractType: 'Trọn gói', packagePrice: 18000000000, bidSecurity: 270000000, closeDate: '2026-06-19' },
    revenue: 17000000000,
    locked: true,
    version: 1,
    masterCode: '022.110',
    businessCode: '022.110.1',
    productionCode: '022.110.2',
    outsourceCodes: [],
    productionTasks: [],
    steps: [
      {
        id: 'S1', order: 1, name: 'Cung cấp thiết bị & bản quyền', assignee: 'Hoàng Ngọc Sơn', startDate: '2026-08-01', endDate: '2026-10-31',
        approvedBudget: 11000000000,
        costItems: [
          { id: 'C1', name: 'Máy chủ & thiết bị lưu trữ', costType: 'Phần cứng/Thiết bị', amount: 7000000000 },
          { id: 'C2', name: 'Bản quyền phần mềm Core', costType: 'Bản quyền phần mềm', amount: 3500000000 },
        ],
      },
      {
        id: 'S2', order: 2, name: 'Triển khai & chuyển đổi dữ liệu', assignee: 'Đội triển khai', startDate: '2026-11-01', endDate: '2027-01-31',
        approvedBudget: 3000000000,
        costItems: [
          { id: 'C3', name: 'Nhân công triển khai', costType: 'Nhân công triển khai', amount: 2200000000 },
          { id: 'C4', name: 'Đào tạo chuyển giao', costType: 'Đào tạo & Chuyển giao', amount: 500000000 },
        ],
      },
    ],
    approvalHistory: [
      { id: 'AR1', stepLabel: 'Chờ GĐ Khối', role: 'BUSINESS_DIRECTOR', actor: 'Nguyễn Tiến Dũng', action: 'APPROVE', comment: 'Thông qua, đã sinh mã.', oldStatus: 'PENDING_BUSINESS_DIRECTOR', newStatus: 'PENDING_BOD', createdAt: '2026-06-23 09:30' },
      { id: 'AR2', stepLabel: 'Chờ BOD', role: 'BOD', actor: 'Phạm Minh Hải', action: 'APPROVE', comment: 'Phê duyệt, chuyển Kế toán thẩm định.', oldStatus: 'PENDING_BOD', newStatus: 'PENDING_ACCOUNTANT', createdAt: '2026-06-24 10:00' },
    ],
    changeRequests: [],
    versionHistory: [],
  },
  {
    id: 'PAKD-111',
    name: 'Hệ thống Wifi Marketing & giám sát tập trung',
    customerName: 'Sở Thông tin và Truyền thông Bắc Ninh',
    customerCode: 'SSTT_BN',
    creator: 'Lê Thu Trang',
    createdAt: '2026-06-24 14:00',
    status: 'COMPLETED',
    tender: { packageCode: 'TBMT-26.0830', investor: 'Sở Thông tin và Truyền thông Bắc Ninh', biddingMethod: 'Chào hàng cạnh tranh', fieldType: 'Hàng hóa CNTT', contractType: 'Trọn gói', packagePrice: 7500000000, bidSecurity: 110000000, closeDate: '2026-06-21' },
    revenue: 7000000000,
    locked: true,
    version: 1,
    masterCode: '022.111',
    businessCode: '022.111.1',
    productionCode: '022.111.2',
    outsourceCodes: [],
    productionTasks: [],
    steps: [
      {
        id: 'S1', order: 1, name: 'Chi phí Kinh doanh', assignee: 'Lê Thu Trang (Sale)', startDate: '2026-06-24', endDate: '2026-07-31', note: 'Chi phí bán hàng & hồ sơ thầu',
        approvedBudget: 1200000000, revenue: 2500000000,
        costItems: [
          { id: 'C1', name: 'Chi phí đội bán hàng & tư vấn', costType: 'Nhân công triển khai', amount: 500000000, actualAmount: 0 },
          { id: 'C2', name: 'Chi phí lập hồ sơ thầu & bảo lãnh', costType: 'Chi phí quản lý dự án', amount: 300000000, actualAmount: 0 },
          { id: 'C3', name: 'Hoa hồng đối tác', costType: 'Khác', amount: 300000000, actualAmount: 0 },
        ],
      },
      {
        id: 'S2', order: 2, name: 'Chi phí Sản xuất', assignee: 'Đội triển khai (PM)', startDate: '2026-08-01', endDate: '2026-10-15', note: 'Chi phí phát triển & triển khai',
        approvedBudget: 4000000000, revenue: 4500000000,
        costItems: [
          { id: 'C4', name: 'Nhân công phát triển & tích hợp', costType: 'Nhân công triển khai', amount: 2200000000, actualAmount: 0 },
          { id: 'C5', name: 'Bản quyền phần mềm nền tảng', costType: 'Bản quyền phần mềm', amount: 900000000, actualAmount: 0 },
          { id: 'C6', name: 'Hạ tầng máy chủ / Cloud', costType: 'Phần cứng/Thiết bị', amount: 600000000, actualAmount: 0 },
          { id: 'C7', name: 'Kiểm thử & đào tạo chuyển giao', costType: 'Đào tạo & Chuyển giao', amount: 300000000, actualAmount: 0 },
        ],
      },
    ],
    approvalHistory: [
      { id: 'AR1', stepLabel: 'Chờ GĐ Khối', role: 'BUSINESS_DIRECTOR', actor: 'Nguyễn Tiến Dũng', action: 'APPROVE', comment: 'Thông qua.', oldStatus: 'PENDING_BUSINESS_DIRECTOR', newStatus: 'PENDING_BOD', createdAt: '2026-06-25 09:00' },
      { id: 'AR2', stepLabel: 'Chờ BOD', role: 'BOD', actor: 'Phạm Minh Hải', action: 'APPROVE', comment: 'Đồng ý.', oldStatus: 'PENDING_BOD', newStatus: 'PENDING_ACCOUNTANT', createdAt: '2026-06-25 11:00' },
      { id: 'AR3', stepLabel: 'Chờ Kế toán', role: 'ACCOUNTANT', actor: 'Lê Thị Mai', action: 'APPROVE', comment: 'Ngân sách hợp lệ, chuyển IT tạo dự án Jira.', oldStatus: 'PENDING_ACCOUNTANT', newStatus: 'PENDING_IT', createdAt: '2026-06-26 15:00' },
    ],
    changeRequests: [],
    versionHistory: [],
  },
  {
    id: 'PAKD-103',
    name: 'Dự án số hóa quy trình & lưu trữ BIDV',
    customerName: 'Ngân hàng TMCP Đầu tư và Phát triển VN (BIDV)',
    customerCode: 'BIDV',
    creator: 'Lê Thu Trang',
    createdAt: '2026-06-20 14:00',
    status: 'PENDING_BUSINESS_DIRECTOR',
    tender: { packageCode: 'TBMT-26.0815', investor: 'Ngân hàng TMCP Đầu tư và Phát triển VN (BIDV)', biddingMethod: 'Chào hàng cạnh tranh', fieldType: 'Dịch vụ phi tư vấn', contractType: 'Trọn gói', packagePrice: 9000000000, bidSecurity: 130000000, closeDate: '2026-06-18' },
    revenue: 8500000000,
    outsourceCodes: [],
    productionTasks: [],
    locked: false,
    version: 1,
    steps: [
      {
        id: 'S1', order: 1, name: 'Phân tích & xây dựng MVP1', assignee: 'Đội phần mềm', startDate: '2026-08-01', endDate: '2026-10-15',
        approvedBudget: 0,
        costItems: [
          { id: 'C1', name: 'Nhân công phát triển', costType: 'Nhân công', amount: 4000000000 },
          { id: 'C2', name: 'Hạ tầng lưu trữ', costType: 'Thiết bị', amount: 2000000000 },
        ],
      },
    ],
    approvalHistory: [],
    changeRequests: [],
    versionHistory: [],
  },
  {
    id: 'PAKD-105',
    name: 'Hạ tầng Cloud Server tỉnh Bắc Ninh',
    customerName: 'Sở Thông tin và Truyền thông Bắc Ninh',
    customerCode: 'SSTT_BN',
    creator: 'Lê Thu Trang',
    createdAt: '2026-06-25 10:00',
    status: 'DRAFT',
    tender: { packageCode: 'TBMT-26.0903', investor: 'Sở Thông tin và Truyền thông Bắc Ninh', biddingMethod: 'Đấu thầu rộng rãi', fieldType: 'Xây lắp hạ tầng CNTT', contractType: 'Theo đơn giá cố định', packagePrice: 12500000000, bidSecurity: 180000000, closeDate: '2026-07-20' },
    revenue: 12000000000,
    outsourceCodes: [],
    productionTasks: [],
    locked: false,
    version: 1,
    steps: [
      {
        id: 'S1', order: 1, name: 'Cung cấp & lắp đặt máy chủ', assignee: 'Chưa phân công', startDate: '2026-09-15', endDate: '2026-11-15',
        approvedBudget: 0,
        costItems: [
          { id: 'C1', name: 'Máy chủ & thiết bị mạng', costType: 'Thiết bị', amount: 6000000000 },
        ],
      },
    ],
    approvalHistory: [],
    changeRequests: [],
    versionHistory: [],
  },
];

export const INITIAL_PAKDS: Pakd[] = RAW_PAKDS.map(normalizePhases);
