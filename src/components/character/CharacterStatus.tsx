import { useGameStore } from '../../store/gameStore';

export const CharacterStatus = () => {
  const character = useGameStore((state) => state.character);
  const baseStats = useGameStore((state) => state.baseStats);
  const gold = useGameStore((state) => state.gold);
  const calculateTotalStats = useGameStore((state) => state.calculateTotalStats);

  if (!character) {
    return (
      <div className="text-gray-500 text-center">
        캐릭터 정보 없음
      </div>
    );
  }

  // 장비 보너스를 포함한 총 스탯 계산
  const totalStats = calculateTotalStats();
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

      {/* HP/MP/EXP 바 */}
      <div className="space-y-2">
        <StatusBar 
          current={computedStats.hp || computedStats.currentHP || 0} 
          max={totalStats.maxHp || totalStats.maxHP || computedStats.maxHp || computedStats.maxHP || 100} 
          label="HP"
          color="bg-red-600" 
        />
        <StatusBar 
          current={computedStats.mp || computedStats.currentMP || 0} 
          max={totalStats.maxMp || totalStats.maxMP || computedStats.maxMp || computedStats.maxMP || 80} 
          label="MP"
          color="bg-blue-600" 
        />
        <StatusBar 
          current={character.experience} 
          max={character.experienceToNext} 
          label="EXP"
          color="bg-purple-600" 
        />
      </div>

      {/* 기본 스탯 */}
      <div className="space-y-3">
        {/* 핵심 3 스탯 */}
        <div className="text-sm">
          <h4 className="font-semibold text-blue-300 mb-2">기본 스탯</h4>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex justify-between">
              <span className="text-gray-400">힘 (STR):</span>
              <span className="flex items-center gap-1">
                {totalStats.strength}
                {totalStats.strength > base.strength && (
                  <span className="text-green-500 text-xs">
                    (+{totalStats.strength - base.strength})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">민첩 (AGI):</span>
              <span className="flex items-center gap-1">
                {totalStats.agility}
                {totalStats.agility > base.agility && (
                  <span className="text-green-500 text-xs">
                    (+{totalStats.agility - base.agility})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">지능 (INT):</span>
              <span className="flex items-center gap-1">
                {totalStats.intelligence}
                {totalStats.intelligence > base.intelligence && (
                  <span className="text-green-500 text-xs">
                    (+{totalStats.intelligence - base.intelligence})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 전투 스탯 */}
        <div className="text-sm">
          <h4 className="font-semibold text-red-300 mb-2">전투 스탯</h4>
          <div className="grid grid-cols-1 gap-1">
            <div className="flex justify-between">
              <span className="text-gray-400">공격력:</span>
              <span className="text-xs text-gray-500">{totalStats.attack} (힘×2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">방어력:</span>
              <span className="text-xs text-gray-500">{totalStats.defense.toFixed(1)} (힘×1.5 + 민×0.5)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">치명타율:</span>
              <span className="text-xs text-gray-500">{totalStats.criticalRate.toFixed(1)}% (민×0.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">치명타피해:</span>
              <span className="text-xs text-gray-500">{totalStats.criticalDamage.toFixed(0)}% (지×2% + 150%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">회피율:</span>
              <span className="text-xs text-gray-500">{totalStats.evasion.toFixed(1)}% (민×1%)</span>
            </div>
          </div>
          
          {/* 속성 저항 */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <h4 className="text-sm font-semibold mb-2 text-gray-300">속성 저항</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">화염 저항:</span>
                <span className="text-red-400">{totalStats.fireResist} (지×0.5)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">냉기 저항:</span>
                <span className="text-blue-400">{totalStats.iceResist} (지×0.5)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">번개 저항:</span>
                <span className="text-yellow-400">{totalStats.lightningResist} (지×0.5)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">독 저항:</span>
                <span className="text-green-400">{totalStats.poisonResist} (지×0.5)</span>
              </div>
            </div>
          </div>
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