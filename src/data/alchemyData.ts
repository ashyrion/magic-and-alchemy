import type { AlchemyRecipe } from '../types/alchemy';

// 기본 연금술 레시피들
export const basicAlchemyRecipes: AlchemyRecipe[] = [
  {
    id: 'basic-healing-potion',
    name: '기본 치유 물약',
    description: '붉은 허브로 만든 기본적인 회복 물약입니다.',
    category: 'potion',
    difficulty: 'basic',
    requiredMaterials: [
      {
        materialId: 'mat-1', // 붉은 허브
        count: 2
      }
    ],
    results: [
      {
        type: 'item',
        id: 'healing-potion-basic',
        count: 1,
        chance: 100
      }
    ],
    successRate: 90
  },
  
  {
    id: 'basic-mana-potion',
    name: '기본 마나 물약',
    description: '파란 크리스탈로 만든 기본적인 마나 회복 물약입니다.',
    category: 'potion',
    difficulty: 'basic',
    requiredMaterials: [
      {
        materialId: 'mat-2', // 파란 크리스탈
        count: 2
      }
    ],
    results: [
      {
        type: 'item',
        id: 'mana-potion-basic',
        count: 1,
        chance: 100
      }
    ],
    successRate: 90
  },
  
  {
    id: 'enhanced-healing-potion',
    name: '강화 치유 물약',
    description: '붉은 허브와 황금 가루로 강화된 치유 물약입니다.',
    category: 'potion',
    difficulty: 'intermediate',
    requiredMaterials: [
      {
        materialId: 'mat-1', // 붉은 허브
        count: 3
      },
      {
        materialId: 'mat-3', // 황금 가루
        count: 1
      }
    ],
    results: [
      {
        type: 'item',
        id: 'healing-potion-enhanced',
        count: 1,
        chance: 100
      }
    ],
    successRate: 75,
    discoveryCondition: {
      type: 'experiment',
      condition: '붉은 허브와 황금 가루를 조합하여 발견'
    }
  },
  
  {
    id: 'fire-enhancement',
    name: '화염 강화',
    description: '붉은 허브로 무기에 화염 속성을 부여합니다.',
    category: 'enhancement',
    difficulty: 'intermediate',
    requiredMaterials: [
      {
        materialId: 'mat-1', // 붉은 허브
        count: 4
      }
    ],
    results: [
      {
        type: 'enhancement',
        id: 'fire-weapon-enhancement',
        count: 1,
        chance: 80
      }
    ],
    successRate: 70,
    discoveryCondition: {
      type: 'experiment',
      condition: '많은 양의 붉은 허브로 실험'
    }
  },
  
  {
    id: 'experimental-super-potion',
    name: '실험용 만능 물약',
    description: '모든 재료를 섞어 만드는 실험적 물약입니다.',
    category: 'experimental',
    difficulty: 'advanced',
    requiredMaterials: [
      {
        materialId: 'mat-1', // 붉은 허브
        count: 2
      },
      {
        materialId: 'mat-2', // 파란 크리스탈
        count: 2
      },
      {
        materialId: 'mat-3', // 황금 가루
        count: 2
      }
    ],
    results: [
      {
        type: 'item',
        id: 'super-potion',
        count: 1,
        chance: 60
      },
      {
        type: 'skill',
        id: 'alchemy-mastery',
        count: 1,
        chance: 20
      }
    ],
    successRate: 40,
    discoveryCondition: {
      type: 'experiment',
      condition: '모든 종류의 재료를 한 번에 사용'
    }
  }
];

// 연금술로 제작 가능한 아이템들
export const alchemyItems = [
  {
    id: 'healing-potion-basic',
    name: '기본 치유 물약',
    type: 'consumable' as const,
    weight: 0.3,
    effects: [
      {
        id: 'heal-basic',
        name: '기본 치유',
        type: 'hot' as const,
        duration: 1,
        stackable: false,
        statModifiers: [
          {
            stat: 'hp' as const,
            value: 40,
            isPercentage: false
          }
        ]
      }
    ],
    description: '40의 체력을 즉시 회복합니다.'
  },
  
  {
    id: 'mana-potion-basic',
    name: '기본 마나 물약',
    type: 'consumable' as const,
    weight: 0.3,
    effects: [
      {
        id: 'mana-restore-basic',
        name: '기본 마나 회복',
        type: 'hot' as const,
        duration: 1,
        stackable: false,
        statModifiers: [
          {
            stat: 'mp' as const,
            value: 30,
            isPercentage: false
          }
        ]
      }
    ],
    description: '30의 마나를 즉시 회복합니다.'
  },
  
  {
    id: 'healing-potion-enhanced',
    name: '강화 치유 물약',
    type: 'consumable' as const,
    weight: 0.4,
    effects: [
      {
        id: 'heal-enhanced',
        name: '강화 치유',
        type: 'hot' as const,
        duration: 1,
        stackable: false,
        statModifiers: [
          {
            stat: 'hp' as const,
            value: 80,
            isPercentage: false
          }
        ]
      }
    ],
    description: '80의 체력을 즉시 회복합니다.'
  },
  
  {
    id: 'super-potion',
    name: '만능 물약',
    type: 'consumable' as const,
    weight: 0.5,
    effects: [
      {
        id: 'super-recovery',
        name: '만능 회복',
        type: 'hot' as const,
        duration: 1,
        stackable: false,
        statModifiers: [
          {
            stat: 'hp' as const,
            value: 100,
            isPercentage: false
          },
          {
            stat: 'mp' as const,
            value: 50,
            isPercentage: false
          }
        ]
      }
    ],
    description: '100의 체력과 50의 마나를 동시에 회복합니다.'
  }
];