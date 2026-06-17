import { NavLink } from 'react-router-dom';
import { Sparkles, Library, Settings, ChevronLeft, ChevronRight, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store';

const navItems = [
  { to: '/', icon: Sparkles, label: '生成提示词' },
  { to: '/library', icon: Library, label: '提示词库' },
  { to: '/settings', icon: Settings, label: '设置' },
];

const themeIcons = { light: Sun, dark: Moon, system: Monitor };
const themeLabels = { light: '浅色', dark: '深色', system: '跟随系统' };

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, theme, cycleTheme } = useUIStore();
  const ThemeIcon = themeIcons[theme];

  return (
    <aside
      className={cn(
        'h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 border-b border-gray-200 dark:border-gray-800', sidebarOpen ? 'px-4' : 'px-3 justify-center')}>
        {sidebarOpen ? (
          <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
            <span className="text-blue-600">Prompt</span> 整合器
          </h1>
        ) : (
          <span className="text-blue-600 text-xl font-bold">P</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                !sidebarOpen && 'justify-center px-0'
              )
            }
            end={to === '/'}
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
            {/* Tooltip for collapsed mode */}
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className={cn(
            'flex items-center w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group',
            sidebarOpen ? 'px-4 py-2.5 gap-3' : 'justify-center py-2.5'
          )}
          title={themeLabels[theme]}
        >
          <ThemeIcon size={18} />
          {sidebarOpen && (
            <span className="text-xs">{themeLabels[theme]}</span>
          )}
          {!sidebarOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              {themeLabels[theme]}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full h-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  );
}
