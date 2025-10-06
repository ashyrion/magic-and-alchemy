import { create } from 'zustand';
import type { Skill } from '../types/gameTypes';
import type { SkillEnhancement, SkillTier } from '../data/skillEnhancementData';
import { 
  skillEnhancements, 
  getEnhancedSkill,
  baseSkills 
} from '../data/skillEnhancementData';

// 플레이어의 스킬 강화 진행 상태
interface PlayerSkillProgress {
  baseSkillId: string;
  currentTier: SkillTier;
  unlockedTiers: SkillTier[];
}

interface SkillEnhancementState {
  // 플레이어가 보유한 스킬들의 강화 진행 상태
  playerSkillProgress: PlayerSkillProgress[];
  
  // 선택된 스킬 (강화 UI에서 사용)
  selectedBaseSkillId: string | null;
  selectedTier: SkillTier | null;
  
  // 강화 진행 중 상태
  isEnhancing: boolean;
  enhancementResult: 'success' | 'failure' | null;
}

interface SkillEnhancementActions {
  // 기본 스킬 해금 (게임 진행으로 획득)
  unlockBaseSkill: (baseSkillId: string) => void;
  
  // 스킬 강화 시도
  attemptSkillEnhancement: (baseSkillId: string, targetTier: SkillTier) => Promise<boolean>;
  
  // 스킬 선택 (UI용)
  selectSkillForEnhancement: (baseSkillId: string, tier: SkillTier) => void;
  clearSelection: () => void;
  
  // 플레이어가 현재 사용할 수 있는 최고 단계 스킬 가져오기
  getCurrentSkill: (baseSkillId: string) => Skill | null;
  
  // 플레이어가 보유한 모든 스킬 가져오기 (현재 최고 단계만)
  getPlayerSkills: () => Skill[];
  
  // 스킬 강화 가능 여부 확인
  canEnhanceSkill: (baseSkillId: string, targetTier: SkillTier) => boolean;
  
  // 특정 스킬의 다음 강화 단계 정보 가져오기
  getNextEnhancement: (baseSkillId: string) => SkillEnhancement | null;
  
  // 진행 상태 초기화 (개발/테스트용)
  resetProgress: () => void;
  clearEnhancementResult: () => void;
}

type SkillEnhancementStore = SkillEnhancementState & SkillEnhancementActions;

