import type { DungeonTemplate, Reward, EventType } from '../types/dungeon';
import type { Combatant } from '../types/battle';
import type { Item, Material } from '../types/gameTypes';

// 기본 재료들 (연금술 시스템과 연동)
const COMMON_MATERIALS: Material[] = [
  { id: 'herb-healing', name: '치유 허브', type: 'material', weight: 0.1, description: '치유에 사용되는 기본 허브' },
  { id: 'mushroom-mana', name: '마나 버섯', type: 'material', weight: 0.1, description: '마나 회복에 효과적인 신비한 버섯' },
  { id: 'stone-magic', name: '마법석', type: 'material', weight: 0.2, description: '마법 에너지가 응축된 신비한 돌' },
  { id: 'essence-fire', name: '화염 정수', type: 'material', weight: 0.1, description: '화염 원소의 순수한 에너지' },
  { id: 'essence-water', name: '물 정수', type: 'material', weight: 0.1, description: '물 원소의 순수한 에너지' },
];

// 기본 아이템들
const BASIC_ITEMS: Item[] = [
  {
    id: 'sword-iron',
    name: '철검',
    type: 'weapon',
    weight: 2.0,
    stats: { attack: 15, strength: 3, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, agility: 0, intelligence: 0, vitality: 0, wisdom: 0, accuracy: 0, speed: 0, weight: 0, magicAttack: 0, criticalRate: 0, criticalDamage: 0, physicalDefense: 0, magicDefense: 0, evasion: 0 },
    originalId: 'sword-iron'
  },
  {
    id: 'armor-leather',
    name: '가죽 갑옷',
    type: 'armor',
    weight: 3.0,
    stats: { defense: 10, hp: 20, maxHp: 20, attack: 0, mp: 0, maxMp: 0, agility: 0, intelligence: 0, strength: 0, vitality: 0, wisdom: 0, accuracy: 0, speed: 0, weight: 0, magicAttack: 0, criticalRate: 0, criticalDamage: 0, physicalDefense: 10, magicDefense: 0, evasion: 0 },
    originalId: 'armor-leather'
  }
];

// 기본 적들
const createGoblin = (level: number = 1): Combatant => ({
  id: `goblin-${level}`,
  name: `고블린 Lv.${level}`,
  type: 'normal',
  category: 'humanoid',
  isEnemy: true,
  level,
  stats: {
    hp: 30 + (level * 10),
    maxHp: 30 + (level * 10),
    mp: 10 + (level * 5),
    maxMp: 10 + (level * 5),
    strength: 10 + (level * 2),
    defense: 3 + level,
    intelligence: 5 + level,
    agility: 12 + level,
    vitality: 10 + level,
    wisdom: 5 + level,
    accuracy: 8 + level,
    speed: 12 + level,
    weight: 50 + (level * 5),
    attack: 8 + (level * 2),
    magicAttack: 2 + level,
    criticalRate: 5,
    criticalDamage: 150,
    physicalDefense: 3 + level,
    magicDefense: 2 + level,
    evasion: 8 + level,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0,
    dotResistance: 0,
    hotBonus: 0,
    recovery: 1,
    hpRegen: 0,
    mpRegen: 0,
    resourceCostReduction: 0
  },
  statusEffects: [],
  skills: [],
  gold: 0
});

const createOrc = (level: number = 2): Combatant => ({
  id: `orc-${level}`,
  name: `오크 전사 Lv.${level}`,
  type: 'elite',
  category: 'humanoid',
  isEnemy: true,
  level,
  stats: {
    hp: 60 + (level * 15),
    maxHp: 60 + (level * 15),
    mp: 20 + (level * 5),
    maxMp: 20 + (level * 5),
    strength: 18 + (level * 3),
    defense: 8 + (level * 2),
    intelligence: 6 + level,
    agility: 8 + level,
    vitality: 15 + (level * 2),
    wisdom: 6 + level,
    accuracy: 10 + level,
    speed: 8 + level,
    weight: 80 + (level * 8),
    attack: 15 + (level * 3),
    magicAttack: 4 + level,
    criticalRate: 8,
    criticalDamage: 160,
    physicalDefense: 8 + (level * 2),
    magicDefense: 4 + level,
    evasion: 5 + level,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0,
    dotResistance: 0,
    hotBonus: 0,
    recovery: 2,
    hpRegen: 0,
    mpRegen: 0,
    resourceCostReduction: 0
  },
  statusEffects: [],
  skills: [],
  gold: 0
});

