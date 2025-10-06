// 연금술 재료 정의
export interface AlchemyMaterial {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  dropRate: number; // 몬스터 처치 시 드롭 확률 (%)
  stackSize: number; // 최대 스택 수량
}

export const alchemyMaterials: AlchemyMaterial[] = [
  // 일반 재료 (높은 드롭률)
  {
    id: 'essence-fragment',
    name: '에센스 파편',
    description: '약한 마력이 깃든 작은 파편',
    rarity: 'common',
    icon: '✨',
    dropRate: 35,
    stackSize: 999
  },
  {
    id: 'monster-blood',
    name: '몬스터의 피',
    description: '몬스터의 생명력이 담긴 피',
    rarity: 'common',
    icon: '🩸',
    dropRate: 30,
    stackSize: 999
  },
  {
    id: 'bone-dust',
    name: '뼈 가루',
    description: '갈아서 만든 몬스터의 뼈 가루',
    rarity: 'common',
    icon: '🦴',
    dropRate: 25,
    stackSize: 999
  },

  // 언커먼 재료
  {
    id: 'magic-crystal',
    name: '마법 수정',
    description: '마법의 힘이 응축된 작은 수정',
    rarity: 'uncommon',
    icon: '💎',
    dropRate: 15,
    stackSize: 999
  },
  {
    id: 'elemental-core',
    name: '원소 핵',
    description: '원소의 순수한 에너지가 담긴 핵',
    rarity: 'uncommon',
    icon: '🔮',
    dropRate: 12,
    stackSize: 999
  },
  {
    id: 'soul-fragment',
    name: '영혼 조각',
    description: '몬스터의 영혼 일부',
    rarity: 'uncommon',
    icon: '👻',
    dropRate: 10,
    stackSize: 999
  },

  // 레어 재료
  {
    id: 'ancient-rune',
    name: '고대 룬',
    description: '고대의 마법이 새겨진 신비한 룬',
    rarity: 'rare',
    icon: '🔯',
    dropRate: 5,
    stackSize: 99
  },
  {
    id: 'dragon-scale',
    name: '드래곤 비늘',
    description: '강력한 드래곤의 비늘',
    rarity: 'rare',
    icon: '🐉',
    dropRate: 3,
    stackSize: 99
  },
  {
    id: 'void-essence',
    name: '공허의 정수',
    description: '공허에서 추출한 순수한 어둠의 힘',
    rarity: 'rare',
    icon: '🌌',
    dropRate: 4,
    stackSize: 99
  },

  // 에픽 재료
  {
    id: 'celestial-dust',
    name: '천상의 가루',
    description: '하늘에서 떨어진 신성한 가루',
    rarity: 'epic',
    icon: '⭐',
    dropRate: 1.5,
    stackSize: 50
  },
  {
    id: 'phoenix-feather',
    name: '불사조 깃털',
    description: '불사조의 재생력이 깃든 깃털',
    rarity: 'epic',
    icon: '🔥',
    dropRate: 1,
    stackSize: 50
  },

  // 레전더리 재료
  {
    id: 'gods-tear',
    name: '신의 눈물',
    description: '신이 흘린 단 한 방울의 눈물',
    rarity: 'legendary',
    icon: '💧',
    dropRate: 0.1,
    stackSize: 10
  }
];

// 아이템 등급별 필요 재료 정의
export const upgradeRequirements = {
  'normal-to-magic': {
    materials: [
      { id: 'essence-fragment', count: 5 },
      { id: 'monster-blood', count: 3 }
    ],
    successRate: 80,
    cost: 100
  },
  'magic-to-rare': {
    materials: [
      { id: 'magic-crystal', count: 3 },
      { id: 'elemental-core', count: 2 },
      { id: 'soul-fragment', count: 1 }
    ],
    successRate: 60,
    cost: 500
  },
  'rare-to-unique': {
    materials: [
      { id: 'ancient-rune', count: 2 },
      { id: 'dragon-scale', count: 1 },
      { id: 'void-essence', count: 1 },
      { id: 'celestial-dust', count: 1 }
    ],
    successRate: 30,
    cost: 2000
  }
};

// 스킬 업그레이드 재료 정의
export const skillUpgradeRequirements = {
  'skill-tier-1': {
    materials: [
      { id: 'essence-fragment', count: 10 },
      { id: 'bone-dust', count: 5 }
    ],
    successRate: 90,
    cost: 200
  },
  'skill-tier-2': {
    materials: [
      { id: 'magic-crystal', count: 5 },
      { id: 'elemental-core', count: 3 },
      { id: 'ancient-rune', count: 1 }
    ],
    successRate: 70,
    cost: 1000
  },
  'skill-tier-3': {
    materials: [
      { id: 'dragon-scale', count: 2 },
      { id: 'void-essence', count: 2 },
      { id: 'celestial-dust', count: 1 },
      { id: 'phoenix-feather', count: 1 }
    ],
    successRate: 50,
    cost: 5000
  },
  'skill-legendary': {
    materials: [
      { id: 'gods-tear', count: 1 },
      { id: 'celestial-dust', count: 5 },
      { id: 'phoenix-feather', count: 3 }
    ],
    successRate: 20,
    cost: 20000
  }
};