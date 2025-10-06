import type { Character, Item, Material, Skill } from '../types/gameTypes';

export const testCharacter: Character = {
  id: 'player-1',
  name: '견습 연금술사',
  level: 1,
  experience: 0,
  experienceToNext: 100,
  stats: {
    hp: 300,                 // 밸런스 조정: 180 -> 300 (더욱 긴 전투)
    maxHp: 300,
    hpRegen: 4,              // 밸런스 조정: 3 -> 4
    vitality: 20,            // 밸런스 조정: 15 -> 20
    mp: 150,                 // 밸런스 조정: 120 -> 150 (더 많은 스킬 사용)
    maxMp: 150,
    mpRegen: 6,              // 밸런스 조정: 5 -> 6
    wisdom: 18,              // 밸런스 조정: 16 -> 18
    strength: 4,             // 밸런스 조정: 6 -> 4 (데미지 추가 감소)
    intelligence: 8,         // 밸런스 조정: 10 -> 8 (데미지 추가 감소)
    agility: 15,             // 밸런스 조정: 12 -> 15 (회피율 증가)
    attack: 5,               // 밸런스 조정: 8 -> 5 (데미지 추가 감소)
    defense: 18,             // 밸런스 조정: 12 -> 18 (생존력 대폭 증가)
    magicAttack: 7,          // 밸런스 조정: 10 -> 7 (데미지 추가 감소)
    magicDefense: 20,        // 밸런스 조정: 14 -> 20 (생존력 대폭 증가)
    criticalRate: 5,         // 밸런스 조정: 6 -> 5 (크리티컬 추가 감소)
    criticalDamage: 125,     // 밸런스 조정: 140 -> 125 (크리티컬 데미지 추가 감소)
    accuracy: 85,            // 밸런스 조정: 90 -> 85 (명중률 추가 감소)
    evasion: 18,             // 밸런스 조정: 15 -> 18 (회피율 증가)
    speed: 15,               // 밸런스 조정: 12 -> 15
    fireResist: 5,           // 밸런스 조정: 0 -> 5 (원소 저항 추가)
    iceResist: 5,            // 밸런스 조정: 0 -> 5
    lightningResist: 5,      // 밸런스 조정: 0 -> 5
    poisonResist: 5,         // 밸런스 조정: 0 -> 5
    weight: 65,
    physicalDefense: 18,     // 밸런스 조정: 12 -> 18 (생존력 대폭 증가)
    resourceCostReduction: 10, // 밸런스 조정: 8 -> 10 (더 많은 스킬 사용)
    dotResistance: 12,       // 밸런스 조정: 8 -> 12 (DOT 저항력 증가)
    hotBonus: 20,            // 밸런스 조정: 15 -> 20 (힐링 효과 증가)
    recovery: 8              // 밸런스 조정: 5 -> 8
  },
  statusEffects: [],
  skills: [], // 시작시 기본 스킬들이 추가됨
  gold: 200,
  isEnemy: false,
  type: 'normal',
  category: 'humanoid',
};

