// 고급 연금술 시스템 데이터

// 연금술 특화 분야 시스템
export type AlchemySpecialization = {
  id: string;
  name: string;
  description: string;
  bonuses: {
    categoryBonus?: string[]; // 해당 카테고리 성공률 +10%
    expBonus?: number;        // 경험치 보너스 %
    materialSaving?: number;  // 재료 절약 확률 %
    qualityBonus?: number;    // 품질 향상 확률 %
  };
  unlockLevel: number;
};

export const alchemySpecializations: AlchemySpecialization[] = [
  {
    id: 'potion-master',
    name: '물약 명인',
    description: '물약 제작에 특화된 연금술사입니다.',
    bonuses: {
      categoryBonus: ['potion'],
      expBonus: 50,
      materialSaving: 15,
      qualityBonus: 20
    },
    unlockLevel: 5
  },
  {
    id: 'enhancement-expert',
    name: '강화 전문가',
    description: '장비 강화와 인챈트에 특화되었습니다.',
    bonuses: {
      categoryBonus: ['enhancement', 'enchantment'],
      expBonus: 30,
      qualityBonus: 35
    },
    unlockLevel: 7
  },
  {
    id: 'experimental-researcher',
    name: '실험 연구자',
    description: '새로운 레시피 발견과 실험에 특화되었습니다.',
    bonuses: {
      categoryBonus: ['experimental'],
      expBonus: 75,
      materialSaving: 25
    },
    unlockLevel: 10
  },
  {
    id: 'mass-producer',
    name: '대량 생산자',
    description: '효율적인 대량 생산에 특화되었습니다.',
    bonuses: {
      expBonus: 25,
      materialSaving: 30,
      qualityBonus: 10
    },
    unlockLevel: 8
  }
];

// 연금술 도구 및 설비 시스템
export type AlchemyEquipment = {
  id: string;
  name: string;
  description: string;
  effects: {
    successRateBonus?: number;
    expBonus?: number;
    qualityBonus?: number;
    batchSizeBonus?: number;
    categoryBonus?: string[];
  };
  cost: number;
  requiredLevel: number;
};

export const alchemyEquipment: AlchemyEquipment[] = [
  {
    id: 'basic-cauldron',
    name: '기본 가마솥',
    description: '연금술의 기본 도구입니다.',
    effects: {
      successRateBonus: 5
    },
    cost: 100,
    requiredLevel: 1
  },
  {
    id: 'enchanted-cauldron',
    name: '마법 가마솥',
    description: '마법이 깃든 고급 가마솥입니다.',
    effects: {
      successRateBonus: 15,
      expBonus: 25
    },
    cost: 500,
    requiredLevel: 5
  },
  {
    id: 'precision-scale',
    name: '정밀 저울',
    description: '재료를 정확히 측정하여 성공률을 높입니다.',
    effects: {
      successRateBonus: 8,
      qualityBonus: 15
    },
    cost: 200,
    requiredLevel: 3
  },
  {
    id: 'crystal-lens',
    name: '크리스탈 렌즈',
    description: '실험 과정을 명확히 관찰할 수 있습니다.',
    effects: {
      categoryBonus: ['experimental'],
      expBonus: 40
    },
    cost: 800,
    requiredLevel: 8
  },
  {
    id: 'mass-production-kit',
    name: '대량 생산 키트',
    description: '한 번에 여러 개의 아이템을 제작할 수 있습니다.',
    effects: {
      batchSizeBonus: 2,
      successRateBonus: -5 // 패널티
    },
    cost: 1200,
    requiredLevel: 10
  }
];

// 연금술 연구 시스템
export type AlchemyResearch = {
  id: string;
  name: string;
  description: string;
  requirements: {
    level: number;
    experiments?: number;    // 실험 횟수 요구
    materials?: string[];   // 특정 재료 사용 횟수
    recipes?: string[];     // 특정 레시피 성공 횟수
  };
  rewards: {
    newRecipes?: string[];
    permanentBonuses?: {
      successRate?: number;
      expGain?: number;
      materialEfficiency?: number;
    };
    specializations?: string[];
  };
};

