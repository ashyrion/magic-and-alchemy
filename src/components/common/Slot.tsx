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
  size?: 'sm' | 'md' | 'lg'; // 크기 옵션 추가
}

export const Slot = ({
  children,
  icon,
  label,
  isEmpty = false,
  isHighlighted = false,
  onClick,
  className = '',
  size = 'md'
}: SlotProps) => {
  // 크기별 클래스 매핑
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  return (
    <div
      className={`
        relative ${sizeClasses[size]} rounded-lg
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