export const testItems: Item[] = [
  // === 일반 등급 장비 (회색) ===
  {
    id: 'weapon-apprentice-staff',
    name: '견습자의 지팡이',
    type: 'weapon',
    weight: 1.2,
    requiredLevel: 1,
    icon: '🪄',
    stats: {
      attack: 2,
      magicAttack: 4,
      intelligence: 1
    },
    description: '연금술 학도들이 사용하는 기본 지팡이입니다.'
  },
  {
    id: 'armor-cloth-robe',
    name: '천 로브',
    type: 'armor',
    weight: 1.8,
    requiredLevel: 1,
    icon: '🥼',
    stats: {
      defense: 2,
      magicDefense: 3,
      mp: 8
    },
    description: '부드러운 천으로 만든 기본 로브입니다.'
  },
  {
    id: 'accessory-copper-ring',
    name: '구리 반지',
    type: 'accessory',
    weight: 0.3,
    requiredLevel: 1,
    icon: '💍',
    stats: {
      intelligence: 1,
      mpRegen: 1
    },
    description: '마력 전도성이 좋은 구리로 만든 반지입니다.'
  },

  // === 고급 등급 장비 (초록) ===
  {
    id: 'weapon-enhanced-staff',
    name: '강화된 마법 지팡이',
    type: 'weapon',
    weight: 1.5,
    requiredLevel: 3,
    icon: '🔮',
    stats: {
      attack: 8,
      magicAttack: 20,
      intelligence: 4,
      criticalRate: 3
    },
    description: '마법 크리스탈로 강화된 지팡이입니다.'
  },
  {
    id: 'armor-reinforced-robe',
    name: '강화 로브',
    type: 'armor',
    weight: 2.2,
    requiredLevel: 3,
    icon: '👘',
    stats: {
      defense: 12,
      magicDefense: 15,
      mp: 25,
      intelligence: 2
    },
    description: '마법 실로 짜여진 강화된 로브입니다.'
  },
  {
    id: 'accessory-silver-amulet',
    name: '은 목걸이',
    type: 'accessory',
    weight: 0.4,
    requiredLevel: 3,
    icon: '📿',
    stats: {
      intelligence: 5,
      wisdom: 3,
      mpRegen: 2,
      resourceCostReduction: 5
    },
    description: '은으로 만든 마력 증폭 목걸이입니다.'
  },

  // === 희귀 등급 장비 (파랑) ===
  {
    id: 'weapon-crystal-staff',
    name: '크리스탈 스태프',
    type: 'weapon',
    weight: 1.8,
    requiredLevel: 5,
    icon: '✨',
    stats: {
      attack: 12,
      magicAttack: 35,
      intelligence: 7,
      criticalRate: 8,
      criticalDamage: 25
    },
    description: '순수한 마법 크리스탈로 만든 강력한 지팡이입니다.'
  },

  // === 소모품 ===
  {
    id: 'potion-health-small',
    name: '작은 체력 물약',
    type: 'consumable',
    weight: 0.2,
    icon: '🧪',
    description: 'HP를 30 회복합니다.',
    stats: { hp: 30 },
    originalId: 'potion-health-small'
  },
  {
    id: 'potion-mana-small',
    name: '작은 마나 물약',
    type: 'consumable',
    icon: '🥤',
    weight: 0.2,
    description: 'MP를 25 회복합니다.',
    stats: { mp: 25 },
    originalId: 'potion-mana-small'
  },
  {
    id: 'potion-health-medium',
    name: '체력 물약',
    type: 'consumable',
    icon: '🧪',
    weight: 0.3,
    description: 'HP를 60 회복합니다.',
    stats: { hp: 60 },
    originalId: 'potion-health-medium'
  },
  {
    id: 'potion-mana-medium',
    name: '마나 물약',
    type: 'consumable',
    icon: '🥤',
    weight: 0.3,
    description: 'MP를 50 회복합니다.',
    stats: { mp: 50 },
    originalId: 'potion-mana-medium'
  }
];