export const alchemyResearches: AlchemyResearch[] = [
  {
    id: 'herb-mastery',
    name: '허브 숙련 연구',
    description: '다양한 허브의 특성을 연구합니다.',
    requirements: {
      level: 3,
      materials: ['mat-1'], // 붉은 허브 사용 20회
      experiments: 10
    },
    rewards: {
      newRecipes: ['concentrated-healing-potion', 'herb-enhancement'],
      permanentBonuses: {
        materialEfficiency: 10 // 허브류 재료 10% 절약
      }
    }
  },
  {
    id: 'crystal-research',
    name: '크리스탈 연구',
    description: '마법 크리스탈의 힘을 연구합니다.',
    requirements: {
      level: 4,
      materials: ['mat-2'], // 파란 크리스탈 사용 15회
      recipes: ['basic-mana-potion'] // 기본 마나 물약 10회 성공
    },
    rewards: {
      newRecipes: ['mana-crystal-enhancement', 'crystal-weapon'],
      permanentBonuses: {
        successRate: 5 // 크리스탈 관련 레시피 성공률 +5%
      }
    }
  },
  {
    id: 'advanced-combinations',
    name: '고급 조합 연구',
    description: '복잡한 재료 조합을 연구합니다.',
    requirements: {
      level: 6,
      experiments: 25,
      recipes: ['enhanced-healing-potion', 'fire-enhancement']
    },
    rewards: {
      newRecipes: ['ultimate-potion', 'multi-enhancement'],
      specializations: ['experimental-researcher']
    }
  }
];

// 실험 시스템 데이터
export type ExperimentType = {
  id: string;
  name: string;
  description: string;
  costMultiplier: number;  // 재료 비용 배수
  successRateModifier: number; // 성공률 수정치
  possibleOutcomes: {
    newRecipeChance: number;     // 새 레시피 발견 확률
    qualityBonusChance: number;  // 품질 향상 확률
    materialReturnChance: number; // 재료 반환 확률
    criticalSuccessChance: number; // 대성공 확률 (2배 결과)
  };
  minLevel: number;
};

export const experimentTypes: ExperimentType[] = [
  {
    id: 'careful-experiment',
    name: '신중한 실험',
    description: '안전하지만 보상도 제한적인 실험입니다.',
    costMultiplier: 0.8,
    successRateModifier: 20,
    possibleOutcomes: {
      newRecipeChance: 5,
      qualityBonusChance: 15,
      materialReturnChance: 30,
      criticalSuccessChance: 10
    },
    minLevel: 2
  },
  {
    id: 'standard-experiment',
    name: '표준 실험',
    description: '균형잡힌 위험과 보상의 실험입니다.',
    costMultiplier: 1.0,
    successRateModifier: 0,
    possibleOutcomes: {
      newRecipeChance: 10,
      qualityBonusChance: 20,
      materialReturnChance: 15,
      criticalSuccessChance: 15
    },
    minLevel: 1
  },
  {
    id: 'risky-experiment',
    name: '위험한 실험',
    description: '높은 위험과 높은 보상의 실험입니다.',
    costMultiplier: 1.5,
    successRateModifier: -20,
    possibleOutcomes: {
      newRecipeChance: 25,
      qualityBonusChance: 35,
      materialReturnChance: 5,
      criticalSuccessChance: 30
    },
    minLevel: 5
  },
  {
    id: 'breakthrough-attempt',
    name: '돌파 시도',
    description: '혁신적 발견을 위한 극도로 위험한 실험입니다.',
    costMultiplier: 2.0,
    successRateModifier: -40,
    possibleOutcomes: {
      newRecipeChance: 50,
      qualityBonusChance: 60,
      materialReturnChance: 0,
      criticalSuccessChance: 50
    },
    minLevel: 8
  }
];

// 품질 시스템
export type ItemQuality = 'poor' | 'common' | 'good' | 'excellent' | 'masterwork';

export const qualityModifiers: Record<ItemQuality, {
  namePrefix: string;
  effectMultiplier: number;
  valueMultiplier: number;
  color: string;
}> = {
  poor: {
    namePrefix: '조악한',
    effectMultiplier: 0.7,
    valueMultiplier: 0.5,
    color: '#8B4513'
  },
  common: {
    namePrefix: '',
    effectMultiplier: 1.0,
    valueMultiplier: 1.0,
    color: '#FFFFFF'
  },
  good: {
    namePrefix: '우수한',
    effectMultiplier: 1.3,
    valueMultiplier: 1.5,
    color: '#00FF00'
  },
  excellent: {
    namePrefix: '뛰어난',
    effectMultiplier: 1.6,
    valueMultiplier: 2.0,
    color: '#4169E1'
  },
  masterwork: {
    namePrefix: '명작',
    effectMultiplier: 2.0,
    valueMultiplier: 3.0,
    color: '#FFD700'
  }
};