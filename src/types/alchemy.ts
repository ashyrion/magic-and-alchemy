import type { Item, Skill, StatusEffect } from './gameTypes';

// 연금술 레시피 타입
export interface AlchemyRecipe {
  id: string;
  name: string;
  description: string;
  category: 'potion' | 'enhancement' | 'skill' | 'experimental';
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'master';
  
  // 필요 재료
  requiredMaterials: {
    materialId: string;
    count: number;
  }[];
  
  // 선택적 재료 (추가 효과)
  optionalMaterials?: {
    materialId: string;
    count: number;
    effect: string; // 추가되는 효과 설명
  }[];
  
  // 제작 결과
  results: AlchemyResult[];
  
  // 발견 조건
  discoveryCondition?: {
    type: 'materials' | 'skill_level' | 'experiment';
    condition: string;
  };
  
  // 성공률 (실험적 레시피용)
  successRate?: number;
}

// 연금술 결과 타입
export interface AlchemyResult {
  type: 'item' | 'skill' | 'enhancement';
  id: string;
  count: number;
  chance: number; // 0-100 확률
}

// 연금술 프로세스 결과
export interface AlchemyProcess {
  success: boolean;
  results: {
    type: 'item' | 'skill' | 'enhancement';
    item?: Item;
    skill?: Skill;
    enhancement?: Enhancement;
    count: number;
  }[];
  newRecipeDiscovered?: AlchemyRecipe;
  experienceGained: number;
  message: string;
}

// 강화 타입
export interface Enhancement {
  id: string;
  name: string;
  description: string;
  targetType: 'item' | 'skill' | 'character';
  effects: StatusEffect[];
  duration?: number; // 영구 강화면 undefined
}

// 연금술 상태
export interface AlchemyState {
  knownRecipes: AlchemyRecipe[];
  alchemyLevel: number;
  alchemyExperience: number;
  experimentHistory: {
    materials: string[];
    result: string;
    timestamp: number;
  }[];
}