interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconPaths: Record<string, string> = {
  // 무기
  weapon: 'M6.92 5.51L3.71 2.29c-.39-.39-1.02-.39-1.41 0l-1 1c-.39.39-.39 1.02 0 1.41l3.21 3.22c.39.39 1.02.39 1.41 0l1-1c.39-.39.39-1.02 0-1.41z',
  // 방어구
  armor: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
  // 장신구
  accessory: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  // HP
  health: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  // MP
  mana: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  // 골드
  gold: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  // 스킬
  skill: 'M12 2L2 7l3.5 1.75L7 17l4.5 3 4.5-3 1.5-8.25L21 7l-9-5z'
};

const getSizeClass = (size: IconProps['size']): string => {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'lg':
      return 'w-8 h-8';
    default:
      return 'w-6 h-6';
  }
};

export const Icon = ({ name, size = 'md', className = '' }: IconProps) => {
  const path = iconPaths[name] || '';

  return (
    <svg
      className={`${getSizeClass(size)} ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} />
    </svg>
  );
};