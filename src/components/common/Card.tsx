import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
}

export const Card = ({
  children,
  title,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  onClick
}: CardProps) => {
  return (
    <div
      className={`
        bg-gray-800 rounded-lg overflow-hidden
        ${onClick ? 'cursor-pointer hover:bg-gray-700' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {title && (
        <div className={`p-4 border-b border-gray-700 ${headerClassName}`}>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};