import type { Combatant } from '../types/battle';

// 테스트용 플레이어 데이터
export const testPlayer: Combatant = {
  id: 'player',
  name: '견습 마법사',
  level: 1,
  gold: 0,
  type: 'normal',
  category: 'humanoid',
  isEnemy: false,
  statusEffects: [],
  stats: {
    hp: 100,
    maxHp: 100,
    hpRegen: 1,
    vitality: 10,
    mp: 50,
    maxMp: 50,
    mpRegen: 1,
    wisdom: 10,
    strength: 15,
    intelligence: 10,
    agility: 12,
    attack: 15,
    defense: 8,
    physicalDefense: 8,
    magicAttack: 10,
    magicDefense: 8,
    criticalRate: 5,
    criticalDamage: 150,
    accuracy: 95,
    evasion: 5,
    speed: 10,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0,
    recovery: 100,
    weight: 70,
    dotResistance: 0,
    hotBonus: 0,
    resourceCostReduction: 0
  },
  skills: [
    {
      id: 'skill-1',
      name: '파이어볼',
      cost: 10,
      power: 20,
      type: 'magic',
      effects: []
    },
    {
      id: 'skill-2',
      name: '아이스 볼트',
      cost: 8,
      power: 15,
      type: 'magic',
      effects: []
    }
  ]
};

// 테스트용 적 데이터
export const testEnemies: Combatant[] = [
  {
    id: 'enemy1',
    name: '고블린',
    level: 1,
    gold: 10,
    type: 'normal',
    category: 'beast',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 50,
      maxHp: 50,
      hpRegen: 1,
      vitality: 8,
      mp: 20,
      maxMp: 20,
      mpRegen: 1,
      wisdom: 5,
      strength: 12,
      intelligence: 5,
      agility: 8,
      attack: 12,
      defense: 5,
      physicalDefense: 5,
      magicAttack: 5,
      magicDefense: 5,
      criticalRate: 5,
      criticalDamage: 150,
      accuracy: 95,
      evasion: 5,
      speed: 8,
      fireResist: 0,
      iceResist: 0,
      lightningResist: 0,
      poisonResist: 0,
      recovery: 100,
      weight: 40,
      dotResistance: 0,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'enemy-skill1',
        name: '곤봉 휘두르기',
        cost: 0,
        power: 10,
        type: 'physical',
        effects: []
      }
    ]
  },
  {
    id: 'enemy2',
    name: '다크 위저드',
    level: 2,
    gold: 25,
    type: 'elite',
    category: 'humanoid',
    isEnemy: true,
    statusEffects: [],
    stats: {
      hp: 80,
      maxHp: 80,
      hpRegen: 1,
      vitality: 8,
      mp: 60,
      maxMp: 60,
      mpRegen: 1,
      wisdom: 15,
      strength: 8,
      intelligence: 15,
      agility: 10,
      attack: 8,
      defense: 6,
      physicalDefense: 6,
      magicAttack: 15,
      magicDefense: 8,
      criticalRate: 5,
      criticalDamage: 150,
      accuracy: 95,
      evasion: 5,
      speed: 10,
      fireResist: 0,
      iceResist: 0,
      lightningResist: 0,
      poisonResist: 0,
      recovery: 100,
      weight: 55,
      dotResistance: 0,
      hotBonus: 0,
      resourceCostReduction: 0
    },
    skills: [
      {
        id: 'enemy-skill2',
        name: '다크 볼트',
        cost: 12,
        power: 25,
        type: 'magic',
        effects: []
      }
    ]
  }
];


