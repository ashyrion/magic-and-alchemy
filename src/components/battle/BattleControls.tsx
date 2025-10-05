import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useBattleStore } from '../../store/battleStore';

export const BattleControls = () => {
  const [showItems, setShowItems] = useState(false);
  const learnedSkills = useGameStore(state => state.learnedSkills);
  const { items } = useInventoryStore();
  const { currentTurn, player } = useBattleStore();
  
  // 사용 가능한 아이템들만 필터링
  const consumableItems = items.filter(item => item.type === 'consumable');
  
  const handleUseItem = (itemId: string) => {
    const inventoryStore = useInventoryStore.getState();
    const success = inventoryStore.useItem(itemId);
    if (success) {
      // 아이템 사용 완료 후 전투 상태 동기화
      const gameStore = useGameStore.getState();
      if (gameStore.character && player) {
        const battleStore = useBattleStore.getState();
        battleStore.updatePlayerStats({
          ...player.stats,
          hp: gameStore.character.stats.hp,
          mp: gameStore.character.stats.mp
        });
      }
      console.log('아이템 사용 완료 및 전투 상태 동기화');
      setShowItems(false);
    }
  };
  
  const isPlayerTurn = currentTurn === player?.id;

  return (
    <div className="space-y-4">
      {/* 탭 버튼들 */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${!showItems ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => setShowItems(false)}
        >
          스킬
        </button>
        <button
          className={`px-3 py-1 rounded ${showItems ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => setShowItems(true)}
        >
          아이템 ({consumableItems.length})
        </button>
      </div>

      {!showItems ? (
        <>
          {/* 스킬 목록 */}
          <div className="grid grid-cols-2 gap-2">
            {learnedSkills.map(skill => (
              <button
                key={skill.id}
                className={`p-2 bg-gray-700 rounded hover:bg-gray-600 ${!isPlayerTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isPlayerTurn}
                onClick={() => {
                  if (isPlayerTurn) {
                    const battleStore = useBattleStore.getState();
                    battleStore.useSkill(skill.id);
                  }
                }}
              >
                <div className="font-bold">{skill.name}</div>
                <div className="text-xs text-gray-400">
                  MP {skill.cost} / 위력 {skill.power}
                </div>
              </button>
            ))}
          </div>

          {/* 기본 행동 */}
          <div className="flex justify-between">
            <button
              className={`px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 ${!isPlayerTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isPlayerTurn}
              onClick={() => {
                if (isPlayerTurn) {
                  const battleStore = useBattleStore.getState();
                  battleStore.basicAttack();
                }
              }}
            >
              기본 공격
            </button>

            <button
              className={`px-4 py-2 bg-red-900 rounded hover:bg-red-800 ${!isPlayerTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isPlayerTurn}
              onClick={() => {
                if (isPlayerTurn) {
                  const battleStore = useBattleStore.getState();
                  battleStore.attemptFlee();
                }
              }}
            >
              도망가기
            </button>
          </div>
        </>
      ) : (
        /* 아이템 목록 */
        <div className="space-y-2">
          {consumableItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {consumableItems.map(item => (
                <button
                  key={item.id}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-left flex justify-between items-center"
                  onClick={() => handleUseItem(item.id)}
                >
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.description}
                    </div>
                  </div>
                  <span className="text-xs bg-green-600 px-2 py-1 rounded">
                    사용
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              사용할 수 있는 아이템이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
};