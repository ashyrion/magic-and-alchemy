/*
// 개발자 도구 콘솔에서 사용할 수 있는 헬퍼 함수들
import { useGameStore } from '../store/gameStore';
import { useSkillEnhancementStore, unlockAllBaseSkills } from '../store/skillEnhancementStore';

// 전역 window 객체에 개발용 함수들을 추가
declare global {
  interface Window {
    // 스킬 강화 시스템 개발 도구
    devSkills: {
      unlockBasicSkills: () => void;
      unlockAllSkills: () => void;
      addSkillMaterials: () => void;
      resetSkillProgress: () => void;
      showPlayerSkills: () => void;
      enhanceSkill: (baseSkillId: string, targetTier: number) => void;
    };
  }
}

// 개발용 스킬 함수들
const devSkills = {
  // 기본 스킬들과 재료 해금
  unlockBasicSkills: () => {
    try {
      const gameStore = useGameStore.getState();
      gameStore.unlockBasicSkillsForTesting();
      console.log('✅ 기본 스킬 6개와 강화 재료가 지급되었습니다!');
      console.log('🔥 파이어볼, 🧊 아이스 샤드, ⚡ 라이트닝 볼트, ☠️ 포이즌 다트, 💚 힐, 🩸 라이프 드레인');
      console.log('📖 스킬 패널과 스킬 강화 워크샵에서 확인하세요!');
      console.log('🔄 잠시 후 페이지를 새로고침하면 동기화가 완료됩니다.');
    } catch (error) {
      console.error('❌ 스킬 해금 중 오류 발생:', error);
    }
  },

  // 모든 기본 스킬 해금
  unlockAllSkills: () => {
    unlockAllBaseSkills();
    console.log('✅ 모든 기본 스킬이 해금되었습니다!');
  },

  // 스킬 강화 재료만 추가
  addSkillMaterials: () => {
    const gameStore = useGameStore.getState();
    gameStore.addGold(10000);
    
    // 재료 추가 로직은 unlockBasicSkillsForTesting에 포함되어 있음
    console.log('✅ 스킬 강화 재료와 골드가 지급되었습니다!');
  },

  // 스킬 진행 상태 초기화 
  resetSkillProgress: () => {
    const enhancementStore = useSkillEnhancementStore.getState();
    enhancementStore.resetProgress();
    console.log('✅ 스킬 강화 진행 상태가 초기화되었습니다!');
  },
  
  // 모든 스킬 완전 초기화
  resetAllSkills: () => {
    try {
      const enhancementStore = useSkillEnhancementStore.getState();
      
      // 기존 스킬 시스템 초기화 (직접 실행)
      useGameStore.setState((state) => ({
        ...state,
        learnedSkills: [],
        equippedSkills: []
      }));
      
      // 스킬 강화 시스템 초기화
      enhancementStore.resetProgress();
      
      console.log('🔄 모든 스킬이 완전히 초기화되었습니다!');
      console.log('💡 이제 devSkills.unlockBasicSkills()로 새로 시작하세요.');
    } catch (error) {
      console.error('❌ 스킬 초기화 중 오류:', error);
    }
  },

  // 현재 플레이어 스킬 상태 표시
  showPlayerSkills: () => {
    const enhancementStore = useSkillEnhancementStore.getState();
    const gameStore = useGameStore.getState();
    
    const playerSkills = enhancementStore.getPlayerSkills();
    const availableSkills = gameStore.getAvailableSkills();
    
    console.log('🎯 현재 플레이어 스킬 상태:');
    console.log('강화된 스킬:', playerSkills);
    console.log('사용 가능한 모든 스킬:', availableSkills);
    console.log('장착된 스킬:', gameStore.equippedSkills);
  },

  // 특정 스킬을 특정 단계로 강화
  enhanceSkill: async (baseSkillId: string, targetTier: number) => {
    const enhancementStore = useSkillEnhancementStore.getState();
    
    // 먼저 기본 스킬이 해금되어 있는지 확인
    if (!enhancementStore.playerSkillProgress.find(p => p.baseSkillId === baseSkillId)) {
      enhancementStore.unlockBaseSkill(baseSkillId);
    }
    
    // 단계별로 강화 시도
    for (let tier = 2; tier <= targetTier; tier++) {
      const success = await enhancementStore.attemptSkillEnhancement(baseSkillId, tier as 1 | 2 | 3 | 4 | 5);
      if (success) {
        console.log(`✅ ${baseSkillId} ${tier}단계 강화 성공!`);
      } else {
        console.log(`❌ ${baseSkillId} ${tier}단계 강화 실패...`);
        break;
      }
    }
    
    devSkills.showPlayerSkills();
  }
};

// 브라우저 콘솔에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  window.devSkills = devSkills;
  
  // 개발자 도구에 도움말 출력
  console.log(`
🔧 스킬 강화 시스템 개발 도구
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 사용 가능한 명령어:
  devSkills.unlockBasicSkills()          - 기본 스킬 6개 + 재료 지급
  devSkills.unlockAllSkills()            - 모든 기본 스킬 해금
  devSkills.addSkillMaterials()          - 스킬 강화 재료만 추가
  devSkills.resetSkillProgress()         - 스킬 강화 진행도 초기화
  devSkills.resetAllSkills()             - 모든 스킬 완전 초기화 (🔄 새로시작)
  devSkills.showPlayerSkills()           - 현재 스킬 상태 확인
  devSkills.enhanceSkill('skill-id', 5)  - 특정 스킬을 5단계까지 강화

🎯 기본 스킬 ID 목록:
  skill-fireball       (파이어볼)
  skill-flame-burst    (이중 화염탄)
  skill-ice-shard      (얼음창)
  skill-frost-barrier  (냉기 방벽)
  skill-lightning-bolt (번개 화살)
  skill-chain-lightning (번개 연타)
  skill-poison-dart    (독침)
  skill-toxic-cloud    (맹독 감염)
  skill-heal           (치유)
  skill-purify         (정화)
  skill-life-drain     (흡혈)
  skill-weaken         (약화)

💡 예시:
  devSkills.unlockBasicSkills()                    // 시작하기
  devSkills.enhanceSkill('skill-fireball', 3)      // 파이어볼을 3단계까지
  devSkills.showPlayerSkills()                     // 결과 확인
  `);
}

export { devSkills };
*/