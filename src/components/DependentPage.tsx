import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar, 
  Check, 
  X, 
  Plus, 
  AlertCircle,
  FileSpreadsheet,
  ArrowLeft,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define the Dependent interface matching exactly all user requested fields
export interface Dependent {
  id: string;
  employeeName: string;      // tên nhân sự
  dependentName: string;     // Họ tên thành viên
  dob: string;               // Ngày tháng năm sinh
  taxCode: string;           // Mã số thuế
  idCard: string;            // CCCD
  relationship: 'Con' | 'Cha/ Mẹ' | 'Khác'; // Quan hệ: Con, Cha/ Mẹ, Khác
  isCalculated: boolean;     // Tick chọn tính NPT
  startDate: string;         // Thời gian bắt đầu
  endDate: string;           // Thời gian kết thúc
  employeeStaffId: string;   // Mã nhân viên
}

export interface Employee {
  staffId: string;           // Mã nhân viên
  name: string;              // Tên nhân sự
  department: string;        // Phòng ban
  position: string;          // Chức danh
  email: string;             // Email liên hệ
  avatarColor: string;       // Color theme for profile avatar
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    staffId: 'NV00123',
    name: 'Nguyễn Văn An',
    department: 'Phòng Nhân sự (HR)',
    position: 'Chuyên viên tuyển dụng',
    email: 'an.nv@imisportal.com',
    avatarColor: 'bg-emerald-500'
  },
  {
    staffId: 'NV00456',
    name: 'HỒ TÚ ANH',
    department: 'Phòng Phát triển sản phẩm',
    position: 'Lập trình viên Senior',
    email: 'anh.ht@imisportal.com',
    avatarColor: 'bg-blue-500'
  },
  {
    staffId: 'NV00789',
    name: 'Hồ Long Nhật Man',
    department: 'Ban Giám đốc',
    position: 'Phó Giám đốc điều hành',
    email: 'man.hln@imisportal.com',
    avatarColor: 'bg-purple-500'
  },
  {
    staffId: 'NV00999',
    name: 'Trần Văn C',
    department: 'Phòng Kế toán',
    position: 'Kế toán trưởng',
    email: 'c.tv@imisportal.com',
    avatarColor: 'bg-amber-500'
  },
  {
    staffId: 'NV00150',
    name: 'Phạm Minh Trí',
    department: 'Phòng Kinh doanh',
    position: 'Trưởng nhóm phát triển kinh doanh',
    email: 'tri.pm@imisportal.com',
    avatarColor: 'bg-indigo-500'
  },
  {
    staffId: 'NV00185',
    name: 'Lê Thu Trang',
    department: 'Phòng Marketing',
    position: 'Chuyên viên Thiết kế đồ họa',
    email: 'trang.lt@imisportal.com',
    avatarColor: 'bg-rose-500'
  },
  {
    staffId: 'NV00210',
    name: 'Nguyễn Thị Mai',
    department: 'Phòng Vận hành',
    position: 'Chuyên viên hỗ trợ dịch vụ',
    email: 'mai.nt@imisportal.com',
    avatarColor: 'bg-teal-500'
  }
];

const INITIAL_DEPENDENTS: Dependent[] = [
  {
    id: 'DP-001',
    employeeName: 'Nguyễn Văn An',
    dependentName: 'Nguyễn Minh Khang',
    dob: '2018-04-12',
    taxCode: '8123456789',
    idCard: '037201004567',
    relationship: 'Con',
    isCalculated: true,
    startDate: '2020-01-01',
    endDate: '2036-12-31',
    employeeStaffId: 'NV00123'
  },
  {
    id: 'DP-002',
    employeeName: 'HỒ TÚ ANH',
    dependentName: 'Hồ Hoàng Long',
    dob: '2021-08-15',
    taxCode: '8543210987',
    idCard: '037201007890',
    relationship: 'Con',
    isCalculated: true,
    startDate: '2021-09-01',
    endDate: '',
    employeeStaffId: 'NV00456'
  },
  {
    id: 'DP-003',
    employeeName: 'Hồ Long Nhật Man',
    dependentName: 'Lê Thị Hoa',
    dob: '1965-10-10',
    taxCode: '8987654321',
    idCard: '037165001234',
    relationship: 'Cha/ Mẹ',
    isCalculated: true,
    startDate: '2022-01-01',
    endDate: '',
    employeeStaffId: 'NV00789'
  },
  {
    id: 'DP-004',
    employeeName: 'Trần Văn C',
    dependentName: 'Trần Tiểu Vy',
    dob: '2023-11-20',
    taxCode: '',
    idCard: '',
    relationship: 'Khác',
    isCalculated: false,
    startDate: '2023-12-01',
    endDate: '',
    employeeStaffId: 'NV00999'
  }
];

