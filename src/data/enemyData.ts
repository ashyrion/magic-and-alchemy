import type { Combatant } from '../types/battle';

// 던전 등급별 몬스터 분류
export interface DungeonTier {
  name: string;
  minLevel: number;
  maxLevel: number;
  enemies: Combatant[];
}

// 실전 적 데이터 - 난이도별 분류
export const testEnemies: Combatant[] = [
  // === 1단계: 초급 적들 (레벨 1-2) ===
  {
    id: 'goblin-scout',
    name: '고블린 정찰병',
    level: 1,
    rewards: {
      experience: 10,
      gold: 5,
      items: [
        { id: 'health-potion', chance: 20, count: [1, 1] },
        { id: 'herb-healing', chance: 30, count: [1, 2] },
      ],
    },
    type: 'normal',
    category: 'humanoid',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 150,                // 밸런스 조정: 80 -> 150 (더욱 긴 전투)
      maxHp: 150,
      hpRegen: 1,             // 밸런스 조정: 0 -> 1
      vitality: 12,           // 밸런스 조정: 8 -> 12
      mp: 15,                 // 밸런스 조정: 10 -> 15
      maxMp: 15,
      mpRegen: 0,
      wisdom: 5,              // 밸런스 조정: 4 -> 5
      strength: 7,            // 밸런스 조정: 10 -> 7 (데미지 감소)
      intelligence: 3,
      agility: 14,            // 밸런스 조정: 12 -> 14
      attack: 5,              // 밸런스 조정: 8 -> 5 (데미지 추가 감소)
      defense: 8,             // 밸런스 조정: 4 -> 8 (생존력 증가)
      physicalDefense: 8,     // 밸런스 조정: 4 -> 8
      magicAttack: 2,
      magicDefense: 6,        // 밸런스 조정: 3 -> 6 (생존력 증가)
      criticalRate: 6,        // 밸런스 조정: 8 -> 6 (크리티컬 감소)
      criticalDamage: 130,    // 밸런스 조정: 140 -> 130
      accuracy: 85,           // 밸런스 조정: 90 -> 85 (명중률 감소)
      evasion: 18,            // 밸런스 조정: 15 -> 18 (회피율 증가)
      speed: 14,              // 밸런스 조정: 12 -> 14
      fireResist: 0,
      iceResist: 0,
      lightningResist: 0,
      poisonResist: 5,        // 밸런스 조정: 0 -> 5
      recovery: 1,            // 밸런스 조정: 0 -> 1
      weight: 45,
      dotResistance: 3,       // 밸런스 조정: 0 -> 3
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'goblin-stab',
        name: '단검 찌르기',
        cost: 0,
        power: 5,               // 밸런스 조정: 8 -> 5 (데미지 추가 감소)
        type: 'physical',
        element: 'neutral',
        category: 'offensive',
        targetType: 'enemy',
        range: 1,
        accuracy: 90,
        effects: [],
        icon: '🗡️',
        description: '빠른 단검 공격입니다.'
      }
    ]
  },
  {
    id: 'forest-wolf',
    name: '숲 늑대',
    level: 1,
    rewards: {
      experience: 15,
      gold: 8,
      items: [
        { id: 'leather-armor', chance: 5, count: [1, 1] },
      ],
    },
    type: 'normal',
    category: 'beast',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 180,                // 밸런스 조정: 95 -> 180 (더욱 긴 전투)
      maxHp: 180,
      hpRegen: 2,             // 밸런스 조정: 1 -> 2
      vitality: 14,           // 밸런스 조정: 10 -> 14
      mp: 10,                 // 밸런스 조정: 5 -> 10
      maxMp: 10,
      mpRegen: 0,
      wisdom: 4,              // 밸런스 조정: 3 -> 4
      strength: 9,            // 밸런스 조정: 14 -> 9 (데미지 감소)
      intelligence: 2,
      agility: 18,            // 밸런스 조정: 16 -> 18
      attack: 6,              // 밸런스 조정: 10 -> 6 (데미지 추가 감소)
      defense: 10,            // 밸런스 조정: 6 -> 10 (생존력 증가)
      physicalDefense: 10,    // 밸런스 조정: 6 -> 10
      magicAttack: 0,
      magicDefense: 5,        // 밸런스 조정: 2 -> 5 (생존력 증가)
      criticalRate: 10,       // 밸런스 조정: 12 -> 10 (크리티컬 감소)
      criticalDamage: 145,    // 밸런스 조정: 160 -> 145
      accuracy: 90,           // 밸런스 조정: 95 -> 90 (명중률 감소)
      evasion: 22,            // 밸런스 조정: 20 -> 22 (회피율 증가)
      speed: 18,              // 밸런스 조정: 16 -> 18
      fireResist: 0,
      iceResist: 8,           // 밸런스 조정: 5 -> 8
      lightningResist: 0,
      poisonResist: 15,       // 밸런스 조정: 10 -> 15
      recovery: 0,
      weight: 50,
      dotResistance: 5,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'wolf-bite',
        name: '물어뜯기',
        cost: 0,
        power: 6,               // 밸런스 조정: 10 -> 6 (데미지 추가 감소)
        type: 'physical',
        element: 'neutral',
        category: 'offensive',
        targetType: 'enemy',
        range: 1,
        accuracy: 95,
        effects: [],
        icon: '🐺',
        description: '날카로운 이빨로 물어뜯습니다.'
      }
    ]
  },

  {
    id: 'giant-spider',
    name: '거대 거미',
    level: 2,
    gold: 0,
    type: 'normal',
    category: 'beast',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 40,
      maxHp: 40,
      hpRegen: 0,
      vitality: 7,
      mp: 15,
      maxMp: 15,
      mpRegen: 0,
      wisdom: 5,
      strength: 8,
      intelligence: 6,
      agility: 18,
      attack: 14,
      defense: 3,
      physicalDefense: 3,
      magicAttack: 8,
      magicDefense: 5,
      criticalRate: 20,
      criticalDamage: 150,
      accuracy: 95,
      evasion: 25,
      speed: 18,
      fireResist: 0,
      iceResist: 0,
      lightningResist: 0,
      poisonResist: 30,
      recovery: 0,
      weight: 30,
      dotResistance: 15,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'poison-bite',
        name: '독니 공격',
        cost: 8,
        power: 12,
        type: 'physical',
        effects: [],
        description: '독이 묻은 송곳니로 물어뜯습니다.'
      }
    ]
  },
  {
    id: 'skeleton-warrior',
    name: '해골 전사',
    level: 2,
    gold: 0,
    type: 'normal',
    category: 'undead',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 50,
      maxHp: 50,
      hpRegen: 0,
      vitality: 8,
      mp: 5,
      maxMp: 5,
      mpRegen: 0,
      wisdom: 2,
      strength: 12,
      intelligence: 1,
      agility: 8,
      attack: 15,
      defense: 8,
      physicalDefense: 8,
      magicAttack: 0,
      magicDefense: 3,
      criticalRate: 5,
      criticalDamage: 130,
      accuracy: 85,
      evasion: 5,
      speed: 8,
      fireResist: 0,
      iceResist: 10,
      lightningResist: 0,
      poisonResist: 50,
      recovery: 0,
      weight: 55,
      dotResistance: 25,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'bone-strike',
        name: '뼈다귀 찌르기',
        cost: 0,
        power: 20,
        type: 'physical',
        effects: [],
        description: '날카로운 뼈로 찌릅니다.'
      }
    ]
  },

  // === 2단계: 중급 적들 (레벨 3-4) ===
  {
    id: 'goblin-warrior',
    name: '고블린 전사',
    level: 3,
    gold: 0,
    type: 'normal',
    category: 'humanoid',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 85,
      maxHp: 85,
      hpRegen: 1,
      vitality: 12,
      mp: 20,
      maxMp: 20,
      mpRegen: 0,
      wisdom: 6,
      strength: 16,
      intelligence: 5,
      agility: 10,
      attack: 20,
      defense: 8,
      physicalDefense: 8,
      magicAttack: 5,
      magicDefense: 6,
      criticalRate: 10,
      criticalDamage: 150,
      accuracy: 88,
      evasion: 8,
      speed: 10,
      fireResist: 0,
      iceResist: 0,
      lightningResist: 0,
      poisonResist: 5,
      recovery: 0,
      weight: 60,
      dotResistance: 0,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'power-strike',
        name: '강타',
        cost: 5,
        power: 35,
        type: 'physical',
        effects: [],
        description: '힘을 모아 강력한 일격을 가합니다.'
      }
    ]
  },
  {
    id: 'orc-brute',
    name: '오크 전사',
    level: 4,
    gold: 0,
    type: 'elite',
    category: 'humanoid',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 120,
      maxHp: 120,
      hpRegen: 2,
      vitality: 16,
      mp: 30,
      maxMp: 30,
      mpRegen: 1,
      wisdom: 8,
      strength: 20,
      intelligence: 7,
      agility: 8,
      attack: 28,
      defense: 12,
      physicalDefense: 12,
      magicAttack: 8,
      magicDefense: 8,
      criticalRate: 8,
      criticalDamage: 170,
      accuracy: 85,
      evasion: 5,
      speed: 8,
      fireResist: 5,
      iceResist: 0,
      lightningResist: 0,
      poisonResist: 10,
      recovery: 0,
      weight: 90,
      dotResistance: 5,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'berserker-rage',
        name: '광전사의 분노',
        cost: 15,
        power: 45,
        type: 'physical',
        effects: [],
        description: '분노에 휩싸여 강력한 공격을 가합니다.'
      }
    ]
  },

  {
    id: 'dire-bear',
    name: '흉포한 곰',
    level: 4,
    gold: 0,
    type: 'elite',
    category: 'beast',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 150,
      maxHp: 150,
      hpRegen: 3,
      vitality: 18,
      mp: 20,
      maxMp: 20,
      mpRegen: 1,
      wisdom: 6,
      strength: 24,
      intelligence: 4,
      agility: 6,
      attack: 32,
      defense: 15,
      physicalDefense: 15,
      magicAttack: 0,
      magicDefense: 8,
      criticalRate: 15,
      criticalDamage: 200,
      accuracy: 80,
      evasion: 3,
      speed: 6,
      fireResist: 0,
      iceResist: 20,
      lightningResist: 0,
      poisonResist: 15,
      recovery: 0,
      weight: 120,
      dotResistance: 10,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'bear-maul',
        name: '곰 할퀴기',
        cost: 10,
        power: 50,
        type: 'physical',
        effects: [],
        description: '강력한 발톱으로 할퀴어 찢습니다.'
      }
    ]
  },

  // === 3단계: 고급 적들 (레벨 5-6) ===
  {
    id: 'dark-mage',
    name: '어둠의 마법사',
    level: 5,
    gold: 0,
    type: 'elite',
    category: 'humanoid',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 95,
      maxHp: 95,
      hpRegen: 1,
      vitality: 12,
      mp: 80,
      maxMp: 80,
      mpRegen: 3,
      wisdom: 18,
      strength: 8,
      intelligence: 22,
      agility: 12,
      attack: 12,
      defense: 8,
      physicalDefense: 8,
      magicAttack: 32,
      magicDefense: 15,
      criticalRate: 15,
      criticalDamage: 180,
      accuracy: 92,
      evasion: 12,
      speed: 12,
      fireResist: 10,
      iceResist: 10,
      lightningResist: 15,
      poisonResist: 20,
      recovery: 0,
      weight: 65,
      dotResistance: 10,
      hotBonus: 0,
      resourceCostReduction: 10
    },
    skills: [
      {
        id: 'shadow-bolt',
        name: '어둠의 화살',
        cost: 18,
        power: 40,
        type: 'magic',
        effects: [],
        description: '어둠 마력을 응축한 마법탄을 발사합니다.'
      },
      {
        id: 'drain-life',
        name: '생명력 흡수',
        cost: 25,
        power: 25,
        type: 'magic',
        effects: [],
        description: '적의 생명력을 흡수해 자신을 회복합니다.'
      }
    ]
  },

  {
    id: 'frost-wraith',
    name: '서리 망령',
    level: 6,
    gold: 0,
    type: 'elite',
    category: 'undead',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 85,
      maxHp: 85,
      hpRegen: 2,
      vitality: 11,
      mp: 100,
      maxMp: 100,
      mpRegen: 4,
      wisdom: 20,
      strength: 6,
      intelligence: 25,
      agility: 15,
      attack: 8,
      defense: 5,
      physicalDefense: 5,
      magicAttack: 38,
      magicDefense: 18,
      criticalRate: 18,
      criticalDamage: 190,
      accuracy: 90,
      evasion: 20,
      speed: 15,
      fireResist: -10,
      iceResist: 40,
      lightningResist: 10,
      poisonResist: 50,
      recovery: 0,
      weight: 40,
      dotResistance: 30,
      hotBonus: 0,
      resourceCostReduction: 15
    },
    skills: [
      {
        id: 'frost-bolt',
        name: '얼음 화살',
        cost: 20,
        power: 35,
        type: 'magic',
        effects: [],
        description: '차가운 얼음 화살을 발사합니다.'
      },
      {
        id: 'ice-shield',
        name: '얼음 방패',
        cost: 30,
        power: 0,
        type: 'magic',
        effects: [],
        description: '얼음으로 자신을 보호합니다.'
      }
    ]
  },

  // === 4단계: 보스급 적들 (레벨 7+) ===
  {
    id: 'ancient-golem',
    name: '고대 골렘',
    level: 7,
    gold: 0,
    type: 'boss',
    category: 'elemental',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 200,
      maxHp: 200,
      hpRegen: 3,
      vitality: 25,
      mp: 60,
      maxMp: 60,
      mpRegen: 2,
      wisdom: 10,
      strength: 28,
      intelligence: 12,
      agility: 4,
      attack: 40,
      defense: 20,
      physicalDefense: 20,
      magicAttack: 18,
      magicDefense: 12,
      criticalRate: 5,
      criticalDamage: 200,
      accuracy: 80,
      evasion: 2,
      speed: 4,
      fireResist: 15,
      iceResist: 15,
      lightningResist: 20,
      poisonResist: 30,
      recovery: 0,
      weight: 150,
      dotResistance: 20,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'earth-slam',
        name: '대지 강타',
        cost: 20,
        power: 60,
        type: 'physical',
        effects: [],
        description: '거대한 주먹으로 땅을 내리쳐 충격파를 발생시킵니다.'
      },
      {
        id: 'stone-barrier',
        name: '돌 방벽',
        cost: 30,
        power: 0,
        type: 'magic',
        effects: [],
        description: '돌로 방벽을 만들어 방어력을 높입니다.'
      }
    ]
  },
  {
    id: 'flame-dragon',
    name: '화염 드래곤',
    level: 10,
    gold: 0,
    type: 'boss',
    category: 'beast',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 350,
      maxHp: 350,
      hpRegen: 5,
      vitality: 35,
      mp: 120,
      maxMp: 120,
      mpRegen: 4,
      wisdom: 20,
      strength: 32,
      intelligence: 25,
      agility: 15,
      attack: 50,
      defense: 25,
      physicalDefense: 25,
      magicAttack: 45,
      magicDefense: 20,
      criticalRate: 20,
      criticalDamage: 250,
      accuracy: 95,
      evasion: 10,
      speed: 15,
      fireResist: 50,
      iceResist: -20,
      lightningResist: 10,
      poisonResist: 40,
      recovery: 0,
      weight: 200,
      dotResistance: 30,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'fire-breath',
        name: '화염 숨결',
        cost: 35,
        power: 80,
        type: 'magic',
        effects: [],
        description: '뜨거운 화염을 내뿜어 적을 불태웁니다.'
      },
      {
        id: 'dragon-roar',
        name: '용의 포효',
        cost: 25,
        power: 0,
        type: 'physical',
        effects: [],
        description: '위압적인 포효로 적을 위축시킵니다.'
      },
      {
        id: 'meteor-strike',
        name: '메테오 스트라이크',
        cost: 50,
        power: 120,
        type: 'magic',
        effects: [],
        description: '하늘에서 불타는 운석을 떨어뜨립니다.'
      }
    ]
  }
];

