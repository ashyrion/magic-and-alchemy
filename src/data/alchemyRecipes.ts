import type { Recipe } from '../types/gameTypes';

// 연금술 레시피 데이터 - 난이도별 분류
export const alchemyRecipes: Recipe[] = [
  // === 초급 레시피 (성공률 80%) ===
  {
    id: 'recipe-health-potion-small',
    name: '작은 체력 물약',
    materials: [
      { itemId: 'herb-red-grass', count: 2 },
      { itemId: 'crystal-clear-shard', count: 1 }
    ],
    result: {
      id: 'potion-health-small',
      name: '작은 체력 물약',
      type: 'consumable',
      weight: 0.2,
      description: 'HP를 30 회복합니다.',
      stats: { hp: 30 }
    }
  },
  {
    id: 'recipe-mana-potion-small',
    name: '작은 마나 물약',
    materials: [
      { itemId: 'herb-blue-flower', count: 2 },
      { itemId: 'crystal-clear-shard', count: 1 }
    ],
    result: {
      id: 'potion-mana-small',
      name: '작은 마나 물약',
      type: 'consumable',
      weight: 0.2,
      description: 'MP를 25 회복합니다.',
      stats: { mp: 25 }
    }
  },
  {
    id: 'recipe-basic-weapon-oil',
    name: '기본 무기 오일',
    materials: [
      { itemId: 'mineral-iron-ore', count: 1 },
      { itemId: 'herb-red-grass', count: 1 }
    ],
    result: {
      id: 'oil-weapon-basic',
      name: '기본 무기 오일',
      type: 'consumable',
      weight: 0.15,
      description: '무기에 발라 공격력을 일시적으로 5 증가시킵니다.',
      stats: { attack: 5 }
    }
  },

  // === 중급 레시피 (성공률 60%) ===
  {
    id: 'recipe-health-potion-medium',
    name: '체력 물약',
    materials: [
      { itemId: 'herb-red-grass', count: 3 },
      { itemId: 'herb-golden-root', count: 1 },
      { itemId: 'crystal-mana-essence', count: 1 }
    ],
    result: {
      id: 'potion-health-medium',
      name: '체력 물약',
      type: 'consumable',
      weight: 0.3,
      description: 'HP를 60 회복합니다.',
      stats: { hp: 60 }
    }
  },
  {
    id: 'recipe-mana-potion-medium',
    name: '마나 물약',
    materials: [
      { itemId: 'herb-blue-flower', count: 3 },
      { itemId: 'crystal-mana-essence', count: 2 }
    ],
    result: {
      id: 'potion-mana-medium',
      name: '마나 물약',
      type: 'consumable',
      weight: 0.3,
      description: 'MP를 50 회복합니다.',
      stats: { mp: 50 }
    }
  },
  {
    id: 'recipe-strength-elixir',
    name: '힘의 비약',
    materials: [
      { itemId: 'herb-golden-root', count: 2 },
      { itemId: 'essence-fire-spark', count: 1 },
      { itemId: 'mineral-silver-dust', count: 1 }
    ],
    result: {
      id: 'elixir-strength',
      name: '힘의 비약',
      type: 'consumable',
      weight: 0.25,
      description: '일정 시간 동안 힘을 10 증가시킵니다.',
      stats: { strength: 10 }
    }
  },
  {
    id: 'recipe-intelligence-elixir',
    name: '지혜의 비약',
    materials: [
      { itemId: 'crystal-mana-essence', count: 2 },
      { itemId: 'essence-ice-fragment', count: 1 },
      { itemId: 'mineral-silver-dust', count: 1 }
    ],
    result: {
      id: 'elixir-intelligence',
      name: '지혜의 비약',
      type: 'consumable',
      weight: 0.25,
      description: '일정 시간 동안 지능을 10 증가시킵니다.',
      stats: { intelligence: 10 }
    }
  },
  {
    id: 'recipe-fire-resistance-potion',
    name: '화염 저항 물약',
    materials: [
      { itemId: 'essence-ice-fragment', count: 2 },
      { itemId: 'mineral-silver-dust', count: 1 },
      { itemId: 'herb-blue-flower', count: 2 }
    ],
    result: {
      id: 'potion-fire-resistance',
      name: '화염 저항 물약',
      type: 'consumable',
      weight: 0.3,
      description: '일정 시간 동안 화염 저항력을 25 증가시킵니다.',
      stats: { fireResist: 25 }
    }
  },

  // === 고급 레시피 (성공률 40%) ===
  {
    id: 'recipe-health-potion-large',
    name: '큰 체력 물약',
    materials: [
      { itemId: 'herb-golden-root', count: 3 },
      { itemId: 'crystal-mana-essence', count: 2 },
      { itemId: 'essence-dragon-scale', count: 1 }
    ],
    result: {
      id: 'potion-health-large',
      name: '큰 체력 물약',
      type: 'consumable',
      weight: 0.4,
      description: 'HP를 120 회복합니다.',
      stats: { hp: 120 }
    }
  },
  {
    id: 'recipe-full-restore-potion',
    name: '완전 회복 물약',
    materials: [
      { itemId: 'herb-golden-root', count: 2 },
      { itemId: 'crystal-mana-essence', count: 3 },
      { itemId: 'mineral-silver-dust', count: 2 }
    ],
    result: {
      id: 'potion-full-restore',
      name: '완전 회복 물약',
      type: 'consumable',
      weight: 0.35,
      description: 'HP와 MP를 완전히 회복합니다.',
      stats: { hp: 999, mp: 999 }
    }
  },
  {
    id: 'recipe-enhanced-weapon-oil',
    name: '강화 무기 오일',
    materials: [
      { itemId: 'mineral-mythril-chunk', count: 1 },
      { itemId: 'essence-fire-spark', count: 2 },
      { itemId: 'mineral-silver-dust', count: 2 }
    ],
    result: {
      id: 'oil-weapon-enhanced',
      name: '강화 무기 오일',
      type: 'consumable',
      weight: 0.2,
      description: '무기에 발라 공격력을 일시적으로 15 증가시킵니다.',
      stats: { attack: 15, criticalRate: 5 }
    }
  },
  {
    id: 'recipe-haste-potion',
    name: '신속 물약',
    materials: [
      { itemId: 'essence-lightning-core', count: 2 },
      { itemId: 'crystal-mana-essence', count: 2 },
      { itemId: 'herb-blue-flower', count: 3 }
    ],
    result: {
      id: 'potion-haste',
      name: '신속 물약',
      type: 'consumable',
      weight: 0.25,
      description: '일정 시간 동안 민첩성을 15 증가시킵니다.',
      stats: { agility: 15, speed: 10 }
    }
  },

  // === 전설 레시피 (성공률 20%) ===
  {
    id: 'recipe-philosophers-elixir',
    name: '현자의 영약',
    materials: [
      { itemId: 'crystal-philosophers-fragment', count: 3 },
      { itemId: 'essence-dragon-scale', count: 2 },
      { itemId: 'mineral-mythril-chunk', count: 2 },
      { itemId: 'crystal-mana-essence', count: 5 }
    ],
    result: {
      id: 'elixir-philosophers',
      name: '현자의 영약',
      type: 'consumable',
      weight: 0.1,
      description: '모든 기본 스탯을 영구적으로 5씩 증가시킵니다.',
      stats: { 
        strength: 5, 
        intelligence: 5, 
        agility: 5, 
        vitality: 5, 
        wisdom: 5,
        maxHp: 50,
        maxMp: 50
      }
    }
  },
  {
    id: 'recipe-immortality-potion',
    name: '불멸의 물약',
    materials: [
      { itemId: 'crystal-philosophers-fragment', count: 5 },
      { itemId: 'essence-dragon-scale', count: 3 },
      { itemId: 'herb-golden-root', count: 10 },
      { itemId: 'crystal-mana-essence', count: 8 }
    ],
    result: {
      id: 'potion-immortality',
      name: '불멸의 물약',
      type: 'consumable',
      weight: 0.05,
      description: '전투에서 사망하더라도 한 번 HP 1로 부활합니다.',
      stats: { recovery: 100 }
    }
  },
  {
    id: 'recipe-master-weapon-oil',
    name: '명인의 무기 오일',
    materials: [
      { itemId: 'mineral-mythril-chunk', count: 3 },
      { itemId: 'essence-fire-spark', count: 5 },
      { itemId: 'essence-lightning-core', count: 3 },
      { itemId: 'crystal-philosophers-fragment', count: 1 }
    ],
    result: {
      id: 'oil-weapon-master',
      name: '명인의 무기 오일',
      type: 'consumable',
      weight: 0.15,
      description: '무기에 발라 공격력 25, 크리티컬 확률 15% 증가.',
      stats: { attack: 25, criticalRate: 15, criticalDamage: 50 }
    }
  }
];