const createDragon = (level: number = 5): Combatant => ({
  id: `dragon-${level}`,
  name: `어린 드래곤 Lv.${level}`,
  type: 'boss',
  category: 'elemental',
  isEnemy: true,
  level,
  stats: {
    hp: 150 + (level * 25),
    maxHp: 150 + (level * 25),
    mp: 80 + (level * 10),
    maxMp: 80 + (level * 10),
    strength: 25 + (level * 4),
    defense: 15 + (level * 3),
    intelligence: 20 + (level * 3),
    agility: 15 + (level * 2),
    vitality: 25 + (level * 3),
    wisdom: 20 + (level * 3),
    accuracy: 15 + (level * 2),
    speed: 15 + (level * 2),
    weight: 200 + (level * 20),
    attack: 25 + (level * 5),
    magicAttack: 20 + (level * 4),
    criticalRate: 15,
    criticalDamage: 200,
    physicalDefense: 15 + (level * 3),
    magicDefense: 20 + (level * 4),
    evasion: 10 + level,
    fireResist: 50,
    iceResist: -20,
    lightningResist: 0,
    poisonResist: 30,
    dotResistance: 20,
    hotBonus: 10,
    recovery: 5,
    hpRegen: 2,
    mpRegen: 2,
    resourceCostReduction: 0
  },
  statusEffects: [],
  skills: [],
  gold: 0
});

// 보상 풀들
const COMMON_REWARDS: Reward[] = [
  { type: 'gold', amount: 10 },
  { type: 'gold', amount: 15 },
  { type: 'material', material: COMMON_MATERIALS[0], amount: 1 },
  { type: 'material', material: COMMON_MATERIALS[1], amount: 1 },
  { type: 'experience', amount: 25 },
];

const UNCOMMON_REWARDS: Reward[] = [
  { type: 'gold', amount: 25 },
  { type: 'gold', amount: 35 },
  { type: 'material', material: COMMON_MATERIALS[2], amount: 1 },
  { type: 'material', material: COMMON_MATERIALS[3], amount: 1 },
  { type: 'item', item: BASIC_ITEMS[0] },
  { type: 'experience', amount: 50 },
];

const RARE_REWARDS: Reward[] = [
  { type: 'gold', amount: 50 },
  { type: 'gold', amount: 75 },
  { type: 'material', material: COMMON_MATERIALS[4], amount: 2 },
  { type: 'item', item: BASIC_ITEMS[1] },
  { type: 'experience', amount: 100 },
];

const BOSS_REWARDS: Reward[] = [
  { type: 'gold', amount: 100 },
  { type: 'gold', amount: 150 },
  { type: 'material', material: COMMON_MATERIALS[2], amount: 3 },
  { type: 'material', material: COMMON_MATERIALS[3], amount: 2 },
  { type: 'material', material: COMMON_MATERIALS[4], amount: 2 },
  { type: 'experience', amount: 200 },
];

// 던전 템플릿들
export const DUNGEON_TEMPLATES: DungeonTemplate[] = [
  // 초급 던전 - 어둠의 숲
  {
    id: 'forest-dark-easy',
    name: '어둠의 숲',
    type: 'forest',
    difficulty: 'easy',
    level: 1,
    description: '초보 모험가를 위한 작은 숲 던전입니다. 고블린들이 서식하고 있습니다.',
    
    minRooms: 5,
    maxRooms: 8,
    width: 4,
    height: 3,
    
    battleRoomChance: 60,
    treasureRoomChance: 20,
    eventRoomChance: 20,
    
    enemyPool: [
      createGoblin(1),
      createGoblin(2),
      createOrc(1)
    ],
    
    rewardPools: {
      common: COMMON_REWARDS,
      uncommon: UNCOMMON_REWARDS.slice(0, 3),
      rare: RARE_REWARDS.slice(0, 2),
      boss: BOSS_REWARDS.slice(0, 3)
    }
  },

  // 중급 던전 - 고블린 동굴
  {
    id: 'cave-goblin-normal',
    name: '고블린 동굴',
    type: 'cave',
    difficulty: 'normal',
    level: 3,
    description: '고블린 족장이 지배하는 어두운 동굴입니다. 더 강한 적들과 보물이 기다리고 있습니다.',
    
    minRooms: 8,
    maxRooms: 12,
    width: 5,
    height: 4,
    
    battleRoomChance: 50,
    treasureRoomChance: 25,
    eventRoomChance: 25,
    
    enemyPool: [
      createGoblin(2),
      createGoblin(3),
      createOrc(2),
      createOrc(3)
    ],
    bossEnemy: createOrc(4),
    
    rewardPools: {
      common: COMMON_REWARDS,
      uncommon: UNCOMMON_REWARDS,
      rare: RARE_REWARDS.slice(0, 4),
      boss: BOSS_REWARDS
    }
  },

  // 고급 던전 - 고대 유적
  {
    id: 'ruins-ancient-hard',
    name: '고대 유적',
    type: 'ruins',
    difficulty: 'hard',
    level: 5,
    description: '고대 마법사들이 남긴 신비로운 유적입니다. 강력한 마법과 귀중한 보물들이 잠들어 있습니다.',
    
    minRooms: 10,
    maxRooms: 15,
    width: 6,
    height: 5,
    
    battleRoomChance: 45,
    treasureRoomChance: 30,
    eventRoomChance: 25,
    
    enemyPool: [
      createOrc(3),
      createOrc(4),
      createGoblin(4),
      createGoblin(5)
    ],
    bossEnemy: createDragon(5),
    
    rewardPools: {
      common: COMMON_REWARDS,
      uncommon: UNCOMMON_REWARDS,
      rare: RARE_REWARDS,
      boss: BOSS_REWARDS
    }
  }
];

