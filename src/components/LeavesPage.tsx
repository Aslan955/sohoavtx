import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  Eye,
  Check,
  Ban,
  Calendar,
  Pencil,
  Trash2,
  Lock,
  Target
} from 'lucide-react';
import { MOCK_LEAVES, LeaveRequest } from '../constants';

const Tabs = () => (
  <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
    <button className="px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600 whitespace-nowrap">All (4)</button>
    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">Requested (3)</button>
    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">Approved (1)</button>
    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">Rejected (0)</button>
  </div>
);

const ActionButtons = () => (
  <div className="flex items-center space-x-2 mb-4 flex-wrap gap-y-2">
    <button className="flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors">
      <Upload size={14} className="mr-1.5" />
      Import
    </button>
    <button className="flex items-center px-3 py-1.5 bg-[#007bff] text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors">
      <Download size={14} className="mr-1.5" />
      Download Template
    </button>
    <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors">
      <FileSpreadsheet size={14} className="mr-1.5" />
      Export to XLSX
    </button>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = status === 'Approved' ? 'bg-green-500' : 'bg-orange-400';
  return (
    <div className="flex items-center space-x-1.5">
      <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
      <span className="text-[11px] font-medium text-gray-700">{status}</span>
    </div>
  );
};

export const LeavesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 bg-white m-4 rounded-sm shadow-sm min-w-[1000px]">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-sm">
          <Target size={16} className="text-gray-400 mr-2" />
          <span className="text-gray-500 font-medium">Home</span>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-gray-500 font-medium">Timekeeping</span>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">Leaves</span>
        </div>
        <button className="flex items-center px-4 py-1.5 bg-[#007bff] text-white text-sm font-semibold rounded shadow-sm hover:bg-blue-600 transition-all active:scale-95">
          <Plus size={16} className="mr-1" />
          Create
        </button>
      </div>

      <Tabs />
      <ActionButtons />

      {/* Grid Controls */}
      <div className="bg-gray-50 border border-gray-200 p-2 text-xs text-gray-600 mb-2 rounded-t-sm">
        Drag a column header here to group by that column
      </div>
      
      <div className="relative mb-2 flex justify-end">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Enter text to search..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-400 outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 w-10">#</th>
              {[
                { name: 'Employee Id', width: '90px' },
                { name: 'Full name', width: '150px' },
                { name: 'Project', width: '150px' },
                { name: 'CreateAt', width: '100px' },
                { name: 'LastModificationTime', width: '130px' },
                { name: 'Leave Type', width: '120px' },
                { name: 'Start Date', width: '130px' },
                { name: 'End Date', width: '130px' },
                { name: 'Total Hours', width: '80px' },
                { name: 'Status', width: '100px' },
                { name: 'Approved/Rejected By', width: '130px' },
                { name: 'Actions', width: '140px' }
              ].map((col) => (
                <th key={col.name} className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200" style={{ minWidth: col.width }}>
                  <div className="flex items-center justify-between">
                    <span>{col.name}</span>
                    <Filter size={10} className="text-gray-400 ml-1 cursor-pointer hover:text-gray-600" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_LEAVES.map((leaf, index) => (
              <tr key={leaf.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors group">
                <td className="px-2 py-2 border-r border-gray-200 text-center text-gray-500">{index + 1}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-blue-600 font-medium">{leaf.employeeId}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-700 capitalize">{leaf.fullName}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-600 text-[10px]">{leaf.project}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-600">{leaf.createdAt}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-600">{leaf.lastModificationTime}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-700">{leaf.leaveType}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-600">{leaf.startDate}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-600">{leaf.endDate}</td>
                <td className="px-3 py-2 border-r border-gray-200 text-right text-gray-700 font-medium pr-10">{leaf.totalHours}</td>
                <td className="px-3 py-2 border-r border-gray-200">
                  <StatusBadge status={leaf.status} />
                </td>
                <td className="px-3 py-2 border-r border-gray-200 text-gray-600 italic">
                  {leaf.approvedBy || ''}
                </td>
                <td className="px-3 py-2 flex items-center space-x-2">
                  {leaf.status === 'Requested' ? (
                    <>
                      <button title="View" className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Eye size={12} /></button>
                      <button title="Approve" className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"><Check size={12} /></button>
                      <button title="Reject" className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"><Ban size={12} /></button>
                      <button title="Calendar" className="p-1 text-orange-500 hover:bg-orange-100 rounded transition-colors"><Calendar size={12} /></button>
                      {index === 2 && ( // Example with more buttons like in row 3
                        <>
                          <button title="Edit" className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Pencil size={12} /></button>
                          <button title="Delete" className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 size={12} /></button>
                          <button title="Lock" className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"><Lock size={12} /></button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button title="View" className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Eye size={12} /></button>
                      <button title="Reject" className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"><Ban size={12} /></button>
                      <button title="Calendar" className="p-1 text-orange-500 hover:bg-orange-100 rounded transition-colors"><Calendar size={12} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex border border-gray-200 rounded divide-x divide-gray-200">
          <button className="p-1 text-gray-400 hover:bg-gray-50"><ChevronsLeft size={14} /></button>
          <button className="p-1 text-gray-400 hover:bg-gray-50"><ChevronLeft size={14} /></button>
          <button className="px-3 py-1 text-xs font-bold bg-[#007bff] text-white">1</button>
          <button className="p-1 text-gray-400 hover:bg-gray-50"><ChevronRight size={14} /></button>
          <button className="p-1 text-gray-400 hover:bg-gray-50"><ChevronsRight size={14} /></button>
        </div>
        
        <div className="flex items-center space-x-2 text-[11px] text-gray-600">
          <span>Page Size:</span>
          <select className="border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-blue-400 font-semibold">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};
