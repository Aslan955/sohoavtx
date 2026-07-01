import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { NAVIGATION, NavItem } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onSelect?: (item: string) => void;
  activeItem?: string;
}

// Fixed 'M' Theme Configuration (Fwork & IMIS Theme Style)
const THEME = {
  sidebarBg: 'bg-[#0f172a] text-slate-300 border-r border-[#1e293b]',
  headerBorder: 'border-b border-slate-800/60',
  footerBg: 'bg-[#0b0f19] border-t border-slate-800/60',
  brandText: 'text-white',
  brandBadge: 'bg-[#0fa57c]/20 text-[#0fa57c] border-[#0fa57c]/30',
  activeItem: 'bg-[#0fa57c] text-white font-extrabold shadow-md shadow-emerald-950/20 rounded-xl',
  activeGroup: 'bg-slate-800/40 text-[#0fa57c] border-l-2 border-[#0fa57c]',
  inactiveItem: 'text-slate-400 hover:text-white hover:bg-slate-800/40',
  itemTextMuted: 'text-slate-500',
  indentBorder: 'border-l border-slate-800 ml-6 pl-1.5 mr-2 mb-1.5 mt-0.5 bg-slate-900/10 rounded-r-lg',
  itemIcon: 'text-slate-400',
  itemIconActive: 'text-white',
  isDark: true,
};

const SidebarItem: React.FC<{
  item: NavItem;
  level: number;
  activeItem?: string;
  onSelect?: (item: string) => void;
}> = ({ item, level, activeItem, onSelect }) => {
  const hasChildren = item.children && item.children.length > 0;
  
  // Recursively check if this menu has any child that is active
  const hasActiveChild = (node: NavItem): boolean => {
    if (node.title === activeItem) return true;
    if (node.children) {
      return node.children.some(c => hasActiveChild(c));
    }
    return false;
  };

  const containsActive = hasChildren ? item.children?.some(c => hasActiveChild(c)) : false;
  
  // Keep parent items open by default if they are active, or if they are HR/Timekeeping (to match mock expectations)
  const [isOpen, setIsOpen] = useState(
    containsActive || 
    item.title === 'Human Resources' || 
    item.title === 'Timekeeping' ||
    item.title === 'Utilities'
  );

  const isActive = activeItem === item.title;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (onSelect) {
      onSelect(item.title);
    }
  };

  const isLevel0 = level === 0;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        className={`
          flex items-center w-full transition-all duration-200 cursor-pointer text-left
          ${isLevel0 
            ? 'px-3.5 py-2.5 text-xs font-black uppercase tracking-wider mx-2 my-0.5 rounded-xl w-[calc(100%-16px)]' 
            : 'px-3.5 py-2 text-xs font-semibold my-0.5 rounded-lg w-[calc(100%-8px)] mx-1'
          }
          ${isActive 
            ? THEME.activeItem 
            : containsActive && isLevel0
              ? THEME.activeGroup
              : THEME.inactiveItem
          }
        `}
        style={{ 
          paddingLeft: isLevel0 ? '14px' : `${(level * 14) + 12}px` 
        }}
      >
        <item.icon 
          size={isLevel0 ? 15 : 13} 
          className={`mr-2.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
            isActive ? THEME.itemIconActive : containsActive ? THEME.itemIconActive : THEME.itemIcon
          }`} 
        />
        <span className="flex-1 truncate">{item.title}</span>
        {hasChildren && (
          <span className={`${THEME.itemTextMuted} ml-1.5 shrink-0`}>
            <ChevronDown 
              size={12} 
              className={`transform transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} 
            />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`overflow-hidden ${THEME.indentBorder}`}
          >
            {item.children?.map((child, idx) => (
              <SidebarItem
                key={`${child.title}-${idx}`}
                item={child}
                level={level + 1}
                activeItem={activeItem}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onSelect }) => {
  return (
    <div className={`w-64 h-full flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar-x select-none transition-all duration-300 ${THEME.sidebarBg}`}>
      {/* Brand Header */}
      <div className={`p-4 flex items-center space-x-3 transition-colors ${THEME.headerBorder}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0fa57c] to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/15 shrink-0">
          <span className="text-white font-black text-lg tracking-tighter">IM</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-base tracking-wide flex items-center gap-1.5 font-black ${THEME.brandText}`}>
            IMIS
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Management System</span>
        </div>
      </div>

      {/* Menu Navigation Area - scrollable list */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar-x">
        <div className="px-5 mb-2 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]/80">Navigation Center</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        
        {NAVIGATION.map((item, idx) => (
          <SidebarItem
            key={`${item.title}-${idx}`}
            item={item}
            level={0}
            activeItem={activeItem}
            onSelect={onSelect}
          />
        ))}
      </nav>

      {/* Bottom Profile Area */}
      <div className={`p-4 transition-colors flex items-center justify-between gap-3 ${THEME.footerBg}`}>
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="relative">
            <img 
              src="https://ui-avatars.com/api/?name=Nguyen+Van+An&background=0fa57c&color=fff&bold=true" 
              className="w-8 h-8 rounded-lg object-cover border border-slate-700" 
              alt="Avatar"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#0b0f19] animate-pulse"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-black truncate text-slate-100`}>Nguyễn Văn An</span>
            <span className="text-[9px] text-slate-400 truncate font-semibold">an.nv@fwork.vn</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <div className="px-1.5 py-0.5 rounded text-[8px] font-black text-[#0fa57c] bg-[#0fa57c]/10 border border-[#0fa57c]/20 uppercase tracking-wider">
            Nhân sự
          </div>
        </div>
      </div>
    </div>
  );
};