// 이벤트 템플릿들
export const EVENT_TEMPLATES: Record<EventType, {
  name: string;
  description: string;
  successChance: number;
  successRewards: Reward[];
  failurePenalty?: { hpLoss?: number; mpLoss?: number; goldLoss?: number };
}> = {
  heal: {
    name: '치유의 샘',
    description: '신비로운 샘물이 흘러나오고 있습니다. 마시면 체력을 회복할 수 있을 것 같습니다.',
    successChance: 100,
    successRewards: []
  },
  buff: {
    name: '고대의 제단',
    description: '고대 룬이 새겨진 제단입니다. 만지면 일시적으로 힘이 강해질 것 같습니다.',
    successChance: 80,
    successRewards: []
  },
  shop: {
    name: '떠돌이 상인',
    description: '던전에서 만난 신비한 상인입니다. 유용한 물건들을 팔고 있습니다.',
    successChance: 100,
    successRewards: []
  },
  fountain: {
    name: '마나의 샘',
    description: '푸른 빛이 나는 마법의 샘입니다. 마시면 마나가 회복될 것 같습니다.',
    successChance: 100,
    successRewards: []
  },
  trap: {
    name: '함정!',
    description: '바닥이 갑자기 무너집니다! 재빨리 피해야 합니다.',
    successChance: 70,
    successRewards: [{ type: 'experience', amount: 10 }],
    failurePenalty: { hpLoss: 15 }
  },
  puzzle: {
    name: '수수께끼 상자',
    description: '복잡한 수수께끼가 적힌 상자입니다. 올바른 답을 맞히면 보상을 얻을 수 있을 것 같습니다.',
    successChance: 60,
    successRewards: [
      { type: 'gold', amount: 30 },
      { type: 'material', material: COMMON_MATERIALS[2], amount: 1 }
    ]
  },
  merchant: {
    name: '신비한 상인',
    description: '후드를 쓴 상인이 특별한 거래를 제안합니다.',
    successChance: 100,
    successRewards: []
  },
  altar: {
    name: '신비한 제단',
    description: '알 수 없는 힘이 느껴지는 제단입니다. 조심스럽게 접근해야 할 것 같습니다.',
    successChance: 50,
    successRewards: [{ type: 'experience', amount: 50 }],
    failurePenalty: { hpLoss: 10, mpLoss: 5 }
  },
  rest: {
    name: '휴식처',
    description: '안전해 보이는 작은 공간입니다. 잠시 휴식을 취할 수 있을 것 같습니다.',
    successChance: 100,
    successRewards: []
  }
};

// 던전을 ID로 찾는 헬퍼 함수
export const getDungeonTemplate = (id: string): DungeonTemplate | undefined => {
  return DUNGEON_TEMPLATES.find(template => template.id === id);
};

// 난이도별 던전 목록
export const getDungeonsByDifficulty = (difficulty: string): DungeonTemplate[] => {
  return DUNGEON_TEMPLATES.filter(template => template.difficulty === difficulty);
};

// 타입별 던전 목록
export const getDungeonsByType = (type: string): DungeonTemplate[] => {
  return DUNGEON_TEMPLATES.filter(template => template.type === type);
};