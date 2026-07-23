import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Wallet, 
  Settings, 
  Calendar, 
  Clock, 
  ClipboardList, 
  FileText, 
  Briefcase,
  UserCheck,
  Plane,
  Home,
  MessageSquare,
  Award,
  Gavel,
  Database,
  Building,
  Users2,
  Layers,
  Hash,
  Network,
  Inbox,
  PieChart,
  BellRing,
  UserPlus,
  Columns3
} from 'lucide-react';

export interface NavItem {
  title: string;
  icon: any;
  path?: string;
  children?: NavItem[];
}

export const NAVIGATION: NavItem[] = [
  {
    title: 'Project Management',
    icon: BarChart3,
    children: [
      { title: 'Projects', icon: Briefcase },
      { title: 'Bảng giai đoạn', icon: Columns3 },
      { title: 'Chi thực tế (Kế toán)', icon: Wallet },
    ]
  },
];

export interface LeaveRequest {
  id: string;
  employeeId: string;
  fullName: string;
  project: string;
  createdAt: string;
  lastModificationTime: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  status: 'Requested' | 'Approved' | 'Rejected';
  approvedBy?: string;
}

export const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'V00623',
    fullName: 'HỒ TÚ ANH',
    project: 'A.25.022.HTBTC',
    createdAt: '17/04/2026',
    lastModificationTime: '17/04/2026',
    leaveType: 'Maternity Leave',
    startDate: '17/04/2026 08:00',
    endDate: '22/04/2026 11:12',
    totalHours: 27.2,
    status: 'Requested'
  },
  {
    id: '2',
    employeeId: 'V00914',
    fullName: 'hồ long nhật man',
    project: 'X.24.NB.PMO',
    createdAt: '17/04/2026',
    lastModificationTime: '17/04/2026',
    leaveType: 'Wedding leave',
    startDate: '17/04/2026 08:00',
    endDate: '17/04/2026 17:30',
    totalHours: 8,
    status: 'Requested'
  },
  {
    id: '3',
    employeeId: 'V00437',
    fullName: 'admin',
    project: 'S.23.NB.SND.IMIS_TEST',
    createdAt: '13/04/2026',
    lastModificationTime: '17/04/2026',
    leaveType: 'Annual leave',
    startDate: '26/03/2026 08:00',
    endDate: '26/03/2026 17:00',
    totalHours: 7.5,
    status: 'Requested'
  },
  {
    id: '4',
    employeeId: 'V00914',
    fullName: 'hồ long nhật man',
    project: 'V.25.H.FX.039.03',
    createdAt: '26/03/2026',
    lastModificationTime: '26/03/2026',
    leaveType: 'Annual leave',
    startDate: '26/03/2026 08:00',
    endDate: '26/03/2026 17:30',
    totalHours: 8,
    status: 'Approved',
    approvedBy: 'admin admin'
  }
];

export interface TimesheetEntry {
  id: string;
  projectName: string;
  authorName: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Draft';
}

export const MOCK_TIMESHEETS: TimesheetEntry[] = [
  { id: '1', projectName: 'A.25.022.HTBTC', authorName: 'HỒ TÚ ANH', status: 'Requested' },
  { id: '2', projectName: 'X.24.NB.PMO', authorName: 'hồ long nhật man', status: 'Requested' },
  { id: '3', projectName: 'S.23.NB.SND.IMIS_TEST', authorName: 'admin', status: 'Approved' },
  { id: '4', projectName: 'V.25.H.FX.039.03', authorName: 'hồ long nhật man', status: 'Draft' },
];

export interface LeaveBalance {
  id: string;
  employeeId: string;
  fullName: string;
  year: number;
  totalEntitlement: number; // Tổng phép năm nay
  carriedForward: number; // Phép tồn năm ngoái
  granted: number; // Phép được cấp thêm
  used: number; // Phép đã dùng
  remaining: number; // Phép còn lại
  pendingApproval: number; // Phép đang chờ duyệt
}

export interface LeaveHistory {
  date: string;
  amount: number;
  type: 'plus' | 'minus';
  reason: string;
  person?: string;
}

export interface HRTicket {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  days: number;
  status: 'Pending HR' | 'Added' | 'Rejected';
  reason?: string;
  createdAt: string;
  evidence?: boolean;
}

export const MOCK_PERSONAL_LEAVE: LeaveBalance = {
  id: '1',
  employeeId: 'V00437',
  fullName: 'admin',
  year: 2026,
  totalEntitlement: 18,
  carriedForward: 2,
  granted: 3,
  used: 7.5,
  remaining: 15.5,
  pendingApproval: 1.5
};

export const MOCK_LEAVE_HISTORY: LeaveHistory[] = [
  { date: '10/05/2026', amount: 3.0, type: 'plus', reason: 'Cấp phép kết hôn', person: 'HR admin' },
  { date: '05/05/2026', amount: 2.0, type: 'minus', reason: 'Nghỉ ốm', person: 'Manager Hồ Tú Anh' },
  { date: '01/05/2026', amount: 1.0, type: 'plus', reason: 'Hệ thống tự động cộng hàng tháng' },
];

