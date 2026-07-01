import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  X,
  Calendar,
  Grid
} from 'lucide-react';
import { MOCK_TIMESHEETS, TimesheetEntry } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Approved': 'bg-green-500',
    'Requested': 'bg-orange-400',
    'Draft': 'bg-gray-400',
    'Rejected': 'bg-red-500'
  };
  return (
    <div className="flex items-center space-x-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`}></span>
      <span className="text-[11px] font-medium text-gray-700">{status}</span>
    </div>
  );
};

export const TimesheetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Software Service');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 bg-transparent min-h-full">
      {/* 1. Header Area */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Grid size={14} className="mr-2" />
          <span>Home</span>
          <ChevronRight size={14} className="mx-2" />
          <span>Timekeeping</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-900 font-semibold">Timesheet</span>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-md border border-gray-200 w-fit">
          <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">Today</button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft size={16} /></button>
          <span className="text-xs font-semibold px-2 text-gray-700">5/4/2026 - 5/10/2026</span>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {['Software Service', 'Staffing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
              />
            )}
          </button>
        ))}
      </div>

      {/* 3. Tab Content (Software Service) */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 min-w-[900px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-[13px] text-green-600 font-medium hover:bg-green-50 px-2 py-1 rounded transition-colors">
              <CheckCircle size={16} className="mr-1.5" />
              Approve Selection
            </button>
            <button className="flex items-center text-[13px] text-red-600 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors">
              <XCircle size={16} className="mr-1.5" />
              Reject Selection
            </button>
          </div>
          <div className="flex items-center space-x-2">
             {activeTab === 'Staffing' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center px-4 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded shadow-sm hover:bg-blue-600 transition-all active:scale-95 mr-2"
                >
                  <Plus size={14} className="mr-1" />
                  Add New
                </button>
             )}
            <button className="flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
              Export
              <ChevronRight size={14} className="ml-1 rotate-90" />
            </button>
          </div>
        </div>

        {/* Grouping Area */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-t-md mb-0.5">
          <span className="text-[11px] text-gray-400 italic">Drag a column header here to group by that column</span>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Enter text to search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-400 outline-none bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="border border-gray-200 rounded-b-md overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-2 py-2 w-10 text-center border-r border-gray-200">
                  <input type="checkbox" className="rounded-sm" />
                </th>
                <th className="px-2 py-2 w-10 text-center border-r border-gray-200 font-semibold text-gray-600">#</th>
                {[
                  { name: 'ProjectName', filter: true },
                  { name: 'AuthorName', filter: true },
                  { name: 'Status', filter: true },
                  { name: 'Actions', filter: false }
                ].map((col) => (
                  <th key={col.name} className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200">
                    <div className="flex items-center justify-between">
                      <span>{col.name}</span>
                      {col.filter && <Filter size={10} className="text-gray-400" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TIMESHEETS.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                  <td className="px-2 py-2 text-center border-r border-gray-200">
                    <input type="checkbox" className="rounded-sm" />
                  </td>
                  <td className="px-2 py-2 text-center border-r border-gray-200 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-blue-600 font-medium">{item.projectName}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-gray-700 capitalize">{item.authorName}</td>
                  <td className="px-3 py-2 border-r border-gray-200">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-all"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex border border-gray-200 rounded divide-x divide-gray-200">
            <button className="p-1.5 text-gray-400 hover:bg-gray-50"><ChevronsLeft size={14} /></button>
            <button className="p-1.5 text-gray-400 hover:bg-gray-50"><ChevronLeft size={14} /></button>
            <button className="px-3 py-1.5 text-xs font-bold bg-[#007bff] text-white">1</button>
            <button className="p-1.5 text-gray-400 hover:bg-gray-50"><ChevronRight size={14} /></button>
            <button className="p-1.5 text-gray-400 hover:bg-gray-50"><ChevronsRight size={14} /></button>
          </div>
          
          <div className="flex items-center space-x-2 text-[11px] text-gray-600">
            <span>Page Size:</span>
            <select className="border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-blue-400 font-semibold bg-white">
              <option>30</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Create New Task Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Create New Task Form</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  {/* Row 1 */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Project <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none bg-white appearance-none pr-8">
                        <option value="">Choose project</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-3 top-3 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Staffing User <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none bg-white appearance-none pr-8">
                        <option value="">Choose staffing user</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-3 top-3 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Issue Type</label>
                    <div className="relative">
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none bg-white appearance-none pr-8">
                        <option value="Task">Task</option>
                        <option value="Bug">Bug</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-3 top-3 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Innovation code</label>
                    <input 
                      type="text" 
                      placeholder="Enter innovation code..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Row 3 (Full) */}
                  <div className="col-span-2 flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Description</label>
                    <textarea 
                      placeholder="Detailed job description..."
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none resize-none"
                    />
                  </div>

                  {/* Row 4 */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Start Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="12/05/2026 08:00"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none pl-10"
                      />
                      <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">End Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="12/05/2026 17:30"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none pl-10"
                      />
                      <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>

                  {/* Row 5 (Full) */}
                  <div className="col-span-2 flex flex-col space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Estimate <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      defaultValue={8}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-gray-400 italic">Total actual working hours.</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#002c59] hover:bg-[#001f3f] rounded shadow-md transition-all active:scale-95"
                >
                  Create & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
