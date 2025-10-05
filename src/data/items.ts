import type { Item, StatusEffect, Stats } from '../types/gameTypes';

// 상태 효과 타입 도우미 함수
function createStatusEffect(
  id: string,
  name: string,
  type: StatusEffect['type'],
  effects: Array<{
    stat: keyof Stats;
    value: number;
    isPercentage: boolean;
  }>,
  duration: number,
  stackable = false,
  description = ''
): StatusEffect {
  return {
    id,
    name,
    type,
    effects,
    duration,
    stackable,
    description,
    value: 0
  };
}

// 기본 무기 데이터
export const weapons: Item[] = [
  {
    id: 'magic-staff',
    name: '마법 지팡이',
    type: 'weapon',
    weight: 1.0,
    stats: {
      attack: 3,
      intelligence: 8,
      maxMp: 20
    },
    requiredLevel: 2,
    description: '마력이 깃든 지팡이입니다.'
  },
  {
    id: 'short-sword',
    name: '짧은 검',
    type: 'weapon',
    weight: 1.5,
    stats: {
      attack: 5,
      agility: 1
    },
    requiredLevel: 1,
    description: '가볍고 다루기 쉬운 기본 검입니다.'
  },
  {
    id: 'long-sword',
    name: '긴 검',
    type: 'weapon',
    weight: 2.5,
    stats: {
      attack: 8,
      strength: 2
    },
    requiredLevel: 3,
    description: '더 강력하지만 무거운 검입니다.'
  }
];

// 기본 방어구 데이터
export const armors: Item[] = [
  {
    id: 'mage-robe',
    name: '마법사 로브',
    type: 'armor',
    weight: 2.0,
    stats: {
      defense: 3,
      intelligence: 5,
      maxMp: 30
    },
    requiredLevel: 2,
    description: '마력이 깃든 로브입니다.'
  },
  {
    id: 'leather-armor',
    name: '가죽 갑옷',
    type: 'armor',
    weight: 3,
    stats: {
      defense: 3,
      agility: 1
    },
    requiredLevel: 1,
    description: '기본적인 보호를 제공하는 가벼운 갑옷입니다.'
  },
  {
    id: 'chain-mail',
    name: '체인메일',
    type: 'armor',
    weight: 6,
    stats: {
      defense: 6,
      strength: 1
    },
    requiredLevel: 3,
    description: '더 강력한 보호를 제공하지만 무거운 갑옷입니다.'
  }
];

// 기본 액세서리 데이터
export const accessories: Item[] = [
  {
    id: 'vitality-band',
    name: '활력의 팔찌',
    type: 'accessory',
    weight: 0.15,
    stats: {
      maxHp: 15,
      defense: 2
    },
    requiredLevel: 1,
    description: '생명력을 높여주는 팔찌입니다.'
  },
  {
    id: 'leather-belt',
    name: '가죽 벨트',
    type: 'accessory',
    weight: 0.5,
    stats: {
      strength: 1,
      maxHp: 10
    },
    requiredLevel: 1,
    description: '기본적인 능력 향상을 제공하는 벨트입니다.'
  },
  {
    id: 'magic-ring',
    name: '마법 반지',
    type: 'accessory',
    weight: 0.1,
    stats: {
      intelligence: 2,
      maxMp: 15
    },
    requiredLevel: 2,
    description: '마법력을 증가시키는 반지입니다.'
  }
];

// 기본 소비 아이템 데이터
export const consumables: Item[] = [
  {
    id: 'speed-potion',
    name: '속도 물약',
    type: 'consumable',
    weight: 0.3,
    effects: [
      createStatusEffect(
        'speed-boost',
        '속도 증가',
        'buff',
        [{
          stat: 'agility',
          value: 5,
          isPercentage: false
        }],
        3
      )
    ],
    description: '3턴 동안 속도를 증가시킵니다.'
  },
  {
    id: 'health-potion',
    name: '체력 물약',
    type: 'consumable',
    weight: 0.3,
    effects: [
      createStatusEffect(
        'heal',
        '치유',
        'hot',
        [{
          stat: 'hp',
          value: 30,
          isPercentage: false
        }],
        1
      )
    ],
    description: '체력을 30 회복합니다.'
  },
  {
    id: 'mana-potion',
    name: '마나 물약',
    type: 'consumable',
    weight: 0.3,
    effects: [
      createStatusEffect(
        'restore-mana',
        '마나 회복',
        'hot',
        [{
          stat: 'mp',
          value: 20,
          isPercentage: false
        }],
        1
      )
    ],
    description: '마나를 20 회복합니다.'
  }
];

// 기본 재료 데이터
export const materials: Item[] = [
  {
    id: 'herb-healing',
    name: '치유 약초',
    type: 'material',
    weight: 0.1,
    description: '치유 효과가 있는 약초입니다.',
    effects: [
      createStatusEffect(
        'healing-essence',
        '치유의 정수',
        'hot',
        [{
          stat: 'hp',
          value: 10,
          isPercentage: false
        }],
        1
      )
    ]
  },
  {
    id: 'herb-mana',
    name: '마나 허브',
    type: 'material',
    weight: 0.1,
    description: '마나 회복에 도움이 되는 허브입니다.',
    effects: [
      createStatusEffect(
        'mana-essence',
        '마나의 정수',
        'hot',
        [{
          stat: 'mp',
          value: 10,
          isPercentage: false
        }],
        1
      )
    ]
  },
  {
    id: 'crystal-fire',
    name: '화염 결정',
    type: 'material',
    weight: 0.2,
    description: '화염의 힘이 담긴 결정입니다.',
    effects: [
      createStatusEffect(
        'fire-essence',
        '화염의 정수',
        'buff',
        [{
          stat: 'magicAttack',
          value: 5,
          isPercentage: false
        }],
        3
      )
    ]
  }
];

// 모든 아이템을 하나의 배열로 합침
export const allItems: Item[] = [
  ...weapons,
  ...armors,
  ...accessories,
  ...consumables,
  ...materials
];

// 아이템 조회 유틸리티 함수
export const getItemById = (id: string): Item | undefined => {
  return allItems.find(item => item.id === id);
};

export const getItemsByType = (type: Item['type']): Item[] => {
  return allItems.filter(item => item.type === type);
};