export const MOCK_HR_TICKETS: HRTicket[] = [
  { id: 'T1', employeeId: 'V00437', employeeName: 'admin', type: 'Đơn cộng phép kết hôn', days: 3, status: 'Added', createdAt: '10/05/2026', evidence: true },
  { id: 'T2', employeeId: 'V00623', employeeName: 'HỒ TÚ ANH', type: 'Phép thai sản bổ sung', days: 5, status: 'Pending HR', createdAt: '12/05/2026', evidence: true },
  { id: 'T3', employeeId: 'V00914', employeeName: 'hồ long nhật man', type: 'Phép hiếu hỉ', days: 2, status: 'Pending HR', createdAt: '13/05/2026', evidence: false },
];

export interface GlobalLedgerEntry {
  id: string;
  timestamp: string;
  employeeName: string;
  action: string;
  amount: number;
  performer: string;
  balanceAfter: number;
  source: 'System' | 'Ticket' | 'Manual';
  dept: string;
}

export interface LeaveTypeConfig {
  id: string;
  name: string;
  standardDays: number;
  evidenceRequired: boolean;
  validityDays: number;
}

export const MOCK_LEAVE_TYPES: LeaveTypeConfig[] = [
  { id: 'LT1', name: 'Kết hôn', standardDays: 3, evidenceRequired: true, validityDays: 30 },
  { id: 'LT2', name: 'Tang chế (Tứ thân phụ mẫu)', standardDays: 3, evidenceRequired: true, validityDays: 30 },
  { id: 'LT3', name: 'Thai sản', standardDays: 180, evidenceRequired: true, validityDays: 365 },
  { id: 'LT4', name: 'Nghỉ khám thai', standardDays: 5, evidenceRequired: true, validityDays: 90 },
];

export interface SystemConfig {
  accrualDay: number;
  accrualValue: number;
  accrualProbation: boolean;
  maxNegativeBalance: number;
  carryoverDate: string;
  maxCarryoverDays: number;
  minLeaveUnit: 'Day' | 'Half Day' | 'Hour';
}

export const MOCK_SYSTEM_CONFIG: SystemConfig = {
  accrualDay: 1,
  accrualValue: 1.0,
  accrualProbation: false,
  maxNegativeBalance: 2,
  carryoverDate: '31/03',
  maxCarryoverDays: 5,
  minLeaveUnit: 'Half Day'
};

export const MOCK_GLOBAL_LEDGER: GlobalLedgerEntry[] = [
  { id: 'L1', timestamp: '14/05/2026 09:30', employeeName: 'HỒ TÚ ANH', action: 'Cộng phép thai sản', amount: 5, performer: 'HR Admin', balanceAfter: 14.5, source: 'Ticket', dept: 'Development' },
  { id: 'L2', timestamp: '01/05/2026 00:00', employeeName: 'Nguyễn Văn A', action: 'Hệ thống tự động cộng hàng tháng', amount: 1, performer: 'System', balanceAfter: 13.5, source: 'System', dept: 'Development' },
  { id: 'L3', timestamp: '10/05/2026 14:15', employeeName: 'admin', action: 'Thưởng hiệu suất năm', amount: 2, performer: 'HR Admin', balanceAfter: 15.5, source: 'Manual', dept: 'HR' },
];

export interface TeamLeaveRequest {
  id: string;
  employeeName: string;
  avatar: string;
  position: string;
  type: 'Nghỉ phép (Trừ hũ)' | 'Nghỉ không lương';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  currentBalance: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const MOCK_TEAM_REQUESTS: TeamLeaveRequest[] = [
  {
    id: 'TR1',
    employeeName: 'Nguyễn Văn A',
    avatar: 'https://ui-avatars.com/api/?name=NV+A&background=random',
    position: 'Developer',
    type: 'Nghỉ phép (Trừ hũ)',
    startDate: '15/05/2026',
    endDate: '16/05/2026',
    totalDays: 2,
    reason: 'Giải quyết việc gia đình',
    currentBalance: 12.5,
    status: 'Pending'
  },
  {
    id: 'TR2',
    employeeName: 'Lê Thị B',
    avatar: 'https://ui-avatars.com/api/?name=LT+B&background=random',
    position: 'Tester',
    type: 'Nghỉ không lương',
    startDate: '14/05/2026',
    endDate: '14/05/2026',
    totalDays: 1,
    reason: 'Đi khám bệnh',
    currentBalance: 5,
    status: 'Pending'
  },
  {
    id: 'TR3',
    employeeName: 'Trần Văn C',
    avatar: 'https://ui-avatars.com/api/?name=TV+C&background=random',
    position: 'Designer',
    type: 'Nghỉ phép (Trừ hũ)',
    startDate: '20/05/2026',
    endDate: '25/05/2026',
    totalDays: 6,
    reason: 'Du lịch hè',
    currentBalance: 18,
    status: 'Pending'
  }
];

export const MOCK_LEAVE_BALANCES: LeaveBalance[] = [
  {
    id: '1',
    employeeId: 'V00623',
    fullName: 'HỒ TÚ ANH',
    year: 2026,
    totalEntitlement: 12,
    carriedForward: 2,
    granted: 0,
    used: 4.5,
    remaining: 9.5,
    pendingApproval: 0
  },
  {
    id: '2',
    employeeId: 'V00914',
    fullName: 'hồ long nhật man',
    year: 2026,
    totalEntitlement: 14,
    carriedForward: 5,
    granted: 1,
    used: 2,
    remaining: 18,
    pendingApproval: 1
  },
  {
    id: '3',
    employeeId: 'V00437',
    fullName: 'admin',
    year: 2026,
    totalEntitlement: 18,
    carriedForward: 0,
    granted: 3,
    used: 7.5,
    remaining: 10.5,
    pendingApproval: 1.5
  }
];
