import { useEffect, useState } from 'react';
import GameLayout from './components/layout/GameLayout';
import { BattleScreen } from './components/battle/BattleScreen';
import AlchemyWorkshop from './components/AlchemyWorkshop';
import { DungeonExplorer } from './components/dungeon/DungeonExplorer';
import Town from './components/town/Town';
import { EquipmentErrorToast } from './components/common/EquipmentErrorToast';
import { useGameStore } from './store/gameStore';
import { useInventoryStore } from './store/inventoryStore';
import { useBattleStore } from './store/battleStore';
import { useDungeonStore } from './store/dungeonStore';
import { useGameStateStore } from './store/gameStateStore';
import { useAlchemyStore } from './stores/alchemyStore';
import { testCharacter, testItems, testMaterials, testSkills } from './data/gameData';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'battle' | 'alchemy' | 'main'>('main');
  const [lastActiveTab, setLastActiveTab] = useState<'battle' | 'alchemy' | 'main'>('main');
  
  // 스토어에서 필요한 액션 가져오기
  const setCharacter = useGameStore((state) => state.setCharacter);
  const { addItem, addMaterial } = useInventoryStore();
  const initializeAlchemy = useAlchemyStore((state) => state.initializeAlchemy);
  
  // 전투 상태 구독
  const inBattle = useBattleStore((state) => state.inBattle);
  const showBattleResult = useBattleStore((state) => state.showBattleResult);
  const isInDungeon = useDungeonStore((state) => state.isInDungeon);
  const currentLocation = useGameStateStore((state) => state.currentLocation);

  // 자동 탭 전환 로직 (전투방에서만)
  useEffect(() => {
    const dungeonStore = useDungeonStore.getState();
    const currentRoom = dungeonStore.getCurrentRoom();
    const isBattleRoom = currentRoom && (currentRoom.type === 'battle' || currentRoom.type === 'boss');
    
    if (inBattle && isInDungeon && isBattleRoom && activeTab === 'main') {
      // 던전의 전투방에서 전투 시작 시에만 전투 탭으로 자동 전환
      setLastActiveTab('main');
      setActiveTab('battle');
    } else if (!inBattle && !showBattleResult && lastActiveTab === 'main' && activeTab === 'battle') {
      // 전투 종료 시 메인 탭으로 복귀 (단, 결과창이 닫힌 경우에만)
      setActiveTab('main');
      setLastActiveTab('battle');
    }
  }, [inBattle, showBattleResult, isInDungeon, activeTab, lastActiveTab]);

  // 초기 전투 시작 함수 (제거됨 - 던전에서만 시작)
  // const startInitialBattle = () => {
  //   // 초기 전투는 던전에서만 시작하도록 변경
  // };

  // 초기화 실행 (중복 방지)
  useEffect(() => {
    const gameStore = useGameStore.getState();
    const inventoryStore = useInventoryStore.getState();
    
    // 이미 초기화된 경우 건너뛰기
    if (gameStore.character || inventoryStore.items.length > 0) {
      return;
    }

    // 캐릭터 설정
    setCharacter(testCharacter);

    // 아이템 추가
    testItems.forEach(item => {
      addItem(item);
    });

    // 재료 추가 (연금술용) - 현실적인 시작 재료
    testMaterials.forEach(material => {
      // 기본 재료는 5개, 고급/희귀 재료는 적게 시작
      const isBasicMaterial = ['herb-red-grass', 'herb-blue-flower', 'mineral-iron-ore', 'crystal-clear-shard'].includes(material.id);
      const isAdvancedMaterial = ['herb-golden-root', 'crystal-mana-essence', 'mineral-silver-dust', 'essence-fire-spark', 'essence-ice-fragment'].includes(material.id);
      
      let count = 1; // 희귀 재료 기본값
      if (isBasicMaterial) count = 5;
      else if (isAdvancedMaterial) count = 2;
      
      for (let i = 0; i < count; i++) {
        addMaterial(material);
      }
    });

    // 스킬 추가 및 기본 스킬 장착
    testSkills.forEach(skill => gameStore.addSkill(skill));
    
    // 기본 스킬들을 장착 (처음 4개 스킬)
    const basicSkills = testSkills.slice(0, 4);
    basicSkills.forEach(skill => gameStore.equipSkill(skill));

    // 기본 장비 장착 (레벨 1에서 장착 가능한 장비들)
    const level1Items = testItems.filter(item => !item.requiredLevel || item.requiredLevel <= 1);
    const weaponItems = level1Items.filter(item => item.type === 'weapon');
    const armorItems = level1Items.filter(item => item.type === 'armor');
    const accessoryItems = level1Items.filter(item => item.type === 'accessory');
    
    // 각 타입별로 첫 번째 아이템 장착
    if (weaponItems.length > 0) {
      gameStore.equipItem(weaponItems[0], 'weapon');
    }
    if (armorItems.length > 0) {
      gameStore.equipItem(armorItems[0], 'armor');
    }
    if (accessoryItems.length > 0) {
      gameStore.equipItem(accessoryItems[0], 'accessory');
    }

    // 장비 장착 후 캐릭터 스탯 업데이트
    gameStore.updateCharacterStats();
    console.log('[초기화] 장비 장착 완료 및 스탯 업데이트');
    
    // 초기 MP를 올바르게 설정 (장비 보너스를 고려한 최대 MP로 설정)
    const totalStats = gameStore.calculateTotalStats();
    const finalMaxMP = totalStats.maxMP || totalStats.maxMp || 80;
    gameStore.updateCharacterStats({
      mp: finalMaxMP,
      currentMP: finalMaxMP,
      maxMP: finalMaxMP,
      maxMp: finalMaxMP
    });
    console.log('[초기화] 최종 MP 설정 완료:', finalMaxMP);

    // 연금술 시스템 초기화
    initializeAlchemy();

    // 던전 초기화는 하지 않음 (마을에서 시작)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'battle':
        return <BattleScreen />;
      case 'alchemy':
        return <AlchemyWorkshop />;
      case 'main':
        // 현재 위치에 따라 다른 화면 표시
        return currentLocation === 'town' ? <Town /> : <DungeonExplorer />;
      default:
        return currentLocation === 'town' ? <Town /> : <DungeonExplorer />;
    }
  };

  return (
    <GameLayout>
      <div className="app-container">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'main' ? 'active' : ''}`}
            onClick={() => setActiveTab('main')}
          >
            {currentLocation === 'town' ? '🏘️ 마을' : '🏰 던전'}
          </button>
          <button 
            className={`tab-button ${activeTab === 'alchemy' ? 'active' : ''}`}
            onClick={() => setActiveTab('alchemy')}
          >
            🧪 연금술
          </button>
          <button 
            className={`tab-button ${activeTab === 'battle' ? 'active' : ''}`}
            onClick={() => setActiveTab('battle')}
            disabled={!inBattle}
            style={{ opacity: inBattle ? 1 : 0.5 }}
          >
            ⚔️ 전투
          </button>
        </div>
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
      
      {/* 장비 에러 토스트 */}
      <EquipmentErrorToast />
    </GameLayout>
  );
}

export default App;


