// 새로운 연금술 레시피 정의
export interface NewAlchemyRecipe {
  id: string;
  name: string;
  description: string;
  type: 'potion' | 'enhancement' | 'transmutation' | 'special';
  category?: 'health' | 'mana' | 'enhancement' | 'special'; // 포션 카테고리
  tier?: number; // 포션 등급 (1=작은, 2=중간, 3=대형)
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  
  materials: Array<{ id: string; count: number }>;
  results: Array<{ type: string; id: string; count: number; quality?: string }>;
  
  successRate: number;
  experienceGain: number;
  goldCost: number;
  
  // 레시피 발견 조건
  discoveryRequirements?: {
    level?: number;
    monstersKilled?: number;
    itemsUpgraded?: number;
    otherRecipes?: string[];
  };
  
  dropRate: number; // 몬스터에서 드롭될 확률 (%)
  dropFromMonsters?: string[]; // 특정 몬스터에서만 드롭되는 경우
}

import type { Recipe } from '../types/gameTypes';

// 기존 레시피 (하위 호환성)
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

// 포션 카테고리 정의
export interface PotionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipes: NewAlchemyRecipe[];
}

// 포션을 카테고리별로 분류하는 함수
export const getPotionsByCategory = (knownRecipes: string[] = []): PotionCategory[] => {
  const healthPotions = newAlchemyRecipes.filter(recipe => 
    recipe.category === 'health' && 
    (knownRecipes.includes(recipe.id) || recipe.tier === 1)
  );
  
  const manaPotions = newAlchemyRecipes.filter(recipe => 
    recipe.category === 'mana' && 
    (knownRecipes.includes(recipe.id) || recipe.tier === 1)
  );

  return [
    {
      id: 'health',
      name: '체력 물약 제작',
      description: '체력을 회복하는 다양한 등급의 물약을 제작합니다',
      icon: '🧪',
      recipes: healthPotions
    },
    {
      id: 'mana', 
      name: '마나 물약 제작',
      description: '마나를 회복하는 다양한 등급의 물약을 제작합니다',
      icon: '💫',
      recipes: manaPotions
    }
  ];
};

