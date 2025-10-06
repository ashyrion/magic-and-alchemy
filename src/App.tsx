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
import { useSkillEnhancementStore } from './store/skillEnhancementStore';
import { useAlchemyStore } from './stores/alchemyStore';
import { testCharacter } from './data/gameData';
import type { Skill } from './types/gameTypes';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'battle' | 'alchemy' | 'main'>('main');
  const [lastActiveTab, setLastActiveTab] = useState<'battle' | 'alchemy' | 'main'>('main');
  
  // 스토어에서 필요한 액션 가져오기
  const setCharacter = useGameStore((state) => state.setCharacter);

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

  // 스킬 강화 시스템 초기화 함수
    const initializeSkillEnhancementSystem = () => {    const enhancementStore = useSkillEnhancementStore.getState();
    
    // 기본 스킬 6개 정의 (0단계에서 시작)
    const starterSkills: Skill[] = [
      {
        id: 'skill-fireball',
        name: '파이어볼',
        type: 'elemental',
        element: 'fire',
        category: 'offensive',
        power: 12,
        cost: 12,
        cooldown: 3,
        targetType: 'enemy',
        range: 4,
        accuracy: 90,
        effects: [],
        icon: '🔥',
        description: '화염구를 발사하여 적에게 화상을 입힙니다.'
      },
      {
        id: 'skill-ice-shard',
        name: '아이스 샤드',
        type: 'elemental',
        element: 'ice',
        category: 'offensive',
        power: 10,
        cost: 10,
        cooldown: 3,
        targetType: 'enemy',
        range: 3,
        accuracy: 85,
        effects: [],
        icon: '🧊',
        description: '얼음 조각을 발사하여 동상 효과를 줍니다.'
      },
      {
        id: 'skill-lightning-bolt',
        name: '라이트닝 볼트',
        type: 'elemental',
        element: 'lightning',
        category: 'offensive',
        power: 14,
        cost: 14,
        cooldown: 4,
        targetType: 'enemy',
        range: 5,
        accuracy: 80,
        effects: [],
        icon: '⚡',
        description: '번개를 발사하여 감전 효과를 줍니다.'
      },
      {
        id: 'skill-poison-dart',
        name: '포이즌 다트',
        type: 'elemental',
        element: 'poison',
        category: 'offensive',
        power: 8,
        cost: 8,
        cooldown: 2,
        targetType: 'enemy',
        range: 4,
        accuracy: 90,
        effects: [],
        icon: '☠️',
        description: '독침을 발사하여 지속 독 데미지를 줍니다.'
      },
      {
        id: 'skill-heal',
        name: '힐',
        type: 'heal',
        element: 'light',
        category: 'support',
        power: 20,
        cost: 12,
        cooldown: 3,
        targetType: 'ally',
        range: 3,
        accuracy: 100,
        effects: [],
        icon: '💚',
        description: '체력을 회복시킵니다.'
      },
      {
        id: 'skill-life-drain',
        name: '라이프 드레인',
        type: 'elemental',
        element: 'dark',
        category: 'offensive',
        power: 8,
        cost: 10,
        cooldown: 3,
        targetType: 'enemy',
        range: 3,
        accuracy: 85,
        effects: [],
        icon: '🩸',
        description: '생명력을 흡수하여 자신을 회복시킵니다.'
      }
    ];
    
    // 스킬 강화 시스템에 0단계(미해금) 상태로 등록
    starterSkills.forEach((skill) => {
      enhancementStore.unlockBaseSkill(skill.id);
    });
    

    
    console.log('✅ 스킬 강화 시스템 초기화 완료!');
    console.log('🔥 기본 스킬 6개 추가 (0단계 미해금 상태)');
    console.log('🎯 파이어볼만 해금 가능한 화염 재료 제공');
    console.log('💰 골드 5,000 추가');
    console.log('📦 나머지 재료는 파밍으로 획득하세요!');
  };

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

    // 🔥 스킬 강화 시스템 초기화
    initializeSkillEnhancementSystem();

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