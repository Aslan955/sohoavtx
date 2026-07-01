import React from 'react';
import { 
  Settings, 
  Activity, 
  Lock, 
  Layers, 
  Workflow, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Shield 
} from 'lucide-react';
import { 
  MOCK_LEAVE_TYPES 
} from '../constants';

export const SystemConfigurationPage: React.FC = () => {
  return (
    <div className="bg-transparent min-h-full p-6">
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
              <Settings size={24} className="mr-3 text-blue-600" />
              BỘ NÃO HỆ THỐNG IMISS (Configuration)
            </h2>
            <p className="text-gray-500 text-sm mt-1">Thiết lập luật chơi và tự động hóa quy trình quản lý phép.</p>
          </div>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center">
             Lưu tất cả thay đổi
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Auto-Accrual Rules */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-50">
               <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Activity size={18} className="mr-3 text-blue-600" />
                  1. Cấu hình Quy tắc cộng phép định kỳ
               </h3>
               <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">Tự động hóa</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Chu kỳ cộng (Ngày trong tháng)</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500">
                     <option>Ngày 01 hàng tháng</option>
                     <option>Ngày 15 hàng tháng</option>
                     <option>Ngày cuối cùng của tháng</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Giá trị cộng / Tháng</label>
                  <div className="relative">
                    <input type="number" step="0.5" defaultValue="1.0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500" />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">Ngày</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Điều kiện cộng</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-900">Cộng cho tất cả NV chính thức</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-900">Nhân viên thử việc có được cộng?</span>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative p-1 cursor-pointer">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bucket Policy */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-50">
               <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Lock size={18} className="mr-3 text-orange-600" />
                  3. Cấu hình Quản lý "Phép cá nhân" (Bucket Policy)
               </h3>
               <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">Chính sách</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Giới hạn âm tối đa</label>
                  <div className="relative">
                    <input type="number" defaultValue="2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500" />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">Ngày</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Đơn vị nghỉ tối thiểu</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500">
                     <option>1.0 ngày</option>
                     <option selected>0.5 ngày</option>
                     <option>1 giờ (OT quy đổi)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-3">
                <p className="text-[10px] font-bold text-orange-600 uppercase italic">Chính sách bảo lưu (Year-end Carryover)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-orange-400 uppercase block mb-1">Thời hạn hết hạn phép cũ</label>
                    <select className="w-full bg-white border border-orange-100 px-3 py-2 rounded-lg text-[10px] font-bold outline-none">
                       <option>Hết hạn vào 31/12</option>
                       <option selected>Gia hạn đến 31/03 năm sau</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-orange-400 uppercase block mb-1">Số ngày tối đa bảo lưu</label>
                    <input type="number" defaultValue="5" className="w-full bg-white border border-orange-100 px-3 py-2 rounded-lg text-[10px] font-bold outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Conditional Leave Catalog */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                <Layers size={18} className="mr-3 text-purple-600" />
                2. Danh mục Loại phép điều kiện (Conditional Leave Catalog)
              </h3>
              <button className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-lg hover:bg-purple-100 transition-colors flex items-center">
                 <Plus size={14} className="mr-1" /> Thêm loại phép
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50/50 text-gray-400 uppercase font-black tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Loại phép</th>
                    <th className="px-6 py-4 text-center">Số ngày quy định</th>
                    <th className="px-6 py-4 text-center">Yêu cầu minh chứng</th>
                    <th className="px-6 py-4 text-center">Hạn sử dụng</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_LEAVE_TYPES.map(type => (
                    <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{type.name}</td>
                      <td className="px-6 py-4 text-center">
                         <span className="px-3 py-1 bg-gray-100 rounded-lg font-black text-gray-700">{type.standardDays} ngày</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex justify-center">
                           <div className={`w-8 h-4 rounded-full relative p-1 ${type.evidenceRequired ? 'bg-blue-600' : 'bg-gray-200'}`}>
                             <div className={`w-2 h-2 bg-white rounded-full ${type.evidenceRequired ? 'ml-auto' : ''}`} />
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 font-medium">
                         Trong vòng {type.validityDays} ngày
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-blue-600 font-bold hover:underline">Chỉnh sửa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Workflow & 5. Permissions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center pb-4 border-b border-gray-50">
              <Workflow size={18} className="mr-3 text-indigo-600" />
              4. Cấu hình Quy trình phê duyệt (Workflow)
            </h3>
            <div className="space-y-4">
               <div className="p-4 border border-indigo-50 bg-indigo-50/30 rounded-2xl">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-3">Quy trình đơn nghỉ phép</p>
                  <div className="flex items-center space-x-3">
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-bold">1</div>
                        <span className="text-[9px] mt-1 text-gray-400">Employee</span>
                     </div>
                     <ChevronRight size={14} className="text-gray-300" />
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-orange-100">M</div>
                        <span className="text-[9px] mt-1 text-orange-600 font-bold">Manager</span>
                     </div>
                     <ChevronRight size={14} className="text-gray-300" />
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-100">H</div>
                        <span className="text-[9px] mt-1 text-blue-600 font-bold">Head of Dept</span>
                     </div>
                  </div>
                  <button className="mt-4 text-[10px] text-indigo-600 font-bold flex items-center hover:underline">
                    <Plus size={12} className="mr-1" /> Thêm cấp duyệt
                  </button>
               </div>
               
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                     <p className="text-xs font-bold text-gray-700">Thông báo Email</p>
                     <p className="text-[10px] text-gray-400">Gửi mail khi đơn được duyệt/từ chối</p>
                  </div>
                  <div className="w-10 h-5 bg-green-500 rounded-full relative p-1 cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center pb-4 border-b border-gray-50">
              <Shield size={18} className="mr-3 text-red-600" />
              5. Phân quyền (Permission Settings)
            </h3>
            <div className="space-y-3">
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Lock size={14} /></div>
                     <div>
                        <p className="text-xs font-bold text-gray-700">Truy cập Config</p>
                        <p className="text-[10px] text-gray-400">HR Manager, IT Admin</p>
                     </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-300" />
               </div>
               <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Lock size={14} /></div>
                     <div>
                        <p className="text-xs font-bold text-gray-700">Điều chỉnh thủ công (Manual)</p>
                        <p className="text-[10px] text-gray-400">HR Admin Team only</p>
                     </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-300" />
               </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Bảng Master Data</h4>
               <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium rounded-lg hover:border-blue-300">Holiday_Calendar</button>
                  <button className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium rounded-lg hover:border-blue-300">User_Leave_Settings</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
