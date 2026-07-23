/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from './components/Layout';
import { LeavesPage } from './components/LeavesPage';
import { TimesheetPage } from './components/TimesheetPage';
import { LeaveBalancesPage } from './components/LeaveBalancesPage';
import { SystemConfigurationPage } from './components/SystemConfigurationPage';
import { DashboardPage } from './components/DashboardPage';
import { RequestManagementPage } from './components/RequestManagementPage';
import { AttendancePage } from './components/AttendancePage';
import { AttendanceSummaryPage } from './components/AttendanceSummaryPage';
import { DependentPage } from './components/DependentPage';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { OnsiteReportPage } from './components/OnsiteReportPage';

export default function App() {
  const [activeItem, setActiveItem] = useState('Projects');

  const renderContent = () => {
    switch (activeItem) {
      case 'Overview':
        return <DashboardPage onNavigate={setActiveItem} />;
      case 'Projects':
        return <ProjectsPage route="PROJECTS" />;
      case 'Bảng giai đoạn':
        return <ProjectsPage route="KANBAN" />;
      case 'Chi thực tế (Kế toán)':
        return <ProjectsPage route="ACCOUNTING" />;
      case 'Leaves':
        return <LeavesPage />;
      case 'Timesheet':
        return <TimesheetPage />;
      case 'Chấm công':
        return <AttendancePage />;
      case 'Tổng hợp công':
        return <AttendanceSummaryPage />;
      case 'Báo cáo Onsite':
        return <OnsiteReportPage />;
      case 'Phép cá nhân':
        return <LeaveBalancesPage />;
      case 'Request Management':
      case 'Quản lý Đơn từ':
        return <RequestManagementPage />;
      case 'System Configuration':
        return <SystemConfigurationPage />;
      case 'Thông tin người phụ thuộc':
        return <DependentPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <div className="text-4xl font-bold bg-gray-200/50 p-8 rounded-2xl border border-gray-300/50 text-gray-400">
              {activeItem}
            </div>
            <p className="text-lg">This section is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <Layout activeItem={activeItem} onSelect={setActiveItem}>
      {renderContent()}
    </Layout>
  );
}
