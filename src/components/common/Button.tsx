import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const getVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'secondary':
      return 'bg-gray-600 hover:bg-gray-700 text-white';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'ghost':
      return 'bg-transparent hover:bg-gray-700 text-gray-300';
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white';
  }
};

const getSizeClasses = (size: ButtonSize): string => {
  switch (size) {
    case 'sm':
      return 'px-2 py-1 text-sm';
    case 'md':
      return 'px-4 py-2';
    case 'lg':
      return 'px-6 py-3 text-lg';
    default:
      return 'px-4 py-2';
  }
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        ${getVariantClasses(variant)}
        ${getSizeClasses(size)}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          로딩중...
        </div>
      ) : (
        children
      )}
    </button>
  );
};