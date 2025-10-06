import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { alchemyMaterials, upgradeRequirements, skillUpgradeRequirements } from '../data/alchemyMaterials';
import { newAlchemyRecipes, calculateRecipeDropChance, type NewAlchemyRecipe } from '../data/alchemyRecipes';

// 아이템 등급 정의
export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique' | 'legendary';

// 새로운 연금술 스토어 상태
interface NewAlchemyState {
  // 기본 정보
  level: number;
  experience: number;
  expToNext: number;
  
  // 인벤토리 - 연금술 재료
  materials: { [materialId: string]: number };
  
  // 발견한 레시피들
  knownRecipes: string[];
  
  // 통계
  totalCrafted: number;
  totalItemsUpgraded: number;
  totalSkillsUpgraded: number;
  monstersKilled: number;
  
  // 제작 결과 메시지
  lastCraftResult: string | null;
}

interface NewAlchemyActions {
  // 기본 액션들
  gainExperience: (amount: number) => void;
  addMaterial: (materialId: string, amount: number) => void;
  removeMaterial: (materialId: string, amount: number) => boolean;
  
  // 레시피 관리
  discoverRecipe: (recipeId: string) => void;
  getAvailableRecipes: () => NewAlchemyRecipe[];
  
  // 제작 시스템
  craftPotion: (recipeId: string) => { success: boolean; message: string; results?: Array<{ type: string; id: string; count: number; quality?: string }> };
  
  // 아이템 업그레이드 시스템
  upgradeItem: (
    item: { name: string; rarity: ItemRarity; [key: string]: unknown }, 
    fromRarity: ItemRarity, 
    toRarity: ItemRarity, 
    useCatalyst?: boolean
  ) => { success: boolean; message: string; upgradedItem?: { name: string; rarity: ItemRarity; [key: string]: unknown } };
  
  // 스킬 업그레이드 시스템
  upgradeSkill: (
    skillId: string, 
    currentTier: number, 
    useCatalyst?: boolean
  ) => { success: boolean; message: string };
  
  // 몬스터 처치 시 드롭 처리
  onMonsterKill: (monsterLevel: number, monsterType?: string) => {
    materials: { [materialId: string]: number };
    recipes: string[];
  };
  
  // 유틸리티
  canCraftRecipe: (recipeId: string) => boolean;
  canUpgradeItem: (fromRarity: ItemRarity, toRarity: ItemRarity) => boolean;
  canUpgradeSkill: (tier: number) => boolean;
  calculateUpgradeSuccess: (fromRarity: ItemRarity, toRarity: ItemRarity, useCatalyst?: boolean) => number;
  
  // 리셋
  resetProgress: () => void;
}

type NewAlchemyStore = NewAlchemyState & NewAlchemyActions;

