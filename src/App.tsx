import { useEffect, useState } from 'react';
import GameLayout from './components/layout/GameLayout';
import { BattleScreen } from './components/battle/BattleScreen';
import AlchemyWorkshop from './components/AlchemyWorkshop';
import { DungeonExplorer } from './components/dungeon/DungeonExplorer';
import { useGameStore } from './store/gameStore';
import { useInventoryStore } from './store/inventoryStore';
import { useBattleStore } from './store/battleStore';
import { useDungeonStore } from './store/dungeonStore';
import { useAlchemyStore } from './stores/alchemyStore';
import { testCharacter, testItems, testMaterials, testSkills } from './data/testData';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'battle' | 'alchemy' | 'dungeon'>('dungeon');
  const [lastActiveTab, setLastActiveTab] = useState<'battle' | 'alchemy' | 'dungeon'>('dungeon');
  
  // 스토어에서 필요한 액션 가져오기
  const setCharacter = useGameStore((state) => state.setCharacter);
  const { addItem, addMaterial } = useInventoryStore();
  const startDungeon = useDungeonStore((state) => state.startDungeon);
  const initializeAlchemy = useAlchemyStore((state) => state.initializeAlchemy);
  
  // 전투 상태 구독
  const inBattle = useBattleStore((state) => state.inBattle);
  const isInDungeon = useDungeonStore((state) => state.isInDungeon);

  // 자동 탭 전환 로직 (전투방에서만)
  useEffect(() => {
    const dungeonStore = useDungeonStore.getState();
    const currentRoom = dungeonStore.getCurrentRoom();
    const isBattleRoom = currentRoom && (currentRoom.type === 'battle' || currentRoom.type === 'boss');
    
    if (inBattle && isInDungeon && isBattleRoom && activeTab === 'dungeon') {
      // 던전의 전투방에서 전투 시작 시에만 전투 탭으로 자동 전환
      setLastActiveTab('dungeon');
      setActiveTab('battle');
    } else if (!inBattle && lastActiveTab === 'dungeon' && activeTab === 'battle') {
      // 전투 종료 시 던전 탭으로 복귀
      setActiveTab('dungeon');
      setLastActiveTab('battle');
    }
  }, [inBattle, isInDungeon, activeTab, lastActiveTab]);

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

    // 재료 추가 (연금술용) - 테스트를 위해 많은 양 추가
    testMaterials.forEach(material => {
      for (let i = 0; i < 10; i++) {
        addMaterial(material); // 각 재료를 10개씩 추가
      }
    });

    // 스킬 추가
    testSkills.forEach(skill => gameStore.addSkill(skill));

    // 연금술 시스템 초기화
    initializeAlchemy();

    // 던전만 초기화 (전투는 던전에서 시작)
    startDungeon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'battle':
        return <BattleScreen />;
      case 'alchemy':
        return <AlchemyWorkshop />;
      case 'dungeon':
        return <DungeonExplorer />;
      default:
        return <BattleScreen />;
    }
  };

  return (
    <GameLayout>
      <div className="app-container">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'battle' ? 'active' : ''}`}
            onClick={() => setActiveTab('battle')}
          >
            ⚔️ 전투
          </button>
          <button 
            className={`tab-button ${activeTab === 'alchemy' ? 'active' : ''}`}
            onClick={() => setActiveTab('alchemy')}
          >
            🧪 연금술
          </button>
          <button 
            className={`tab-button ${activeTab === 'dungeon' ? 'active' : ''}`}
            onClick={() => setActiveTab('dungeon')}
          >
            🏰 던전
          </button>
        </div>
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </GameLayout>
  );
}

export default App;


