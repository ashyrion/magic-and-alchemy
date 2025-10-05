import type { BattleLog as BattleLogType } from '../../types/battle';
import { useBattleStore } from '../../store/battleStore';

export const BattleLog = () => {
  const battleLogs = useBattleStore((state) => state.battleLogs);

  const getLogColor = (type: BattleLogType['type']) => {
    switch (type) {
      case 'system':
        return 'text-yellow-400';
      case 'player-action':
        return 'text-blue-400';
      case 'enemy-action':
        return 'text-red-400';
      case 'damage':
        return 'text-orange-400';
      case 'heal':
        return 'text-green-400';
      case 'equipment':
        return 'text-purple-400';
      case 'critical':
        return 'text-yellow-300 font-bold';
      case 'effect':
        return 'text-indigo-400';
      case 'status':
        return 'text-cyan-400';
      case 'resource':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatLogMessage = (log: BattleLogType) => {
    const baseMessage = log.message;
    
    if (!log.details) {
      return baseMessage;
    }

    const { damage, healing, effect, resourceChanges } = log.details;
    let detailsText = '';

    // 데미지 디테일 표시
    if (damage) {
      const criticalText = damage.isCritical ? ' 치명타!' : '';
      const dodgeText = damage.wasDodged ? ' (회피됨)' : '';
      detailsText += ` [${damage.total} 데미지${criticalText}${dodgeText}]`;
      
      if (damage.isCritical || damage.wasDodged) {
        detailsText += ` (명중률: ${Math.round(damage.hitChance)}%, 주사위: ${damage.hitRoll})`;
      }
    }

    // 힐링 디테일
    if (healing) {
      detailsText += ` [${healing} 회복]`;
    }

    // 상태 효과
    if (effect) {
      detailsText += ` [${effect.name} 효과]`;
    }

    // 리소스 변화
    if (resourceChanges && resourceChanges.length > 0) {
      const resourceText = resourceChanges
        .map(rc => `${rc.source}: ${rc.value > 0 ? '+' : ''}${rc.value}${rc.isCritical ? ' 크리!' : ''}`)
        .join(', ');
      detailsText += ` [${resourceText}]`;
    }

    return baseMessage + detailsText;
  };

  return (
    <div className="w-full h-48 bg-gray-800 rounded-lg p-4 overflow-y-auto">
      <div className="flex flex-col-reverse gap-1">
        {battleLogs.map((log: BattleLogType, index: number) => (
          <div
            key={log.timestamp + index}
            className={`${getLogColor(log.type)} text-sm leading-relaxed`}
          >
            <span className="text-xs text-gray-500 mr-2">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {formatLogMessage(log)}
          </div>
        ))}
      </div>
    </div>
  );
};