export const testMaterials: Material[] = [
  // === 기본 재료 (흔함) ===
  {
    id: 'herb-red-grass',
    name: '붉은 풀',
    type: 'material',
    weight: 0.1,
    icon: '🌿',
    description: '체력 회복 포션의 기본 재료. 숲 곳곳에서 발견됩니다.'
  },
  {
    id: 'herb-blue-flower',
    name: '푸른 꽃',
    type: 'material',
    weight: 0.1,
    icon: '🐸',
    description: '마나 회복 포션의 기본 재료. 물가에서 자랍니다.'
  },
  {
    id: 'mineral-iron-ore',
    name: '철광석',
    type: 'material',
    weight: 0.5,
    icon: '⛏️',
    description: '무기 제작의 기본 재료. 광산에서 채굴됩니다.'
  },
  {
    id: 'crystal-clear-shard',
    name: '투명한 크리스탈 조각',
    type: 'material',
    weight: 0.2,
    icon: '💎',
    description: '마법 도구 제작에 사용되는 기본 크리스탈입니다.'
  },

  // === 고급 재료 (드문) ===
  {
    id: 'herb-golden-root',
    name: '황금 뿌리',
    type: 'material',
    weight: 0.3,
    icon: '🌱',
    description: '강력한 회복 포션의 핵심 재료. 매우 희귀합니다.'
  },
  {
    id: 'crystal-mana-essence',
    name: '마나 정수',
    type: 'material',
    weight: 0.2,
    icon: '🔮',
    description: '순수한 마나가 결정화된 것. 고급 마법 아이템에 필수입니다.'
  },
  {
    id: 'mineral-silver-dust',
    name: '은 가루',
    type: 'material',
    weight: 0.1,
    icon: '✨',
    description: '마법 저항력을 부여하는 특별한 가루입니다.'
  },
  {
    id: 'essence-fire-spark',
    name: '불꽃 정수',
    type: 'material',
    weight: 0.15,
    icon: '🔥',
    description: '화염 속성 마법 아이템 제작에 사용됩니다.'
  },
  {
    id: 'essence-ice-fragment',
    name: '얼음 조각',
    type: 'material',
    weight: 0.15,
    icon: '❄️',
    description: '냉기 속성 마법 아이템 제작에 사용됩니다.'
  },

  // === 희귀 재료 (매우 드문) ===
  {
    id: 'crystal-philosophers-fragment',
    name: '현자의 돌 파편',
    type: 'material',
    weight: 0.05,
    icon: '💫',
    description: '전설의 현자의 돌 조각. 최고급 연금술에 필요합니다.'
  },
  {
    id: 'essence-dragon-scale',
    name: '용린',
    type: 'material',
    weight: 0.8,
    icon: '🐲',
    description: '고대 용의 비늘. 최강 방어구 제작에 사용됩니다.'
  },
  {
    id: 'mineral-mythril-chunk',
    name: '미스릴 덩어리',
    type: 'material',
    weight: 0.3,
    icon: '⚡',
    description: '전설의 금속 미스릴. 신화급 무기 제작 재료입니다.'
  },
  {
    id: 'essence-lightning-core',
    name: '번개 핵',
    type: 'material',
    weight: 0.2,
    icon: '⚡',
    description: '순수한 번개 에너지가 결정화된 것. 속도 증강 마법에 사용됩니다.'
  }
];