export const useSkillEnhancementStore = create<SkillEnhancementStore>((set, get) => ({
  // 초기 상태
  playerSkillProgress: [],
  selectedBaseSkillId: null,
  selectedTier: null,
  isEnhancing: false,
  enhancementResult: null,

  // 기본 스킬 해금
  unlockBaseSkill: (baseSkillId: string) => {
    set((state) => {
      // 이미 해금된 스킬인지 확인
      const existingProgress = state.playerSkillProgress.find(
        p => p.baseSkillId === baseSkillId
      );
      
      if (existingProgress) {
        return state; // 이미 해금됨
      }
      
      // 새 스킬 추가 (0단계로 시작 - 아직 해금되지 않은 상태)
      const newProgress: PlayerSkillProgress = {
        baseSkillId,
        currentTier: 0 as SkillTier, // 미해금 상태
        unlockedTiers: [] // 빈 배열로 시작
      };
      
      return {
        ...state,
        playerSkillProgress: [...state.playerSkillProgress, newProgress]
      };
    });
  },

  // 스킬 강화 시도
  attemptSkillEnhancement: async (baseSkillId: string, targetTier: SkillTier): Promise<boolean> => {
    const { canEnhanceSkill } = get();
    
    if (!canEnhanceSkill(baseSkillId, targetTier)) {
      return false;
    }
    
    set({ isEnhancing: true, enhancementResult: null });
    
    // 강화 시도 로직 (실제로는 게임 스토어와 연동하여 재료/골드 소모)
    const enhancement = skillEnhancements.find(e => 
      e.baseSkillId === baseSkillId && e.tier === targetTier
    );
    
    if (!enhancement) {
      set({ isEnhancing: false });
      return false;
    }
    
    // 성공률 계산 (실제 구현시에는 더 복잡한 로직 가능)
    await new Promise(resolve => setTimeout(resolve, 1000)); // 강화 애니메이션 시간
    
    const success = Math.random() * 100 < enhancement.successRate;
    
    if (success) {
      // 강화 성공 - 진행 상태 업데이트
      set((state) => {
        const updatedProgress = state.playerSkillProgress.map(progress => {
          if (progress.baseSkillId === baseSkillId) {
            return {
              ...progress,
              currentTier: targetTier,
              unlockedTiers: [...new Set([...progress.unlockedTiers, targetTier])]
            };
          }
          return progress;
        });
        
        return {
          ...state,
          playerSkillProgress: updatedProgress,
          isEnhancing: false,
          enhancementResult: 'success'
        };
      });

      // 1단계 강화 성공 시 게임 스토어에 기본 스킬 추가
      if (targetTier === 1) {
        const baseSkill = baseSkills.find(skill => skill.id === baseSkillId);
        if (baseSkill) {
          // gameStore import를 위해 동적으로 가져오기
          const gameStore = (await import('./gameStore')).useGameStore.getState();
          gameStore.addSkill(baseSkill);
        }
      }
    } else {
      // 강화 실패
      set({ isEnhancing: false, enhancementResult: 'failure' });
    }
    
    return success;
  },

  // UI용 스킬 선택
  selectSkillForEnhancement: (baseSkillId: string, tier: SkillTier) => {
    set({
      selectedBaseSkillId: baseSkillId,
      selectedTier: tier,
      enhancementResult: null
    });
  },

  clearSelection: () => {
    set({
      selectedBaseSkillId: null,
      selectedTier: null,
      enhancementResult: null
    });
    console.log('🧹 [Store] 선택 상태 초기화 완료');
  },

  // 현재 사용 가능한 최고 단계 스킬 가져오기
  getCurrentSkill: (baseSkillId: string): Skill | null => {
    const { playerSkillProgress } = get();
    const progress = playerSkillProgress.find(p => p.baseSkillId === baseSkillId);
    
    if (!progress) {
      return null;
    }
    
    return getEnhancedSkill(baseSkillId, progress.currentTier);
  },

  // 플레이어가 보유한 모든 스킬 (최고 단계만)
  getPlayerSkills: (): Skill[] => {
    const { playerSkillProgress, getCurrentSkill } = get();
    
    return playerSkillProgress
      .map(progress => getCurrentSkill(progress.baseSkillId))
      .filter((skill): skill is Skill => skill !== null);
  },

  // 스킬 강화 가능 여부 확인
  canEnhanceSkill: (baseSkillId: string, targetTier: SkillTier): boolean => {
    const { playerSkillProgress } = get();
    const progress = playerSkillProgress.find(p => p.baseSkillId === baseSkillId);
    
    if (!progress) {
      return false; // 스킬을 보유하지 않음
    }
    
    // 이전 단계가 해금되어 있어야 함 (1단계는 예외 - 0단계에서 시작 가능)
    const previousTier = (targetTier - 1) as SkillTier;
    if (targetTier > 1 && !progress.unlockedTiers.includes(previousTier)) {
      return false;
    }
    
    // 1단계 강화는 항상 가능 (0단계에서 시작)
    if (targetTier === 1) {
      const alreadyUnlocked = progress.unlockedTiers.includes(targetTier);
      if (alreadyUnlocked) {
        return false;
      }
      return true;
    }
    
    // 이미 해당 단계가 해금되어 있으면 강화 불가
    if (progress.unlockedTiers.includes(targetTier)) {
      return false;
    }
    
    return true;
  },

  // 다음 강화 단계 정보
  getNextEnhancement: (baseSkillId: string): SkillEnhancement | null => {
    const { playerSkillProgress } = get();
    const progress = playerSkillProgress.find(p => p.baseSkillId === baseSkillId);
    
    if (!progress) {
      return null;
    }
    
    // 다음 강화 가능한 단계 찾기
    for (let tier = progress.currentTier + 1; tier <= 5; tier++) {
      const enhancement = skillEnhancements.find(e => 
        e.baseSkillId === baseSkillId && e.tier === tier as SkillTier
      );
      
      if (enhancement) {
        return enhancement;
      }
    }
    
    return null; // 더 이상 강화할 수 없음
  },

  // 진행 상태 초기화 (개발용)
  resetProgress: () => {
    set({
      playerSkillProgress: [],
      selectedBaseSkillId: null,
      selectedTier: null,
      isEnhancing: false,
      enhancementResult: null
    });
  },

  clearEnhancementResult: () => {
    set({ enhancementResult: null });
  }
}));

// 개발용: 모든 기본 스킬을 1단계로 해금하는 함수
export const unlockAllBaseSkills = () => {
  const store = useSkillEnhancementStore.getState();
  baseSkills.forEach(skill => {
    store.unlockBaseSkill(skill.id);
  });
};