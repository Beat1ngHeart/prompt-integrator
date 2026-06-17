import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  onRemove?: () => void;
  className?: string;
}

export function Badge({ children, variant = 'default', onRemove, className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:opacity-70">
          <X size={12} />
        </button>
      )}
    </span>
  );
}
