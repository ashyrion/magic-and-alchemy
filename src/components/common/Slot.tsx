import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface SlotProps {
  children?: ReactNode;
  icon?: string;
  label?: string;
  isEmpty?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Slot = ({
  children,
  icon,
  label,
  isEmpty = false,
  isHighlighted = false,
  onClick,
  className = ''
}: SlotProps) => {
  return (
    <div
      className={`
        relative w-16 h-16 rounded-lg
        ${isEmpty ? 'bg-gray-800' : 'bg-gray-700'}
        ${isHighlighted ? 'ring-2 ring-blue-500' : ''}
        ${onClick ? 'cursor-pointer hover:bg-gray-600' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {icon && (
        <div className="absolute top-1 left-1">
          <Icon name={icon} size="sm" className="text-gray-400" />
        </div>
      )}
      
      {label && (
        <div className="absolute bottom-1 right-1 text-xs text-gray-400">
          {label}
        </div>
      )}
      
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};