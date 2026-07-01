import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  onSelect?: (item: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeItem, onSelect }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#f4f7f9] overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden no-scrollbar-x shrink-0`}>
        <Sidebar activeItem={activeItem} onSelect={onSelect} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar-x bg-[#f4f6f8] relative">
          {/* Decorative ambient glowing blobs to enhance backdrop-blur glassmorphism */}
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#3197E5]/10 blur-[100px] pointer-events-none" />
          <div className="absolute top-[30%] right-20 w-[450px] h-[450px] rounded-full bg-[#f59e0b]/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-[20%] w-[500px] h-[500px] rounded-full bg-[#9b51e0]/10 blur-[130px] pointer-events-none" />
          <div className="absolute top-[65%] right-10 w-[350px] h-[350px] rounded-full bg-[#27ae60]/10 blur-[90px] pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
