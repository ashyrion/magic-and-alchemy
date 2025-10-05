import { Card, Icon } from '../common';
import type { Character, Stats } from '../../types/gameTypes';

interface StatusBarProps {
  current: number;
  max: number;
  label: string;
  icon: string;
  color: string;
}

const StatusBar = ({ current, max, label, icon, color }: StatusBarProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-1">
        <Icon name={icon} size="sm" className={color} />
        <span>{label}</span>
      </div>
      <span>{current}/{max}</span>
    </div>
    <div className="h-2 bg-gray-700 rounded overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  </div>
);

interface StatDisplayProps {
  label: string;
  value: number;
  bonusValue?: number;
  icon: string;
}

const StatDisplay = ({ label, value, bonusValue = 0, icon }: StatDisplayProps) => (
  <div className="flex items-center space-x-2">
    <Icon name={icon} size="sm" className="text-gray-400" />
    <div className="flex items-center">
      <span className="text-gray-400">{label}:</span>
      <span className="ml-1">{value}</span>
      {bonusValue > 0 && (
        <span className="text-green-500 text-sm ml-1">
          (+{bonusValue})
        </span>
      )}
    </div>
  </div>
);

interface StatusDisplayProps {
  character: Character;
  className?: string;
}

export const StatusDisplay = ({ character, className = '' }: StatusDisplayProps) => {
  if (!character) {
    return (
      <Card className={`${className} text-center text-gray-500`}>
        캐릭터 정보 없음
      </Card>
    );
  }

  // 임시로 기본 스탯과 실제 스탯의 차이를 보너스로 표시
  const calculateBonus = (stat: keyof Stats) => {
    const baseValue = character.stats[stat] || 0;
    const currentValue = character.stats[stat] || 0; // 실제로는 장비와 버프가 적용된 값을 사용해야 함
    return Math.max(0, currentValue - baseValue);
  };

  return (
    <Card title={character.name} className={className}>
      <div className="space-y-4">
        {/* 레벨 정보 */}
        <div className="text-sm text-gray-400">
          Level {character.level}
        </div>

        {/* HP/MP 바 */}
        <div className="space-y-2">
          <StatusBar
            current={character.stats.hp}
            max={character.stats.maxHp || character.stats.hp}
            label="HP"
            icon="health"
            color="text-red-500"
          />
          <StatusBar
            current={character.stats.mp}
            max={character.stats.maxMp || character.stats.mp}
            label="MP"
            icon="mana"
            color="text-blue-500"
          />
        </div>

        {/* 기본 스탯 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <StatDisplay
            label="공격력"
            value={character.stats.strength}
            bonusValue={calculateBonus('strength')}
            icon="weapon"
          />
          <StatDisplay
            label="방어력"
            value={character.stats.defense}
            bonusValue={calculateBonus('defense')}
            icon="armor"
          />
        </div>

        {/* 상태 효과 */}
        {character.statusEffects.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-400">상태 효과</div>
            <div className="flex flex-wrap gap-1">
              {character.statusEffects.map((effect) => (
                <span
                  key={effect.id}
                  className="px-2 py-1 text-xs bg-gray-700 rounded-full"
                >
                  {effect.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};