import type { AlchemyRecipe } from '../types/alchemy';

// 고급 연금술 레시피들
export const advancedAlchemyRecipes: AlchemyRecipe[] = [
  // === 허브 마스터리 연구로 해금되는 레시피들 ===
  {
    id: 'concentrated-healing-potion',
    name: '농축 치유 물약',
    description: '허브의 효능을 최대한 농축한 강력한 치유 물약입니다.',
    category: 'potion',
    difficulty: 'intermediate',
    requiredMaterials: [
      { materialId: 'herb-red-grass', count: 4 },
      { materialId: 'herb-golden-root', count: 1 }
    ],
    results: [
      { type: 'item', id: 'concentrated-healing-potion', count: 1, chance: 100 }
    ],
    successRate: 80,
    discoveryCondition: {
      type: 'experiment',
      condition: '허브 마스터리 연구 완료 후 해금'
    }
  },
  
  {
    id: 'herb-enhancement-elixir',
    name: '허브 강화 엘릭서',
    description: '일시적으로 생명력 재생을 크게 향상시키는 물약입니다.',
    category: 'potion',
    difficulty: 'advanced',
    requiredMaterials: [
      { materialId: 'herb-red-grass', count: 6 },
      { materialId: 'herb-blue-flower', count: 3 },
      { materialId: 'crystal-mana-essence', count: 1 }
    ],
    results: [
      { type: 'item', id: 'herb-enhancement-elixir', count: 1, chance: 85 },
      { type: 'item', id: 'concentrated-healing-potion', count: 1, chance: 40 }
    ],
    successRate: 65
  },

  // === 크리스탈 연구로 해금되는 레시피들 ===
  {
    id: 'mana-crystal-enhancement',
    name: '마나 크리스탈 강화',
    description: '무기나 장신구에 마나 효율을 향상시키는 마법을 부여합니다.',
    category: 'enhancement',
    difficulty: 'intermediate',
    requiredMaterials: [
      { materialId: 'crystal-mana-essence', count: 2 },
      { materialId: 'mineral-silver-dust', count: 3 }
    ],
    results: [
      { type: 'enhancement', id: 'mana-efficiency-boost', count: 1, chance: 90 }
    ],
    successRate: 75
  },

  {
    id: 'crystal-weapon-enhancement',
    name: '크리스탈 무기 강화',
    description: '무기에 마법 속성을 부여하여 마법 공격력을 증가시킵니다.',
    category: 'enhancement',
    difficulty: 'advanced',
    requiredMaterials: [
      { materialId: 'crystal-mana-essence', count: 3 },
      { materialId: 'crystal-clear-shard', count: 5 },
      { materialId: 'essence-fire-spark', count: 2 }
    ],
    results: [
      { type: 'enhancement', id: 'crystal-weapon-enchant', count: 1, chance: 80 },
      { type: 'item', id: 'magic-crystal-fragment', count: 2, chance: 60 }
    ],
    successRate: 60
  },

  // === 고급 조합 연구로 해금되는 레시피들 ===
  {
    id: 'ultimate-recovery-potion',
    name: '궁극 회복 물약',
    description: '체력과 마나를 완전히 회복하고 일시적으로 능력치를 향상시킵니다.',
    category: 'potion',
    difficulty: 'master',
    requiredMaterials: [
      { materialId: 'herb-golden-root', count: 3 },
      { materialId: 'crystal-mana-essence', count: 2 },
      { materialId: 'essence-fire-spark', count: 1 },
      { materialId: 'essence-ice-fragment', count: 1 },
      { materialId: 'mineral-silver-dust', count: 2 }
    ],
    results: [
      { type: 'item', id: 'ultimate-recovery-potion', count: 1, chance: 100 }
    ],
    successRate: 45
  },

  {
    id: 'multi-element-enhancement',
    name: '다원소 강화',
    description: '여러 원소의 힘을 조합하여 장비에 복합 속성을 부여합니다.',
    category: 'enhancement',
    difficulty: 'master',
    requiredMaterials: [
      { materialId: 'essence-fire-spark', count: 2 },
      { materialId: 'essence-ice-fragment', count: 2 },
      { materialId: 'crystal-mana-essence', count: 3 },
      { materialId: 'mineral-silver-dust', count: 4 }
    ],
    results: [
      { type: 'enhancement', id: 'elemental-mastery-enchant', count: 1, chance: 70 },
      { type: 'enhancement', id: 'resistance-boost-enchant', count: 1, chance: 50 }
    ],
    successRate: 35
  },

  // === 실험적 레시피들 ===
  {
    id: 'transmutation-experiment',
    name: '변환 실험',
    description: '기본 재료를 더 가치있는 재료로 변환하는 실험적 연금술입니다.',
    category: 'experimental',
    difficulty: 'advanced',
    requiredMaterials: [
      { materialId: 'herb-red-grass', count: 10 },
      { materialId: 'mineral-iron-ore', count: 5 },
      { materialId: 'crystal-clear-shard', count: 3 }
    ],
    results: [
      { type: 'item', id: 'herb-golden-root', count: 2, chance: 60 },
      { type: 'item', id: 'crystal-mana-essence', count: 1, chance: 40 },
      { type: 'item', id: 'mineral-silver-dust', count: 3, chance: 70 }
    ],
    successRate: 50
  },

  {
    id: 'philosophers-catalyst',
    name: '현자의 촉매',
    description: '전설적인 현자의 돌을 만들기 위한 첫 단계 촉매입니다.',
    category: 'experimental',
    difficulty: 'master',
    requiredMaterials: [
      { materialId: 'herb-golden-root', count: 5 },
      { materialId: 'crystal-mana-essence', count: 5 },
      { materialId: 'mineral-silver-dust', count: 10 },
      { materialId: 'essence-fire-spark', count: 3 },
      { materialId: 'essence-ice-fragment', count: 3 }
    ],
    results: [
      { type: 'item', id: 'philosophers-catalyst', count: 1, chance: 30 },
      { type: 'skill', id: 'transmutation-mastery', count: 1, chance: 20 },
      { type: 'enhancement', id: 'alchemical-genius', count: 1, chance: 15 }
    ],
    successRate: 25
  },

  // === 대량 생산 레시피들 ===
  {
    id: 'batch-healing-potions',
    name: '치유 물약 대량 생산',
    description: '효율적인 방법으로 치유 물약을 대량 생산합니다.',
    category: 'potion',
    difficulty: 'intermediate',
    requiredMaterials: [
      { materialId: 'herb-red-grass', count: 15 },
      { materialId: 'crystal-clear-shard', count: 3 }
    ],
    results: [
      { type: 'item', id: 'healing-potion-basic', count: 8, chance: 100 }
    ],
    successRate: 85
  },

  {
    id: 'batch-mana-potions',
    name: '마나 물약 대량 생산',
    description: '효율적인 방법으로 마나 물약을 대량 생산합니다.',
    category: 'potion',
    difficulty: 'intermediate',
    requiredMaterials: [
      { materialId: 'herb-blue-flower', count: 12 },
      { materialId: 'crystal-mana-essence', count: 2 }
    ],
    results: [
      { type: 'item', id: 'mana-potion-basic', count: 6, chance: 100 }
    ],
    successRate: 85
  }
];