// 던전 등급별 몬스터 분류
export const DUNGEON_TIERS: DungeonTier[] = [
  {
    name: '초급 던전',
    minLevel: 1,
    maxLevel: 5,
    enemies: [
      testEnemies[0], // 고블린 정찰병
      testEnemies[1], // 숲 늑대  
      testEnemies[2], // 거대 거미
      testEnemies[3], // 해골 전사
      testEnemies[4], // 고블린 전사
    ]
  },
  {
    name: '중급 던전',
    minLevel: 6,
    maxLevel: 10,
    enemies: [
      testEnemies[3], // 해골 전사
      testEnemies[4], // 고블린 전사
      testEnemies[5], // 오크 전사
      testEnemies[6], // 흉포한 곰
    ]
  },
  {
    name: '고급 던전',
    minLevel: 11,
    maxLevel: 15,
    enemies: [
      testEnemies[5], // 오크 전사
      testEnemies[6], // 흉포한 곰
      testEnemies[7], // 어둠의 마법사
      testEnemies[8], // 서리 망령
    ]
  },
  {
    name: '최상급 던전',
    minLevel: 16,
    maxLevel: 999,
    enemies: [
      testEnemies[7], // 어둠의 마법사
      testEnemies[8], // 서리 망령
      testEnemies[9], // 고대 골렘 (보스급도 일반 적으로)
      testEnemies[10], // 화염 드래곤 (보스급도 일반 적으로)
    ]
  }
];

// 던전 레벨에 맞는 적 풀 가져오기
export const getEnemiesForDungeonLevel = (dungeonLevel: number): Combatant[] => {
  const tier = DUNGEON_TIERS.find(tier => 
    dungeonLevel >= tier.minLevel && dungeonLevel <= tier.maxLevel
  );
  
  return tier ? tier.enemies : DUNGEON_TIERS[0].enemies; // 기본값은 초급 던전
};

// 던전 레벨에 맞는 보스 가져오기
export const getBossForDungeonLevel = (dungeonLevel: number): Combatant | null => {
  if (dungeonLevel >= 20) {
    return testEnemies[10]; // 화염 드래곤 (최상급 보스)
  } else if (dungeonLevel >= 15) {
    return testEnemies[9]; // 고대 골렘 (고급 보스)
  } else if (dungeonLevel >= 10) {
    return testEnemies[7]; // 어둠의 마법사 (중급 보스)
  } else if (dungeonLevel >= 5) {
    return testEnemies[5]; // 오크 전사 (초급 보스)
  }
  
  return null; // 5층 미만에는 보스 없음
};

