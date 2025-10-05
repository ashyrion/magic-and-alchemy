import type { Stats } from '../../types/gameTypes';

interface BattleCharacterProps {
  name: string;
  stats: Stats;
  isPlayer: boolean;
}

export const BattleCharacter = ({ name, stats, isPlayer }: BattleCharacterProps) => {
  return (
    <div className={`p-4 rounded-lg ${isPlayer ? 'bg-blue-900' : 'bg-red-900'}`}>
      <div className="text-xl font-bold mb-4">{name}</div>
      
      {/* HP/MP 바 */}
      <div className="space-y-2 mb-4">
        <StatusBar 
          current={stats.hp} 
          max={100} 
          label="HP" 
          color={isPlayer ? 'bg-blue-600' : 'bg-red-600'}
        />
        <StatusBar 
          current={stats.mp} 
          max={100} 
          label="MP" 
          color={isPlayer ? 'bg-blue-400' : 'bg-red-400'}
        />
      </div>

      {/* 스탯 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>공격력: {stats.strength}</div>
        <div>방어력: {stats.defense}</div>
      </div>
    </div>
  );
};

interface StatusBarProps {
  current: number;
  max: number;
  label: string;
  color: string;
}

const StatusBar = ({ current, max, label, color }: StatusBarProps) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{current}/{max}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded overflow-hidden">
        <div 
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};