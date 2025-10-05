import { create } from 'zustand';
import { basicAlchemyRecipes } from '../data/alchemyData';
import { useInventoryStore } from '../store/inventoryStore';

interface CraftingResult {
  success: boolean;
  message: string;
  results: Array<{
    type: 'item' | 'skill' | 'enhancement';
    id: string;
    count: number;
  }>;
  experienceGained: number;
}

interface AlchemyProcess {
  recipeId: string;
  success: boolean;
  results: Array<{
    type: 'item' | 'skill' | 'enhancement';
    id: string;
    count: number;
  }>;
  experienceGained: number;
}

interface AlchemyStore {
  // State
  level: number;
  experience: number;
  knownRecipes: string[];
  recentResults: AlchemyProcess[];
  
  // Actions
  addExperience: (amount: number) => void;
  learnRecipe: (recipeId: string) => void;
  getAvailableRecipes: () => typeof basicAlchemyRecipes;
  hasRequiredMaterials: (recipeId: string) => boolean;
  attemptCrafting: (recipeId: string) => CraftingResult;
  initializeAlchemy: () => void;
}

export const useAlchemyStore = create<AlchemyStore>((set, get) => ({
  // Initial state
  level: 1,
  experience: 0,
  knownRecipes: ['basic-healing-potion', 'basic-mana-potion'], // 기본 레시피들
  recentResults: [],
  
  // Actions
  addExperience: (amount) => {
    const currentExp = get().experience;
    const currentLevel = get().level;
    const newExp = currentExp + amount;
    
    // 레벨업 계산 (100 경험치당 1레벨)
    const newLevel = Math.floor(newExp / 100) + 1;
    
    set({
      experience: newExp,
      level: newLevel
    });
    
    if (newLevel > currentLevel) {
      console.log(`연금술 레벨업! ${currentLevel} -> ${newLevel}`);
    }
  },
  
  learnRecipe: (recipeId) => {
    const { knownRecipes } = get();
    if (!knownRecipes.includes(recipeId)) {
      set({
        knownRecipes: [...knownRecipes, recipeId]
      });
      console.log(`새로운 레시피 발견: ${recipeId}`);
    }
  },
  
  getAvailableRecipes: () => {
    const { knownRecipes, level } = get();
    
    return basicAlchemyRecipes.filter(recipe => {
      // 알고 있는 레시피만
      const isKnown = knownRecipes.includes(recipe.id);
      
      // 레벨 제한 (기본: 1, 중급: 3, 고급: 5)
      const levelRequirement = recipe.difficulty === 'basic' ? 1 :
                              recipe.difficulty === 'intermediate' ? 3 : 5;
      const meetLevelRequirement = level >= levelRequirement;
      
      return isKnown && meetLevelRequirement;
    });
  },
  
  hasRequiredMaterials: (recipeId) => {
    const recipe = basicAlchemyRecipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    
    const inventoryStore = useInventoryStore.getState();
    
    console.log('재료 확인 - 레시피:', recipe.name);
    console.log('현재 보유 재료:', inventoryStore.materials.map(m => `${m.name}(${m.id})`));
    
    const hasAll = recipe.requiredMaterials.every(required => {
      const materialCount = inventoryStore.materials
        .filter(material => material.id === required.materialId)
        .length;
      
      console.log(`${required.materialId} 필요: ${required.count}, 보유: ${materialCount}`);
      return materialCount >= required.count;
    });
    
    console.log('제작 가능 여부:', hasAll);
    return hasAll;
  },
  
  attemptCrafting: (recipeId) => {
    const recipe = basicAlchemyRecipes.find(r => r.id === recipeId);
    if (!recipe) {
      return {
        success: false,
        message: '레시피를 찾을 수 없습니다.',
        results: [],
        experienceGained: 0
      };
    }
    
    if (!get().hasRequiredMaterials(recipeId)) {
      return {
        success: false,
        message: '필요한 재료가 부족합니다.',
        results: [],
        experienceGained: 0
      };
    }
    
    // 성공률 계산 (레벨에 따라 보너스)
    const levelBonus = Math.min(get().level * 2, 20); // 최대 20% 보너스
    const actualSuccessRate = Math.min((recipe.successRate || 50) + levelBonus, 95);
    
    const isSuccess = Math.random() * 100 < actualSuccessRate;
    
    const inventoryStore = useInventoryStore.getState();
    
    if (isSuccess) {
      // 성공 시 결과 결정
      const results: Array<{
        type: 'item' | 'skill' | 'enhancement';
        id: string;
        count: number;
      }> = [];
      
      recipe.results.forEach(result => {
        const roll = Math.random() * 100;
        if (roll < result.chance) {
          results.push({
            type: result.type,
            id: result.id,
            count: result.count
          });
          
          // 제작된 아이템을 인벤토리에 추가
          if (result.type === 'item') {
            console.log(`${result.id} 아이템 ${result.count}개 제작 시작`);
            
            for (let i = 0; i < result.count; i++) {
              // 더 고유한 ID 생성을 위해 Math.random() 추가
              const uniqueId = `${result.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
              
              const alchemyItem = {
                id: uniqueId,
                name: result.id === 'healing-potion-basic' ? '기본 치유 물약' :
                      result.id === 'mana-potion-basic' ? '기본 마나 물약' :
                      result.id === 'healing-potion-enhanced' ? '강화 치유 물약' :
                      result.id === 'super-potion' ? '만능 물약' : result.id,
                type: 'consumable' as const,
                weight: 0.3,
                description: result.id === 'healing-potion-basic' ? '40의 체력을 즉시 회복합니다.' :
                            result.id === 'mana-potion-basic' ? '30의 마나를 즉시 회복합니다.' :
                            result.id === 'healing-potion-enhanced' ? '80의 체력을 즉시 회복합니다.' :
                            result.id === 'super-potion' ? '100의 체력과 50의 마나를 동시에 회복합니다.' : '연금술로 제작된 아이템입니다.',
                // 원본 타입 정보 저장 (전투에서 사용할 때 필요)
                originalId: result.id
              };
              
              console.log(`연금술로 제작된 아이템 ${i + 1}/${result.count}:`, alchemyItem);
              
              // 인벤토리 공간과 무게 체크 먼저
              const canAddSpace = inventoryStore.hasSpace();
              const canAddWeight = inventoryStore.canAddWeight(alchemyItem.weight);
              console.log(`인벤토리 상태 체크 - 공간: ${canAddSpace}, 무게 가능: ${canAddWeight}`);
              
              if (!canAddSpace || !canAddWeight) {
                console.log(`아이템 ${i + 1}/${result.count} 추가 불가 - 공간(${canAddSpace}) 또는 무게(${canAddWeight}) 부족`);
                continue;
              }
              
              const success = inventoryStore.addItem(alchemyItem);
              console.log(`아이템 추가 결과 ${i + 1}/${result.count}:`, success);
              
              if (success) {
                console.log(`${alchemyItem.name} 인벤토리에 성공적으로 추가됨 (ID: ${uniqueId})`);
              } else {
                console.log(`${alchemyItem.name} 인벤토리 추가 실패`);
              }
            }
            
            console.log('제작 완료 후 현재 인벤토리 아이템 수:', inventoryStore.items.length);
          }
        }
      });
      
      // 재료 소모 (개선된 버전)
      recipe.requiredMaterials.forEach(required => {
        console.log(`${required.materialId} ${required.count}개 소모 시작`);
        for (let i = 0; i < required.count; i++) {
          const success = inventoryStore.removeMaterial(required.materialId);
          console.log(`${required.materialId} 소모 ${i + 1}/${required.count}: ${success ? '성공' : '실패'}`);
        }
        
        // 소모 후 현재 재료 상태 확인
        const remainingCount = inventoryStore.materials.filter(m => m.id === required.materialId).length;
        console.log(`${required.materialId} 남은 개수: ${remainingCount}`);
      });
      
      // 경험치 획득
      const expGain = recipe.difficulty === 'basic' ? 10 : 
                     recipe.difficulty === 'intermediate' ? 25 : 50;
      get().addExperience(expGain);
      
      const process: AlchemyProcess = {
        recipeId,
        success: true,
        results,
        experienceGained: expGain
      };
      
      // 최근 결과에 추가
      set(state => ({
        recentResults: [process, ...state.recentResults].slice(0, 10)
      }));
      
      return {
        success: true,
        message: `${recipe.name} 제작에 성공했습니다!`,
        results,
        experienceGained: expGain
      };
    } else {
      // 실패 시에도 재료 일부 소모 및 소량 경험치 획득
      recipe.requiredMaterials.forEach(required => {
        const consumeCount = Math.ceil(required.count * 0.5); // 50% 소모
        console.log(`실패로 인한 ${required.materialId} ${consumeCount}개 소모 시작`);
        for (let i = 0; i < consumeCount; i++) {
          const success = inventoryStore.removeMaterial(required.materialId);
          console.log(`실패 소모 ${required.materialId} ${i + 1}/${consumeCount}: ${success ? '성공' : '실패'}`);
        }
      });
      
      const expGain = 5; // 실패 시 소량 경험치
      get().addExperience(expGain);
      
      const process: AlchemyProcess = {
        recipeId,
        success: false,
        results: [],
        experienceGained: expGain
      };
      
      set(state => ({
        recentResults: [process, ...state.recentResults].slice(0, 10)
      }));
      
      return {
        success: false,
        message: `${recipe.name} 제작에 실패했습니다. 재료 일부가 소모되었습니다.`,
        results: [],
        experienceGained: expGain
      };
    }
  },
  
  initializeAlchemy: () => {
    // 연금술 시스템 초기화 (필요시)
    console.log('연금술 시스템이 초기화되었습니다.');
  }
}));