export const useNewAlchemyStore = create<NewAlchemyStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      level: 1,
      experience: 0,
      expToNext: 100,
      materials: {
        'essence-fragment': 10, // 시작 재료
        'monster-blood': 5,
        'bone-dust': 3
      },
      knownRecipes: ['basic-health-potion', 'basic-mana-potion'], // 기본 레시피
      totalCrafted: 0,
      totalItemsUpgraded: 0,
      totalSkillsUpgraded: 0,
      monstersKilled: 0,
      lastCraftResult: null,

      // 경험치 및 레벨업
      gainExperience: (amount) => {
        set((state) => {
          const newExp = state.experience + amount;
          let newLevel = state.level;
          let remainingExp = newExp;
          let expForNext = state.expToNext;
          
          // 레벨업 체크
          while (remainingExp >= expForNext) {
            remainingExp -= expForNext;
            newLevel++;
            expForNext = newLevel * 100; // 레벨당 필요 경험치 증가
            console.log(`연금술 레벨업! 새로운 레벨: ${newLevel}`);
          }
          
          return {
            level: newLevel,
            experience: remainingExp,
            expToNext: expForNext - remainingExp
          };
        });
      },

      // 재료 관리
      addMaterial: (materialId, amount) => {
        set((state) => ({
          materials: {
            ...state.materials,
            [materialId]: (state.materials[materialId] || 0) + amount
          }
        }));
      },

      removeMaterial: (materialId, amount) => {
        const state = get();
        const currentAmount = state.materials[materialId] || 0;
        
        if (currentAmount < amount) {
          return false;
        }
        
        set((prevState) => ({
          materials: {
            ...prevState.materials,
            [materialId]: currentAmount - amount
          }
        }));
        
        return true;
      },

      // 레시피 관리
      discoverRecipe: (recipeId) => {
        set((state) => ({
          knownRecipes: [...new Set([...state.knownRecipes, recipeId])]
        }));
        console.log(`새로운 레시피 발견: ${recipeId}`);
      },

      getAvailableRecipes: () => {
        const state = get();
        return newAlchemyRecipes.filter(recipe => {
          // 레시피를 알고 있는지 확인
          if (!state.knownRecipes.includes(recipe.id)) return false;
          
          // 발견 조건 확인
          if (recipe.discoveryRequirements) {
            const req = recipe.discoveryRequirements;
            if (req.level && state.level < req.level) return false;
            if (req.monstersKilled && state.monstersKilled < req.monstersKilled) return false;
            if (req.itemsUpgraded && state.totalItemsUpgraded < req.itemsUpgraded) return false;
            if (req.otherRecipes) {
              const hasAllPrereqs = req.otherRecipes.every(prereq => 
                state.knownRecipes.includes(prereq)
              );
              if (!hasAllPrereqs) return false;
            }
          }
          
          return true;
        });
      },

      // 제작 시스템
      craftPotion: (recipeId) => {
        const state = get();
        const recipe = newAlchemyRecipes.find(r => r.id === recipeId);
        
        if (!recipe) {
          return { success: false, message: '알 수 없는 레시피입니다.' };
        }
        
        if (!state.knownRecipes.includes(recipeId)) {
          return { success: false, message: '아직 발견하지 못한 레시피입니다.' };
        }
        
        // 재료 확인
        for (const material of recipe.materials) {
          const owned = state.materials[material.id] || 0;
          if (owned < material.count) {
            const materialData = alchemyMaterials.find(m => m.id === material.id);
            return { 
              success: false, 
              message: `${materialData?.name || material.id}이(가) 부족합니다. (보유: ${owned}, 필요: ${material.count})` 
            };
          }
        }
        
        // 성공률 체크
        const isSuccess = Math.random() * 100 < recipe.successRate;
        
        if (isSuccess) {
          // 재료 소모
          recipe.materials.forEach(material => {
            get().removeMaterial(material.id, material.count);
          });
          
          // 결과 아이템 생성 (실제로는 인벤토리에 추가해야 함)
          const results = recipe.results;
          
          // 경험치 획득
          get().gainExperience(recipe.experienceGain);
          
          // 통계 업데이트
          set((prevState) => ({
            totalCrafted: prevState.totalCrafted + 1,
            lastCraftResult: `${recipe.name} 제작에 성공했습니다!`
          }));
          
          return { 
            success: true, 
            message: `${recipe.name} 제작에 성공했습니다!`,
            results
          };
        } else {
          // 실패 시에도 재료의 일부는 소모
          recipe.materials.forEach(material => {
            const lossAmount = Math.ceil(material.count * 0.5); // 50% 손실
            get().removeMaterial(material.id, lossAmount);
          });
          
          set((state) => ({
            ...state,
            lastCraftResult: `${recipe.name} 제작에 실패했습니다...`
          }));
          
          return { success: false, message: `${recipe.name} 제작에 실패했습니다...` };
        }
      },

      // 아이템 업그레이드 시스템
      upgradeItem: (item, fromRarity, toRarity, useCatalyst = false) => {
        const state = get();
        
        // 업그레이드 경로 확인
        const upgradeKey = `${fromRarity}-to-${toRarity.replace('unique', 'unique')}` as keyof typeof upgradeRequirements;
        const requirements = upgradeRequirements[upgradeKey];
        
        if (!requirements) {
          return { success: false, message: '잘못된 업그레이드 경로입니다.' };
        }
        
        // 재료 확인
        for (const material of requirements.materials) {
          const owned = state.materials[material.id] || 0;
          if (owned < material.count) {
            const materialData = alchemyMaterials.find(m => m.id === material.id);
            return { 
              success: false, 
              message: `${materialData?.name || material.id}이(가) 부족합니다.` 
            };
          }
        }
        
        // 성공률 계산
        let successRate = requirements.successRate;
        if (useCatalyst) {
          // 촉진제 사용 시 성공률 증가
          const catalystBonus = state.materials['upgrade-catalyst'] ? 10 : 
                              state.materials['upgrade-catalyst-advanced'] ? 25 : 0;
          successRate = Math.min(95, successRate + catalystBonus);
          
          // 촉진제 소모
          if (state.materials['upgrade-catalyst-advanced'] && state.materials['upgrade-catalyst-advanced'] > 0) {
            get().removeMaterial('upgrade-catalyst-advanced', 1);
          } else if (state.materials['upgrade-catalyst'] && state.materials['upgrade-catalyst'] > 0) {
            get().removeMaterial('upgrade-catalyst', 1);
          }
        }
        
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
          // 재료 소모
          requirements.materials.forEach(material => {
            get().removeMaterial(material.id, material.count);
          });
          
          // 업그레이드된 아이템 생성 (여기서는 간단하게 등급만 변경)
          const upgradedItem = {
            ...item,
            rarity: toRarity,
            // 여기에 추가 접두사/접미사 추가 로직
          };
          
          // 경험치 및 통계 업데이트
          get().gainExperience(requirements.successRate); // 난이도에 따른 경험치
          
          set((prevState) => ({
            totalItemsUpgraded: prevState.totalItemsUpgraded + 1,
            lastCraftResult: `${item.name}을(를) ${toRarity} 등급으로 업그레이드했습니다!`
          }));
          
          return { 
            success: true, 
            message: `${item.name}을(를) ${toRarity} 등급으로 업그레이드했습니다!`,
            upgradedItem
          };
        } else {
          // 실패 시 재료 일부 손실
          requirements.materials.forEach(material => {
            const lossAmount = Math.ceil(material.count * 0.3); // 30% 손실
            get().removeMaterial(material.id, lossAmount);
          });
          
          set((state) => ({
            ...state,
            lastCraftResult: `${item.name} 업그레이드에 실패했습니다...`
          }));
          
          return { success: false, message: `${item.name} 업그레이드에 실패했습니다...` };
        }
      },

      // 스킬 업그레이드 시스템
      upgradeSkill: (skillId, currentTier, useCatalyst = false) => {
        const state = get();
        
        const tierKey = `skill-tier-${currentTier + 1}` as keyof typeof skillUpgradeRequirements;
        const requirements = skillUpgradeRequirements[tierKey];
        
        if (!requirements) {
          return { success: false, message: '더 이상 업그레이드할 수 없습니다.' };
        }
        
        // 재료 확인
        for (const material of requirements.materials) {
          const owned = state.materials[material.id] || 0;
          if (owned < material.count) {
            const materialData = alchemyMaterials.find(m => m.id === material.id);
            return { 
              success: false, 
              message: `${materialData?.name || material.id}이(가) 부족합니다.` 
            };
          }
        }
        
        // 성공률 계산 (스킬 업그레이드용)
        let successRate = requirements.successRate;
        if (useCatalyst) {
          const catalystBonus = state.materials['upgrade-catalyst-advanced'] ? 15 : 
                              state.materials['upgrade-catalyst'] ? 8 : 0;
          successRate = Math.min(90, successRate + catalystBonus);
          
          // 촉진제 소모
          if (state.materials['upgrade-catalyst-advanced'] && state.materials['upgrade-catalyst-advanced'] > 0) {
            get().removeMaterial('upgrade-catalyst-advanced', 1);
          } else if (state.materials['upgrade-catalyst'] && state.materials['upgrade-catalyst'] > 0) {
            get().removeMaterial('upgrade-catalyst', 1);
          }
        }
        
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
          // 재료 소모
          requirements.materials.forEach(material => {
            get().removeMaterial(material.id, material.count);
          });
          
          // 경험치 및 통계 업데이트
          get().gainExperience(requirements.successRate * 2); // 스킬 업그레이드는 더 많은 경험치
          
          set((prevState) => ({
            totalSkillsUpgraded: prevState.totalSkillsUpgraded + 1,
            lastCraftResult: `${skillId} 스킬을 Tier ${currentTier + 1}로 업그레이드했습니다!`
          }));
          
          return { 
            success: true, 
            message: `${skillId} 스킬을 Tier ${currentTier + 1}로 업그레이드했습니다!`
          };
        } else {
          // 실패 시 재료 일부 손실
          requirements.materials.forEach(material => {
            const lossAmount = Math.ceil(material.count * 0.4); // 40% 손실
            get().removeMaterial(material.id, lossAmount);
          });
          
          set((state) => ({
            ...state,
            lastCraftResult: `${skillId} 스킬 업그레이드에 실패했습니다...`
          }));
          
          return { success: false, message: `${skillId} 스킬 업그레이드에 실패했습니다...` };
        }
      },

      // 몬스터 처치 시 드롭 처리
      onMonsterKill: (monsterLevel) => {
        const state = get();
        const droppedMaterials: { [materialId: string]: number } = {};
        const droppedRecipes: string[] = [];
        
        // 몬스터 레벨에 따른 드롭률 보정
        const levelMultiplier = Math.min(1 + (monsterLevel * 0.05), 3); // 최대 3배
        
        // 재료 드롭 체크
        alchemyMaterials.forEach(material => {
          const dropChance = material.dropRate * levelMultiplier;
          if (Math.random() * 100 < dropChance) {
            const dropAmount = Math.ceil(Math.random() * 3); // 1-3개
            droppedMaterials[material.id] = dropAmount;
            get().addMaterial(material.id, dropAmount);
          }
        });
        
        // 레시피 드롭 체크
        newAlchemyRecipes.forEach(recipe => {
          if (state.knownRecipes.includes(recipe.id)) return; // 이미 알고 있는 레시피
          
          const dropChance = calculateRecipeDropChance(recipe, state.level, { discoveryBonus: state.level * 0.1 });
          if (Math.random() * 100 < dropChance) {
            droppedRecipes.push(recipe.id);
            get().discoverRecipe(recipe.id);
          }
        });
        
        // 몬스터 처치 카운트 증가
        set((prevState) => ({
          monstersKilled: prevState.monstersKilled + 1
        }));
        
        return { materials: droppedMaterials, recipes: droppedRecipes };
      },

      // 유틸리티 함수들
      canCraftRecipe: (recipeId) => {
        const state = get();
        const recipe = newAlchemyRecipes.find(r => r.id === recipeId);
        
        if (!recipe || !state.knownRecipes.includes(recipeId)) return false;
        
        return recipe.materials.every(material => 
          (state.materials[material.id] || 0) >= material.count
        );
      },

      canUpgradeItem: (fromRarity, toRarity) => {
        const state = get();
        const upgradeKey = `${fromRarity}-to-${toRarity.replace('unique', 'unique')}` as keyof typeof upgradeRequirements;
        const requirements = upgradeRequirements[upgradeKey];
        
        if (!requirements) return false;
        
        return requirements.materials.every(material => 
          (state.materials[material.id] || 0) >= material.count
        );
      },

      canUpgradeSkill: (tier) => {
        const state = get();
        const tierKey = `skill-tier-${tier + 1}` as keyof typeof skillUpgradeRequirements;
        const requirements = skillUpgradeRequirements[tierKey];
        
        if (!requirements) return false;
        
        return requirements.materials.every(material => 
          (state.materials[material.id] || 0) >= material.count
        );
      },

      calculateUpgradeSuccess: (fromRarity, toRarity, useCatalyst = false) => {
        const state = get();
        const upgradeKey = `${fromRarity}-to-${toRarity.replace('unique', 'unique')}` as keyof typeof upgradeRequirements;
        const requirements = upgradeRequirements[upgradeKey];
        
        if (!requirements) return 0;
        
        let successRate = requirements.successRate;
        
        if (useCatalyst) {
          const catalystBonus = state.materials['upgrade-catalyst-advanced'] ? 25 : 
                              state.materials['upgrade-catalyst'] ? 10 : 0;
          successRate = Math.min(95, successRate + catalystBonus);
        }
        
        return successRate;
      },

      // 진행상황 리셋
      resetProgress: () => {
        set({
          level: 1,
          experience: 0,
          expToNext: 100,
          materials: {
            'essence-fragment': 10,
            'monster-blood': 5,
            'bone-dust': 3
          },
          knownRecipes: ['basic-health-potion', 'basic-mana-potion'],
          totalCrafted: 0,
          totalItemsUpgraded: 0,
          totalSkillsUpgraded: 0,
          monstersKilled: 0,
          lastCraftResult: null
        });
      }
    }),
    {
      name: 'new-alchemy-store'
    }
  )
);