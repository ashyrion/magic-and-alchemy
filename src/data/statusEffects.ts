import type { StatusEffect } from '../types/gameTypes';

// 상태 효과 데이터 정의
export const statusEffectsData: Record<string, StatusEffect> = {
  // === 화염 계열 ===
  burn: {
    id: 'burn',
    name: '화상',
    description: '턴마다 화염 피해를 입습니다',
    type: 'dot',
    element: 'fire',
    duration: 3,
    stackable: true,
    maxStacks: 5,
    value: 8,
    tickPower: 8,
    tickPeriod: 1,
    icon: '🔥',
    effects: [],
    onTick: (target) => {
      const effect = target.statusEffects.find(e => e.id === 'burn');
      if (effect && effect.currentStacks) {
        return effect.tickPower! * effect.currentStacks;
      }
      return effect?.tickPower || 8;
    }
  },

  fireAura: {
    id: 'fireAura',
    name: '화염 오라',
    description: '화염 피해가 증가합니다',
    type: 'buff',
    element: 'fire',
    duration: 5,
    stackable: false,
    value: 25,
    icon: '🌋',
    effects: [
      { stat: 'attack', value: 15, isPercentage: false },
      { stat: 'magicAttack', value: 20, isPercentage: false }
    ]
  },

  // === 빙결 계열 ===
  frozen: {
    id: 'frozen',
    name: '빙결',
    description: '얼어붙어 행동할 수 없습니다',
    type: 'debuff',
    element: 'ice',
    duration: 2,
    stackable: false,
    value: 0,
    icon: '❄️',
    effects: [
      { stat: 'speed', value: -50, isPercentage: true }
    ],
    isDisabling: true,
    preventsActions: ['attack', 'skill']
  },

  frostbite: {
    id: 'frostbite',
    name: '동상',
    description: '턴마다 냉기 피해를 입고 공격력이 감소합니다',
    type: 'dot',
    element: 'ice',
    duration: 4,
    stackable: true,
    maxStacks: 3,
    value: 6,
    tickPower: 6,
    icon: '🧊',
    effects: [
      { stat: 'attack', value: -10, isPercentage: false }
    ],
    onTick: (target) => {
      const effect = target.statusEffects.find(e => e.id === 'frostbite');
      return effect?.tickPower || 6;
    }
  },

  // === 번개 계열 ===
  shocked: {
    id: 'shocked',
    name: '감전',
    description: '번개에 감전되어 마비됩니다',
    type: 'debuff',
    element: 'lightning',
    duration: 3,
    stackable: false,
    value: 0,
    icon: '⚡',
    effects: [
      { stat: 'evasion', value: -20, isPercentage: false },
      { stat: 'accuracy', value: -15, isPercentage: false }
    ]
  },

  electrified: {
    id: 'electrified',
    name: '전기 충전',
    description: '전기 에너지로 충전되어 행동 속도가 증가합니다',
    type: 'buff',
    element: 'lightning',
    duration: 4,
    stackable: false,
    value: 0,
    icon: '🌩️',
    effects: [
      { stat: 'speed', value: 30, isPercentage: true },
      { stat: 'criticalRate', value: 15, isPercentage: false }
    ]
  },

  // === 독 계열 ===
  poisoned: {
    id: 'poisoned',
    name: '중독',
    description: '턴마다 독 피해를 입습니다',
    type: 'dot',
    element: 'poison',
    duration: 5,
    stackable: true,
    maxStacks: 3,
    value: 5,
    tickPower: 5,
    icon: '☠️',
    effects: [
      { stat: 'hpRegen', value: -2, isPercentage: false }
    ],
    onTick: (target) => {
      const effect = target.statusEffects.find(e => e.id === 'poisoned');
      if (effect && effect.currentStacks) {
        return effect.tickPower! * effect.currentStacks;
      }
      return effect?.tickPower || 5;
    }
  },

  // === 치유 계열 ===
  regeneration: {
    id: 'regeneration',
    name: '재생',
    description: '턴마다 HP가 회복됩니다',
    type: 'hot',
    element: 'light',
    duration: 5,
    stackable: true,
    maxStacks: 3,
    value: 12,
    tickPower: 12,
    icon: '💚',
    effects: [],
    onTick: (target) => {
      const effect = target.statusEffects.find(e => e.id === 'regeneration');
      if (effect && effect.currentStacks) {
        return -(effect.tickPower! * effect.currentStacks); // 음수로 반환하여 힐링
      }
      return -(effect?.tickPower || 12);
    }
  },

  blessed: {
    id: 'blessed',
    name: '축복',
    description: '신의 가호로 모든 능력이 향상됩니다',
    type: 'buff',
    element: 'light',
    duration: 6,
    stackable: false,
    value: 0,
    icon: '✨',
    effects: [
      { stat: 'attack', value: 20, isPercentage: true },
      { stat: 'magicAttack', value: 20, isPercentage: true },
      { stat: 'defense', value: 15, isPercentage: true },
      { stat: 'magicDefense', value: 15, isPercentage: true }
    ]
  },

  // === 물리 계열 ===
  weakened: {
    id: 'weakened',
    name: '약화',
    description: '공격력이 감소합니다',
    type: 'debuff',
    element: 'neutral',
    duration: 4,
    stackable: false,
    value: 0,
    icon: '💔',
    effects: [
      { stat: 'attack', value: -30, isPercentage: true },
      { stat: 'magicAttack', value: -25, isPercentage: true }
    ]
  },

  strengthened: {
    id: 'strengthened',
    name: '강화',
    description: '공격력이 증가합니다',
    type: 'buff',
    element: 'neutral',
    duration: 5,
    stackable: false,
    value: 0,
    icon: '💪',
    effects: [
      { stat: 'attack', value: 25, isPercentage: true },
      { stat: 'criticalDamage', value: 50, isPercentage: false }
    ]
  },

  // === 방어 계열 ===
  shielded: {
    id: 'shielded',
    name: '보호막',
    description: '받는 피해가 감소합니다',
    type: 'buff',
    element: 'neutral',
    duration: 4,
    stackable: false,
    value: 0,
    icon: '🛡️',
    effects: [
      { stat: 'physicalDefense', value: 50, isPercentage: true },
      { stat: 'magicDefense', value: 40, isPercentage: true }
    ]
  },

  vulnerable: {
    id: 'vulnerable',
    name: '취약',
    description: '받는 피해가 증가합니다',
    type: 'debuff',
    element: 'neutral',
    duration: 3,
    stackable: false,
    value: 0,
    icon: '🩹',
    effects: [
      { stat: 'physicalDefense', value: -40, isPercentage: true },
      { stat: 'magicDefense', value: -35, isPercentage: true }
    ]
  }
};

// 스킬별 적용할 상태 효과 매핑
export const skillStatusEffects: Record<string, string[]> = {
  'skill-fireball': ['burn'],
  'skill-flame-burst': ['burn', 'fireAura'],
  'skill-ice-shard': ['frostbite'],
  'skill-blizzard': ['frozen', 'frostbite'],
  'skill-lightning-bolt': ['shocked'],
  'skill-chain-lightning': ['shocked', 'electrified'],
  'skill-poison-dart': ['poisoned'],
  'skill-toxic-cloud': ['poisoned', 'weakened'],
  'skill-heal': ['regeneration'],
  'skill-greater-heal': ['regeneration', 'blessed'],
  'skill-bless': ['blessed'],
  'skill-shield': ['shielded'],
  'skill-weaken': ['weakened'],
  'skill-vulnerability': ['vulnerable']
};

export default statusEffectsData;