// 새로운 연금술 시스템 레시피들
export const newAlchemyRecipes: NewAlchemyRecipe[] = [
  // === 체력 포션 시리즈 ===
  {
    id: 'small-health-potion',
    name: '작은 체력 물약',
    description: '체력을 30 회복하는 기본적인 포션',
    type: 'potion',
    category: 'health',
    tier: 1,
    rarity: 'common',
    icon: '🧪',
    materials: [
      { id: 'essence-fragment', count: 2 },
      { id: 'monster-blood', count: 1 }
    ],
    results: [
      { type: 'consumable', id: 'potion-health-small', count: 1 }
    ],
    successRate: 95,
    experienceGain: 10,
    goldCost: 50,
    dropRate: 5,
    discoveryRequirements: {
      level: 1
    }
  },
  
  {
    id: 'medium-health-potion',
    name: '체력 물약',
    description: '체력을 80 회복하는 개선된 포션',
    type: 'potion',
    category: 'health',
    tier: 2,
    rarity: 'uncommon',
    icon: '🧪',
    materials: [
      { id: 'magic-crystal', count: 1 },
      { id: 'monster-blood', count: 2 },
      { id: 'essence-fragment', count: 3 }
    ],
    results: [
      { type: 'consumable', id: 'potion-health-medium', count: 1 }
    ],
    successRate: 85,
    experienceGain: 20,
    goldCost: 120,
    dropRate: 3,
    discoveryRequirements: {
      level: 3,
      otherRecipes: ['small-health-potion']
    }
  },
  
  {
    id: 'large-health-potion',
    name: '대형 체력 물약',
    description: '체력을 150 회복하는 강력한 포션',
    type: 'potion',
    category: 'health',
    tier: 3,
    rarity: 'rare',
    icon: '🧪',
    materials: [
      { id: 'elemental-core', count: 1 },
      { id: 'magic-crystal', count: 2 },
      { id: 'monster-blood', count: 4 }
    ],
    results: [
      { type: 'consumable', id: 'potion-health-large', count: 1 }
    ],
    successRate: 70,
    experienceGain: 35,
    goldCost: 250,
    dropRate: 1,
    discoveryRequirements: {
      level: 7,
      otherRecipes: ['medium-health-potion']
    }
  },
  
  // === 마나 포션 시리즈 ===
  {
    id: 'small-mana-potion',
    name: '작은 마나 물약',
    description: '마나를 25 회복하는 기본적인 포션',
    type: 'potion',
    category: 'mana',
    tier: 1,
    rarity: 'common',
    icon: '💫',
    materials: [
      { id: 'essence-fragment', count: 3 },
      { id: 'bone-dust', count: 1 }
    ],
    results: [
      { type: 'consumable', id: 'potion-mana-small', count: 1 }
    ],
    successRate: 95,
    experienceGain: 10,
    goldCost: 50,
    dropRate: 5,
    discoveryRequirements: {
      level: 1
    }
  },
  
  {
    id: 'medium-mana-potion',
    name: '마나 물약',
    description: '마나를 60 회복하는 개선된 포션',
    type: 'potion',
    category: 'mana',
    tier: 2,
    rarity: 'uncommon',
    icon: '💫',
    materials: [
      { id: 'magic-crystal', count: 1 },
      { id: 'bone-dust', count: 2 },
      { id: 'essence-fragment', count: 4 }
    ],
    results: [
      { type: 'consumable', id: 'potion-mana-medium', count: 1 }
    ],
    successRate: 85,
    experienceGain: 20,
    goldCost: 120,
    dropRate: 3,
    discoveryRequirements: {
      level: 3,
      otherRecipes: ['small-mana-potion']
    }
  },
  
  {
    id: 'large-mana-potion',
    name: '대형 마나 물약',
    description: '마나를 120 회복하는 강력한 포션',
    type: 'potion',
    category: 'mana',
    tier: 3,
    rarity: 'rare',
    icon: '💫',
    materials: [
      { id: 'elemental-core', count: 1 },
      { id: 'magic-crystal', count: 2 },
      { id: 'bone-dust', count: 3 }
    ],
    results: [
      { type: 'consumable', id: 'potion-mana-large', count: 1 }
    ],
    successRate: 70,
    experienceGain: 35,
    goldCost: 250,
    dropRate: 1,
    discoveryRequirements: {
      level: 7,
      otherRecipes: ['medium-mana-potion']
    }
  },

  // 개선된 포션 레시피
  {
    id: 'improved-health-potion',
    name: '개선된 체력 포션',
    description: '체력을 150 회복하는 강화된 포션',
    type: 'potion',
    rarity: 'uncommon',
    icon: '🧪',
    materials: [
      { id: 'magic-crystal', count: 2 },
      { id: 'monster-blood', count: 3 },
      { id: 'elemental-core', count: 1 }
    ],
    results: [
      { type: 'consumable', id: 'potion-health-medium', count: 1 }
    ],
    successRate: 80,
    experienceGain: 25,
    goldCost: 200,
    dropRate: 2,
    discoveryRequirements: {
      level: 5,
      otherRecipes: ['basic-health-potion']
    }
  },

  // 업그레이드 촉진제 레시피들
  {
    id: 'upgrade-catalyst-basic',
    name: '기본 업그레이드 촉진제',
    description: '아이템 업그레이드 성공률을 10% 증가시킨다',
    type: 'enhancement',
    rarity: 'uncommon',
    icon: '⚡',
    materials: [
      { id: 'magic-crystal', count: 5 },
      { id: 'elemental-core', count: 3 },
      { id: 'essence-fragment', count: 20 }
    ],
    results: [
      { type: 'material', id: 'upgrade-catalyst', count: 1 }
    ],
    successRate: 70,
    experienceGain: 30,
    goldCost: 300,
    dropRate: 1,
    discoveryRequirements: {
      level: 10,
      itemsUpgraded: 5
    }
  }
];

// 레시피 발견 확률 계산 함수
export const calculateRecipeDropChance = (recipe: NewAlchemyRecipe, playerLevel: number, bonuses: Record<string, number> = {}): number => {
  let baseChance = recipe.dropRate;
  
  // 레벨에 따른 보너스 (높은 레벨일수록 레어한 레시피 발견 확률 증가)
  const levelBonus = Math.min(playerLevel * 0.1, recipe.rarity === 'legendary' ? 2 : 5);
  
  // 연금술 마스터리에 따른 보너스
  const masteryBonus = bonuses.discoveryBonus || 0;
  
  return Math.min(baseChance + levelBonus + masteryBonus, 
                 recipe.rarity === 'legendary' ? 5 : 25);
};