import { useGameStore } from '../../store/gameStore';

export const CharacterStatus = () => {
  const character = useGameStore((state) => state.character);
  const baseStats = useGameStore((state) => state.baseStats);
  const gold = useGameStore((state) => state.gold);

  if (!character) {
    return (
      <div className="text-gray-500 text-center">
        캐릭터 정보 없음
      </div>
    );
  }

  // 게임 스토어에서 이미 계산된 스탯을 사용
  const computedStats = character.stats;
  const base = baseStats || character.stats;

  return (
    <div className="space-y-4">
      {/* 기본 정보 */}
      <div>
        <h3 className="font-bold mb-2">{character.name}</h3>
        <div className="text-sm">레벨 {character.level}</div>
        <div className="text-sm text-yellow-400">💰 {gold} 골드</div>
      </div>

      {/* HP/MP 바 */}
      <div className="space-y-2">
        <StatusBar 
          current={computedStats.hp} 
          max={computedStats.maxHp} 
          label="HP"
          color="bg-red-600" 
        />
        <StatusBar 
          current={computedStats.mp} 
          max={computedStats.maxMp} 
          label="MP"
          color="bg-blue-600" 
        />
      </div>

      {/* 기본 스탯 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">STR:</span>{' '}
          <span className="flex items-center gap-1">
            {base.strength}
            {computedStats.strength > base.strength && (
              <span className="text-green-500 text-xs">
                (+{computedStats.strength - base.strength})
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-gray-400">DEF:</span>{' '}
          <span className="flex items-center gap-1">
            {base.defense}
            {computedStats.defense > base.defense && (
              <span className="text-green-500 text-xs">
                (+{computedStats.defense - base.defense})
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-gray-400">ATK:</span>{' '}
          <span className="flex items-center gap-1">
            {(base.strength || 0) + (base.attack || 0)}
            {((computedStats.strength || 0) + (computedStats.attack || 0)) > ((base.strength || 0) + (base.attack || 0)) && (
              <span className="text-green-500 text-xs">
                (+{((computedStats.strength || 0) + (computedStats.attack || 0)) - ((base.strength || 0) + (base.attack || 0))})
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-gray-400">INT:</span>{' '}
          <span className="flex items-center gap-1">
            {base.intelligence}
            {computedStats.intelligence > base.intelligence && (
              <span className="text-green-500 text-xs">
                (+{computedStats.intelligence - base.intelligence})
              </span>
            )}
          </span>
        </div>
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