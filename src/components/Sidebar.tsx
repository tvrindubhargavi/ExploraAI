import { motion } from 'motion/react';
import { 
    LayoutDashboard, 
    CalendarClock, 
    Bot, 
    Languages, 
    Image as ImageIcon, 
    UserPlus, 
    UserCircle,
    Navigation2,
    Globe,
    Map,
    TicketPercent
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';

export type NavTab = 
    | 'dashboard' 
    | 'explore' 
    | 'planner' 
    | 'assistant' 
    | 'translate' 
    | 'experiences' 
    | 'friends' 
    | 'profile'
    | 'vouchers'
    | 'tracker';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile } = useAuth();
  
  const navItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'explore' as const, icon: Map, label: 'Explore Map' },
    { id: 'tracker' as const, icon: Navigation2, label: 'Live Tracking' },
    { id: 'planner' as const, icon: CalendarClock, label: 'Trip Planner' },
    { id: 'assistant' as const, icon: Bot, label: 'Travel Assistant' },
    { id: 'translate' as const, icon: Languages, label: 'Translate' },
    { id: 'experiences' as const, icon: ImageIcon, label: 'Travel Experiences' },
    { id: 'friends' as const, icon: UserPlus, label: 'Make a Friend' },
    { id: 'vouchers' as const, icon: TicketPercent, label: 'Vouchers' },
  ] as const;

  return (
    <div className="fixed top-0 left-0 h-full w-[100px] lg:w-36 z-50 bg-white/40 backdrop-blur-3xl border-r border-white/50 flex flex-col items-center py-6 gap-6 shadow-2xl">
      <div 
        onClick={() => onTabChange('dashboard')}
        className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
      >
        <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-purple-200 flex items-center justify-center">
            <Globe size={28} />
        </div>
        <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-600 to-indigo-700 uppercase tracking-tighter">ExploraAI</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 items-center overflow-y-auto px-2 custom-scrollbar w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 w-full transition-all duration-300 group relative py-3 rounded-2xl",
              activeTab === item.id 
                ? "bg-white shadow-xl ring-1 ring-purple-100 text-purple-600" 
                : "text-gray-400 hover:text-purple-400 hover:bg-white/40"
            )}
          >
            <item.icon size={24} className={cn(activeTab === item.id ? "scale-110" : "opacity-80 transition-opacity")} />
            
            <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter leading-none text-center px-1",
                activeTab === item.id 
                    ? "opacity-100" 
                    : "opacity-60"
            )}>
                {item.label}
            </span>
            
            {activeTab === item.id && (
              <motion.div 
                layoutId="sidebarActive"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-l-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto group w-full px-2 pt-4 border-t border-white/40">
        <button
          onClick={() => onTabChange('profile')}
          className={cn(
            "flex flex-col items-center gap-2 transition-all p-3 rounded-[2rem] w-full",
            activeTab === 'profile' ? "bg-white shadow-2xl ring-2 ring-purple-50" : "hover:bg-white/40"
          )}
        >
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-600 overflow-hidden shadow-lg flex items-center justify-center text-white shrink-0 relative border-4 border-white transform transition-transform group-hover:scale-105">
                {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                    <UserCircle size={32} />
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter truncate w-full text-center">
                {profile?.displayName?.split(' ')[0] || 'Me'}
            </span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Profile</span>
          </div>
        </button>
      </div>
    </div>
  );
}