export const testSkills: Skill[] = [
  // === 기본 마법 스킬 ===
  {
    id: 'skill-magic-missile',
    name: '마법 화살',
    type: 'magic',
    element: 'neutral',
    category: 'offensive',
    power: 8,                // 밸런스 조정: 12 -> 8 (추가 감소)
    cost: 6,
    targetType: 'enemy',
    range: 3,
    accuracy: 95,
    effects: [],
    icon: '🏹',
    description: '기본적인 마법 공격입니다.'
  },
  {
    id: 'skill-fireball',
    name: '파이어볼',
    type: 'elemental',
    element: 'fire',
    category: 'offensive',
    power: 12,               // 밸런스 조정: 18 -> 12 (추가 감소)
    cost: 12,
    cooldown: 3,
    targetType: 'enemy',
    range: 4,
    accuracy: 90,
    effects: [],
    icon: '🔥',
    description: '화염구를 발사하여 적에게 화상을 입힙니다.'
  },
  {
    id: 'skill-heal',
    name: '치유',
    type: 'heal',
    element: 'light',
    category: 'support',
    power: 15,               // 밸런스 조정: 20 -> 15 (추가 감소)
    cost: 10,
    cooldown: 4,
    targetType: 'self',
    range: 1,
    accuracy: 100,
    effects: [],
    icon: '💚',
    description: 'HP를 회복하고 재생 효과를 부여합니다.'
  },
  {
    id: 'skill-ice-shard',
    name: '얼음 창',
    type: 'elemental',
    element: 'ice',
    category: 'offensive',
    power: 15,               // 밸런스 조정: 30 -> 15
    cost: 10,                // 밸런스 조정: 13 -> 10
    cooldown: 2,
    targetType: 'enemy',
    range: 5,
    accuracy: 85,
    effects: [],
    icon: '🧊',
    description: '날카로운 얼음 창으로 적을 공격하고 동상을 입힙니다.'
  },

  // === 물리 스킬 ===
  {
    id: 'skill-staff-strike',
    name: '지팡이 타격',
    type: 'physical',
    element: 'neutral',
    category: 'offensive',
    power: 8,                // 밸런스 조정: 15 -> 8
    cost: 3,                 // 밸런스 조정: 5 -> 3
    cooldown: 1,
    targetType: 'enemy',
    range: 1,
    accuracy: 95,
    effects: [],
    icon: '🏹',
    description: '지팡이로 직접 타격합니다.'
  },
  {
    id: 'skill-power-attack',
    name: '강타',
    type: 'physical',
    element: 'neutral',
    category: 'offensive',
    power: 22,               // 밸런스 조정: 40 -> 22
    cost: 8,                 // 밸런스 조정: 10 -> 8
    cooldown: 3,
    targetType: 'enemy',
    range: 1,
    accuracy: 80,
    effects: [],
    icon: '💪',
    description: '힘을 모아 강력한 일격을 가합니다.'
  },

  // === 새로운 원소 스킬 ===
  {
    id: 'skill-lightning-bolt',
    name: '번개',
    type: 'elemental',
    element: 'lightning',
    category: 'offensive',
    power: 16,
    cost: 11,
    cooldown: 2,
    targetType: 'enemy',
    range: 6,
    accuracy: 88,
    effects: [],
    icon: '⚡',
    description: '번개를 소환하여 적을 감전시킵니다.'
  },
  {
    id: 'skill-poison-dart',
    name: '독침',
    type: 'elemental',
    element: 'poison',
    category: 'offensive',
    power: 10,
    cost: 8,
    cooldown: 1,
    targetType: 'enemy',
    range: 4,
    accuracy: 92,
    effects: [],
    icon: '🎯',
    description: '독이 발린 침을 발사하여 중독시킵니다.'
  },

  // === 버프/디버프 스킬 ===
  {
    id: 'skill-bless',
    name: '축복',
    type: 'buff',
    element: 'light',
    category: 'support',
    power: 0,
    cost: 15,
    cooldown: 5,
    targetType: 'self',
    range: 1,
    accuracy: 100,
    effects: [],
    icon: '✨',
    description: '자신에게 축복을 내려 모든 능력을 향상시킵니다.'
  },
  {
    id: 'skill-weaken',
    name: '약화',
    type: 'debuff',
    element: 'dark',
    category: 'utility',
    power: 0,
    cost: 12,
    cooldown: 3,
    targetType: 'enemy',
    range: 3,
    accuracy: 85,
    effects: [],
    icon: '💔',
    description: '적의 공격력을 약화시킵니다.'
  },
  {
    id: 'skill-shield',
    name: '마법 방패',
    type: 'buff',
    element: 'neutral',
    category: 'defensive',
    power: 30, // 보호막 수치
    cost: 14,
    cooldown: 4,
    targetType: 'self',
    range: 1,
    accuracy: 100,
    effects: [], // 상태 효과는 skillStatusEffects에서 관리
    icon: '🛡️',
    description: '마법 방패를 생성하여 30의 피해를 흡수합니다.'
  },

  // === 고급 스킬 (밸런스 조정) ===
  {
    id: 'skill-blizzard',
    name: '블리자드',
    type: 'elemental',
    element: 'ice',
    category: 'offensive',
    power: 25,               // 밸런스 조정: 새로 추가
    cost: 20,
    cooldown: 5,
    targetType: 'enemy',
    range: 6,
    accuracy: 75,
    effects: [],
    icon: '🌨️',
    description: '거대한 블리자드로 적을 얼려버립니다.'
  },
  {
    id: 'skill-meteor',
    name: '메테오',
    type: 'elemental',
    element: 'fire',
    category: 'offensive',
    power: 40,               // 밸런스 조정: 80 -> 40
    cost: 25,                // 밸런스 조정: 40 -> 25
    cooldown: 8,
    targetType: 'enemy',
    range: 8,
    accuracy: 70,
    effects: [],
    icon: '☄️',
    description: '하늘에서 거대한 운석을 떨어뜨립니다.'
  },
  {
    id: 'skill-greater-heal',
    name: '상급 치유',
    type: 'heal',
    element: 'light',
    category: 'support',
    power: 35,               // 밸런스 조정: 60 -> 35 (현자의 손길에서 변경)
    cost: 20,                // 밸런스 조정: 35 -> 20
    cooldown: 7,             // 밸런스 조정: 10 -> 7
    targetType: 'self',
    range: 1,
    accuracy: 100,
    effects: [],
    icon: '🌟',
    description: '강력한 치유 마법으로 완전히 회복하고 축복을 받습니다.'
  }
];