import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AlchemySpecialization, ItemQuality } from '../data/alchemyAdvanced';
import { alchemySpecializations, alchemyEquipment, alchemyResearches, experimentTypes, qualityModifiers } from '../data/alchemyAdvanced';
import { advancedAlchemyRecipes } from '../data/advancedAlchemyRecipes';
import { basicAlchemyRecipes } from '../data/alchemyData';

import type { AlchemyRecipe } from '../types/alchemy';

interface AdvancedAlchemyState {
  // 기본 정보
  level: number;
  experience: number;
  specialization: string | null;
  
  // 연구 및 발견
  completedResearches: string[];
  knownRecipes: string[];
  experimentCount: number;
  
  // 장비 및 설비
  ownedEquipment: string[];
  activeEquipment: string[];
  
  // 실험 시스템
  lastExperimentResults: Array<{
    materials: string[];
    result: string;
    timestamp: number;
    quality?: ItemQuality;
  }>;
  
  // 통계
  totalCrafted: number;
  successfulCrafts: number;
  discoveredRecipes: number;
  masterworksCrafted: number;
}

interface AdvancedAlchemyActions {
  // 레벨링 및 진행
  gainExperience: (amount: number) => void;
  checkLevelUp: () => boolean;
  
  // 특화 시스템
  selectSpecialization: (specializationId: string) => boolean;
  getSpecializationBonus: () => AlchemySpecialization | null;
  
  // 연구 시스템
  startResearch: (researchId: string) => boolean;
  checkResearchProgress: (researchId: string) => number; // 0-100 진행도
  completeResearch: (researchId: string) => boolean;
  
  // 장비 시스템
  purchaseEquipment: (equipmentId: string) => boolean;
  activateEquipment: (equipmentId: string) => boolean;
  deactivateEquipment: (equipmentId: string) => void;
  getEquipmentBonuses: () => {
    successRateBonus: number;
    expBonus: number;
    qualityBonus: number;
    batchSizeBonus: number;
  };
  
  // 실험 시스템
  attemptExperiment: (
    recipeId: string, 
    experimentType: string,
    extraMaterials?: string[]
  ) => {
    success: boolean;
    quality: ItemQuality;
    results: Array<{ type: string; id: string; count: number; quality?: ItemQuality }>;
    newRecipeDiscovered?: string;
    message: string;
  };
  
  // 레시피 관리
  getAllAvailableRecipes: () => AlchemyRecipe[];
  discoverRecipe: (recipeId: string) => void;
  
  // 유틸리티
  calculateSuccessRate: (recipeId: string, experimentType?: string) => number;
  calculateQualityChance: () => number;
  resetProgress: () => void;
}

type AdvancedAlchemyStore = AdvancedAlchemyState & AdvancedAlchemyActions;