// 새로운 연금술 아이템들
export const advancedAlchemyItems = [
  {
    id: 'concentrated-healing-potion',
    name: '농축 치유 물약',
    type: 'consumable' as const,
    weight: 0.4,
    icon: '🧪',
    description: '120의 체력을 즉시 회복합니다.',
    stats: { hp: 120 },
    originalId: 'concentrated-healing-potion'
  },

  {
    id: 'herb-enhancement-elixir',
    name: '허브 강화 엘릭서',
    type: 'consumable' as const,
    weight: 0.5,
    icon: '🌿',
    description: '80의 체력을 회복하고 3턴 동안 생명력 재생 +10을 부여합니다.',
    stats: { hp: 80 },
    originalId: 'herb-enhancement-elixir'
  },

  {
    id: 'ultimate-recovery-potion',
    name: '궁극 회복 물약',
    type: 'consumable' as const,
    weight: 0.6,
    icon: '✨',
    description: '체력과 마나를 완전히 회복하고 5턴 동안 모든 능력치 +2를 부여합니다.',
    stats: { hp: 9999, mp: 9999 }, // 완전 회복 표시
    originalId: 'ultimate-recovery-potion'
  },

  {
    id: 'magic-crystal-fragment',
    name: '마법 크리스탈 조각',
    type: 'material' as const,
    weight: 0.1,
    icon: '💎',
    description: '고급 연금술에 사용되는 마법이 깃든 크리스탈 조각입니다.'
  },

  {
    id: 'philosophers-catalyst',
    name: '현자의 촉매',
    type: 'material' as const,
    weight: 0.8,
    icon: '🔮',
    description: '전설적인 연금술 실험에 필요한 희귀한 촉매입니다.'
  }
];

// 연금술 강화 아이템들
export const alchemyEnhancements = [
  {
    id: 'mana-efficiency-boost',
    name: '마나 효율 향상',
    description: '마나 소모량을 15% 감소시킵니다.',
    targetType: 'item' as const,
    duration: -1, // 영구
    effects: []
  },

  {
    id: 'crystal-weapon-enchant',
    name: '크리스탈 무기 마법부여',
    description: '마법 공격력을 +15 증가시킵니다.',
    targetType: 'item' as const,
    duration: -1,
    effects: []
  },

  {
    id: 'elemental-mastery-enchant',
    name: '원소 숙련 마법부여',
    description: '모든 원소 저항을 +20 증가시킵니다.',
    targetType: 'item' as const,
    duration: -1,
    effects: []
  },

  {
    id: 'resistance-boost-enchant',
    name: '저항력 강화 마법부여',
    description: '모든 상태이상 저항을 +25% 증가시킵니다.',
    targetType: 'item' as const,
    duration: -1,
    effects: []
  },

  {
    id: 'alchemical-genius',
    name: '연금술 천재',
    description: '영구적으로 연금술 경험치 획득량이 50% 증가합니다.',
    targetType: 'character' as const,
    duration: -1,
    effects: []
  }
];