import { Activity, Upload, FileText, History, Settings, Moon, Sun, User } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface NavigationProps {
  currentPage: 'dashboard' | 'report' | 'history' | 'settings';
  onNavigate: (page: 'dashboard' | 'report' | 'history' | 'settings') => void;
  userType: 'doctor' | 'guest';
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navigation({ currentPage, onNavigate, userType, isDarkMode, onToggleDarkMode }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Upload Data', icon: Upload },
    { id: 'report' as const, label: 'AI Reports', icon: FileText },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className="w-64 min-h-screen p-6 border-r flex flex-col"
      style={{ 
        backgroundColor: isDarkMode ? '#1E2A35' : '#FFFFFF',
        borderColor: '#E2E8F0'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#0E6BA8' }}
        >
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 style={{ color: isDarkMode ? '#FFFFFF' : '#1E2A35' }}>
            AI EHR
          </h3>
          <p className="text-[0.75rem]" style={{ color: '#64748B' }}>
            MRI Assistant
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Navigation Items */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id)}
              className={`w-full justify-start h-11 ${isActive ? 'shadow-sm' : ''}`}
              style={{
                backgroundColor: isActive ? '#E0F2FE' : 'transparent',
                color: isActive ? '#0E6BA8' : (isDarkMode ? '#94A3B8' : '#64748B')
              }}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator className="my-6" />

      {/* User Info & Theme Toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFB' }}>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#0E6BA8' }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[0.875rem]" style={{ color: '#1E2A35' }}>
              {userType === 'doctor' ? 'Dr. Smith' : 'Guest User'}
            </p>
            <p className="text-[0.75rem]" style={{ color: '#64748B' }}>
              {userType === 'doctor' ? 'City Hospital' : 'Demo Mode'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onToggleDarkMode}
          className="w-full justify-start h-10"
          style={{ borderColor: '#CBD5E1' }}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 mr-3" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-3" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
