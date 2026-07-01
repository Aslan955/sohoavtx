import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Star, 
  Grid, 
  List, 
  FileText, 
  Clock, 
  Briefcase, 
  CheckSquare, 
  LogOut, 
  Plane, 
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  ExternalLink,
  Users,
  Trash2,
  Edit,
  Paperclip,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HRAdminCenter } from './HRAdminCenter';

// Request type definitions
interface RequestType {
  id: string;
  title: string;
  code: string;
  icon: React.ReactNode;
  bgIconColor: string;
  myCount: number;
  approvalCount: number;
  description: string;
}

// Request instance definition (for the tracker table below)
interface RequestInstance {
  id: string;
  code: string;
  typeId: string;
  typeName: string;
  createdAt: string;
  applicant: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Draft';
  approver: string;
  teamMembers?: string[];
}

export const RequestManagementPage: React.FC = () => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'my-requests' | 'pending-approval' | 'hr-admin'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  
  // Selections and rejection modal states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectingIds, setRejectingIds] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [openRejectModal, setOpenRejectModal] = useState(false);
  
  // Modals state
  const [activeCreateModal, setActiveCreateModal] = useState<string | null>(null); // 'leave' | 'ot' | 'business' | 'checkin' | 'resign'
  const [otMode, setOtMode] = useState<'hourly' | 'package' | 'staffing'>('hourly');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Leave Form specific state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'annual',
    hours: '8',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  // OT Hourly Form specific state
  const [otHourlyForm, setOtHourlyForm] = useState({
    projectCode: 'A.24.DA.VCB.STAF',
    description: '',
    uploadedFiles: [] as string[],
    assignments: [
      {
        selected: true,
        employeeCode: 'V00360',
        employeeName: 'BÙI VĂN HUẾ',
        role: 'DEPLOYMENT',
        date: '2026-06-02',
        startTime: '18:00',
        endTime: '21:00',
        overtimeHours: '3.00'
      },
      {
        selected: true,
        employeeCode: 'V00554',
        employeeName: 'NGUYỄN MINH HIẾU',
        role: 'Dev',
        date: '2026-06-02',
        startTime: '18:00',
        endTime: '21:00',
        overtimeHours: '3.00'
      }
    ]
  });

  // OT Package Form specific state
  const [otPackageForm, setOtPackageForm] = useState({
    projectCode: 'A.24.DA.VCB.STAF',
    description: '',
    uploadedFiles: [] as string[],
    packageBudget: '50000000',
    assignments: [
      {
        selected: true,
        employeeCode: 'V00360',
        employeeName: 'BÙI VĂN HUẾ',
        role: 'DEPLOYMENT',
        amount: '15000000'
      },
      {
        selected: true,
        employeeCode: 'V00554',
        employeeName: 'NGUYỄN MINH HIẾU',
        role: 'Dev',
        amount: '15000000'
      }
    ]
  });

  // OT Staffing Self Form (Staffing nhân viên tự đăng ký OT theo dự án)
  const [otStaffingForm, setOtStaffingForm] = useState({
    projectCode: 'A.24.DA.VCB.STAF',
    date: '2026-06-08',
    startTime: '18:00',
    endTime: '21:00',
    overtimeHours: '3.0',
    description: '',
    uploadedFiles: [] as string[],
    approver: 'Trần Văn B (Manager)'
  });

  // Permit/Leave Grant Form specific state (Quy trình cũ)
  const [permitForm, setPermitForm] = useState({
    requestedDays: '1.0',
    leaveTypeCategory: 'marriage',
    applyYear: '2026',
    reason: '',
    evidence: '',
    approver: 'Trần Văn B (Manager)'
  });

  // Checkin/out Form specific state
  const [checkinForm, setCheckinForm] = useState({
    date: '',
    time: '08:00',
    direction: 'in', // 'in' or 'out'
    reason: ''
  });

  // Resignation Form specific state
  const [resignForm, setResignForm] = useState({
    intendedLastDay: '',
    reason: '',
    noticePeriodCompelled: 'yes'
  });

  // Onsite Form specific state
  const [onsiteForm, setOnsiteForm] = useState({
    projectCode: 'A.24.DA.VCB.STAF',
    location: 'Vietcombank Tower - Số 198 Trần Quang Khải, Hà Nội',
    dates: [
      { id: '1', date: '2026-06-15', startTime: '08:00', endTime: '17:30', hours: '8.0', onsiteType: 'Full day' },
      { id: '2', date: '2026-06-16', startTime: '08:05', endTime: '17:35', hours: '8.0', onsiteType: 'Full day' },
      { id: '3', date: '2026-06-17', startTime: '08:00', endTime: '17:30', hours: '8.0', onsiteType: 'Full day' },
      { id: '4', date: '2026-06-18', startTime: '08:00', endTime: '17:30', hours: '8.0', onsiteType: 'Full day' },
      { id: '5', date: '2026-06-19', startTime: '08:00', endTime: '17:30', hours: '8.0', onsiteType: 'Full day' }
    ],
    purpose: 'Hỗ trợ khách hàng UAT hệ thống Mobile Banking thế hệ mới',
    approver: 'HOD Giám đốc khối',
    uploadedFiles: [] as string[],
    assignments: [
      { selected: true, staffId: 'NV00123', name: 'BÙI VĂN HUẾ', role: 'DEPLOYMENT' },
      { selected: true, staffId: 'NV00456', name: 'NGUYỄN MINH HIẾU', role: 'Developer' },
      { selected: false, staffId: 'NV00789', name: 'ĐỖ THỊ MAI', role: 'QC Tester' },
      { selected: false, staffId: 'NV00999', name: 'PHẠM HÙNG ANH', role: 'Tech Lead' },
      { selected: false, staffId: 'NV01256', name: 'LÊ QUỲNH CHI', role: 'Developer' }
    ]
  });

  const [onsiteMode, setOnsiteMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedWeekStart, setSelectedWeekStart] = useState('2026-06-15');
  const [selectedMonth, setSelectedMonth] = useState('2026-06');

  // List of request cards requested by user
  const requestTypes: RequestType[] = [
    {
      id: 'leave',
      title: 'Đơn xin nghỉ/ Đơn làm việc linh hoạt',
      code: 'DXN',
      icon: (
        <div className="w-14 h-14 bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl flex items-center justify-center text-[#059669] relative group-hover:scale-105 transition-transform duration-300">
          <Plane size={24} className="animate-pulse" />
          <span className="absolute bottom-1 right-1 bg-emerald-600 text-white font-mono font-black text-[7px] px-1 rounded-sm">LEAVE</span>
        </div>
      ),
      bgIconColor: 'bg-[#10b981]',
      myCount: 164,
      approvalCount: 0,
      description: 'Nghỉ phép năm, nghỉ phép không lương, làm việc từ xa (WFH), kết hôn, thai sản...',
    },
    {
      id: 'ot',
      title: 'Đơn làm thêm giờ',
      code: 'DLTG-CN',
      icon: (
        <div className="w-14 h-14 bg-[#fff7ed] border border-[#fed7aa] rounded-2xl flex items-center justify-center text-[#d97706] relative group-hover:scale-105 transition-transform duration-300">
          <Clock size={24} />
          <span className="absolute bottom-1 right-1 bg-amber-600 text-white font-mono font-black text-[7px] px-1 rounded-sm">OT</span>
        </div>
      ),
      bgIconColor: 'bg-[#f59e0b]',
      myCount: 38,
      approvalCount: 0,
      description: 'Đăng ký làm thêm ngoài giờ hành chính hoặc vào cuối tuần, ngày lễ.',
    },
    {
      id: 'business',
      title: 'Đơn cấp phép',
      code: 'DCP',
      icon: (
        <div className="w-14 h-14 bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl flex items-center justify-center text-[#2563eb] relative group-hover:scale-105 transition-transform duration-300">
          <Briefcase size={24} />
          <span className="absolute bottom-1 right-1 bg-blue-600 text-white font-mono font-black text-[7px] px-1 rounded-sm">PERMIT</span>
        </div>
      ),
      bgIconColor: 'bg-[#3b82f6]',
      myCount: 12,
      approvalCount: 2,
      description: 'Đăng ký xin cấp số ngày phép theo quy trình cũ (bổ sung thâm niên, kết chuyển phép cũ, hoặc nghỉ bù dự án).',
    },
    {
      id: 'checkin',
      title: 'Đơn Checkin/ Checkout',
      code: 'DXNCC',
      icon: (
        <div className="w-14 h-14 bg-[#f5f3ff] border border-[#ddd6fe] rounded-2xl flex items-center justify-center text-[#7c3aed] relative group-hover:scale-105 transition-transform duration-300">
          <CheckSquare size={24} />
          <span className="absolute bottom-1 right-1 bg-purple-600 text-white font-mono font-black text-[7px] px-1 rounded-sm">LOG</span>
        </div>
      ),
      bgIconColor: 'bg-[#8b5cf6]',
      myCount: 141,
      approvalCount: 0,
      description: 'Quên chấm công, bổ sung giờ vào/ra thực tế do lỗi hệ thống hoặc đi gặp khách hàng.',
    },
    {
      id: 'resign',
      title: 'Đơn nghỉ việc',
      code: 'DNV',
      icon: (
        <div className="w-14 h-14 bg-[#fef2f2] border border-[#fecaca] rounded-2xl flex items-center justify-center text-[#dc2626] relative group-hover:scale-105 transition-transform duration-300">
          <LogOut size={24} />
          <span className="absolute bottom-1 right-1 bg-red-600 text-white font-mono font-black text-[7px] px-1 rounded-sm">EXIT</span>
        </div>
      ),
      bgIconColor: 'bg-[#ef4444]',
      myCount: 1,
      approvalCount: 0,
      description: 'Đơn xin thôi việc theo quy định hợp đồng lao động và bàn giao công việc.',
    },
    {
      id: 'onsite',
      title: 'Đơn đăng ký đi onsite',
      code: 'DOS',
      icon: (
        <div className="w-14 h-14 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl flex items-center justify-center text-[#16a34a] relative group-hover:scale-105 transition-transform duration-300">
          <MapPin size={24} />
          <span className="absolute bottom-1 right-1 bg-[#16a34a] text-white font-mono font-black text-[7px] px-1 rounded-sm">ONSITE</span>
        </div>
      ),
      bgIconColor: 'bg-[#22c55e]',
      myCount: 4,
      approvalCount: 1,
      description: 'Đăng ký công tác, làm việc tại văn phòng đối tác/khách hàng hoặc ngoài trụ sở công ty.',
    }
  ];

  // Request list instances database
  const [instances, setInstances] = useState<RequestInstance[]>([
    {
      id: '1',
      code: 'DXN-00438',
      typeId: 'leave',
      typeName: 'Đơn xin nghỉ/ Đơn làm việc linh hoạt',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: 'Nghỉ phép có hưởng lương - 1 ngày (8 giờ), Lý do: Giải quyết việc cá nhân',
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    },
    {
      id: '2',
      code: 'DLTG-0129',
      typeId: 'ot_hourly',
      typeName: 'Đơn làm thêm giờ (Theo giờ)',
      createdAt: '20/05/2026',
      applicant: 'Nguyễn Văn User',
      details: '[OT THEO GIỜ] Dự án: A.24.DA.VCB.STAF. Danh sách: [BÙI VĂN HUẾ (3.00 giờ), NGUYỄN MINH HIẾU (3.00 giờ)]. Lý do: Deploy hệ thống Production',
      status: 'Approved',
      approver: 'Trần Văn B (Manager)'
    },
    {
      id: '3',
      code: 'DXNCC-049',
      typeId: 'checkin',
      typeName: 'Đơn Checkin/ Checkout',
      createdAt: '19/05/2026',
      applicant: 'Nguyễn Văn User',
      details: 'Bổ sung giờ vào (08:30) ngày 18/05, Lý do: Cổng từ kẹt thẻ',
      status: 'Approved',
      approver: 'Trần Văn B (Manager)'
    },
    {
      id: '4',
      code: 'DCP-0902',
      typeId: 'business',
      typeName: 'Đơn cấp phép',
      createdAt: '15/05/2026',
      applicant: 'Nguyễn Văn User',
      details: 'Đề xuất cấp thêm 2.0 ngày [Phép năm ngoái (2025)] áp dụng năm 2026. Minh chứng đính kèm: Quy trình cũ kết chuyển. Lý do: Chưa kịp kết chuyển phép thâm niên năm cũ sang năm 2026.',
      status: 'Rejected',
      approver: 'Lê Văn HR (HR Manager)'
    },
    {
      id: '5',
      code: 'DNV-0001',
      typeId: 'resign',
      typeName: 'Đơn nghỉ việc',
      createdAt: '12/05/2026',
      applicant: 'Nguyễn Văn User',
      details: 'Ngày làm việc cuối mong muốn: 30/06/2026',
      status: 'Draft',
      approver: 'Trần Văn B (Manager)'
    },
    {
      id: '6',
      code: 'DLTG-0130',
      typeId: 'ot_package',
      typeName: 'Đơn làm thêm giờ (Theo gói)',
      createdAt: '22/05/2026',
      applicant: 'Nguyễn Văn User',
      details: '[OT THEO GÓI] Dự án: A.24.DA.VCB.STAF (Tổng gói: 50.000.000 VND). Danh sách: [BÙI VĂN HUẾ (15.000.000 VND), NGUYỄN MINH HIẾU (15.000.000 VND)]. Nội dung: Hoàn thiện tính năng Core banking',
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    },
    {
      id: '7',
      code: 'DLTG-0131',
      typeId: 'ot_hourly',
      typeName: 'Đơn làm thêm giờ (Theo giờ)',
      createdAt: '23/05/2026',
      applicant: 'Nguyễn Văn User',
      details: '[OT THEO GIỜ] Dự án: A.25.DA.BIDV.CORE. Danh sách: [PHẠM HÙNG ANH (4.00 giờ)]. Lý do: Fix bug tích hợp Core Banking ngoại giờ khẩn cấp',
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    },
    {
      id: '8',
      code: 'DOS-23940',
      typeId: 'onsite',
      typeName: 'Đơn đăng ký đi onsite',
      createdAt: '10/06/2026',
      applicant: 'Nguyễn Văn User (PM)',
      details: '[ONSITE] Dự án: A.24.DA.VCB.STAF. Nhân sự: [BÙI VĂN HUẾ, NGUYỄN MINH HIẾU]. Địa điểm: Vietcombank Tower - Số 198 Trần Quang Khải, Hà Nội. Thời gian: Từ 15/06/2026 08:00 đến 19/06/2026 17:30 (Tổng số: 40.0 giờ đi onsite). Mục đích: Triển khai vận hành tích hợp đối tác ngoại tại onsite khách hàng',
      status: 'Pending',
      approver: 'HOD Giám đốc khối',
      teamMembers: ['BÙI VĂN HUẾ', 'NGUYỄN MINH HIẾU']
    }
  ]);

  // Handle new submission
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handle approvals and rejections
  const handleApproveSingle = (id: string) => {
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
        return { ...inst, status: 'Approved' };
      }
      return inst;
    }));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    triggerToast('🎉 Đã phê duyệt đơn thành công!');
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    
    const pendingSelected = instances.filter(i => selectedIds.includes(i.id) && i.status === 'Pending');
    if (pendingSelected.length === 0) {
      triggerToast('⚠️ Không có đơn nào đang chờ duyệt trong danh sách đã chọn!');
      return;
    }

    setInstances(prev => prev.map(inst => {
      if (selectedIds.includes(inst.id) && inst.status === 'Pending') {
        return { ...inst, status: 'Approved' };
      }
      return inst;
    }));
    
    const approvedIds = pendingSelected.map(i => i.id);
    setSelectedIds(prev => prev.filter(selectedId => !approvedIds.includes(selectedId)));
    triggerToast(`🎉 Đã phê duyệt hàng loạt ${approvedIds.length} đơn thành công!`);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingIds.length === 0) return;
    if (!rejectionReason.trim()) {
      triggerToast('⚠️ Vui lòng nhập lý do từ chối!');
      return;
    }

    setInstances(prev => prev.map(inst => {
      if (rejectingIds.includes(inst.id)) {
        return { 
          ...inst, 
          status: 'Rejected',
          details: `${inst.details} (Lý do từ chối: ${rejectionReason.trim()})`
        };
      }
      return inst;
    }));

    setSelectedIds(prev => prev.filter(id => !rejectingIds.includes(id)));
    
    const count = rejectingIds.length;
    setRejectingIds([]);
    setRejectionReason('');
    setOpenRejectModal(false);
    triggerToast(`❌ Đã từ chối ${count} đơn thành công!`);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DXN-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'leave',
      typeName: 'Đơn xin nghỉ/ Đơn làm việc linh hoạt',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: `${leaveForm.leaveType === 'annual' ? 'Nghỉ phép có hưởng lương' : leaveForm.leaveType === 'unpaid' ? 'Nghỉ phép không lương' : 'Đăng ký WFH'} - ${leaveForm.hours} giờ, Lý do: ${leaveForm.reason}`,
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã nộp đơn xin nghỉ/ làm việc linh hoạt thành công!');
  };

  const handleCreateOTHourly = (e: React.FormEvent) => {
    e.preventDefault();
    const activeAssigns = otHourlyForm.assignments.filter(a => a.selected);
    const membersStr = activeAssigns.map(a => `${a.employeeName} (${a.overtimeHours} giờ)`).join(', ');
    const detailsStr = `[OT THEO GIỜ] Dự án: ${otHourlyForm.projectCode}. Danh sách: [${membersStr}]. Lý do: ${otHourlyForm.description || 'Làm thêm giờ hoàn thiện tính năng'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DLTG-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'ot_hourly',
      typeName: 'Đơn làm thêm giờ (Theo giờ)',
      createdAt: '22/05/2026',
      applicant: 'Nguyễn Văn User',
      details: detailsStr,
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã gửi đơn đăng ký OT theo giờ thành công!');
  };

  const handleSaveOTHourlyDraft = () => {
    const activeAssigns = otHourlyForm.assignments.filter(a => a.selected);
    const membersStr = activeAssigns.map(a => `${a.employeeName} (${a.overtimeHours} giờ)`).join(', ');
    const detailsStr = `[BẢN NHÁP - OT THEO GIỜ] Dự án: ${otHourlyForm.projectCode}. Danh sách: [${membersStr}]. Lý do: ${otHourlyForm.description || 'Bản nháp'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DLTG-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'ot_hourly',
      typeName: 'Đơn làm thêm giờ (Theo giờ)',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: detailsStr,
      status: 'Draft',
      approver: 'Chưa gửi (Nháp)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('📁 Đã lưu bản nháp đơn làm thêm giờ theo giờ thành công!');
  };

  const handleCreateOTPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const activeAssigns = otPackageForm.assignments.filter(a => a.selected);
    const formattedBudget = Number(otPackageForm.packageBudget || 0).toLocaleString('vi-VN');
    const membersStr = activeAssigns.map(a => `${a.employeeName} (${Number(a.amount || 0).toLocaleString('vi-VN')} VND)`).join(', ');
    const detailsStr = `[OT THEO GÓI] Dự án: ${otPackageForm.projectCode} (Tổng gói: ${formattedBudget} VND). Danh sách: [${membersStr}]. Lý do: ${otPackageForm.description || 'Làm thêm giờ theo gói dự án'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DLTG-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'ot_package',
      typeName: 'Đơn làm thêm giờ (Theo gói)',
      createdAt: '22/05/2026',
      applicant: 'Nguyễn Văn User',
      details: detailsStr,
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã gửi đơn đăng ký OT theo gói khoán thành công!');
  };

  const handleSaveOTPackageDraft = () => {
    const activeAssigns = otPackageForm.assignments.filter(a => a.selected);
    const formattedBudget = Number(otPackageForm.packageBudget || 0).toLocaleString('vi-VN');
    const membersStr = activeAssigns.map(a => `${a.employeeName} (${Number(a.amount || 0).toLocaleString('vi-VN')} VND)`).join(', ');
    const detailsStr = `[BẢN NHÁP - OT THEO GÓI] Dự án: ${otPackageForm.projectCode} (Tổng gói: ${formattedBudget} VND). Danh sách: [${membersStr}]. Lý do: ${otPackageForm.description || 'Bản nháp'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DLTG-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'ot_package',
      typeName: 'Đơn làm thêm giờ (Theo gói)',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: detailsStr,
      status: 'Draft',
      approver: 'Chưa gửi (Nháp)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('📁 Đã lưu bản nháp đơn làm thêm giờ theo gói thành công!');
  };

  const handleCreateOTStaffing = (e: React.FormEvent) => {
    e.preventDefault();
    const detailsStr = `[OT STAFFING TỰ ĐĂNG KÝ] Dự án: ${otStaffingForm.projectCode}. Ngày: ${otStaffingForm.date} (${otStaffingForm.startTime} - ${otStaffingForm.endTime}, Số giờ: ${otStaffingForm.overtimeHours} h). Lý do: ${otStaffingForm.description || 'Staffing nhân viên tự khai báo OT theo dự án'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DLST-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'ot_staffing',
      typeName: 'Đơn OT Staffing tự đăng ký',
      createdAt: '22/05/2026',
      applicant: 'Nguyễn Văn User',
      details: detailsStr,
      status: 'Pending',
      approver: otStaffingForm.approver
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã gửi đơn tự đăng ký OT Staffing thành công!');
  };

  const handleSaveOTStaffingDraft = () => {
    const detailsStr = `[BẢN NHÁP - OT STAFFING] Dự án: ${otStaffingForm.projectCode}. Ngày: ${otStaffingForm.date} (${otStaffingForm.startTime} - ${otStaffingForm.endTime}, Số giờ: ${otStaffingForm.overtimeHours} h). Lý do: ${otStaffingForm.description || 'Bản nháp'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DLST-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'ot_staffing',
      typeName: 'Đơn OT Staffing tự đăng ký',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: detailsStr,
      status: 'Draft',
      approver: 'Chưa gửi (Nháp)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('📁 Đã lưu bản nháp đơn tự đăng ký OT Staffing thành công!');
  };

  const handleCreatePermit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapping category key to Vietnamese text
    let catText = 'Nghỉ Cưới';
    if (permitForm.leaveTypeCategory === 'bereavement') {
      catText = 'Nghỉ Hiếu';
    } else if (permitForm.leaveTypeCategory === 'regime') {
      catText = 'Nghỉ chế độ';
    }

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DCP-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'business',
      typeName: 'Đơn cấp phép',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: `Đề xuất cấp thêm ${permitForm.requestedDays} ngày [${catText}] áp dụng năm ${permitForm.applyYear}. Minh chứng đính kèm: ${permitForm.evidence || 'Không có'}. Lý do: ${permitForm.reason}`,
      status: 'Pending',
      approver: permitForm.approver
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast(`🎉 Đã nộp Đơn cấp thêm phép (${permitForm.requestedDays} ngày) thành công!`);
  };

  const handleCreateCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DXNCC-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'checkin',
      typeName: 'Đơn Checkin/ Checkout',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: `Bổ sung ${checkinForm.direction === 'in' ? 'Checkin' : 'Checkout'} lúc ${checkinForm.time} ngày ${checkinForm.date}, Lý do: ${checkinForm.reason}`,
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã gửi đơn bổ sung checkin/checkout!');
  };

  const handleCreateResign = (e: React.FormEvent) => {
    e.preventDefault();
    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DNV-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'resign',
      typeName: 'Đơn nghỉ việc',
      createdAt: '21/05/2026',
      applicant: 'Nguyễn Văn User',
      details: `Ngày làm việc cuối: ${resignForm.intendedLastDay}, Đúng hạn báo trước: ${resignForm.noticePeriodCompelled === 'yes' ? 'Có' : 'Không'}, Lý do: ${resignForm.reason}`,
      status: 'Pending',
      approver: 'Trần Văn B (Manager)'
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã gửi đơn xin nghỉ việc. Bộ phận HR sẽ liên hệ bàn giao!');
  };

  const autoCalculateOnsiteHours = (date: string, sTime: string, eTime: string) => {
    if (!date || !sTime || !eTime) return '0.0';
    try {
      const sParts = sTime.split(':');
      const eParts = eTime.split(':');
      if (sParts.length !== 2 || eParts.length !== 2) return '0.0';
      const sMins = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
      const eMins = parseInt(eParts[0]) * 60 + parseInt(eParts[1]);
      if (eMins <= sMins) return '0.0';
      let diffHrs = (eMins - sMins) / 60;
      if (sMins <= 12 * 60 && eMins >= 13.5 * 60) {
        diffHrs -= 1.5;
      }
      return Math.max(0.0, diffHrs).toFixed(1);
    } catch {
      return '0.0';
    }
  };

  const handleCreateOnsite = (e: React.FormEvent) => {
    e.preventDefault();
    const activeAssigns = onsiteForm.assignments.filter(a => a.selected);
    if (activeAssigns.length === 0) {
      triggerToast('⚠️ Vui lòng chọn ít nhất một nhân sự đi Onsite!');
      return;
    }
    const memberNames = activeAssigns.map(a => a.name);
    const membersStr = memberNames.join(', ');

    const totalHrs = onsiteForm.dates.reduce((sum, d) => sum + Number(d.hours || 0), 0);
    const dateSummary = onsiteForm.dates.map(d => {
      const formattedDate = new Date(d.date).toLocaleDateString('vi-VN');
      return `${formattedDate} (${d.startTime}-${d.endTime}: ${d.hours}h)`;
    }).join(', ');
    const detailsStr = `[ONSITE] Dự án: ${onsiteForm.projectCode}. Nhân sự: [${membersStr}]. Địa điểm: ${onsiteForm.location}. Lịch trình: [${dateSummary}] (Tổng số: ${totalHrs.toFixed(1)} giờ đi onsite). Mục đích: ${onsiteForm.purpose || 'Hỗ trợ nghiệp vụ onsite'}`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DOS-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'onsite',
      typeName: 'Đơn đăng ký đi onsite',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      applicant: 'Nguyễn Văn User (PM)',
      details: detailsStr,
      status: 'Pending',
      approver: onsiteForm.approver,
      teamMembers: memberNames
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('🎉 Đã gửi đơn đăng ký đi onsite thành công!');
  };

  const handleSaveOnsiteDraft = () => {
    const activeAssigns = onsiteForm.assignments.filter(a => a.selected);
    const memberNames = activeAssigns.map(a => a.name);
    const membersStr = memberNames.length > 0 ? memberNames.join(', ') : 'Chưa chọn nhân sự';

    const totalHrs = onsiteForm.dates.reduce((sum, d) => sum + Number(d.hours || 0), 0);
    const dateSummary = onsiteForm.dates.map(d => {
      const formattedDate = new Date(d.date).toLocaleDateString('vi-VN');
      return `${formattedDate} (${d.startTime}-${d.endTime}: ${d.hours}h)`;
    }).join(', ');
    const detailsStr = `[BẢN NHÁP - ONSITE] Dự án: ${onsiteForm.projectCode}. Nhân sự: [${membersStr}]. Địa điểm: ${onsiteForm.location}. Lịch trình: [${dateSummary}] (Tổng số: ${totalHrs.toFixed(1)} giờ đi onsite).`;

    const newInst: RequestInstance = {
      id: Date.now().toString(),
      code: `DOS-${Math.floor(10000 + Math.random() * 90000)}`,
      typeId: 'onsite',
      typeName: 'Đơn đăng ký đi onsite',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      applicant: 'Nguyễn Văn User (PM)',
      details: detailsStr,
      status: 'Draft',
      approver: 'Chưa gửi (Nháp)',
      teamMembers: memberNames
    };
    setInstances([newInst, ...instances]);
    setActiveCreateModal(null);
    triggerToast('📁 Đã lưu bản nháp đơn đăng ký đi onsite thành công!');
  };

  const toLocalYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleGenerateWeekDays = (baseDateStr: string) => {
    const parts = baseDateStr.split('-');
    if (parts.length !== 3) return;
    const baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(baseDate.getTime())) return;
    
    // Find Monday of the week
    const day = baseDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push({
        id: `week-${i}-${Date.now()}-${Math.random()}`,
        date: toLocalYYYYMMDD(d),
        startTime: '08:00',
        endTime: '17:30',
        hours: '8.0',
        onsiteType: 'Full day'
      });
    }
    setOnsiteForm(prev => ({ ...prev, dates }));
  };

  const handleGenerateMonthDays = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split('-').map(Number);
    if (!year || !month) return;
    
    const dates = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push({
          id: `month-${date.getDate()}-${Date.now()}-${Math.random()}`,
          date: toLocalYYYYMMDD(date),
          startTime: '08:00',
          endTime: '17:30',
          hours: '8.0',
          onsiteType: 'Full day'
        });
      }
      date.setDate(date.getDate() + 1);
    }
    setOnsiteForm(prev => ({ ...prev, dates }));
  };

  const getWeeksInMonth = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split('-').map(Number);
    if (!year || !month) return [];
    
    const weeks = [];
    const startDate = new Date(year, month - 1, 1);
    const startDay = startDate.getDay();
    const diffToMonday = startDay === 0 ? -6 : 1 - startDay;
    const curr = new Date(startDate);
    curr.setDate(startDate.getDate() + diffToMonday);
    
    for (let w = 1; w <= 6; w++) {
      const monday = new Date(curr);
      const friday = new Date(curr);
      friday.setDate(curr.getDate() + 4);
      
      const isOverlap = (monday.getMonth() === month - 1) || (friday.getMonth() === month - 1);
      
      if (isOverlap) {
        const formattedMonday = monday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const formattedFriday = friday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        weeks.push({
          weekNum: w,
          label: `Tuần ${w} (${formattedMonday} - ${formattedFriday})`,
          startDateStr: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
        });
      }
      curr.setDate(curr.getDate() + 7);
    }
    return weeks;
  };

  const handleMonthChangeForWeek = (monthVal: string) => {
    setSelectedMonth(monthVal);
    const newWeeks = getWeeksInMonth(monthVal);
    if (newWeeks.length > 0) {
      setSelectedWeekStart(newWeeks[0].startDateStr);
      handleGenerateWeekDays(newWeeks[0].startDateStr);
    }
  };

  const handleChangeOnsiteMode = (mode: 'day' | 'week' | 'month') => {
    setOnsiteMode(mode);
    if (mode === 'week') {
      const currentWeeks = getWeeksInMonth(selectedMonth);
      if (currentWeeks.length > 0) {
        const found = currentWeeks.find(w => w.startDateStr === selectedWeekStart);
        if (found) {
          handleGenerateWeekDays(selectedWeekStart);
        } else {
          setSelectedWeekStart(currentWeeks[0].startDateStr);
          handleGenerateWeekDays(currentWeeks[0].startDateStr);
        }
      }
    } else if (mode === 'month') {
      handleGenerateMonthDays(selectedMonth);
    }
  };

  const handleWeekChange = (val: string) => {
    setSelectedWeekStart(val);
    handleGenerateWeekDays(val);
  };

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    handleGenerateMonthDays(val);
  };

  const handleUpdateOnsiteRow = (index: number, updatedFields: Partial<typeof onsiteForm.dates[0]>) => {
    const newDates = [...onsiteForm.dates];
    const row = { ...newDates[index], ...updatedFields };
    if (updatedFields.date !== undefined || updatedFields.startTime !== undefined || updatedFields.endTime !== undefined) {
      row.hours = autoCalculateOnsiteHours(row.date, row.startTime || '', row.endTime || '');
    }
    newDates[index] = row;
    setOnsiteForm({ ...onsiteForm, dates: newDates });
  };

  const handleAddOnsiteRow = () => {
    const lastRow = onsiteForm.dates[onsiteForm.dates.length - 1];
    let nextDateStr = '2026-06-20';
    if (lastRow && lastRow.date) {
      try {
        const d = new Date(lastRow.date);
        d.setDate(d.getDate() + 1);
        nextDateStr = d.toISOString().split('T')[0];
      } catch (e) {}
    }
    const newRow = {
      id: (Date.now() + Math.random()).toString(),
      date: nextDateStr,
      startTime: '08:00',
      endTime: '17:30',
      hours: '8.0',
      onsiteType: 'Full day'
    };
    setOnsiteForm({
      ...onsiteForm,
      dates: [...onsiteForm.dates, newRow]
    });
  };

  const handleRemoveOnsiteRow = (index: number) => {
    if (onsiteForm.dates.length <= 1) return;
    const newDates = onsiteForm.dates.filter((_, idx) => idx !== index);
    setOnsiteForm({ ...onsiteForm, dates: newDates });
  };

  // Dynamic counts for each request type card
  const dynamicCounts = useMemo(() => {
    const counts: Record<string, { myCount: number; approvalCount: number }> = {
      leave: { myCount: 0, approvalCount: 0 },
      ot: { myCount: 0, approvalCount: 0 },
      business: { myCount: 0, approvalCount: 0 },
      checkin: { myCount: 0, approvalCount: 0 },
      resign: { myCount: 0, approvalCount: 0 },
      onsite: { myCount: 0, approvalCount: 0 }
    };
    
    // Aggregate counts from instances
    instances.forEach(inst => {
      let mappedTypeId = inst.typeId;
      if (mappedTypeId === 'ot_hourly' || mappedTypeId === 'ot_package' || mappedTypeId === 'ot') {
        mappedTypeId = 'ot';
      }
      
      if (counts[mappedTypeId]) {
        if (inst.applicant === 'Nguyễn Văn User') {
          counts[mappedTypeId].myCount += 1;
        }
        if (inst.status === 'Pending') {
          counts[mappedTypeId].approvalCount += 1;
        }
      }
    });

    return counts;
  }, [instances]);

  // Filter logic
  const filteredTypes = useMemo(() => {
    return requestTypes.filter(type => 
      type.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      type.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredInstances = useMemo(() => {
    return instances.filter(inst => {
      // 1. Filter by card selection click to highlight selected type
      if (selectedTypeFilter) {
        if (selectedTypeFilter === 'ot') {
          // Group both hourly and package overtime under 'ot' Group Card
          if (inst.typeId !== 'ot_hourly' && inst.typeId !== 'ot_package' && inst.typeId !== 'ot') {
            return false;
          }
        } else if (inst.typeId !== selectedTypeFilter) {
          return false;
        }
      }
      // 2. Filter by status filter buttons
      if (activeFilter === 'pending-approval' && inst.status !== 'Pending') {
        return false;
      }
      if (activeFilter === 'my-requests' && inst.applicant !== 'Nguyễn Văn User') {
        return false;
      }
      return true;
    });
  }, [instances, selectedTypeFilter, activeFilter]);

  return (
    <div className="p-6 bg-transparent min-h-full space-y-6">
      
      {/* Toast popup */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-8 right-8 z-[200] bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center space-x-3 text-sm font-semibold"
          >
            <div className="bg-emerald-500 text-slate-900 p-1 rounded-full text-xs">✓</div>
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header with Title and Search Input */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Bảng điều khiển</h1>
          <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Yêu cầu & Quản lý đơn từ toàn diện</p>
        </div>

        {/* Search input to match top bar look */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Tìm đơn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-sans"
          />
          <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
        </div>
      </div>

      {/* 3. Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTypes.map((type) => {
          const isSelected = selectedTypeFilter === type.id;
          return (
            <motion.div
              layoutId={`card-layout-${type.id}`}
              key={type.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${
                isSelected ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/5' : 'border-gray-100'
              }`}
            >
              {/* Card top details */}
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  {type.icon}
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">{type.title}</h3>
                    <p className="text-[10px] font-mono tracking-wider text-gray-400 font-bold mt-1 uppercase">{type.code}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] font-bold text-gray-400/90 mt-4 leading-normal min-h-[2.5rem] line-clamp-2">
                {type.description}
              </p>

              {/* Functional Badge buttons matching image */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 flex-wrap gap-2">
                {/* Submit New button "+" */}
                <button 
                  onClick={() => {
                    if (type.id === 'ot') {
                      setActiveCreateModal('ot');
                      setOtMode('hourly');
                    } else {
                      setActiveCreateModal(type.id);
                    }
                  }}
                  className="p-2 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-650 shadow-sm transition-all flex items-center justify-center font-bold"
                  title="Tạo đơn mới"
                >
                  <Plus size={16} />
                </button>

                <div className="flex space-x-1.5">
                  {/* My requests count badge */}
                  <button 
                    onClick={() => {
                      setSelectedTypeFilter(type.id);
                      setActiveFilter('my-requests');
                    }}
                    className="px-3 py-1.5 bg-[#17a2b8] hover:bg-[#138496] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>{dynamicCounts[type.id]?.myCount ?? 0} Y/c của tôi</span>
                  </button>

                  {/* Pending approvals count badge */}
                  <button 
                    onClick={() => {
                      if (type.id === 'business') {
                        setSelectedTypeFilter('business');
                        setActiveFilter('hr-admin');
                      } else {
                        setSelectedTypeFilter(type.id);
                        setActiveFilter('pending-approval');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#495057] hover:bg-[#343a40] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>{dynamicCounts[type.id]?.approvalCount ?? 0} Cần phê duyệt</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Action Toolbar Filter Options */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 p-4 rounded-xl border border-gray-100/65 shadow-sm text-xs font-bold text-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          {/* Advanced Search */}
          <button className="flex items-center space-x-1 px-3.5 py-2 bg-slate-100/80 hover:bg-slate-200/90 rounded-lg transition-colors border border-slate-200/40">
            <SlidersHorizontal size={13} className="text-slate-500" />
            <span>Tìm kiếm nâng cao</span>
          </button>

          {/* Group By dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-1 px-3.5 py-2 bg-slate-100/80 hover:bg-slate-200/90 rounded-lg transition-colors border border-slate-200/40">
              <span className="text-slate-400 mr-0.5">☰</span>
              <span>Nhóm theo</span>
              <ChevronDown size={11} className="text-slate-400 ml-1" />
            </button>
          </div>

          {/* Favorite */}
          <button className="flex items-center space-x-1 px-3.5 py-2 bg-slate-100/80 hover:bg-slate-200/90 rounded-lg transition-colors border border-slate-200/40">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span>Yêu thích</span>
          </button>

          {selectedTypeFilter && (
            <button 
              onClick={() => setSelectedTypeFilter(null)}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center space-x-1 hover:bg-blue-100 transition-colors"
            >
              <span>Xóa bộ lọc loại đơn</span>
              <X size={10} />
            </button>
          )}
        </div>

        {/* Far-Right pagination matching image */}
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 text-[11px] font-black">1-5 / {filteredTypes.length}</span>
          <div className="flex space-x-1">
            <button className="p-1 px-2.5 bg-slate-100 rounded text-slate-400 hover:bg-slate-200 transition-colors">&lt;</button>
            <button className="p-1 px-2.5 bg-slate-100 rounded text-slate-400 hover:bg-slate-200 transition-colors">&gt;</button>
          </div>
        </div>
      </div>

      {/* 4. Requests Tracker Table Below */}
      {activeFilter === 'hr-admin' ? (
        <div className="space-y-6">
          {/* Tracker Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-purple-700 tracking-tight uppercase flex items-center">
                <CheckCircle2 size={16} className="mr-2 text-purple-600 fill-purple-50" />
                Theo dõi phê duyệt đơn cấp phép
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">HR Admin Center • Quản lý &amp; Phê duyệt quỹ phép</p>
            </div>
            
            <div className="flex space-x-2 bg-slate-100/80 p-1 rounded-xl w-fit">
              <button 
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedTypeFilter(null);
                  setSelectedIds([]);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-850"
              >
                Quay lại danh sách đơn từ
              </button>
              <button 
                type="button"
                className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all bg-purple-600 text-white shadow-xs"
              >
                HR Admin Center
              </button>
            </div>
          </div>

          <HRAdminCenter triggerToast={triggerToast} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Tracker Header */}
          <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 tracking-tight uppercase">
                {selectedTypeFilter === 'business' ? 'Theo dõi phê duyệt đơn cấp phép' : 'Theo dõi / phê duyệt đơn'}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Danh sách đơn từ thực tế được đồng bộ</p>
            </div>

            {/* Action Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedTypeFilter(null);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeFilter === 'all' && !selectedTypeFilter ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
              <button 
                type="button"
                onClick={() => {
                  setActiveFilter('my-requests');
                  setSelectedIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeFilter === 'my-requests' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Yêu cầu của tôi
              </button>
              <button 
                type="button"
                onClick={() => {
                  setActiveFilter('pending-approval');
                  setSelectedIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeFilter === 'pending-approval' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đang chờ duyệt
              </button>
              
              {selectedTypeFilter === 'business' && (
                <button 
                  type="button"
                  onClick={() => {
                    setActiveFilter('hr-admin');
                    setSelectedIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 ${
                    activeFilter === 'hr-admin' ? 'bg-white text-purple-700 shadow-xs border border-purple-100' : 'text-purple-600 hover:text-purple-800'
                  }`}
                >
                  <span>HR Admin Center</span>
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] rounded-full font-black">HR</span>
                </button>
              )}
            </div>
          </div>

        {/* Bulk Action Panel */}
        <AnimatePresence>
          {activeFilter === 'pending-approval' && selectedIds.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50/70 border-b border-blue-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-700">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                  {selectedIds.length}
                </span>
                <span>đơn được chọn để xử lý hàng loạt</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <span>✓</span>
                  <span>Phê duyệt hàng loạt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const pendingSelected = instances.filter(i => selectedIds.includes(i.id) && i.status === 'Pending').map(i => i.id);
                    if (pendingSelected.length === 0) {
                      triggerToast('⚠️ Không có đơn nào đang chờ duyệt trong danh sách đã chọn!');
                      return;
                    }
                    setRejectingIds(pendingSelected);
                    setRejectionReason('');
                    setOpenRejectModal(true);
                  }}
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <span>✕</span>
                  <span>Từ chối hàng loạt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-500 rounded-xl text-xs font-bold border border-gray-200 transition-all font-sans"
                >
                  Hủy chọn
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table representation */}
        <div className="p-4 overflow-x-auto min-h-[16rem]">
          {filteredInstances.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-2 h-full">
              <AlertCircle size={32} className="text-slate-300" />
              <p className="text-xs font-bold text-gray-500">Mục lục trống. Không tìm thấy đơn từ nào khớp bộ lọc hành trình này.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {selectedTypeFilter === 'onsite' ? (
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-black tracking-wider">
                    {activeFilter === 'pending-approval' && (
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredInstances.filter(i => i.status === 'Pending').length > 0 &&
                            filteredInstances.filter(i => i.status === 'Pending').every(i => selectedIds.includes(i.id))
                          }
                          onChange={(e) => {
                            const pendingInFiltered = filteredInstances.filter(i => i.status === 'Pending');
                            if (e.target.checked) {
                              const newSelects = Array.from(new Set([...selectedIds, ...pendingInFiltered.map(i => i.id)]));
                              setSelectedIds(newSelects);
                            } else {
                              const pendingIdsInFiltered = pendingInFiltered.map(i => i.id);
                              setSelectedIds(selectedIds.filter(id => !pendingIdsInFiltered.includes(id)));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-3">Mã đơn</th>
                    <th className="py-3 px-3">Loại đơn</th>
                    <th className="py-3 px-3">Ngày tạo</th>
                    <th className="py-3 px-3">Dự án</th>
                    <th className="py-3 px-3">Nhân sự đi Onsite</th>
                    <th className="py-3 px-3">Người đề xuất (PM)</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                ) : (
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-black tracking-wider">
                    {activeFilter === 'pending-approval' && (
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredInstances.filter(i => i.status === 'Pending').length > 0 &&
                            filteredInstances.filter(i => i.status === 'Pending').every(i => selectedIds.includes(i.id))
                          }
                          onChange={(e) => {
                            const pendingInFiltered = filteredInstances.filter(i => i.status === 'Pending');
                            if (e.target.checked) {
                              const newSelects = Array.from(new Set([...selectedIds, ...pendingInFiltered.map(i => i.id)]));
                              setSelectedIds(newSelects);
                            } else {
                              const pendingIdsInFiltered = pendingInFiltered.map(i => i.id);
                              setSelectedIds(selectedIds.filter(id => !pendingIdsInFiltered.includes(id)));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-3">Mã đơn</th>
                    <th className="py-3 px-3">Loại đơn từ</th>
                    <th className="py-3 px-3">Ngày tạo</th>
                    <th className="py-3 px-3">Nội dung chi tiết</th>
                    <th className="py-3 px-3">Người duyệt đề xuất</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    {activeFilter === 'pending-approval' && <th className="py-3 px-3 text-center">Thao tác</th>}
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-bold">
                {filteredInstances.map((inst, index) => {
                  const isChecked = selectedIds.includes(inst.id);
                  const isPending = inst.status === 'Pending';

                  if (selectedTypeFilter === 'onsite') {
                    const extractedProjectCode = inst.details.match(/Dự án:\s*([^.\n]+)/)?.[1]?.trim() || 'A.24.DA.VCB.STAF';
                    return (
                      <tr key={inst.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                        {activeFilter === 'pending-approval' && (
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              disabled={!isPending}
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedIds(selectedIds.filter(id => id !== inst.id));
                                } else {
                                  setSelectedIds([...selectedIds, inst.id]);
                                }
                              }}
                              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 ${isPending ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                            />
                          </td>
                        )}
                        <td className="py-3.5 px-3 text-gray-400 font-semibold">{index + 1}</td>
                        <td className="py-3.5 px-3">
                          <span className="font-mono bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-slate-700 font-semibold text-[11px]">
                            {inst.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-[#2a91df] font-bold">{inst.typeName}</td>
                        <td className="py-3.5 px-3 font-semibold text-gray-500">{inst.createdAt}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-black">
                            {extractedProjectCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {inst.teamMembers && inst.teamMembers.length > 0 ? (
                              inst.teamMembers.map((member, mIdx) => (
                                <span key={mIdx} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-black whitespace-nowrap">
                                  {member}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold italic">Chưa chỉ định</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-gray-500 font-semibold inline-flex items-center space-x-1.5 mt-2">
                          <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white font-extrabold flex items-center justify-center text-[9px]">
                            {inst.applicant ? inst.applicant.charAt(0) : 'U'}
                          </div>
                          <span className="text-gray-700 font-bold">{inst.applicant || 'Nguyễn Văn User'}</span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                            inst.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            inst.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            inst.status === 'Draft' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                            'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {inst.status === 'Approved' ? 'Đã duyệt' :
                             inst.status === 'Pending' ? 'Chờ duyệt' :
                             inst.status === 'Draft' ? 'Bản nháp' : 'Từ chối'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {isPending ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveSingle(inst.id)}
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-none cursor-pointer"
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingIds([inst.id]);
                                  setRejectionReason('');
                                  setOpenRejectModal(true);
                                }}
                                className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-none cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-gray-400 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={inst.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                      {activeFilter === 'pending-approval' && (
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            disabled={!isPending}
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedIds(selectedIds.filter(id => id !== inst.id));
                              } else {
                                setSelectedIds([...selectedIds, inst.id]);
                              }
                            }}
                            className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 ${isPending ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                          />
                        </td>
                      )}
                      <td className="py-3.5 px-3 text-gray-400 font-semibold">{index + 1}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-slate-700 font-semibold text-[11px]">
                          {inst.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#2a91df] font-bold">{inst.typeName}</td>
                      <td className="py-3.5 px-3 font-semibold text-gray-500">{inst.createdAt}</td>
                      <td className="py-3.5 px-3 max-w-sm truncate text-slate-900 font-medium" title={inst.details}>{inst.details}</td>
                      <td className="py-3.5 px-3 text-gray-500 font-semibold flex items-center space-x-1.5 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500">M</div>
                        <span>{inst.approver}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                          inst.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          inst.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          inst.status === 'Draft' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                          'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {inst.status === 'Approved' ? 'Đã duyệt' :
                           inst.status === 'Pending' ? 'Chờ duyệt' :
                           inst.status === 'Draft' ? 'Bản nháp' : 'Từ chối'}
                        </span>
                      </td>
                      {activeFilter === 'pending-approval' && (
                        <td className="py-3.5 px-3 text-center">
                          {isPending ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveSingle(inst.id)}
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-none"
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingIds([inst.id]);
                                  setRejectionReason('');
                                  setOpenRejectModal(true);
                                }}
                                className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-none"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-gray-400 italic">N/A</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )}

      {/* 5. Modals for forms registration */}
      <AnimatePresence>
        
        {/* Form 1: Đơn xin nghỉ / làm việc linh hoạt */}
        {activeCreateModal === 'leave' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCreateModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
              
              {/* Header block */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-500">
                    <Plane size={22} className="text-[#3b82f6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight leading-none uppercase">ĐƠN ĐĂNG KÝ NGHỈ/ WFH</h3>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase mt-1 tracking-wider">CREATE LEAVE REQUEST</p>
                  </div>
                </div>
                <button onClick={() => setActiveCreateModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Form elements body */}
              <form onSubmit={handleCreateLeave} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Employee & Approver metadata boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NV block */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">NHÂN VIÊN (EMPLOYEE)</label>
                    <div className="flex items-center space-x-3 bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-[#1d82b6] text-white font-extrabold flex items-center justify-center text-sm">
                        V0
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">Nguyễn Văn User</div>
                        <div className="text-[10px] text-gray-400 font-bold">V00497 • Developer</div>
                      </div>
                    </div>
                  </div>

                  {/* Approver block */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">NGƯỜI DUYỆT (APPROVER)</label>
                    <div className="flex items-center justify-between bg-white border border-blue-100 p-3 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                          M
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-800">Trần Văn B (Manager)</div>
                          <div className="text-[10px] text-blue-500 font-extrabold leading-none mt-1">Phê duyệt trực tiếp</div>
                        </div>
                      </div>
                      <div className="bg-blue-50 text-blue-500 p-1 rounded-full">
                        <CheckCircle2 size={14} className="fill-blue-50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Leave Remaining Balance Widget banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-3xl flex items-center justify-between shadow-md relative overflow-hidden">
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">SỐ ĐƯ PHÉP HIỆN TẠI</div>
                      <div className="text-lg font-black text-white mt-0.5">15.5 ngày</div>
                    </div>
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-inner tracking-wider">
                    Available
                  </span>
                </div>

                {/* 3. Leave Type & Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">LOẠI HÌNH NGHỈ (LEAVE TYPE) *</label>
                    <select 
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 outline-none transition-colors"
                    >
                      <option value="annual">Nghỉ phép có hưởng lương</option>
                      <option value="unpaid">Nghỉ phép không lương</option>
                      <option value="wfh">Đăng ký làm việc linh hoạt / WFH</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">SỐ GIỜ NGHỈ (TOTAL HOURS) *</label>
                    <div className="relative">
                      <input 
                        type="number" step="0.5" required
                        value={leaveForm.hours}
                        onChange={(e) => setLeaveForm({...leaveForm, hours: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 outline-none pr-10"
                      />
                      <Clock size={16} className="absolute right-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* 4. Dates row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">TỪ NGÀY (FROM) *</label>
                    <input 
                      type="datetime-local" required
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({...leaveForm, fromDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">ĐẾN NGÀY (TO) *</label>
                    <input 
                      type="datetime-local" required
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({...leaveForm, toDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* 5. Text Reason */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">LÝ DO NGHỈ (REASON) *</label>
                  <textarea 
                    required 
                    placeholder="Vui lòng nhập lý do cụ thể để Manager duyệt nhanh hơn..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-700 focus:border-blue-600 outline-none h-24 resize-none"
                  />
                </div>
              </form>

              {/* Footer action buttons */}
              <div className="p-6 border-t border-gray-105 flex items-center justify-between bg-white z-10 sticky bottom-0">
                <button 
                  type="button" 
                  onClick={() => setActiveCreateModal(null)} 
                  className="px-5 py-2.5 text-xs font-extrabold text-gray-500 hover:text-gray-700"
                >
                  Hủy bỏ
                </button>
                <div className="flex items-center space-x-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveCreateModal(null);
                      triggerToast('🎉 Đã lưu nháp đơn xin nghỉ/ làm việc linh hoạt!');
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-colors"
                  >
                    Lưu nháp
                  </button>
                  <button 
                    onClick={handleCreateLeave} 
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-extrabold hover:bg-blue-700 shadow-md shadow-blue-500/15 transition-all"
                  >
                    Tạo đơn đăng ký
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Form 2: Unified Overtime (Đăng ký Overtime) with selection tabs */}
        {activeCreateModal === 'ot' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCreateModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 w-full animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl transition-all ${
                    otMode === 'hourly' ? 'bg-blue-50 text-blue-600' :
                    otMode === 'package' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                  }`}><Clock size={20} /></div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">YÊU CẦU ĐĂNG KÝ PHÂN CÔNG OT</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      {otMode === 'hourly' 
                        ? 'Create Hourly Overtime Request (Hourly DB Table)' 
                        : otMode === 'package'
                        ? 'Create Package-Based Overtime Request (Package DB Table)'
                        : 'Staffing Overtime Self-Service Request (Staffing DB Table)'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveCreateModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Overtime Type Switcher Tabs */}
              <div className="px-8 pt-4 pb-0 bg-slate-50 border-b border-gray-100 flex items-center space-x-6">
                <button
                  type="button"
                  onClick={() => setOtMode('hourly')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative transition-all ${
                    otMode === 'hourly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span>💡</span>
                    <span>OT Theo giờ (Hourly)</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOtMode('package')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative transition-all ${
                    otMode === 'package' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span>📦</span>
                    <span>OT Theo gói khoán (Package)</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOtMode('staffing')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider relative transition-all ${
                    otMode === 'staffing' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span>👥</span>
                    <span>Staffing tự đăng ký</span>
                  </span>
                </button>
              </div>

              {/* Form body */}
              {otMode === 'hourly' ? (
                <form onSubmit={handleCreateOTHourly} className="flex-1 overflow-y-auto p-8 space-y-6">
                  <div className="p-4 bg-blue-50/40 border border-blue-105 rounded-2xl flex items-start space-x-3 text-xs text-blue-800 font-bold leading-relaxed animate-fadeIn">
                    <span>💡</span>
                    <p>Hệ thống đang hoạt động ở chế độ Đăng Ký Theo Giờ Thực Tế. Bạn cần thêm nhân sự và nhập thời gian cụ thể (Giờ bắt đầu - Giờ kết thúc) cho từng người.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end animate-fadeIn">
                    {/* Project Code selection */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Project Code <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          value={otHourlyForm.projectCode}
                          onChange={(e) => setOtHourlyForm({ ...otHourlyForm, projectCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-blue-600 outline-none appearance-none"
                        >
                          <option value="A.24.DA.VCB.STAF">A.24.DA.VCB.STAF - Vietcombank Staffing Portal</option>
                          <option value="A.25.DA.BIDV.CORE">A.25.DA.BIDV.CORE - Core integration</option>
                          <option value="A.26.DA.VIETIN.INTG">A.26.DA.VIETIN.INTG - Portal backend</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-200 text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-bold p-3 bg-slate-50 border border-slate-100 rounded-xl leading-normal">
                      📊 Hệ số quy đổi tiền làm thêm giờ sẽ được tự động đồng bộ hóa với quy tắc chi nhánh.
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="animate-fadeIn">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Attach Files <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const simulatedFiles = [
                            'biên_bản_phân_công_ot.pdf',
                            'signoff_vcb_week23.png',
                            'timesheet_delivery.xlsx'
                          ];
                          const nextFile = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
                          if (!otHourlyForm.uploadedFiles.includes(nextFile)) {
                            setOtHourlyForm({ ...otHourlyForm, uploadedFiles: [...otHourlyForm.uploadedFiles, nextFile] });
                          }
                        }}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-extrabold transition-all shadow-sm"
                      >
                        <Paperclip size={16} className="text-gray-500 animate-pulse" />
                        <span>Upload Attachments</span>
                      </button>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic text-slate-400">(Bấm để đính kèm tệp mô phỏng)</span>
                    </div>

                    {otHourlyForm.uploadedFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 animate-fadeIn">
                        {otHourlyForm.uploadedFiles.map((file, i) => (
                          <div key={i} className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600">
                            <span>📎 {file}</span>
                            <button
                              type="button"
                              onClick={() => setOtHourlyForm({ ...otHourlyForm, uploadedFiles: otHourlyForm.uploadedFiles.filter((_, idx) => idx !== i) })}
                              className="p-1 hover:bg-slate-200 rounded-full text-red-500 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="animate-fadeIn">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                    <textarea
                      placeholder="Nhập ghi chú chi tiết..."
                      value={otHourlyForm.description}
                      onChange={(e) => setOtHourlyForm({ ...otHourlyForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:border-blue-600 outline-none h-24 resize-none transition-all"
                    />
                  </div>

                  {/* Assignments Section */}
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Danh sách nhân sự thực hiện OT (Assignments)</h4>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const spareMembers = [
                            { employeeCode: 'V00911', employeeName: 'ĐỖ THỊ MAI', role: 'QC' },
                            { employeeCode: 'V00122', employeeName: 'PHẠM HÙNG ANH', role: 'Tech Lead' },
                            { employeeCode: 'V01256', employeeName: 'LÊ QUỲNH CHI', role: 'Dev' }
                          ];
                          const candidate = spareMembers.find(sm => !otHourlyForm.assignments.some(a => a.employeeCode === sm.employeeCode));
                          if (candidate) {
                            setOtHourlyForm({
                              ...otHourlyForm,
                              assignments: [
                                ...otHourlyForm.assignments,
                                {
                                  ...candidate,
                                  selected: true,
                                  date: '2026-06-02',
                                  startTime: '18:00',
                                  endTime: '21:00',
                                  overtimeHours: '3.00'
                                }
                              ]
                            });
                          } else {
                            triggerToast('ℹ️ Tất cả thành viên có sẵn đã có mặt trong danh sách!');
                          }
                        }}
                        className="text-xs text-blue-600 font-extrabold flex items-center space-x-1 hover:underline focus:outline-none bg-blue-50/50 hover:bg-blue-100/60 px-3 py-1.5 rounded-xl border border-blue-105 transition-all"
                      >
                        <Plus size={14} className="text-blue-600" />
                        <span>Thêm nhân sự</span>
                      </button>
                    </div>

                    {/* Interactive tabular Grid */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-gray-100 text-[10px] uppercase tracking-wider">
                              <th className="p-4 w-12 text-center">
                                <input
                                  type="checkbox"
                                  checked={otHourlyForm.assignments.length > 0 && otHourlyForm.assignments.every(a => a.selected)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setOtHourlyForm({
                                      ...otHourlyForm,
                                      assignments: otHourlyForm.assignments.map(a => ({ ...a, selected: checked }))
                                    });
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                />
                              </th>
                              <th className="p-4 font-bold">Mã NV</th>
                              <th className="p-4 font-bold">Họ và tên</th>
                              <th className="p-4 font-bold">Vai trò (Role)</th>
                              <th className="p-4 font-bold">Ngày OT</th>
                              <th className="p-4 font-bold">Giờ Bắt Đầu</th>
                              <th className="p-4 font-bold">Giờ Kết Thúc</th>
                              <th className="p-4 font-bold text-right">Tổng số giờ</th>
                              <th className="p-4 font-bold text-center">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {otHourlyForm.assignments.map((assign, idx) => (
                              <tr key={assign.employeeCode} className={`hover:bg-slate-50/50 transition-colors ${!assign.selected ? 'opacity-40 bg-slate-50/30' : ''}`}>
                                <td className="p-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={assign.selected}
                                    onChange={() => {
                                      const next = [...otHourlyForm.assignments];
                                      next[idx].selected = !next[idx].selected;
                                      setOtHourlyForm({ ...otHourlyForm, assignments: next });
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="p-4 font-mono font-bold text-gray-700">{assign.employeeCode}</td>
                                <td className="p-4 font-extrabold text-gray-800">{assign.employeeName}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase">
                                    {assign.role}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <input
                                    type="date"
                                    value={assign.date}
                                    onChange={(e) => {
                                      const next = [...otHourlyForm.assignments];
                                      next[idx].date = e.target.value;
                                      setOtHourlyForm({ ...otHourlyForm, assignments: next });
                                    }}
                                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold focus:border-blue-600 outline-none w-32 focus:bg-white transition-all"
                                  />
                                </td>
                                <td className="p-4">
                                  <input
                                    type="time"
                                    value={assign.startTime}
                                    onChange={(e) => {
                                      const next = [...otHourlyForm.assignments];
                                      next[idx].startTime = e.target.value;
                                      const from = e.target.value;
                                      const to = next[idx].endTime;
                                      if (from && to) {
                                        const [fh, fm] = from.split(':').map(Number);
                                        const [th, tm] = to.split(':').map(Number);
                                        let hours = (th + tm / 60) - (fh + fm / 60);
                                        if (hours < 0) hours += 24;
                                        next[idx].overtimeHours = hours.toFixed(2);
                                      }
                                      setOtHourlyForm({ ...otHourlyForm, assignments: next });
                                    }}
                                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold focus:border-blue-600 outline-none w-20 focus:bg-white transition-all"
                                  />
                                </td>
                                <td className="p-4">
                                  <input
                                    type="time"
                                    value={assign.endTime}
                                    onChange={(e) => {
                                      const next = [...otHourlyForm.assignments];
                                      next[idx].endTime = e.target.value;
                                      const from = next[idx].startTime;
                                      const to = e.target.value;
                                      if (from && to) {
                                        const [fh, fm] = from.split(':').map(Number);
                                        const [th, tm] = to.split(':').map(Number);
                                        let hours = (th + tm / 60) - (fh + fm / 60);
                                        if (hours < 0) hours += 24;
                                        next[idx].overtimeHours = hours.toFixed(2);
                                      }
                                      setOtHourlyForm({ ...otHourlyForm, assignments: next });
                                    }}
                                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold focus:border-blue-600 outline-none w-20 focus:bg-white transition-all"
                                  />
                                </td>
                                <td className="p-4 text-right">
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    value={assign.overtimeHours}
                                    onChange={(e) => {
                                      const next = [...otHourlyForm.assignments];
                                      next[idx].overtimeHours = e.target.value;
                                      setOtHourlyForm({ ...otHourlyForm, assignments: next });
                                    }}
                                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold focus:border-blue-600 outline-none w-20 text-right focus:bg-white transition-all"
                                  />
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerToast(`✏️ Đang chỉnh sửa cấu hình cho ${assign.employeeName}...`);
                                      }}
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Edit Row"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = otHourlyForm.assignments.filter((_, i) => i !== idx);
                                        setOtHourlyForm({ ...otHourlyForm, assignments: next });
                                        triggerToast(`🗑️ Đã xoá phân công của ${assign.employeeName}`);
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {otHourlyForm.assignments.length === 0 && (
                              <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-400 font-bold">
                                  Không có nhân sự phân công làm thêm giờ. Vui lòng bấm "Thêm nhân sự".
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </form>
              ) : otMode === 'package' ? (
                <form onSubmit={handleCreateOTPackage} className="flex-1 overflow-y-auto p-8 space-y-6">
                  <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-start space-x-3 text-xs text-emerald-800 font-bold leading-relaxed animate-fadeIn">
                    <span>💡</span>
                    <p>Hệ thống đang hoạt động ở chế độ phân bổ Ngân Sách Gói OT. Bạn cần nhập Tổng Ngân Sách Gói, sau đó nhập chính xác số tiền trợ cấp quy đổi cho từng nhân sự.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end animate-fadeIn">
                    {/* Project Code selection */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Project Code <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          value={otPackageForm.projectCode}
                          onChange={(e) => setOtPackageForm({ ...otPackageForm, projectCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-emerald-600 outline-none appearance-none"
                        >
                          <option value="A.24.DA.VCB.STAF">A.24.DA.VCB.STAF - Vietcombank Staffing Portal</option>
                          <option value="A.25.DA.BIDV.CORE">A.25.DA.BIDV.CORE - Core integration</option>
                          <option value="A.26.DA.VIETIN.INTG">A.26.DA.VIETIN.INTG - Portal backend</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-200 text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Budget input */}
                    <div>
                      <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Tổng ngân sách gói (Budget) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={otPackageForm.packageBudget}
                          onChange={(e) => setOtPackageForm({ ...otPackageForm, packageBudget: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-emerald-250 focus:border-emerald-600 rounded-xl text-xs font-extrabold text-emerald-800 outline-none pr-12 placeholder-emerald-800"
                          placeholder="Nhập ngân sách..."
                        />
                        <span className="absolute right-4 top-3 ml-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">VND</span>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="animate-fadeIn">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Attach Files <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const simulatedFiles = [
                            'quyết_định_phê_duyệt_gói_ot.pdf',
                            'budget_VCB_completed.png',
                            'signoff_package.xlsx'
                          ];
                          const nextFile = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
                          if (!otPackageForm.uploadedFiles.includes(nextFile)) {
                            setOtPackageForm({ ...otPackageForm, uploadedFiles: [...otPackageForm.uploadedFiles, nextFile] });
                          }
                        }}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-extrabold transition-all shadow-sm"
                      >
                        <Paperclip size={16} className="text-gray-500 animate-pulse" />
                        <span>Upload Attachments</span>
                      </button>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic text-slate-400">(Bấm để đính kèm tệp mô phỏng)</span>
                    </div>

                    {otPackageForm.uploadedFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 animate-fadeIn">
                        {otPackageForm.uploadedFiles.map((file, i) => (
                          <div key={i} className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600">
                            <span>📎 {file}</span>
                            <button
                              type="button"
                              onClick={() => setOtPackageForm({ ...otPackageForm, uploadedFiles: otPackageForm.uploadedFiles.filter((_, idx) => idx !== i) })}
                              className="p-1 hover:bg-slate-200 rounded-full text-red-500 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="animate-fadeIn">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                    <textarea
                      placeholder="Nhập ghi chú chi tiết về gói thầu, đề tài OT..."
                      value={otPackageForm.description}
                      onChange={(e) => setOtPackageForm({ ...otPackageForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:border-emerald-600 outline-none h-24 resize-none transition-all"
                    />
                  </div>

                  {/* Assignments Section */}
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Danh sách nhân sự thực hiện OT (Assignments)</h4>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const spareMembers = [
                            { employeeCode: 'V00911', employeeName: 'ĐỖ THỊ MAI', role: 'QC' },
                            { employeeCode: 'V00122', employeeName: 'PHẠM HÙNG ANH', role: 'Tech Lead' },
                            { employeeCode: 'V01256', employeeName: 'LÊ QUỲNH CHI', role: 'Dev' }
                          ];
                          const candidate = spareMembers.find(sm => !otPackageForm.assignments.some(a => a.employeeCode === sm.employeeCode));
                          if (candidate) {
                            setOtPackageForm({
                              ...otPackageForm,
                              assignments: [
                                ...otPackageForm.assignments,
                                {
                                  ...candidate,
                                  selected: true,
                                  amount: '5000000'
                                }
                              ]
                            });
                          } else {
                            triggerToast('ℹ️ Tất cả thành viên có sẵn đã có mặt trong danh sách!');
                          }
                        }}
                        className="text-xs text-emerald-600 font-extrabold flex items-center space-x-1 hover:underline focus:outline-none bg-emerald-50/55 hover:bg-emerald-100/60 px-3 py-1.5 rounded-xl border border-emerald-150 transition-all font-sans"
                      >
                        <Plus size={14} className="text-emerald-600" />
                        <span>Thêm nhân sự</span>
                      </button>
                    </div>

                    {/* Dynamic Package Allocation Statistics Panel */}
                    <div className="bg-emerald-50/40 border border-emerald-100 hover:border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
                      <div>
                        <div className="text-[10px] font-black text-emerald-800 tracking-wider uppercase mb-1 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>Thống kê phân bổ ngân sách gói OT</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-base font-black text-slate-800">
                            {Number(otPackageForm.assignments.filter(a => a.selected).reduce((acc, curr) => acc + Number(curr.amount || 0), 0)).toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">/ {Number(otPackageForm.packageBudget || 0).toLocaleString('vi-VN')} VND</span>
                        </div>
                      </div>
                      
                      {/* Visual progress bar */}
                      <div className="flex-1 max-w-xs space-y-1">
                        <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${Math.min(100, (otPackageForm.assignments.filter(a => a.selected).reduce((acc, curr) => acc + Number(curr.amount || 0), 0) / (Number(otPackageForm.packageBudget) || 1)) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-extrabold text-gray-500 leading-none">
                          <span>Đã chia: {((otPackageForm.assignments.filter(a => a.selected).reduce((acc, curr) => acc + Number(curr.amount || 0), 0) / (Number(otPackageForm.packageBudget) || 1)) * 100).toFixed(1)}%</span>
                          <span>Còn lại: {Number(Number(otPackageForm.packageBudget || 0) - otPackageForm.assignments.filter(a => a.selected).reduce((acc, curr) => acc + Number(curr.amount || 0), 0)).toLocaleString('vi-VN')} VND</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive tabular Grid */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-gray-100 text-[10px] uppercase tracking-wider">
                              <th className="p-4 w-12 text-center">
                                <input
                                  type="checkbox"
                                  checked={otPackageForm.assignments.length > 0 && otPackageForm.assignments.every(a => a.selected)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setOtPackageForm({
                                      ...otPackageForm,
                                      assignments: otPackageForm.assignments.map(a => ({ ...a, selected: checked }))
                                    });
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                />
                              </th>
                              <th className="p-4 font-bold">Mã NV</th>
                              <th className="p-4 font-bold">Họ và tên</th>
                              <th className="p-4 font-bold">Vai trò (Role)</th>
                              <th className="p-4 font-bold text-right">Số tiền OT đề xuất (VND)</th>
                              <th className="p-4 font-bold text-center">% Gói ngân sách</th>
                              <th className="p-4 font-bold text-center">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {otPackageForm.assignments.map((assign, idx) => (
                              <tr key={assign.employeeCode} className={`hover:bg-slate-50/50 transition-colors ${!assign.selected ? 'opacity-40 bg-slate-50/30' : ''}`}>
                                <td className="p-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={assign.selected}
                                    onChange={() => {
                                      const next = [...otPackageForm.assignments];
                                      next[idx].selected = !next[idx].selected;
                                      setOtPackageForm({ ...otPackageForm, assignments: next });
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="p-4 font-mono font-bold text-gray-700">{assign.employeeCode}</td>
                                <td className="p-4 font-extrabold text-gray-800">{assign.employeeName}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase">
                                    {assign.role}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="relative max-w-[170px] ml-auto">
                                    <input
                                      type="number"
                                      value={assign.amount || ''}
                                      onChange={(e) => {
                                        const next = [...otPackageForm.assignments];
                                        next[idx].amount = e.target.value;
                                        setOtPackageForm({ ...otPackageForm, assignments: next });
                                      }}
                                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold focus:border-emerald-600 outline-none focus:bg-white text-right pr-9 transition-all"
                                      placeholder="Nhập số tiền..."
                                    />
                                    <span className="absolute right-2 top-2 text-[9px] font-black text-slate-400">VND</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center font-mono text-gray-550 font-bold">
                                  {otPackageForm.packageBudget && Number(otPackageForm.packageBudget) > 0 ? (
                                    `${((Number(assign.amount || 0) / Number(otPackageForm.packageBudget || 1)) * 100).toFixed(1)}%`
                                  ) : '0.0%'}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerToast(`✏️ Đang chỉnh sửa cấu hình cho ${assign.employeeName}...`);
                                      }}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                      title="Edit Row"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = otPackageForm.assignments.filter((_, i) => i !== idx);
                                        setOtPackageForm({ ...otPackageForm, assignments: next });
                                        triggerToast(`🗑️ Đã xoá phân công của ${assign.employeeName}`);
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {otPackageForm.assignments.length === 0 && (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 font-bold">
                                  Không có nhân sự phân công làm thêm giờ. Vui lòng bấm "Thêm nhân sự".
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateOTStaffing} className="flex-1 overflow-y-auto p-8 space-y-6 font-sans">
                  <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl flex items-start space-x-3 text-xs text-purple-800 font-bold leading-relaxed animate-fadeIn animate-duration-300">
                    <span>👥</span>
                    <p>Dành riêng cho đối tượng nhân sự <strong>Staffing</strong> tự chủ động đăng ký thông tin tăng ca (Overtime) của mình theo từng dự án được phê duyệt trực tiếp bởi dự án.</p>
                  </div>

                  <div className="space-y-6 animate-fadeIn animate-duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Project selection */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">MÃ DỰ ÁN (PROJECT CODE) <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <select
                            value={otStaffingForm.projectCode}
                            onChange={(e) => setOtStaffingForm({ ...otStaffingForm, projectCode: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none appearance-none cursor-pointer"
                          >
                            <option value="A.24.DA.VCB.STAF">A.24.DA.VCB.STAF - Vietcombank Staffing Portal</option>
                            <option value="A.25.DA.BIDV.CORE">A.25.DA.BIDV.CORE - Core integration</option>
                            <option value="A.26.DA.VIETIN.INTG">A.26.DA.VIETIN.INTG - Portal backend</option>
                            <option value="A.26.DA.AGRI.STAF">A.26.DA.AGRI.STAF - Agribank Staffing Migration Code</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-200 text-gray-500">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Overtime Date */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">NGÀY ĐĂNG KÝ TĂNG CA (DATE) <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          value={otStaffingForm.date}
                          onChange={(e) => setOtStaffingForm({ ...otStaffingForm, date: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Start Time */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">GIỜ BẮT ĐẦU <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          required
                          value={otStaffingForm.startTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            const startParts = val.split(':');
                            const endParts = otStaffingForm.endTime.split(':');
                            let diff = 0;
                            if (startParts.length === 2 && endParts.length === 2) {
                              const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                              const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                              if (endMin > startMin) {
                                diff = (endMin - startMin) / 60;
                              }
                            }
                            setOtStaffingForm({ 
                              ...otStaffingForm, 
                              startTime: val,
                              overtimeHours: diff > 0 ? diff.toFixed(1) : otStaffingForm.overtimeHours
                            });
                          }}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">GIỜ KẾT THÚC <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          required
                          value={otStaffingForm.endTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            const startParts = otStaffingForm.startTime.split(':');
                            const endParts = val.split(':');
                            let diff = 0;
                            if (startParts.length === 2 && endParts.length === 2) {
                              const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                              const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                              if (endMin > startMin) {
                                diff = (endMin - startMin) / 60;
                              }
                            }
                            setOtStaffingForm({ 
                              ...otStaffingForm, 
                              endTime: val,
                              overtimeHours: diff > 0 ? diff.toFixed(1) : otStaffingForm.overtimeHours
                            });
                          }}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none"
                        />
                      </div>

                      {/* Overtime Hours */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">TỔNG SỐ GIỜ TĂNG CA (HOURS) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          required
                          value={otStaffingForm.overtimeHours}
                          onChange={(e) => setOtStaffingForm({ ...otStaffingForm, overtimeHours: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Approver Selection */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">NGƯỜI phê duyệt TRỰC TIẾP <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <select
                            value={otStaffingForm.approver}
                            onChange={(e) => setOtStaffingForm({ ...otStaffingForm, approver: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none appearance-none cursor-pointer"
                          >
                            <option value="Trần Văn B (Project Manager)">Trần Văn B (Project Manager)</option>
                            <option value="Lê Thị C (Delivery Head)">Lê Thị C (Delivery Head)</option>
                            <option value="Nguyễn Hoàng D (HR BP)">Nguyễn Hoàng D (HR BP)</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-200 text-gray-500">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Gói hoặc Giao dịch liên quan */}
                      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex flex-col justify-center">
                        <span className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wider">Thông tin lưu ý quy chuẩn Staffing:</span>
                        <p className="text-[11px] text-purple-900 mt-1 leading-normal font-medium">
                          Nhân viên <strong>Staffing</strong> tự chấm cứu thông tin ngày giờ, hệ thống sẽ gửi luồng phê duyệt tự động đến PM trực tiếp quản lý dự án đó trước khi hợp thức hoá.
                        </p>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">MINH CHỨNG ĐÍNH KÈM (ATTACH EVIDENCE) <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const dummyFiles = ['logs_system_deployment.txt', 'screenshot_deployment_result.png', 'email_confirmation_ot.pdf', 'git_commit_log.txt'];
                            const nextFile = dummyFiles[Math.floor(Math.random() * dummyFiles.length)];
                            if (!otStaffingForm.uploadedFiles.includes(nextFile)) {
                              setOtStaffingForm({ ...otStaffingForm, uploadedFiles: [...otStaffingForm.uploadedFiles, nextFile] });
                            }
                          }}
                          className="px-4 py-2.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-2 border border-gray-200"
                        >
                          <Paperclip size={14} className="text-gray-400" />
                          <span>Tải tệp đính kèm lên</span>
                        </button>
                        <span className="text-[10px] text-gray-400 font-bold lowercase">Bấm để đính kèm tệp mô phỏng minh chứng tăng ca</span>
                      </div>

                      {otStaffingForm.uploadedFiles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 animate-fadeIn">
                          {otStaffingForm.uploadedFiles.map((file, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg flex items-center space-x-1.5 border border-purple-100">
                              <span>📄 {file}</span>
                              <button
                                type="button"
                                onClick={() => setOtStaffingForm({ ...otStaffingForm, uploadedFiles: otStaffingForm.uploadedFiles.filter((_, idx) => idx !== i) })}
                                className="hover:text-red-500 text-purple-400 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">MÔ TẢ CÔNG VIỆC TĂNG CA & LÝ DO <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        placeholder="Vui lòng nhập chi tiết nội dung công việc thực hiện ngoài giờ và lý do tăng ca..."
                        value={otStaffingForm.description}
                        onChange={(e) => setOtStaffingForm({ ...otStaffingForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-purple-600 outline-none min-h-[85px] transition-all"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white z-10 sticky bottom-0 w-full animate-fadeIn font-sans">
                <button
                  type="button"
                  onClick={() => setActiveCreateModal(null)}
                  className="px-6 py-2.5 bg-gray-150 text-gray-600 hover:bg-gray-250 rounded-xl text-xs font-semibold transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={
                      otMode === 'hourly' 
                        ? handleCreateOTHourly 
                        : otMode === 'package' 
                        ? handleCreateOTPackage 
                        : handleCreateOTStaffing
                    }
                    className={`px-6 py-2.5 text-white rounded-xl text-xs font-semibold transition-all shadow-md ${
                      otMode === 'hourly' 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/15' 
                        : otMode === 'package'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/15'
                        : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/15'
                    }`}
                  >
                    Save and request
                  </button>
                  <button
                    type="button"
                    onClick={
                      otMode === 'hourly' 
                        ? handleSaveOTHourlyDraft 
                        : otMode === 'package' 
                        ? handleSaveOTPackageDraft 
                        : handleSaveOTStaffingDraft
                    }
                    className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      otMode === 'hourly' 
                        ? 'bg-blue-10 hover:bg-blue-50 text-blue-600 border-blue-100' 
                        : otMode === 'package'
                        ? 'bg-emerald-10 hover:bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-purple-10 hover:bg-purple-50 text-purple-600 border-purple-100'
                    }`}
                  >
                    Save to draft
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {/* Form 3: Đơn cấp phép */}
        {activeCreateModal === 'business' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCreateModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 font-sans">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileText size={20} /></div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">ĐƠN ĐỀ XUẤT CẤP PHÉP</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Create Leave Grant / Restored Days Request</p>
                  </div>
                </div>
                <button onClick={() => setActiveCreateModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreatePermit} className="flex-1 overflow-y-auto p-8 space-y-6 font-sans">
                
                {/* Alert info block */}
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                  <span className="text-amber-500 font-extrabold text-sm">💡</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-bold">
                    Vui lòng điền đầy đủ thông tin để đề xuất bổ sung hoặc khôi phục số ngày phép. Đơn này sau khi gửi sẽ được chuyển đến người phê duyệt có thẩm quyền để xem xét và cập nhật trên hệ thống.
                  </p>
                </div>

                {/* Row 1: Lý do xin cấp ngày phép & Số ngày */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Lý do xin cấp ngày phép *</label>
                    <div className="relative">
                      <select
                        value={permitForm.leaveTypeCategory}
                        onChange={(e) => setPermitForm({...permitForm, leaveTypeCategory: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold focus:border-blue-600 outline-none appearance-none cursor-pointer"
                      >
                        <option value="marriage">🎉 Nghỉ Cưới</option>
                        <option value="bereavement">🖤 Nghỉ Hiếu</option>
                        <option value="regime">👶 Nghỉ chế độ</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-150 text-gray-500">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Số ngày *</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" required step="0.5" min="0.5" max="30" placeholder="Số ngày phép"
                        value={permitForm.requestedDays}
                        onChange={(e) => setPermitForm({...permitForm, requestedDays: e.target.value})}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                      />
                      <div className="flex space-x-1">
                        {['1.0', '2.0', '5.0'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setPermitForm({...permitForm, requestedDays: val})}
                            className={`px-2.5 py-3 rounded-xl text-[10px] font-black border transition-all ${
                              permitForm.requestedDays === val
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            +{val} ngày
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Minh chứng (upload file) & Người duyệt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Minh chứng (upload file)</label>
                    <div 
                      onClick={() => {
                        const randomFiles = [
                          'bien_ban_cuoi_tuan_signoff.pdf',
                          'email_phe_duyet_lam_bu.png',
                          'timesheet_he_thong_error.xlsx',
                          'bien_ban_ban_giao_nhiem_vu.pdf'
                        ];
                        const picked = randomFiles[Math.floor(Math.random() * randomFiles.length)];
                        setPermitForm({...permitForm, evidence: picked});
                        triggerToast(`📎 Đã đính kèm tệp minh chứng: ${picked}`);
                      }}
                      className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-4 text-center bg-gray-50/50 cursor-pointer transition-all hover:bg-white group"
                    >
                      <div className="flex flex-col items-center justify-center space-y-1 py-1">
                        <Paperclip size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs font-bold text-gray-700">Nhấn để chọn / Kéo thả tệp</span>
                        <span className="text-[9px] text-gray-400">Định dạng PDF, PNG, JPG, XLSX (Tối đa 5MB)</span>
                      </div>
                    </div>

                    {permitForm.evidence && (
                      <div className="mt-2.5 p-2 px-3 bg-blue-50/50 border border-blue-105 rounded-xl flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-sm">📎</span>
                          <span className="text-xs font-bold text-slate-705 truncate max-w-[190px]">{permitForm.evidence}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPermitForm({...permitForm, evidence: ''});
                            triggerToast('🗑️ Đã gỡ bỏ tệp minh chứng');
                          }}
                          className="p-1 hover:bg-slate-205 text-red-500 rounded-lg transition-colors"
                          title="Hủy đính kèm"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Người duyệt *</label>
                    <div className="relative">
                      <select
                        value={permitForm.approver}
                        onChange={(e) => setPermitForm({...permitForm, approver: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold focus:border-blue-600 outline-none appearance-none cursor-pointer"
                      >
                        <option value="Trần Văn B (Manager)">Trần Văn B (Manager / Quản lý trực tiếp)</option>
                        <option value="Lê Văn HR (HR Manager)">Lê Văn HR (HR Manager / Trưởng phòng Nhân sự)</option>
                        <option value="Phạm Hoàng C (Director)">Phạm Hoàng C (Director / Giám đốc Bộ phận)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-150 text-gray-500">
                        <ChevronDown size={14} />
                      </div>
                    </div>

                    <div className="mt-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Người đề xuất (Nhân viên)</span>
                        <span className="text-[11px] font-black text-slate-800 leading-tight block mt-1">Nguyễn Văn User</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Mã nhân sự</span>
                        <span className="text-[11px] font-mono font-black text-blue-600 block mt-1">V00497</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Diễn giải */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Diễn giải *</label>
                  <textarea 
                    required 
                    placeholder="Vui lòng diễn giải chi tiết căn cứ, lý do xin cấp thêm phép hoặc khôi phục ngày phép để người duyệt dễ dàng theo dõi và phê duyệt sớm..."
                    value={permitForm.reason}
                    onChange={(e) => setPermitForm({...permitForm, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:border-blue-600 outline-none h-24 resize-none transition-all focus:bg-white"
                  />
                </div>
              </form>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white sticky bottom-0 z-10 font-sans">
                <button 
                  type="button" 
                  onClick={() => setActiveCreateModal(null)} 
                  className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Hủy bỏ
                </button>
                <div className="flex items-center space-x-3">
                  <button 
                    type="submit"
                    onClick={handleCreatePermit}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all font-sans"
                  >
                    Gửi đơn đề xuất cấp phép
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {/* Form 4: Đơn Checkin/ Checkout */}
        {activeCreateModal === 'checkin' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCreateModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><CheckSquare size={20} /></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">BỔ SUNG GIỜ CHECKIN/ CHECKOUT</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Create Checkin/out Adjustment</p>
                  </div>
                </div>
                <button onClick={() => setActiveCreateModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>

              <form onSubmit={handleCreateCheckin} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Bổ sung cho ngày *</label>
                    <input 
                      type="date" required
                      value={checkinForm.date}
                      onChange={(e) => setCheckinForm({...checkinForm, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Loại điều chỉnh *</label>
                    <select 
                      value={checkinForm.direction}
                      onChange={(e) => setCheckinForm({...checkinForm, direction: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                    >
                      <option value="in">Bổ sung GIỜ VÀO (Check-In)</option>
                      <option value="out">Bổ sung GIỜ RA (Check-Out)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Thời gian thực tế (Giờ:Phút) *</label>
                  <input 
                    type="time" required
                    value={checkinForm.time}
                    onChange={(e) => setCheckinForm({...checkinForm, time: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Lý do quên chấm hoặc sửa lỗi máy scan *</label>
                  <textarea 
                    required placeholder="Nhập lý do cụ thể..."
                    value={checkinForm.reason}
                    onChange={(e) => setCheckinForm({...checkinForm, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:border-blue-600 outline-none h-24 resize-none"
                  />
                </div>
              </form>

              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
                <button type="button" onClick={() => setActiveCreateModal(null)} className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700">Hủy</button>
                <button onClick={handleCreateCheckin} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Gửi đơn bổ sung vân tay</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Form 5: Đơn nghỉ việc */}
        {activeCreateModal === 'resign' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCreateModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl"><LogOut size={20} /></div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">ĐƠN ĐỀ XUẤT THÔI VIỆC</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Create Resignation Request</p>
                  </div>
                </div>
                <button onClick={() => setActiveCreateModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>

              <form onSubmit={handleCreateResign} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ngày làm việc cuối đề xuất *</label>
                    <input 
                      type="date" required
                      value={resignForm.intendedLastDay}
                      onChange={(e) => setResignForm({...resignForm, intendedLastDay: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Đảm bảo thời hạn báo trước (30-45 ngày)? *</label>
                    <select 
                      value={resignForm.noticePeriodCompelled}
                      onChange={(e) => setResignForm({...resignForm, noticePeriodCompelled: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                    >
                      <option value="yes">Vâng, hoàn toàn đúng hạn</option>
                      <option value="no">Thương lượng thời gian báo trước rút ngắn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mô tả lý do thôi việc chi tiết *</label>
                  <textarea 
                    required placeholder="Xin nêu lý do nghỉ cụ thể để tiến hành thủ tục thanh lý..."
                    value={resignForm.reason}
                    onChange={(e) => setResignForm({...resignForm, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:border-blue-600 outline-none h-24 resize-none"
                  />
                </div>
              </form>

              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
                <button type="button" onClick={() => setActiveCreateModal(null)} className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700">Hủy</button>
                <button onClick={handleCreateResign} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">Xác nhận nộp đơn nghỉ việc</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Form 6: Đơn đăng ký đi onsite */}
        {activeCreateModal === 'onsite' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCreateModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 font-sans">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl"><MapPin size={20} className="text-green-600" /></div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">ĐƠN ĐĂNG KÝ ĐI ONSITE</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Create Onsite Registration Request</p>
                  </div>
                </div>
                <button onClick={() => setActiveCreateModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>

              <form onSubmit={handleCreateOnsite} className="flex-1 overflow-y-auto p-8 space-y-6 font-sans">
                <div className="p-4 bg-green-50/40 border border-green-100 rounded-2xl flex items-start space-x-3 text-xs text-green-900 font-bold leading-relaxed">
                  <span>💡</span>
                  <p>Mẫu đơn dành cho nhân sự đăng ký lịch làm việc biệt phái, công tác tại Onsite văn phòng Khách hàng hoặc văn phòng đối tác chiến lược để hệ thống đồng bộ lịch chấm công định vị phù hợp.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dự án */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Mã dự án cần đi Onsite *</label>
                    <div className="relative">
                      <select
                        value={onsiteForm.projectCode}
                        onChange={(e) => setOnsiteForm({...onsiteForm, projectCode: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 focus:bg-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="A.24.DA.VCB.STAF">A.24.DA.VCB.STAF - Vietcombank Staffing Portal</option>
                        <option value="A.25.DA.BIDV.CORE">A.25.DA.BIDV.CORE - Core integration</option>
                        <option value="A.26.DA.VIETIN.INTG">A.26.DA.VIETIN.INTG - Portal backend</option>
                        <option value="A.26.DA.AGRI.STAF">A.26.DA.AGRI.STAF - Agribank Staffing Migration</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-200 text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Địa điểm Onsite */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Địa điểm làm việc cụ thể *</label>
                    <input 
                      type="text" required
                      value={onsiteForm.location}
                      onChange={(e) => setOnsiteForm({...onsiteForm, location: e.target.value})}
                      placeholder="VD: Toà nhà Vietcombank, Hoàn Kiếm, HN"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Chọn thành viên đi Onsite */}
                <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2.5xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Chọn thành viên trong Team đi Onsite *
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase">
                        Đã chọn: {onsiteForm.assignments.filter(a => a.selected).length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = onsiteForm.assignments.map(a => ({ ...a, selected: true }));
                          setOnsiteForm({ ...onsiteForm, assignments: updated });
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = onsiteForm.assignments.map(a => ({ ...a, selected: false }));
                          setOnsiteForm({ ...onsiteForm, assignments: updated });
                        }}
                        className="text-gray-500 hover:text-gray-600 font-bold hover:underline cursor-pointer"
                      >
                        Bỏ chọn hết
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {onsiteForm.assignments.map((assign, index) => {
                      return (
                        <label
                          key={assign.staffId}
                          className={`flex items-center space-x-3 p-3 bg-white border rounded-2xl cursor-pointer hover:shadow-sm transition-all select-none ${
                            assign.selected ? 'border-blue-200 bg-blue-50/10' : 'border-gray-200/80 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={assign.selected}
                            onChange={(e) => {
                              const updated = [...onsiteForm.assignments];
                              updated[index] = { ...updated[index], selected: e.target.checked };
                              setOnsiteForm({ ...onsiteForm, assignments: updated });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                            index % 5 === 0 ? 'bg-indigo-500' :
                            index % 5 === 1 ? 'bg-emerald-500' :
                            index % 5 === 2 ? 'bg-amber-500' :
                            index % 5 === 3 ? 'bg-rose-500' : 'bg-sky-500'
                          }`}>
                            {assign.name.split(' ').slice(-1)[0].charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{assign.name}</p>
                            <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5 truncate">{assign.staffId} • {assign.role}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Grid chọn thời gian nâng cao theo mẫu Register OT */}
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-2.5xl space-y-5">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      ONSITE INFORMATION (CHI TIẾT LỊCH TRÌNH ONSITE)
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">Fields marked with (*) are required</span>
                  </div>

                  {/* Lựa chọn Hình thức đăng ký */}
                  <div className="bg-[#f0fdf4] p-4 rounded-xl border border-green-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[10px] font-black text-green-700 uppercase tracking-widest block mb-1">Hình thức đăng ký Onsite *</label>
                      <div className="inline-flex bg-gray-200/70 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleChangeOnsiteMode('day')}
                          className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            onsiteMode === 'day' 
                              ? 'bg-white text-green-700 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Theo ngày
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeOnsiteMode('week')}
                          className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            onsiteMode === 'week' 
                              ? 'bg-white text-green-700 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Theo tuần
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeOnsiteMode('month')}
                          className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                            onsiteMode === 'month' 
                              ? 'bg-white text-green-700 shadow-sm' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Theo tháng
                        </button>
                      </div>
                      <p className="text-[10px] text-green-600 font-semibold italic mt-1">
                        {onsiteMode === 'day' && 'Tự do thêm bớt và điều chỉnh từng ngày làm việc Onsite.'}
                        {onsiteMode === 'week' && 'Tự động tạo lịch làm việc từ thứ 2 tới thứ 6 của tuần được chọn.'}
                        {onsiteMode === 'month' && 'Tự động tạo lịch làm việc trong suốt tháng (bỏ qua thứ 7, chủ nhật).'}
                      </p>
                    </div>

                    {onsiteMode === 'week' && (
                      <div className="w-full md:w-96 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Chọn Tháng *</label>
                            <input
                              type="month"
                              value={selectedMonth}
                              onChange={(e) => handleMonthChangeForWeek(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Chọn Tuần (1/2/3/4) *</label>
                            <div className="relative">
                              <select
                                value={selectedWeekStart}
                                onChange={(e) => handleWeekChange(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 outline-none appearance-none cursor-pointer"
                              >
                                {getWeeksInMonth(selectedMonth).map((wk) => (
                                  <option key={wk.startDateStr} value={wk.startDateStr}>
                                    {wk.label}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                                <ChevronDown size={12} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Chọn nhanh:</span>
                          {getWeeksInMonth(selectedMonth).map((wk) => {
                            const isSelected = selectedWeekStart === wk.startDateStr;
                            return (
                              <button
                                key={wk.startDateStr}
                                type="button"
                                onClick={() => handleWeekChange(wk.startDateStr)}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                Tuần {wk.weekNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {onsiteMode === 'month' && (
                      <div className="w-full md:w-64">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Chọn tháng làm việc *</label>
                        <div className="relative">
                          <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="w-full pl-3 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Header labels */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Ngày đi Onsite *</div>
                    <div className="col-span-2">Giờ bắt đầu *</div>
                    <div className="col-span-2">Giờ kết thúc *</div>
                    <div className="col-span-2 text-center">Số giờ</div>
                    <div className="col-span-2 text-center">Hệ số</div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-3">
                    {onsiteForm.dates.map((row, idx) => {
                      const hrs = Number(row.hours) || 0;
                      const coeffVal = hrs / 8;
                      const coeffStr = hrs === 8 ? '1.0' : hrs === 0 ? '0' : `${hrs}/8 (${coeffVal.toFixed(2).replace(/\.00$/, '')})`;

                      return (
                        <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Label "Onsite Date" for Row 0, or minus icon for other rows */}
                          <div className="col-span-1 flex items-center justify-start md:justify-end pr-1">
                            {idx === 0 ? (
                              <span className="text-[10px] font-black text-gray-500 uppercase whitespace-nowrap">Ngày *</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveOnsiteRow(idx)}
                                className="w-6 h-6 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors cursor-pointer"
                                title="Xóa ngày này"
                              >
                                <span className="text-sm font-black leading-none">—</span>
                              </button>
                            )}
                          </div>

                          {/* Onsite Date */}
                          <div className="col-span-3 relative">
                            <input 
                              type="date" required
                              value={row.date}
                              onChange={(e) => handleUpdateOnsiteRow(idx, { date: e.target.value })}
                              className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 outline-none"
                            />
                            <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Start time */}
                          <div className="col-span-2 relative">
                            <input 
                              type="time" required
                              value={row.startTime}
                              onChange={(e) => handleUpdateOnsiteRow(idx, { startTime: e.target.value })}
                              className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 outline-none"
                            />
                            <Clock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>

                          {/* End time */}
                          <div className="col-span-2 relative">
                            <input 
                              type="time" required
                              value={row.endTime}
                              onChange={(e) => handleUpdateOnsiteRow(idx, { endTime: e.target.value })}
                              className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 outline-none"
                            />
                            <Clock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Hours badge with custom styled orange outline and clock */}
                          <div className="col-span-2">
                            <div className="w-full py-2.5 bg-orange-50/70 border border-orange-200 text-orange-600 rounded-xl text-xs font-extrabold text-center flex items-center justify-center space-x-1 shadow-sm shadow-orange-500/5">
                              <Clock size={12} className="text-orange-500 shrink-0" />
                              <span>{row.hours}h</span>
                            </div>
                          </div>

                          {/* Coefficient (Hệ số) Badge */}
                          <div className="col-span-2">
                            <div className="w-full py-2.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-xl text-xs font-black text-center flex items-center justify-center space-x-1 shadow-sm">
                              <span className="text-[10px] uppercase text-indigo-400 md:hidden font-black">Hệ số: </span>
                              <span>{coeffStr}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add date action link */}
                  <div className="flex items-center pl-1 pt-1">
                    <button
                      type="button"
                      onClick={handleAddOnsiteRow}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center space-x-1.5 transition-colors bg-blue-50/40 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100 cursor-pointer"
                    >
                      <Plus size={14} className="text-blue-500" />
                      <span>+ Add date (Thêm ngày mới)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Người phê duyệt */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Người duyệt chính *</label>
                    <div className="relative">
                      <select
                        value={onsiteForm.approver}
                        onChange={(e) => setOnsiteForm({...onsiteForm, approver: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:border-green-600 focus:bg-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="HOD Giám đốc khối">HOD Giám đốc khối (Head of Department)</option>
                        <option value="Trần Văn B (Project Manager)">Trần Văn B (Project Manager)</option>
                        <option value="Lê Thị C (Delivery Head)">Lê Thị C (Delivery Head)</option>
                        <option value="Nguyễn Hoàng D (HR BP)">Nguyễn Hoàng D (HR BP)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l border-gray-200 text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Minh chứng đính kèm */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Quyết định bổ nhiệm/Yêu cầu onsite từ KH (Đính kèm)</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const dummyFiles = ['quyet_dinh_onsite_vcb.pdf', 'yeu_cau_phim_uat_bidv.docx', 'email_xac_nhan_working_onsite.png'];
                          const nextFile = dummyFiles[Math.floor(Math.random() * dummyFiles.length)];
                          if (!onsiteForm.uploadedFiles.includes(nextFile)) {
                            setOnsiteForm({...onsiteForm, uploadedFiles: [...onsiteForm.uploadedFiles, nextFile]});
                          }
                        }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-xs font-semibold text-gray-750 flex items-center space-x-2 transition-all cursor-pointer"
                      >
                        <Paperclip size={14} className="text-gray-400" />
                        <span>Tải tệp đính kèm lên</span>
                      </button>
                    </div>

                    {onsiteForm.uploadedFiles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {onsiteForm.uploadedFiles.map((file, i) => (
                          <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 font-bold text-[10px] rounded border border-green-100 flex items-center space-x-1.5">
                            <span>📄 {file}</span>
                            <button
                              type="button"
                              onClick={() => setOnsiteForm({...onsiteForm, uploadedFiles: onsiteForm.uploadedFiles.filter((_, idx) => idx !== i)})}
                              className="text-green-500 hover:text-red-500 font-black cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mục đích */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mục đích đi onsite & Nội dung nhiệm vụ cụ thể *</label>
                  <textarea 
                    required placeholder="Nêu rõ mô tả công việc phân công khi thực hiện onsite tại văn phòng đối tác..."
                    value={onsiteForm.purpose}
                    onChange={(e) => setOnsiteForm({...onsiteForm, purpose: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:border-green-600 focus:bg-white outline-none h-24 resize-none transition-all"
                  />
                </div>
              </form>

              {/* Sticky footer exactly replicating the Register OT style */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white sticky bottom-0 z-10 w-full font-sans shadow-lg">
                {/* Left side: Total Hours summary inspired by 'Total OT: 9.0 hours' */}
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50/50 border border-orange-100 px-4 py-2 rounded-2xl">
                  <Clock size={15} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Total Onsite: <span className="text-sm font-black text-orange-700">{onsiteForm.dates.reduce((sum, d) => sum + Number(d.hours || 0), 0).toFixed(1)}</span> hours
                  </span>
                </div>

                {/* Right side Buttons */}
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => setActiveCreateModal(null)} className="px-5 py-2.5 text-xs font-bold text-gray-550 hover:text-gray-700">Cancel</button>
                  <button type="button" onClick={handleSaveOnsiteDraft} className="px-5 py-2.5 bg-green-10 hover:bg-green-50 text-green-600 rounded-xl text-xs font-extrabold border border-green-100 transition-all">
                    Save Draft
                  </button>
                  <button onClick={handleCreateOnsite} className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-green-750 transition-all shadow-md shadow-green-500/15">
                    Submit Onsite
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {openRejectModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => {
                setOpenRejectModal(false);
                setRejectingIds([]);
              }} 
              className="fixed inset-0 bg-black/50 backdrop-blur-xs" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Từ chối đơn từ</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Input Rejection Reason</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setOpenRejectModal(false);
                    setRejectingIds([]);
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-850 leading-relaxed">
                  ⚠️ Bạn đang thực hiện từ chối <span className="font-extrabold text-rose-950 underline">{rejectingIds.length}</span> đơn. Hành động này không thể hoàn tác. Vui lòng cung cấp lý do rõ ràng để gửi tới nhân viên.
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Lý do từ chối *</label>
                  <textarea
                    required
                    placeholder="Ví dụ: Không đáp ứng điều kiện dự án, ngày nghỉ cần được dời sang tuần sau, thiếu thông tin OT..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-rose-500 rounded-xl text-xs font-semibold outline-none h-28 resize-none transition-all font-sans"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenRejectModal(false);
                      setRejectingIds([]);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all font-sans"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-500/15 transition-all font-sans"
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};
