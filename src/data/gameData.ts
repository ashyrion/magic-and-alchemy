import type { Character, Item, Material, Skill } from '../types/gameTypes';

export const testCharacter: Character = {
  id: 'player-1',
  name: '견습 연금술사',
  level: 1,
  experience: 0,
  experienceToNext: 100,
  stats: {
    hp: 120,
    maxHp: 120,
    hpRegen: 2,
    vitality: 12,
    mp: 80,
    maxMp: 80,
    mpRegen: 3,
    wisdom: 14,
    strength: 8,
    intelligence: 12,
    agility: 10,
    attack: 12,
    defense: 8,
    magicAttack: 15,
    magicDefense: 10,
    criticalRate: 8,
    criticalDamage: 150,
    accuracy: 95,
    evasion: 12,
    speed: 10,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0,
    weight: 65,
    physicalDefense: 8,
    resourceCostReduction: 5,
    dotResistance: 5,
    hotBonus: 10,
    recovery: 3
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
    stats: {
      attack: 5,
      magicAttack: 12,
      intelligence: 2
    },
    description: '연금술 학도들이 사용하는 기본 지팡이입니다.'
  },
  {
    id: 'armor-cloth-robe',
    name: '천 로브',
    type: 'armor',
    weight: 1.8,
    requiredLevel: 1,
    stats: {
      defense: 6,
      magicDefense: 8,
      mp: 15
    },
    description: '부드러운 천으로 만든 기본 로브입니다.'
  },
  {
    id: 'accessory-copper-ring',
    name: '구리 반지',
    type: 'accessory',
    weight: 0.3,
    requiredLevel: 1,
    stats: {
      intelligence: 3,
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
    description: 'HP를 30 회복합니다.',
    stats: { hp: 30 },
    originalId: 'potion-health-small'
  },
  {
    id: 'potion-mana-small',
    name: '작은 마나 물약',
    type: 'consumable',
    weight: 0.2,
    description: 'MP를 25 회복합니다.',
    stats: { mp: 25 },
    originalId: 'potion-mana-small'
  },
  {
    id: 'potion-health-medium',
    name: '체력 물약',
    type: 'consumable',
    weight: 0.3,
    description: 'HP를 60 회복합니다.',
    stats: { hp: 60 },
    originalId: 'potion-health-medium'
  },
  {
    id: 'potion-mana-medium',
    name: '마나 물약',
    type: 'consumable',
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
    description: '체력 회복 포션의 기본 재료. 숲 곳곳에서 발견됩니다.'
  },
  {
    id: 'herb-blue-flower',
    name: '푸른 꽃',
    type: 'material',
    weight: 0.1,
    description: '마나 회복 포션의 기본 재료. 물가에서 자랍니다.'
  },
  {
    id: 'mineral-iron-ore',
    name: '철광석',
    type: 'material',
    weight: 0.5,
    description: '무기 제작의 기본 재료. 광산에서 채굴됩니다.'
  },
  {
    id: 'crystal-clear-shard',
    name: '투명한 크리스탈 조각',
    type: 'material',
    weight: 0.2,
    description: '마법 도구 제작에 사용되는 기본 크리스탈입니다.'
  },

  // === 고급 재료 (드문) ===
  {
    id: 'herb-golden-root',
    name: '황금 뿌리',
    type: 'material',
    weight: 0.3,
    description: '강력한 회복 포션의 핵심 재료. 매우 희귀합니다.'
  },
  {
    id: 'crystal-mana-essence',
    name: '마나 정수',
    type: 'material',
    weight: 0.2,
    description: '순수한 마나가 결정화된 것. 고급 마법 아이템에 필수입니다.'
  },
  {
    id: 'mineral-silver-dust',
    name: '은 가루',
    type: 'material',
    weight: 0.1,
    description: '마법 저항력을 부여하는 특별한 가루입니다.'
  },
  {
    id: 'essence-fire-spark',
    name: '불꽃 정수',
    type: 'material',
    weight: 0.15,
    description: '화염 속성 마법 아이템 제작에 사용됩니다.'
  },
  {
    id: 'essence-ice-fragment',
    name: '얼음 조각',
    type: 'material',
    weight: 0.15,
    description: '냉기 속성 마법 아이템 제작에 사용됩니다.'
  },

  // === 희귀 재료 (매우 드문) ===
  {
    id: 'crystal-philosophers-fragment',
    name: '현자의 돌 파편',
    type: 'material',
    weight: 0.05,
    description: '전설의 현자의 돌 조각. 최고급 연금술에 필요합니다.'
  },
  {
    id: 'essence-dragon-scale',
    name: '용린',
    type: 'material',
    weight: 0.8,
    description: '고대 용의 비늘. 최강 방어구 제작에 사용됩니다.'
  },
  {
    id: 'mineral-mythril-chunk',
    name: '미스릴 덩어리',
    type: 'material',
    weight: 0.3,
    description: '전설의 금속 미스릴. 신화급 무기 제작 재료입니다.'
  },
  {
    id: 'essence-lightning-core',
    name: '번개 핵',
    type: 'material',
    weight: 0.2,
    description: '순수한 번개 에너지가 결정화된 것. 속도 증강 마법에 사용됩니다.'
  }
];

export const testSkills: Skill[] = [
  // === 기본 마법 스킬 ===
  {
    id: 'skill-magic-missile',
    name: '마법 화살',
    type: 'magic',
    power: 20,
    cost: 8,
    effects: [],
    description: '기본적인 마법 공격입니다.'
  },
  {
    id: 'skill-fireball',
    name: '파이어볼',
    type: 'magic',
    power: 35,
    cost: 15,
    effects: [],
    description: '강력한 화염 마법입니다.'
  },
  {
    id: 'skill-heal',
    name: '치유',
    type: 'magic',
    power: 25,
    cost: 12,
    effects: [],
    description: 'HP를 회복하는 치유 마법입니다.'
  },
  {
    id: 'skill-ice-shard',
    name: '얼음 창',
    type: 'magic',
    power: 30,
    cost: 13,
    effects: [],
    description: '냉기 속성의 관통 공격입니다.'
  },

  // === 물리 스킬 ===
  {
    id: 'skill-staff-strike',
    name: '지팡이 타격',
    type: 'physical',
    power: 15,
    cost: 5,
    effects: [],
    description: '지팡이로 직접 타격합니다.'
  },
  {
    id: 'skill-power-attack',
    name: '강타',
    type: 'physical',
    power: 40,
    cost: 10,
    effects: [],
    description: '힘을 모아 강력한 일격을 가합니다.'
  },

  // === 연금술 스킬 ===
  {
    id: 'skill-quick-potion',
    name: '즉석 물약',
    type: 'alchemy',
    power: 20,
    cost: 18,
    effects: [],
    description: '전투 중에 즉석에서 치유 물약을 제작합니다.'
  },
  {
    id: 'skill-transmute-weapon',
    name: '무기 변환',
    type: 'alchemy',
    power: 0,
    cost: 20,
    effects: [],
    description: '일시적으로 무기의 속성을 강화합니다.'
  },
  {
    id: 'skill-explosive-flask',
    name: '폭발 플라스크',
    type: 'alchemy',
    power: 45,
    cost: 25,
    effects: [],
    description: '연금술로 제작한 폭발물을 투척합니다.'
  },

  // === 고급 스킬 ===
  {
    id: 'skill-meteor',
    name: '메테오',
    type: 'magic',
    power: 80,
    cost: 40,
    effects: [],
    description: '하늘에서 거대한 운석을 떨어뜨립니다.'
  },
  {
    id: 'skill-philosophers-touch',
    name: '현자의 손길',
    type: 'alchemy',
    power: 60,
    cost: 35,
    effects: [],
    description: '현자의 돌 힘으로 완전 회복시킵니다.'
  }
];