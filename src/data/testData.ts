import type { Character, Item, Material, Skill } from '../types/gameTypes';

export const testCharacter: Character = {
  id: 'player-1',
  name: '견습 마법사',
  level: 1,
  stats: {
    hp: 100,
    maxHp: 100,
    hpRegen: 1,
    vitality: 10,
    mp: 100,
    maxMp: 100,
    mpRegen: 1,
    wisdom: 10,
    strength: 10,
    intelligence: 8,
    agility: 5,
    attack: 10,
    defense: 5,
    magicAttack: 8,
    magicDefense: 5,
    criticalRate: 5,
    criticalDamage: 150,
    accuracy: 95,
    evasion: 5,
    speed: 10,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0,
    weight: 60,
    physicalDefense: 5,
    resourceCostReduction: 0,
    dotResistance: 0,
    hotBonus: 0,
    recovery: 0
  },
  statusEffects: [],
  skills: [], // 기본적으로 스킬이 없음
  gold: 100,
  isEnemy: false,
  type: 'normal',
  category: 'humanoid',
};

export const testItems: Item[] = [
  {
    id: 'item-1',
    name: '낡은 지팡이',
    type: 'weapon',
    weight: 1.5,
    stats: {
      attack: 2,        // 물리 공격력 소폭 증가
      magicAttack: 5    // 마법 공격력 주력 증가
    }
  },
  {
    id: 'item-2',
    name: '가죽 로브',
    type: 'armor',
    weight: 2.0,
    stats: {
      defense: 3
    }
  },
  {
    id: 'item-3',
    name: '마력의 반지',
    type: 'accessory',
    weight: 0.5,
    stats: {
      intelligence: 2,  // 지능 증가
      magicAttack: 3    // 마법 공격력 증가
    }
  }
];

export const testMaterials: Material[] = [
  {
    id: 'mat-1',
    name: '붉은 허브',
    type: 'material',
    weight: 0.1,
    description: '회복에 도움이 되는 허브입니다.'
  },
  {
    id: 'mat-2',
    name: '파란 크리스탈',
    type: 'material',
    weight: 0.3,
    description: '마나를 보충하는 크리스탈입니다.'
  },
  {
    id: 'mat-3',
    name: '황금 가루',
    type: 'material',
    weight: 0.1,
    description: '강화에 사용되는 황금 가루입니다.'
  }
];

export const testSkills: Skill[] = [
  {
    id: 'skill-1',
    name: '파이어볼',
    type: 'magic',
    power: 15,
    cost: 10,
    effects: []
  },
  {
    id: 'skill-2',
    name: '힐링 포션',
    type: 'alchemy',
    power: 20,
    cost: 15,
    effects: []
  }
];