export const DependentPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [dependents, setDependents] = useState<Dependent[]>(INITIAL_DEPENDENTS);
  
  // Navigation State: Null means showing Employee list, non-null means showing detailed view of a selected Employee
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Search & Filters for Employee List
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState('All');
  
  // Filters for Dependent List (in detail view)
  const [depSearchQuery, setDepSearchQuery] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('All');
  const [calcFilter, setCalcFilter] = useState<string>('All');
  
  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);

  // Form states matching exactly the required fields
  const [formEmployeeName, setFormEmployeeName] = useState('');
  const [formEmployeeStaffId, setFormEmployeeStaffId] = useState('');
  const [formDependentName, setFormDependentName] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formTaxCode, setFormTaxCode] = useState('');
  const [formIdCard, setFormIdCard] = useState('');
  const [formRelationship, setFormRelationship] = useState<'Con' | 'Cha/ Mẹ' | 'Khác'>('Con');
  const [formIsCalculated, setFormIsCalculated] = useState(true);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const [formError, setFormError] = useState('');

  // Copy paste import states
  const [importText, setImportText] = useState('');
  const [importParsedData, setImportParsedData] = useState<Partial<Dependent>[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success'>('idle');
  const [importFileFeedback, setImportFileFeedback] = useState<string>('');

  // Unique list of departments for filter
  const departmentsList = Array.from(new Set(employees.map(e => e.department)));

  // Open modal for creating a new dependent
  const handleOpenAddModal = (emp?: Employee) => {
    setEditingDependent(null);
    setFormError('');
    
    // If we have an active selected employee, we prefill their credentials!
    const targetEmp = emp || selectedEmployee;
    if (targetEmp) {
      setFormEmployeeName(targetEmp.name);
      setFormEmployeeStaffId(targetEmp.staffId);
    } else {
      setFormEmployeeName('');
      setFormEmployeeStaffId('');
    }
    
    setFormDependentName('');
    setFormDob('');
    setFormTaxCode('');
    setFormIdCard('');
    setFormRelationship('Con');
    setFormIsCalculated(true);
    // Auto populate today's date for starting date as standard placeholder
    const todayStr = new Date().toISOString().split('T')[0];
    setFormStartDate(todayStr);
    setFormEndDate('');
    
    setIsFormModalOpen(true);
  };

  // Open modal for editing an existing dependent
  const handleOpenEditModal = (dep: Dependent) => {
    setEditingDependent(dep);
    setFormEmployeeName(dep.employeeName);
    setFormEmployeeStaffId(dep.employeeStaffId);
    setFormDependentName(dep.dependentName);
    setFormDob(dep.dob);
    setFormTaxCode(dep.taxCode);
    setFormIdCard(dep.idCard);
    setFormRelationship(dep.relationship);
    setFormIsCalculated(dep.isCalculated);
    setFormStartDate(dep.startDate);
    setFormEndDate(dep.endDate);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông tin người phụ thuộc này?')) {
      setDependents(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formEmployeeName.trim()) {
      setFormError('Vui lòng nhập tên nhân sự');
      return;
    }
    if (!formEmployeeStaffId.trim()) {
      setFormError('Vui lòng nhập mã nhân viên (Staff ID)');
      return;
    }
    if (!formDependentName.trim()) {
      setFormError('Vui lòng nhập họ tên thành viên phụ thuộc');
      return;
    }

    const savedData: Dependent = {
      id: editingDependent ? editingDependent.id : `DP-${Date.now().toString().slice(-4)}`,
      employeeName: formEmployeeName.trim(),
      employeeStaffId: formEmployeeStaffId.trim(),
      dependentName: formDependentName.trim(),
      dob: formDob,
      taxCode: formTaxCode.trim(),
      idCard: formIdCard.trim(),
      relationship: formRelationship,
      isCalculated: formIsCalculated,
      startDate: formStartDate,
      endDate: formEndDate
    };

    if (editingDependent) {
      setDependents(prev => prev.map(item => item.id === editingDependent.id ? savedData : item));
    } else {
      setDependents(prev => [savedData, ...prev]);
      
      // Auto-add employee if they don't exist yet in the primary listing
      const empExists = employees.some(emp => emp.staffId === savedData.employeeStaffId);
      if (!empExists) {
        const newEmp: Employee = {
          staffId: savedData.employeeStaffId,
          name: savedData.employeeName,
          department: 'Phòng ban mới',
          position: 'Nhân sự ngoài danh sách',
          email: `${savedData.employeeStaffId.toLowerCase()}@imisportal.com`,
          avatarColor: 'bg-slate-500'
        };
        setEmployees(prev => [...prev, newEmp]);
      }
    }

    setIsFormModalOpen(false);
  };

  // Parsed Copy-Paste Excel / TSV/ CSV data
  const handleParseImport = () => {
    if (!importText.trim()) {
      setImportFileFeedback('Vui lòng nhập hoặc dán nội dung bảng dữ liệu!');
      return;
    }

    try {
      // Split by lines
      const lines = importText.trim().split('\n');
      const parsed: Partial<Dependent>[] = [];

      lines.forEach((line, index) => {
        // Support tab or comma separation
        const parts = line.split(/\t|,/);
        
        // Skip header if looks like title
        if (index === 0 && (line.toLowerCase().includes('tên') || line.toLowerCase().includes('họ') || line.toLowerCase().includes('mã'))) {
          return;
        }

        if (parts.length >= 3) {
          // Attempt to map columns cleanly
          // 1. Dependent name, 2. Relationship, 3. Dob, 4. TaxCode, 5. ID Card, 6. calculated (true/false), 7. StartDate, 8. EndDate
          const depName = parts[0]?.trim() || '';
          const rawRel = parts[1]?.trim() || 'Con';
          const rel: 'Con' | 'Cha/ Mẹ' | 'Khác' = 
            rawRel.toLowerCase().includes('con') ? 'Con' : 
            (rawRel.toLowerCase().includes('mẹ') || rawRel.toLowerCase().includes('cha')) ? 'Cha/ Mẹ' : 'Khác';
          
          const dob = parts[2]?.trim() || '';
          const taxCode = parts[3]?.trim() || '';
          const idCard = parts[4]?.trim() || '';
          const rawCalc = parts[5]?.trim() || 'true';
          const isCalculated = rawCalc.toLowerCase() !== 'false' && rawCalc !== '0';
          const startDate = parts[6]?.trim() || new Date().toISOString().split('T')[0];
          const endDate = parts[7]?.trim() || '';

          // If we have selectedEmployee, prefill employee info. Else read from extra cols if available or leave blank
          let empName = selectedEmployee ? selectedEmployee.name : (parts[8]?.trim() || '');
          let staffId = selectedEmployee ? selectedEmployee.staffId : (parts[9]?.trim() || parts[10]?.trim() || '');

          if (depName) {
            parsed.push({
              dependentName: depName,
              relationship: rel,
              dob,
              taxCode,
              idCard,
              isCalculated,
              startDate,
              endDate,
              employeeName: empName || 'Nhân viên chưa đặt tên',
              employeeStaffId: staffId || 'NV00000'
            });
          }
        }
      });

      if (parsed.length === 0) {
        setImportFileFeedback('Không nhận diện được hàng dữ liệu nào hợp lệ. Vui lòng định dạng đúng cột!');
      } else {
        setImportParsedData(parsed);
        setImportStatus('preview');
        setImportFileFeedback('');
      }
    } catch (err) {
      setImportFileFeedback('Có lỗi xảy ra khi phân tích dữ liệu. Vui lòng thử lại.');
    }
  };

  // Submit parsed data to actual dependents state
  const handleExecuteImport = () => {
    const finalNewDependents: Dependent[] = importParsedData.map((item, idx) => ({
      id: `DP-IMP-${Date.now().toString().slice(-4)}-${idx}`,
      employeeName: item.employeeName || selectedEmployee?.name || 'Nguyễn Văn An',
      employeeStaffId: item.employeeStaffId || selectedEmployee?.staffId || 'NV00123',
      dependentName: item.dependentName || 'Họ tên',
      dob: item.dob || '2020-01-01',
      taxCode: item.taxCode || '',
      idCard: item.idCard || '',
      relationship: item.relationship || 'Con',
      isCalculated: item.isCalculated !== undefined ? item.isCalculated : true,
      startDate: item.startDate || '2020-01-01',
      endDate: item.endDate || ''
    }));

    setDependents(prev => [...finalNewDependents, ...prev]);
    
    // Also auto insert employees if we imported globally with missing employees
    finalNewDependents.forEach(dep => {
      const empExists = employees.some(e => e.staffId === dep.employeeStaffId);
      if (!empExists) {
        const newEmp: Employee = {
          staffId: dep.employeeStaffId,
          name: dep.employeeName,
          department: 'Phòng ban Import',
          position: 'Nhân viên mới',
          email: `${dep.employeeStaffId.toLowerCase()}@imisportal.com`,
          avatarColor: 'bg-teal-500'
        };
        setEmployees(prev => [...prev, newEmp]);
      }
    });

    setImportStatus('success');
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportStatus('idle');
      setImportText('');
      setImportParsedData([]);
    }, 1500);
  };

  // Simulated drag-and-drop file import
  const handleSimulatedFileUpload = (fileName: string) => {
    setImportFileFeedback(`Đã tải file "${fileName}" thành công!`);
    
    // Inject custom realistic mock data inside the textarea for parsing
    let sampleData = '';
    if (selectedEmployee) {
      sampleData = `Hồ Anh Thư\tCon\t2022-05-18\t910234567\t037202008899\ttrue\t2022-06-01\t\n` +
                   `Hồ Tuấn Kiệt\tCon\t2025-01-10\t\t\ttrue\t2025-02-01\t`;
    } else {
      sampleData = `Nguyễn Bảo Long\tCon\t2019-12-05\t810101010\t037201019999\ttrue\t2020-01-01\t\tNguyễn Văn An\tNV00123\n` +
                   `Lê Thu Cúc\tCha/ Mẹ\t1960-03-24\t892222222\t037160002233\ttrue\t2022-01-01\t\tLê Thu Trang\tNV00185`;
    }
    setImportText(sampleData);
  };

  // Helper count function
  const getDependentCountForEmployee = (staffId: string) => {
    return dependents.filter(dep => dep.employeeStaffId === staffId).length;
  };

  // Filter Employees List
  const filteredEmployees = employees.filter(emp => {
    const searchString = `${emp.name} ${emp.staffId} ${emp.position} ${emp.department}`.toLowerCase();
    const matchesSearch = searchString.includes(employeeSearchQuery.toLowerCase());
    const matchesDept = employeeDeptFilter === 'All' || emp.department === employeeDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Filter Dependents for Selected Employee
  const filteredDependentsForSelected = dependents.filter(dep => {
    if (!selectedEmployee) return false;
    if (dep.employeeStaffId !== selectedEmployee.staffId) return false;

    const searchString = `${dep.dependentName} ${dep.taxCode} ${dep.idCard}`.toLowerCase();
    const matchesSearch = searchString.includes(depSearchQuery.toLowerCase());

    const matchesRelationship = relationshipFilter === 'All' || dep.relationship === relationshipFilter;
    const matchesCalc = calcFilter === 'All' || 
                         (calcFilter === 'Yes' && dep.isCalculated) || 
                         (calcFilter === 'No' && !dep.isCalculated);

    return matchesSearch && matchesRelationship && matchesCalc;
  });

  return (
    <div className="bg-transparent min-h-full p-4 sm:p-6">
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        
        {/* Breadcrumb Navigation when viewing detail */}
        <AnimatePresence mode="wait">
          {!selectedEmployee ? (
            // ==========================================
            // SCREEN 1: EMPLOYEE DATABASE LIST (MASTER)
            // ==========================================
            <motion.div 
              key="employee-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Top Row Title & Global Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-[#0fa57c]/10 text-[#0fa57c] rounded-2xl shadow-xs">
                      <Users size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        THÔNG TIN NGƯỜI PHỤ THUỘC
                      </h2>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
                        Quản lý hồ sơ gia cảnh và giảm trừ gia cảnh thuế TNCN theo Nhân sự
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start md:self-auto">
                  <button 
                    onClick={() => {
                      setImportText('');
                      setImportParsedData([]);
                      setImportStatus('idle');
                      setImportFileFeedback('');
                      setIsImportModalOpen(true);
                    }}
                    className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Upload size={14} className="text-[#0fa57c]" />
                    Import danh sách
                  </button>

                  <button 
                    onClick={() => handleOpenAddModal()}
                    className="px-5 py-2.5 bg-[#0fa57c] text-white rounded-xl text-xs font-bold hover:bg-[#0fa57c]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer hover:shadow-emerald-500/20 active:scale-95"
                  >
                    <Plus size={15} />
                    Thêm NPT mới
                  </button>
                </div>
              </div>

              {/* Searching and Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Tìm nhân sự theo tên, mã NV, chức danh..."
                    value={employeeSearchQuery}
                    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 w-full sm:w-auto justify-end">
                  <Filter size={14} className="text-slate-400" />
                  <span>Bộ phận:</span>
                  <select 
                    value={employeeDeptFilter}
                    onChange={(e) => setEmployeeDeptFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0fa57c]"
                  >
                    <option value="All">Tất cả phòng ban</option>
                    {departmentsList.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Employees Table Grid */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-[#0fa57c]" />
                    DANH SÁCH NHÂN SỰ CHỦ QUẢN ({filteredEmployees.length})
                  </h3>
                  <span className="text-[10px] text-[#0fa57c] bg-emerald-50 px-2 py-1 rounded-md font-bold">Bấm vào hàng để xem hồ sơ gia cảnh</span>
                </div>

                <div className="overflow-x-auto">
                  {filteredEmployees.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <AlertCircle className="mx-auto text-slate-300" size={40} />
                      <p className="text-xs font-bold text-slate-400">Không tìm thấy cán bộ nhân sự nào phù hợp</p>
                      <button 
                        onClick={() => { setEmployeeSearchQuery(''); setEmployeeDeptFilter('All'); }}
                        className="px-4 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-slate-50"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="px-5 py-4 font-bold">Mã nhân viên</th>
                          <th className="px-5 py-4 font-bold">Họ và tên</th>
                          <th className="px-5 py-4 font-bold">Phòng ban</th>
                          <th className="px-5 py-4 font-bold">Chức danh</th>
                          <th className="px-5 py-4 text-center font-bold">Số lượng người phụ thuộc</th>
                          <th className="px-5 py-4 text-right font-bold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredEmployees.map((emp) => {
                          const depCount = getDependentCountForEmployee(emp.staffId);
                          return (
                            <tr 
                              key={emp.staffId} 
                              onClick={() => setSelectedEmployee(emp)}
                              className="hover:bg-slate-50/75 transition-all group cursor-pointer"
                            >
                              <td className="px-5 py-4 font-mono font-bold text-slate-500">
                                <div className="flex flex-col">
                                  <span>Mã NV: <span className="text-slate-800">{emp.staffId}</span></span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full ${emp.avatarColor} text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs`}>
                                    {emp.name.split(' ').pop()?.slice(0, 2)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800 group-hover:text-[#0fa57c] transition-colors">{emp.name}</span>
                                    <span className="block text-[10px] text-slate-400 font-medium">{emp.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-600">
                                {emp.department}
                              </td>
                              <td className="px-5 py-4 text-slate-500 font-medium">
                                {emp.position}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                  depCount > 0 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/30' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  <Users size={12} />
                                  <span>{depCount} thành viên</span>
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEmployee(emp);
                                  }}
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-[#0fa57c]/10 text-slate-600 hover:text-[#0fa57c] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ml-auto border border-slate-100"
                                >
                                  Chi tiết NPT
                                  <ChevronRight size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Informative Note Footer */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/20 flex items-start gap-3">
                <Info size={16} className="text-[#0fa57c] mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">Hướng dẫn quản lý giảm trừ gia cảnh: </span> 
                  Vui lòng bấm chọn một nhân viên cụ thể từ danh sách để xem hồ sơ chi tiết người phụ thuộc, thêm mới người phụ thuộc cho nhân viên đó, hoặc thực hiện import danh sách gia cảnh nhanh chóng. Quy định giảm trừ gia cảnh thuế TNCN hiện hành được áp dụng tự động dựa trên mốc thời gian hoạt động.
                </div>
              </div>
            </motion.div>
          ) : (
            // ==========================================
            // SCREEN 2: DEPENDENTS FOR SELECTED EMPLOYEE
            // ==========================================
            <motion.div 
              key="dependent-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Back breadcrumb and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button 
                  onClick={() => {
                    setSelectedEmployee(null);
                    setDepSearchQuery('');
                    setRelationshipFilter('All');
                    setCalcFilter('All');
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors self-start py-1"
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại danh sách nhân viên</span>
                </button>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button 
                    onClick={() => {
                      setImportText('');
                      setImportParsedData([]);
                      setImportStatus('idle');
                      setImportFileFeedback('');
                      setIsImportModalOpen(true);
                    }}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Upload size={14} className="text-[#0fa57c]" />
                    Import cho NV này
                  </button>

                  <button 
                    onClick={() => handleOpenAddModal(selectedEmployee)}
                    className="px-4 py-2 bg-[#0fa57c] text-white rounded-xl text-xs font-bold hover:bg-[#0fa57c]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95"
                  >
                    <Plus size={15} />
                    Thêm người phụ thuộc
                  </button>
                </div>
              </div>

              {/* Highlight Profile Card of Selected Employee */}
              <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl ${selectedEmployee.avatarColor} text-white flex items-center justify-center font-black text-lg uppercase shadow-md`}>
                    {selectedEmployee.name.split(' ').pop()?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{selectedEmployee.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-bold mt-1">
                      <span className="font-mono text-slate-700">Mã NV: {selectedEmployee.staffId}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#0fa57c]">{selectedEmployee.department}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold">{selectedEmployee.position} | {selectedEmployee.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-slate-50/70 border border-slate-100 rounded-2xl p-4 self-stretch md:self-auto justify-around">
                  <div className="text-center px-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Người phụ thuộc</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{filteredDependentsForSelected.length}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center px-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Đang tính NPT</span>
                    <span className="text-lg font-black text-emerald-600 font-mono">
                      {filteredDependentsForSelected.filter(d => d.isCalculated).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-filtering tool for the active dependents */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Tìm theo họ tên người phụ thuộc, CCCD, MST..."
                    value={depSearchQuery}
                    onChange={(e) => setDepSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Filter size={14} className="text-slate-400" />
                    <span>Mối quan hệ:</span>
                    <select 
                      value={relationshipFilter}
                      onChange={(e) => setRelationshipFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0fa57c]"
                    >
                      <option value="All">Tất cả</option>
                      <option value="Con">Con</option>
                      <option value="Cha/ Mẹ">Cha / Mẹ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>Tính NPT:</span>
                    <select 
                      value={calcFilter}
                      onChange={(e) => setCalcFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0fa57c]"
                    >
                      <option value="All">Tất cả</option>
                      <option value="Yes">Có tính giảm trừ</option>
                      <option value="No">Không tính giảm trừ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dependents list details table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-[#0fa57c]" />
                    DANH SÁCH CHI TIẾT NGƯỜI PHỤ THUỘC CỦA {selectedEmployee.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold italic font-mono">DỮ LIỆU ĐỒNG BỘ IMIS</span>
                </div>

                <div className="overflow-x-auto">
                  {filteredDependentsForSelected.length === 0 ? (
                    <div className="py-16 text-center space-y-4">
                      <AlertCircle className="mx-auto text-slate-300" size={44} />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500">Nhân viên này chưa có hồ sơ người phụ thuộc nào</p>
                        <p className="text-[11px] text-slate-400 font-semibold">Bấm nút "Thêm người phụ thuộc" hoặc "Import" để thiết lập nhanh gia cảnh</p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenAddModal(selectedEmployee)}
                          className="px-4 py-1.5 bg-[#0fa57c] text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#0fa57c]/90 transition-all cursor-pointer"
                        >
                          Thêm mới thủ công
                        </button>
                        <button 
                          onClick={() => {
                            setImportText('');
                            setImportParsedData([]);
                            setImportStatus('idle');
                            setImportFileFeedback('');
                            setIsImportModalOpen(true);
                          }}
                          className="px-4 py-1.5 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Import Excel mẫu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="px-5 py-4 font-bold">Họ tên thành viên phụ thuộc</th>
                          <th className="px-5 py-4 font-bold">Quan hệ</th>
                          <th className="px-5 py-4 font-bold">Ngày tháng năm sinh</th>
                          <th className="px-5 py-4 font-bold">CCCD / Hộ chiếu</th>
                          <th className="px-5 py-4 font-bold">Mã số thuế (MST)</th>
                          <th className="px-5 py-4 text-center font-bold">Tính NPT</th>
                          <th className="px-5 py-4 font-bold">Thời gian áp dụng</th>
                          <th className="px-5 py-4 text-right font-bold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredDependentsForSelected.map((dep) => (
                          <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="px-5 py-4 font-bold text-slate-800">
                              {dep.dependentName}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                dep.relationship === 'Con' ? 'bg-blue-50 text-blue-600 border-blue-100/30' :
                                dep.relationship === 'Cha/ Mẹ' ? 'bg-purple-50 text-purple-600 border-purple-100/30' :
                                'bg-amber-50 text-amber-600 border-amber-100/30'
                              }`}>
                                {dep.relationship}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-600 font-mono">
                              {dep.dob ? new Date(dep.dob).toLocaleDateString('vi-VN') : '—'}
                            </td>
                            <td className="px-5 py-4 font-semibold font-mono text-slate-600">
                              {dep.idCard || 'Chưa cập nhật'}
                            </td>
                            <td className="px-5 py-4 font-mono font-bold text-slate-600">
                              {dep.taxCode || '—'}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${dep.isCalculated ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-300'}`}>
                                <Check size={14} className={dep.isCalculated ? 'opacity-100' : 'opacity-30'} />
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                              <div className="flex flex-col">
                                <span>Từ: <span className="font-bold text-slate-700">{dep.startDate ? new Date(dep.startDate).toLocaleDateString('vi-VN') : '—'}</span></span>
                                {dep.endDate ? (
                                  <span className="text-[10px] text-slate-400 mt-0.5">Đến: {new Date(dep.endDate).toLocaleDateString('vi-VN')}</span>
                                ) : (
                                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded-sm max-w-fit mt-0.5">Vô thời hạn</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleOpenEditModal(dep)}
                                  className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg hover:text-[#0fa57c] transition-colors cursor-pointer"
                                  title="Chỉnh sửa thông tin"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(dep.id)}
                                  className="p-1.5 hover:bg-rose-50 text-slate-500 rounded-lg hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Xóa thông tin"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ==========================================
          MODAL 1: CREATE OR EDIT FORM MODAL
          ========================================== */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsFormModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-100 z-10"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Users size={16} className="text-[#0fa57c]" />
                    {editingDependent ? 'CẬP NHẬT THÔNG TIN NGƯỜI PHỤ THUỘC' : 'THÊM NGƯỜI PHỤ THUỘC MỚI'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Nhập chính xác đầy đủ thông tin để lưu hồ sơ gia cảnh IMIS</p>
                </div>
                <button 
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && (
                  <div className="p-3.5 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Employee/Staff Credentials (REQUIRED) */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Thông tin Nhân sự chủ quản</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Tên nhân sự *</label>
                      <input 
                        type="text"
                        placeholder="VD: Nguyễn Văn An"
                        value={formEmployeeName}
                        onChange={(e) => setFormEmployeeName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Mã nhân viên *</label>
                      <input 
                        type="text"
                        placeholder="VD: NV00123"
                        value={formEmployeeStaffId}
                        onChange={(e) => setFormEmployeeStaffId(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Dependent Info (REQUIRED) */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Thông tin Thành viên phụ thuộc</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Họ tên thành viên *</label>
                      <input 
                        type="text"
                        placeholder="Nhập họ và tên thành viên"
                        value={formDependentName}
                        onChange={(e) => setFormDependentName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Ngày tháng năm sinh</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="date"
                          value={formDob}
                          onChange={(e) => setFormDob(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Mã số thuế (MST)</label>
                      <input 
                        type="text"
                        placeholder="MST cá nhân người phụ thuộc"
                        value={formTaxCode}
                        onChange={(e) => setFormTaxCode(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">CCCD / Hộ chiếu</label>
                      <input 
                        type="text"
                        placeholder="Số CCCD người phụ thuộc"
                        value={formIdCard}
                        onChange={(e) => setFormIdCard(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Mối quan hệ</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Con', 'Cha/ Mẹ', 'Khác'] as const).map((rel) => (
                          <button
                            key={rel}
                            type="button"
                            onClick={() => setFormRelationship(rel)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              formRelationship === rel 
                                ? 'bg-[#0fa57c]/10 border-[#0fa57c] text-[#0fa57c]' 
                                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                            }`}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Tính thuế NPT</label>
                      <label className="flex items-center space-x-3 p-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                        <div className="relative">
                          <input 
                            type="checkbox"
                            checked={formIsCalculated}
                            onChange={(e) => setFormIsCalculated(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full transition-all duration-300 ${formIsCalculated ? 'bg-[#0fa57c]' : 'bg-slate-300'}`} />
                          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${formIsCalculated ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Tick chọn tính giảm trừ (NPT)</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Thời gian bắt đầu</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Thời gian kết thúc</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="date"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0fa57c] focus:ring-2 focus:ring-[#0fa57c]/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#0fa57c] text-white rounded-xl text-xs font-bold hover:bg-[#0fa57c]/90 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    {editingDependent ? 'Lưu cập nhật' : 'Tạo hồ sơ mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL 2: INTERACTIVE EXCEL/CSV IMPORT SYSTEM
          ========================================== */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-100 z-10 animate-fade-in"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Upload size={16} className="text-[#0fa57c]" />
                    IMPORT DANH SÁCH NGƯỜI PHỤ THUỘC (EXCEL/CSV)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {selectedEmployee 
                      ? `Đang thiết lập import danh sách trực tiếp cho nhân viên: ${selectedEmployee.name}`
                      : 'Import danh sách người phụ thuộc toàn cục cho nhiều nhân viên'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {importStatus === 'idle' && (
                  <div className="space-y-4">
                    {/* File Dropzone representation */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#0fa57c] transition-all bg-slate-50/30 group">
                      <div className="mx-auto flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-slate-100 text-slate-500 group-hover:bg-[#0fa57c]/10 group-hover:text-[#0fa57c] rounded-2xl transition-all">
                          <FileText size={28} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">Kéo thả file Excel hoặc .CSV của bạn vào đây</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Hệ thống chấp nhận các cột dữ liệu theo thứ tự chuẩn</p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => handleSimulatedFileUpload(selectedEmployee ? 'dependents_subset_sample.xlsx' : 'all_dependent_records_imis.csv')}
                            className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-[#0fa57c]/10 hover:text-[#0fa57c] text-[10px] font-bold rounded-lg transition-all border border-slate-200/50 cursor-pointer"
                          >
                            📁 Sử dụng File Excel mẫu có sẵn
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Excel Sheet copy pasting workspace */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                        <label className="uppercase text-[10px] text-slate-400 tracking-wider">Hoặc Sao chép & Dán trực tiếp từ hàng Excel tại đây:</label>
                        <span className="text-[10px] text-[#0fa57c] font-bold">Mỗi dòng một người phụ thuộc</span>
                      </div>
                      <textarea
                        rows={6}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder={
                          selectedEmployee
                            ? "Cột định dạng Tab hoặc Comma (CSV):\n[Họ tên]\t[Quan hệ]\t[Ngày sinh]\t[Mã số thuế]\t[CCCD]\t[Tính NPT (true/false)]\t[Ngày BĐ]\t[Ngày KT]\n\nVí dụ:\nHồ Anh Thơ\tCon\t2020-05-12\t8234567812\t037202005511\ttrue\t2020-06-01\t"
                            : "Định dạng cho toàn cục (nhiều nhân viên):\n[Họ tên]\t[Quan hệ]\t[Ngày sinh]\t[MST]\t[CCCD]\t[Tính NPT]\t[Bắt đầu]\t[Kết thúc]\t[Tên nhân viên]\t[Mã NV]\n\nVí dụ:\nNguyễn Bảo Long\tCon\t2019-12-05\t810101010\t037201019999\ttrue\t2020-01-01\t\tNguyễn Văn An\tNV00123"
                        }
                        className="w-full px-3.5 py-3 bg-slate-950 font-mono text-[10px] text-emerald-400 rounded-xl outline-none border border-slate-800 focus:border-[#0fa57c] focus:ring-1 focus:ring-[#0fa57c]/30 leading-relaxed placeholder:text-slate-600"
                      />
                    </div>

                    {importFileFeedback && (
                      <div className="p-3 bg-emerald-50 text-[#0fa57c] text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#0fa57c]" />
                        <span>{importFileFeedback}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                        <Download size={12} />
                        <span>Xem cấu trúc file mẫu: 8 cột (hoặc 10 cột nếu import toàn cục)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setIsImportModalOpen(false)}
                          className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          type="button"
                          onClick={handleParseImport}
                          className="px-5 py-2 bg-[#0fa57c] text-white rounded-xl text-xs font-bold hover:bg-[#0fa57c]/90 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          Phân tích dữ liệu
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {importStatus === 'preview' && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-blue-50 text-blue-700 border border-blue-100/50 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Info size={16} />
                      <span>Đã tìm thấy {importParsedData.length} bản ghi hợp lệ. Vui lòng kiểm tra lại cấu trúc cột bên dưới trước khi lưu:</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-[11px] border-collapse font-medium">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="px-4 py-2">Thành viên phụ thuộc</th>
                            <th className="px-4 py-2">Quan hệ</th>
                            <th className="px-4 py-2">Ngày sinh</th>
                            <th className="px-4 py-2">CCCD</th>
                            <th className="px-4 py-2">MST</th>
                            <th className="px-4 py-2">Tính NPT</th>
                            <th className="px-4 py-2">Thời gian bắt đầu</th>
                            <th className="px-4 py-2">Nhân sự liên kết</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                          {importParsedData.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 font-medium">
                              <td className="px-4 py-2 font-bold text-slate-800">{item.dependentName}</td>
                              <td className="px-4 py-2">
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  {item.relationship}
                                </span>
                              </td>
                              <td className="px-4 py-2 font-mono">{item.dob || '—'}</td>
                              <td className="px-4 py-2 font-mono">{item.idCard || '—'}</td>
                              <td className="px-4 py-2 font-mono">{item.taxCode || '—'}</td>
                              <td className="px-4 py-2 text-center font-bold">
                                {item.isCalculated ? '✓ Có' : '❌ Không'}
                              </td>
                              <td className="px-4 py-2 font-mono">{item.startDate}</td>
                              <td className="px-4 py-2 text-slate-500">
                                <div className="text-[10px]">
                                  <span>{item.employeeName || selectedEmployee?.name}</span>
                                  <span className="block text-[9px] text-slate-400">({item.employeeStaffId || selectedEmployee?.staffId})</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                      <button 
                        type="button"
                        onClick={() => setImportStatus('idle')}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Quay lại sửa
                      </button>
                      <button 
                        type="button"
                        onClick={handleExecuteImport}
                        className="px-5 py-2 bg-[#0fa57c] text-white rounded-xl text-xs font-bold hover:bg-[#0fa57c]/90 transition-all cursor-pointer shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                      >
                        <Check size={14} />
                        Xác nhận Import ({importParsedData.length} dòng)
                      </button>
                    </div>
                  </div>
                )}

                {importStatus === 'success' && (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={36} className="animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Import dữ liệu thành công!</h4>
                      <p className="text-xs text-slate-500 font-semibold">Đã đồng bộ {importParsedData.length} hồ sơ người phụ thuộc mới lên IMIS.</p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