// 레시피를 난이도별로 분류하는 헬퍼 함수들
export const getRecipesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'legendary'): Recipe[] => {
  const ranges = {
    beginner: [0, 2],
    intermediate: [3, 8],
    advanced: [9, 12],
    legendary: [13, 15]
  };
  
  const [start, end] = ranges[difficulty];
  return alchemyRecipes.slice(start, end + 1);
};

export const getRecipeById = (id: string): Recipe | undefined => {
  return alchemyRecipes.find(recipe => recipe.id === id);
};

// 기본 성공률 정의 (레시피 난이도에 따라)
export const getBaseSuccessRate = (recipeId: string): number => {
  const beginnerRecipes = getRecipesByDifficulty('beginner').map(r => r.id);
  const intermediateRecipes = getRecipesByDifficulty('intermediate').map(r => r.id);
  const advancedRecipes = getRecipesByDifficulty('advanced').map(r => r.id);
  const legendaryRecipes = getRecipesByDifficulty('legendary').map(r => r.id);
  
  if (beginnerRecipes.includes(recipeId)) return 80;
  if (intermediateRecipes.includes(recipeId)) return 60;
  if (advancedRecipes.includes(recipeId)) return 40;
  if (legendaryRecipes.includes(recipeId)) return 20;
  
  return 50; // 기본값
};