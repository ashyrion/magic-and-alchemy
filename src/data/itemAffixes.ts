import type { ItemAffix, ItemRarity } from '../types/gameTypes';

// 접두사 (Prefixes) - 공격적/능동적 속성
const itemPrefixes: ItemAffix[] = [
  // === 힘 기반 접두사 ===
  {
    id: 'mighty',
    name: '강력한',
    type: 'prefix',
    tier: 1,
    stats: { strength: 2, attack: 3 },
    description: '힘과 물리 공격력이 증가합니다.',
    itemTypes: ['weapon', 'armor']
  },
  {
    id: 'brutal',
    name: '야만적인',
    type: 'prefix',
    tier: 1,
    stats: { strength: 3, attack: 2 },
    description: '힘이 대폭 증가합니다.',
    itemTypes: ['weapon']
  },
  {
    id: 'heavy',
    name: '묵직한',
    type: 'prefix',
    tier: 2,
    stats: { strength: 2, defense: 2 },
    description: '힘과 방어력이 증가합니다.',
    itemTypes: ['weapon', 'armor']
  },
  
  // === 민첩 기반 접두사 ===
  {
    id: 'swift',
    name: '신속한',
    type: 'prefix',
    tier: 1,
    stats: { agility: 2, evasion: 2 },
    description: '민첩과 회피율이 증가합니다.',
    itemTypes: ['weapon', 'armor', 'accessory']
  },
  {
    id: 'precise',
    name: '정확한',
    type: 'prefix',
    tier: 1,
    stats: { agility: 2, criticalRate: 1 },
    description: '민첩과 치명타 확률이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'keen',
    name: '예리한',
    type: 'prefix',
    tier: 2,
    stats: { agility: 3, criticalRate: 2 },
    description: '민첩과 치명타 확률이 증가합니다.',
    itemTypes: ['weapon']
  },

  // === 지능 관련 (마법) ===
  {
    id: 'mystic',
    name: '신비한',
    type: 'prefix',
    tier: 1,
    stats: { intelligence: 2, maxMp: 8 },
    description: '지능과 최대 마나가 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'arcane',
    name: '비밀의',
    type: 'prefix',
    tier: 2,
    stats: { intelligence: 3, criticalDamage: 5 },
    description: '지능과 치명타 피해가 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'enchanted',
    name: '마법부여된',
    type: 'prefix',
    tier: 2,
    stats: { intelligence: 2, maxMp: 10 },
    description: '지능과 최대 마나가 증가합니다.',
    itemTypes: ['weapon', 'armor', 'accessory']
  },
  {
    id: 'wise',
    name: '현명한',
    type: 'prefix',
    tier: 1,
    stats: { intelligence: 2, maxMp: 6 },
    description: '지능과 최대 마나가 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'scholarly',
    name: '학자의',
    type: 'prefix',
    tier: 3,
    stats: { intelligence: 4, criticalDamage: 8 },
    description: '지능과 치명타 피해가 크게 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },

  // === 방어 관련 ===
  {
    id: 'reinforced',
    name: '강화된',
    type: 'prefix',
    tier: 1,
    stats: { strength: 1, defense: 3 },
    description: '힘과 방어력이 증가합니다.',
    itemTypes: ['armor']
  },
  {
    id: 'blessed',
    name: '축복받은',
    type: 'prefix',
    tier: 1,
    stats: { intelligence: 1, maxHp: 8 },
    description: '지능과 생명력이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'sturdy',
    name: '튼튼한',
    type: 'prefix',
    tier: 2,
    stats: { strength: 2, maxHp: 6 },
    description: '힘과 생명력이 증가합니다.',
    itemTypes: ['armor']
  },
  {
    id: 'guardian',
    name: '수호의',
    type: 'prefix',
    tier: 2,
    stats: { agility: 1, defense: 2 },
    description: '민첩과 방어력이 증가합니다.',
    itemTypes: ['armor']
  },

  // === 속성 관련 ===
  {
    id: 'flaming',
    name: '화염의',
    type: 'prefix',
    tier: 2,
    stats: { intelligence: 1, fireResist: 10 },
    description: '지능과 화염 저항력이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'frozen',
    name: '얼음의',
    type: 'prefix',
    tier: 2,
    stats: { intelligence: 1, iceResist: 10 },
    description: '지능과 빙결 저항력이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'shocking',
    name: '전기의',
    type: 'prefix',
    tier: 2,
    stats: { intelligence: 1, lightningResist: 10 },
    description: '지능과 전기 저항력이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },

  // === 균형 잡힌 접두사 ===
  {
    id: 'empowered',
    name: '강화된',
    type: 'prefix',
    tier: 2,
    stats: { strength: 1, intelligence: 1, attack: 2 },
    description: '힘과 지능, 공격력이 증가합니다.',
    itemTypes: ['weapon']
  },
  {
    id: 'masterwork',
    name: '명작의',
    type: 'prefix',
    tier: 3,
    stats: { agility: 2, intelligence: 2 },
    description: '민첩성과 지능이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'volatile',
    name: '불안정한',
    type: 'prefix',
    tier: 2,
    stats: { intelligence: 3, criticalRate: 3, criticalDamage: -5 },
    description: '지능과 치명타 확률이 증가하지만 치명타 피해가 감소합니다.',
    itemTypes: ['weapon']
  }
];

// 접미어 (Suffixes) - 방어적/보조적 속성
const itemSuffixes: ItemAffix[] = [
  // === 생존력 관련 ===
  {
    id: 'vitality',
    name: '활력의',
    type: 'suffix',
    tier: 1,
    stats: { strength: 1, maxHp: 15 },
    description: '힘과 최대 생명력이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'fortitude',
    name: '인내의',
    type: 'suffix',
    tier: 1,
    stats: { strength: 2, maxHp: 10 },
    description: '힘과 생명력이 증가합니다.',
    itemTypes: ['armor']
  },
  {
    id: 'protection',
    name: '보호의',
    type: 'suffix',
    tier: 2,
    stats: { strength: 1, agility: 1, defense: 3 },
    description: '힘, 민첩, 방어력이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },

  // === 민첩성 관련 ===
  {
    id: 'swiftness',
    name: '신속의',
    type: 'suffix',
    tier: 1,
    stats: { agility: 2, evasion: 3 },
    description: '민첩성과 회피율이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'precision',
    name: '정확성의',
    type: 'suffix',
    tier: 2,
    stats: { agility: 2, criticalRate: 2 },
    description: '민첩성과 치명타율이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'grace',
    name: '우아함의',
    type: 'suffix',
    tier: 2,
    stats: { agility: 2, evasion: 2 },
    description: '민첩성과 회피율이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },

  // === 마법 관련 ===
  {
    id: 'wisdom',
    name: '지혜의',
    type: 'suffix',
    tier: 1,
    stats: { intelligence: 3, maxMp: 8 },
    description: '지능과 최대 마나가 증가합니다.',
    itemTypes: ['weapon', 'armor', 'accessory']
  },
  {
    id: 'meditation',
    name: '명상의',
    type: 'suffix',
    tier: 2,
    stats: { intelligence: 1, maxMp: 12 },
    description: '지능과 최대 마나가 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'focus',
    name: '집중의',
    type: 'suffix',
    tier: 2,
    stats: { intelligence: 2, criticalDamage: 4 },
    description: '지능과 치명타 피해가 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },

  // === 저항력 관련 ===
  {
    id: 'fire_resistance',
    name: '화염 저항의',
    type: 'suffix',
    tier: 3,
    stats: { fireResist: 15 },
    description: '화염 저항력이 크게 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'ice_resistance',
    name: '빙결 저항의',
    type: 'suffix',
    tier: 3,
    stats: { iceResist: 15 },
    description: '빙결 저항력이 크게 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'lightning_resistance',
    name: '전기 저항의',
    type: 'suffix',
    tier: 3,
    stats: { lightningResist: 15 },
    description: '전기 저항력이 크게 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'poison_resistance',
    name: '독 저항의',
    type: 'suffix',
    tier: 3,
    stats: { poisonResist: 15 },
    description: '독 저항력이 크게 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },

  // === 특수 효과 ===
  {
    id: 'regeneration',
    name: '재생의',
    type: 'suffix',
    tier: 2,
    stats: { strength: 1, maxHp: 8 },
    description: '힘과 최대 생명력이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'mastery',
    name: '숙련의',
    type: 'suffix',
    tier: 3,
    stats: { strength: 1, agility: 1, intelligence: 1 },
    description: '모든 기본 스탯이 증가합니다.',
    itemTypes: ['weapon', 'armor', 'accessory']
  },
  {
    id: 'balance',
    name: '균형의',
    type: 'suffix',
    tier: 2,
    stats: { agility: 1, defense: 2 },
    description: '민첩성과 방어력이 균형있게 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },

  // === 추가 균형 접미사 ===
  {
    id: 'power',
    name: '힘의',
    type: 'suffix',
    tier: 1,
    stats: { strength: 2, attack: 2 },
    description: '힘과 물리 공격력이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'resilience',
    name: '회복력의',
    type: 'suffix',
    tier: 2,
    stats: { strength: 1, agility: 1, maxHp: 6 },
    description: '힘, 민첩성과 최대 생명력이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'amplification',
    name: '증폭의',
    type: 'suffix',
    tier: 2,
    stats: { intelligence: 2, magicAttack: 3 },
    description: '지능과 마법 공격력이 증가합니다.',
    itemTypes: ['weapon', 'accessory']
  },
  {
    id: 'warding',
    name: '보호막의',
    type: 'suffix',
    tier: 3,
    stats: { fireResist: 8, iceResist: 8, lightningResist: 8 },
    description: '화염, 빙결, 전기 저항력이 증가합니다.',
    itemTypes: ['armor', 'accessory']
  },
  {
    id: 'perfection',
    name: '완벽의',
    type: 'suffix',
    tier: 4,
    stats: { strength: 2, agility: 2, intelligence: 2, maxHp: 5, maxMp: 5 },
    description: '모든 능력치가 완벽하게 증가합니다.',
    itemTypes: ['weapon', 'armor', 'accessory']
  }
];

// 등급별 색상 정의  
const rarityColors: Record<ItemRarity, string> = {
  common: '#FFFFFF',    // 흰색
  magic: '#4A90E2',     // 파란색
  rare: '#F5A623',      // 노란색
  unique: '#FF6B35'     // 오렌지색
};

// 등급별 접두사/접미어 개수 설정
const rarityAffixRules: Record<ItemRarity, {
  prefixes: { min: number; max: number };
  suffixes: { min: number; max: number };
  minTotal?: number;
  maxTier?: number; // 최대 접사 tier 제한
}> = {
  common: {
    prefixes: { min: 0, max: 0 },
    suffixes: { min: 0, max: 0 }
  },
  magic: {
    prefixes: { min: 0, max: 1 },
    suffixes: { min: 0, max: 1 },
    minTotal: 1, // 최소 1개는 있어야 함
    maxTier: 2   // tier 1-2만 사용
  },
  rare: {
    prefixes: { min: 1, max: 2 },
    suffixes: { min: 1, max: 2 },
    maxTier: 3   // tier 1-3 사용
  },
  unique: {
    prefixes: { min: 2, max: 3 },
    suffixes: { min: 2, max: 3 },
    maxTier: 4   // 모든 tier 사용 가능
  }
};

export { itemPrefixes, itemSuffixes, rarityColors, rarityAffixRules };