export const useAdvancedAlchemyStore = create<AdvancedAlchemyStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      level: 1,
      experience: 0,
      specialization: null,
      completedResearches: [],
      knownRecipes: ['basic-healing-potion', 'basic-mana-potion'],
      experimentCount: 0,
      ownedEquipment: ['basic-cauldron'],
      activeEquipment: ['basic-cauldron'],
      lastExperimentResults: [],
      totalCrafted: 0,
      successfulCrafts: 0,
      discoveredRecipes: 0,
      masterworksCrafted: 0,

      // 경험치 및 레벨업
      gainExperience: (amount) => {
        const state = get();
        const specializationBonus = state.getSpecializationBonus();
        const equipmentBonuses = state.getEquipmentBonuses();
        
        let totalBonus = 1;
        if (specializationBonus?.bonuses.expBonus) {
          totalBonus += specializationBonus.bonuses.expBonus / 100;
        }
        totalBonus += equipmentBonuses.expBonus / 100;
        
        const finalExp = Math.floor(amount * totalBonus);
        
        set((state) => ({
          experience: state.experience + finalExp
        }));
        
        if (get().checkLevelUp()) {
          console.log(`연금술 레벨업! 새로운 레벨: ${get().level}`);
        }
      },

      checkLevelUp: () => {
        const state = get();
        const expForNextLevel = state.level * 150; // 레벨당 필요 경험치 증가
        
        if (state.experience >= expForNextLevel) {
          set((prevState) => ({
            level: prevState.level + 1,
            experience: prevState.experience - expForNextLevel
          }));
          return true;
        }
        return false;
      },

      // 특화 시스템
      selectSpecialization: (specializationId) => {
        const state = get();
        const specialization = alchemySpecializations.find(s => s.id === specializationId);
        
        if (!specialization || state.level < specialization.unlockLevel || state.specialization) {
          return false;
        }
        
        set({ specialization: specializationId });
        console.log(`특화 분야 선택: ${specialization.name}`);
        return true;
      },

      getSpecializationBonus: () => {
        const state = get();
        return state.specialization 
          ? alchemySpecializations.find(s => s.id === state.specialization) || null 
          : null;
      },

      // 연구 시스템
      startResearch: (researchId) => {
        const research = alchemyResearches.find(r => r.id === researchId);
        const state = get();
        
        if (!research || state.level < research.requirements.level) {
          return false;
        }
        
        // 연구 시작 로직 (실제로는 더 복잡할 수 있음)
        console.log(`연구 시작: ${research.name}`);
        return true;
      },

      checkResearchProgress: (researchId) => {
        // 실제 진행도 계산 로직
        // 현재는 간단한 예시 (researchId 기반으로 진행도 계산)
        const hash = researchId.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
        return Math.abs(hash) % 100;
      },

      completeResearch: (researchId) => {
        const research = alchemyResearches.find(r => r.id === researchId);
        const state = get();
        
        if (!research || state.completedResearches.includes(researchId)) {
          return false;
        }
        
        set((prevState) => ({
          completedResearches: [...prevState.completedResearches, researchId],
          knownRecipes: [...prevState.knownRecipes, ...(research.rewards.newRecipes || [])]
        }));
        
        console.log(`연구 완료: ${research.name}`);
        return true;
      },

      // 장비 시스템
      purchaseEquipment: (equipmentId) => {
        const equipment = alchemyEquipment.find(e => e.id === equipmentId);
        const state = get();
        
        if (!equipment || state.level < equipment.requiredLevel) {
          return false;
        }
        
        // 실제로는 골드 차감 로직 필요
        set((prevState) => ({
          ownedEquipment: [...prevState.ownedEquipment, equipmentId]
        }));
        
        return true;
      },

      activateEquipment: (equipmentId) => {
        const state = get();
        
        if (!state.ownedEquipment.includes(equipmentId) || 
            state.activeEquipment.includes(equipmentId)) {
          return false;
        }
        
        set((prevState) => ({
          activeEquipment: [...prevState.activeEquipment, equipmentId]
        }));
        
        return true;
      },

      deactivateEquipment: (equipmentId) => {
        set((prevState) => ({
          activeEquipment: prevState.activeEquipment.filter(id => id !== equipmentId)
        }));
      },

      getEquipmentBonuses: () => {
        const state = get();
        const bonuses = {
          successRateBonus: 0,
          expBonus: 0,
          qualityBonus: 0,
          batchSizeBonus: 0
        };
        
        state.activeEquipment.forEach(equipmentId => {
          const equipment = alchemyEquipment.find(e => e.id === equipmentId);
          if (equipment) {
            bonuses.successRateBonus += equipment.effects.successRateBonus || 0;
            bonuses.expBonus += equipment.effects.expBonus || 0;
            bonuses.qualityBonus += equipment.effects.qualityBonus || 0;
            bonuses.batchSizeBonus += equipment.effects.batchSizeBonus || 0;
          }
        });
        
        return bonuses;
      },

      // 실험 시스템
      attemptExperiment: (recipeId, experimentTypeId, extraMaterials = []) => {
        // extraMaterials는 향후 고급 실험에서 사용될 추가 재료
        console.log('Extra materials for experiment:', extraMaterials);
        const recipe = [...basicAlchemyRecipes, ...advancedAlchemyRecipes]
          .find(r => r.id === recipeId);
        const experimentType = experimentTypes.find(e => e.id === experimentTypeId);
        const state = get();
        
        if (!recipe || !experimentType || state.level < experimentType.minLevel) {
          return {
            success: false,
            quality: 'poor' as ItemQuality,
            results: [],
            message: '실험을 진행할 수 없습니다.'
          };
        }
        
        // 성공률 계산
        const baseSuccessRate = recipe.successRate || 50;
        const equipmentBonuses = state.getEquipmentBonuses();
        const finalSuccessRate = Math.min(95, 
          baseSuccessRate + 
          experimentType.successRateModifier + 
          equipmentBonuses.successRateBonus
        );
        
        const isSuccess = Math.random() * 100 < finalSuccessRate;
        
        // 품질 결정
        let quality: ItemQuality = 'common';
        const qualityRoll = Math.random() * 100;
        const qualityBonus = equipmentBonuses.qualityBonus + 
          (state.getSpecializationBonus()?.bonuses.qualityBonus || 0);
        
        if (qualityRoll < 5 + qualityBonus * 0.3) quality = 'masterwork';
        else if (qualityRoll < 15 + qualityBonus * 0.5) quality = 'excellent';
        else if (qualityRoll < 35 + qualityBonus) quality = 'good';
        else if (qualityRoll > 85 - qualityBonus) quality = 'poor';
        
        // 실험 결과 처리
        set((prevState) => ({
          experimentCount: prevState.experimentCount + 1,
          totalCrafted: prevState.totalCrafted + 1,
          successfulCrafts: prevState.successfulCrafts + (isSuccess ? 1 : 0),
          masterworksCrafted: prevState.masterworksCrafted + (quality === 'masterwork' ? 1 : 0)
        }));
        
        if (isSuccess) {
          // 새 레시피 발견 확인
          const discoveryRoll = Math.random() * 100;
          let newRecipeDiscovered: string | undefined;
          
          if (discoveryRoll < experimentType.possibleOutcomes.newRecipeChance) {
            // 간단한 레시피 발견 로직
            const undiscoveredRecipes = advancedAlchemyRecipes
              .filter(r => !state.knownRecipes.includes(r.id))
              .map(r => r.id);
            
            if (undiscoveredRecipes.length > 0) {
              newRecipeDiscovered = undiscoveredRecipes[
                Math.floor(Math.random() * undiscoveredRecipes.length)
              ];
              
              set((prevState) => ({
                knownRecipes: [...prevState.knownRecipes, newRecipeDiscovered!],
                discoveredRecipes: prevState.discoveredRecipes + 1
              }));
            }
          }
          
          // 실제 아이템 생성 및 인벤토리 추가 로직
          const results = recipe.results.map(result => ({
            type: result.type,
            id: result.id,
            count: result.count,
            quality
          }));
          
          // 경험치 획득
          let expGain = recipe.difficulty === 'basic' ? 15 :
                       recipe.difficulty === 'intermediate' ? 30 :
                       recipe.difficulty === 'advanced' ? 60 : 100;
          
          if (quality === 'masterwork') expGain *= 2;
          else if (quality === 'excellent') expGain *= 1.5;
          
          get().gainExperience(expGain);
          
          return {
            success: true,
            quality,
            results,
            newRecipeDiscovered,
            message: `실험 성공! ${quality !== 'common' ? qualityModifiers[quality].namePrefix + ' ' : ''}제품이 완성되었습니다.`
          };
        } else {
          return {
            success: false,
            quality: 'poor',
            results: [],
            message: '실험이 실패했습니다.'
          };
        }
      },

      // 레시피 관리
      getAllAvailableRecipes: () => {
        const state = get();
        return [...basicAlchemyRecipes, ...advancedAlchemyRecipes]
          .filter(recipe => state.knownRecipes.includes(recipe.id));
      },

      discoverRecipe: (recipeId) => {
        set((prevState) => ({
          knownRecipes: [...new Set([...prevState.knownRecipes, recipeId])],
          discoveredRecipes: prevState.discoveredRecipes + 1
        }));
      },

      // 유틸리티
      calculateSuccessRate: (recipeId, experimentTypeId) => {
        const recipe = [...basicAlchemyRecipes, ...advancedAlchemyRecipes]
          .find(r => r.id === recipeId);
        const experimentType = experimentTypeId ? 
          experimentTypes.find(e => e.id === experimentTypeId) : null;
        const state = get();
        
        if (!recipe) return 0;
        
        const baseRate = recipe.successRate || 50;
        const equipmentBonuses = state.getEquipmentBonuses();
        const expModifier = experimentType?.successRateModifier || 0;
        
        return Math.min(95, Math.max(5, 
          baseRate + equipmentBonuses.successRateBonus + expModifier
        ));
      },

      calculateQualityChance: () => {
        const state = get();
        const equipmentBonuses = state.getEquipmentBonuses();
        const specializationBonus = state.getSpecializationBonus()?.bonuses.qualityBonus || 0;
        
        return equipmentBonuses.qualityBonus + specializationBonus;
      },

      resetProgress: () => {
        set({
          level: 1,
          experience: 0,
          specialization: null,
          completedResearches: [],
          knownRecipes: ['basic-healing-potion', 'basic-mana-potion'],
          experimentCount: 0,
          ownedEquipment: ['basic-cauldron'],
          activeEquipment: ['basic-cauldron'],
          lastExperimentResults: [],
          totalCrafted: 0,
          successfulCrafts: 0,
          discoveredRecipes: 0,
          masterworksCrafted: 0
        });
      }
    }),
    {
      name: 'advanced-alchemy-store'
    }
  )
);