import type { Skill } from '../types/gameTypes';

// 스킬 강화 단계 타입
export type SkillTier = 1 | 2 | 3 | 4 | 5;

// 스킬 강화 정보
export interface SkillEnhancement {
  baseSkillId: string;
  tier: SkillTier;
  tierName: string;
  enhancedSkill: Skill;
  requiredMaterials: Array<{
    itemId: string;
    count: number;
  }>;
  successRate: number;
  cost: number; // 골드 비용
}

// 기본 스킬 ID 목록
export const baseSkillIds = {
  // 화염 속성
  fireball: 'skill-fireball',
  flameBurst: 'skill-flame-burst',
  
  // 냉기 속성
  iceShard: 'skill-ice-shard', 
  frostBarrier: 'skill-frost-barrier',
  
  // 번개 속성
  lightningBolt: 'skill-lightning-bolt',
  chainLightning: 'skill-chain-lightning',
  
  // 독 속성
  poisonDart: 'skill-poison-dart',
  toxicCloud: 'skill-toxic-cloud',
  
  // 빛 속성
  heal: 'skill-heal',
  purify: 'skill-purify',
  
  // 어둠 속성
  lifeDrain: 'skill-life-drain',
  weaken: 'skill-weaken'
} as const;

// 강화 단계 이름
export const tierNames: Record<SkillTier, string> = {
  1: '기본',
  2: '개선된',
  3: '강화된', 
  4: '숙련된',
  5: '완성된'
};

// 스킬 강화 데이터 생성 함수
function createEnhancedSkill(
  baseSkill: Skill, 
  tier: SkillTier, 
  additionalEffects?: Partial<Skill>
): Skill {
  const tierMultipliers = {
    1: 1.0,   // 기본 (100%)
    2: 1.15,  // 15% 증가
    3: 1.35,  // 35% 증가
    4: 1.60,  // 60% 증가
    5: 2.0    // 100% 증가
  };
  
  const multiplier = tierMultipliers[tier];
  const tierName = tierNames[tier];
  
  // 스킬별 특별한 강화 효과
  const enhancedDescription = getEnhancedDescription(baseSkill, tier);
  const enhancedEffects = getEnhancedEffects(baseSkill, tier);
  
  return {
    ...baseSkill,
    id: `${baseSkill.id}-tier-${tier}`,
    name: tier === 1 ? baseSkill.name : `${tierName} ${baseSkill.name}`,
    power: Math.round(baseSkill.power * multiplier),
    cost: Math.max(1, Math.round(baseSkill.cost * (0.8 + tier * 0.1))), // 비용은 약간씩만 증가
    description: enhancedDescription,
    ...enhancedEffects,
    ...additionalEffects
  };
}

// 강화 단계별 특별한 효과 부여
function getEnhancedEffects(baseSkill: Skill, tier: SkillTier): Partial<Skill> {
  const effects: Partial<Skill> = {};
  
  // 이중 화염탄 (연속 공격 스킬)
  if (baseSkill.id === 'skill-flame-burst') {
    if (tier >= 3) {
      effects.accuracy = 90; // 명중률 향상
    }
    if (tier >= 5) {
      effects.power = Math.round(baseSkill.power * 2.5); // 5단계에서 추가 데미지
    }
  }
  
  // 얼음 창 (DOT 스킬)
  else if (baseSkill.id === 'skill-ice-shard') {
    if (tier >= 3) {
      effects.accuracy = 90; // 명중률 향상
    }
    if (tier >= 4) {
      effects.cooldown = 1; // 쿨타임 감소
    }
  }
  
  // 번개 연타 (다중 공격 스킬)
  else if (baseSkill.id === 'skill-chain-lightning') {
    if (tier >= 2) {
      effects.accuracy = 92; // 명중률 향상
    }
    if (tier >= 4) {
      effects.power = Math.round(baseSkill.power * 1.8); // 4단계에서 추가 데미지
    }
    if (tier >= 5) {
      effects.cooldown = 2; // 쿨타임 감소
    }
  }
  
  // 맹독 감염 (강력한 DOT)
  else if (baseSkill.id === 'skill-toxic-cloud') {
    if (tier >= 3) {
      effects.accuracy = 95; // 명중률 향상
    }
    if (tier >= 5) {
      effects.power = Math.round(baseSkill.power * 3.0); // 5단계에서 강력한 DOT
    }
  }
  
  // 파이어볼 (기본 공격)
  else if (baseSkill.id === 'skill-fireball') {
    if (tier >= 4) {
      effects.accuracy = 95; // 명중률 향상
    }
  }
  
  // 번개 화살 (빠른 공격)
  else if (baseSkill.id === 'skill-lightning-bolt') {
    if (tier >= 3) {
      effects.cooldown = 1; // 쿨타임 감소
    }
    if (tier >= 5) {
      effects.accuracy = 95; // 명중률 향상
    }
  }
  
  // 독침 (기본 DOT)
  else if (baseSkill.id === 'skill-poison-dart') {
    if (tier >= 4) {
      effects.cooldown = 0; // 쿨타임 제거
    }
  }
  
  return effects;
}

// 강화 단계별 설명 업데이트
function getEnhancedDescription(baseSkill: Skill, tier: SkillTier): string {
  const baseDesc = baseSkill.description || '';
  
  if (tier === 1) return baseDesc;
  
  // 스킬별 강화 설명
  if (baseSkill.id === 'skill-flame-burst') {
    const tierDescriptions = {
      2: baseDesc + ' (2회 공격, 약간 향상)',
      3: baseDesc + ' (2회 공격, 명중률 향상)',
      4: baseDesc + ' (2회 공격, 화상 효과 강화)',
      5: baseDesc + ' (2회 공격, 폭발적인 추가 데미지)'
    };
    return tierDescriptions[tier] || baseDesc;
  }
  
  else if (baseSkill.id === 'skill-ice-shard') {
    const tierDescriptions = {
      2: baseDesc + ' (동상 지속시간 연장)',
      3: baseDesc + ' (동상 지속시간 연장, 명중률 향상)',
      4: baseDesc + ' (동상 지속시간 연장, 쿨타임 감소)',
      5: baseDesc + ' (강력한 동상 효과, 이동 불가)'
    };
    return tierDescriptions[tier] || baseDesc;
  }
  
  else if (baseSkill.id === 'skill-chain-lightning') {
    const tierDescriptions = {
      2: baseDesc + ' (명중률 향상)',
      3: baseDesc + ' (감전 효과 추가)',
      4: baseDesc + ' (3회 연속 공격, 데미지 증가)',
      5: baseDesc + ' (3회 연속 공격, 쿨타임 감소, 마비 효과)'
    };
    return tierDescriptions[tier] || baseDesc;
  }
  
  else if (baseSkill.id === 'skill-toxic-cloud') {
    const tierDescriptions = {
      2: baseDesc + ' (독 지속시간 연장)',
      3: baseDesc + ' (독 지속시간 연장, 명중률 향상)',
      4: baseDesc + ' (강력한 독 효과, 치유 방해)',
      5: baseDesc + ' (치명적인 독, 회복 불가, 확산 효과)'
    };
    return tierDescriptions[tier] || baseDesc;
  }
  
  // 기본 강화 설명
  return baseDesc + ` (${tierNames[tier]} 버전 - 성능 향상)`;
}

// === 화염 속성 스킬들 ===

// 파이어볼 기본 스킬
const baseFireball: Skill = {
  id: 'skill-fireball',
  name: '파이어볼',
  type: 'elemental',
  element: 'fire',
  category: 'offensive',
  power: 12,
  cost: 12,
  cooldown: 3,
  targetType: 'enemy',
  range: 4,
  accuracy: 90,
  effects: [],
  icon: '🔥',
  description: '화염구를 발사하여 적에게 화상을 입힙니다.'
};

// 화염 폭발 기본 스킬
const baseFlameBurst: Skill = {
  id: 'skill-flame-burst',
  name: '이중 화염탄',
  type: 'elemental',
  element: 'fire',
  category: 'offensive',
  power: 10,
  cost: 18,
  cooldown: 4,
  targetType: 'enemy',
  range: 3,
  accuracy: 85,
  effects: [],
  icon: '�🔥',
  description: '연속으로 두 발의 화염탄을 발사합니다. (2회 공격)'
};

// === 냉기 속성 스킬들 ===

// 얼음 창 기본 스킬 (기존 스킬 활용)
const baseIceShard: Skill = {
  id: 'skill-ice-shard',
  name: '얼음 창',
  type: 'elemental',
  element: 'ice',
  category: 'offensive',
  power: 12,
  cost: 10,
  cooldown: 2,
  targetType: 'enemy',
  range: 5,
  accuracy: 85,
  effects: [],
  icon: '🧊',
  description: '날카로운 얼음 창으로 적을 공격하고 3턴간 동상 피해를 입힙니다.'
};

// 냉기 방벽 기본 스킬
const baseFrostBarrier: Skill = {
  id: 'skill-frost-barrier',
  name: '냉기 방벽',
  type: 'buff',
  element: 'ice',
  category: 'defensive',
  power: 25, // 보호막 수치
  cost: 15,
  cooldown: 6,
  targetType: 'self',
  range: 1,
  accuracy: 100,
  effects: [],
  icon: '🧊🛡️',
  description: '냉기 방벽을 생성하여 피해를 흡수하고 공격자를 둔화시킵니다.'
};

// === 번개 속성 스킬들 ===

// 번개 화살 기본 스킬 (기존 스킬 활용)
const baseLightningBolt: Skill = {
  id: 'skill-lightning-bolt',
  name: '번개 화살',
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
};

// 연쇄 번개 기본 스킬
const baseChainLightning: Skill = {
  id: 'skill-chain-lightning',
  name: '번개 연타',
  type: 'elemental',
  element: 'lightning',
  category: 'offensive',
  power: 8,
  cost: 16,
  cooldown: 3,
  targetType: 'enemy',
  range: 5,
  accuracy: 90,
  effects: [],
  icon: '⚡⚡',
  description: '빠른 속도로 3회 연속 번개 공격을 가합니다.'
};

// === 독 속성 스킬들 ===

// 독침 기본 스킬 (기존 스킬 활용)
const basePoisonDart: Skill = {
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
};

// 독 구름 기본 스킬
const baseToxicCloud: Skill = {
  id: 'skill-toxic-cloud',
  name: '맹독 감염',
  type: 'elemental',
  element: 'poison',
  category: 'offensive',
  power: 5,
  cost: 14,
  cooldown: 4,
  targetType: 'enemy',
  range: 4,
  accuracy: 92,
  effects: [],
  icon: '☠️�',
  description: '치명적인 독을 주입하여 5턴간 지속 피해를 입힙니다.'
};

// === 빛 속성 스킬들 ===

// 치유 기본 스킬 (기존 스킬 활용)
const baseHeal: Skill = {
  id: 'skill-heal',
  name: '치유',
  type: 'heal',
  element: 'light',
  category: 'support',
  power: 15,
  cost: 10,
  cooldown: 4,
  targetType: 'self',
  range: 1,
  accuracy: 100,
  effects: [],
  icon: '💚',
  description: 'HP를 회복하고 재생 효과를 부여합니다.'
};

// 정화 기본 스킬
const basePurify: Skill = {
  id: 'skill-purify',
  name: '정화',
  type: 'buff',
  element: 'light',
  category: 'support',
  power: 0,
  cost: 12,
  cooldown: 3,
  targetType: 'self',
  range: 1,
  accuracy: 100,
  effects: [],
  icon: '✨',
  description: '디버프를 제거하고 잠시동안 상태이상에 면역이 됩니다.'
};

// === 어둠 속성 스킬들 ===

// 흡혈 기본 스킬
const baseLifeDrain: Skill = {
  id: 'skill-life-drain',
  name: '흡혈',
  type: 'elemental',
  element: 'dark',
  category: 'offensive',
  power: 12,
  cost: 14,
  cooldown: 3,
  targetType: 'enemy',
  range: 3,
  accuracy: 90,
  effects: [],
  icon: '🩸',
  description: '적의 생명력을 흡수하여 자신의 HP를 회복합니다.'
};

// 약화 기본 스킬 (기존 스킬 활용)
const baseWeaken: Skill = {
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
};

// 기본 스킬 목록
export const baseSkills: Skill[] = [
  baseFireball, baseFlameBurst,
  baseIceShard, baseFrostBarrier,
  baseLightningBolt, baseChainLightning,
  basePoisonDart, baseToxicCloud,
  baseHeal, basePurify,
  baseLifeDrain, baseWeaken
];

// 스킬 강화 레시피 생성
export const skillEnhancements: SkillEnhancement[] = [];

// 각 기본 스킬에 대해 5단계 강화 버전 생성
baseSkills.forEach(baseSkill => {
  for (let tier = 1 as SkillTier; tier <= 5; tier++) {
    // 특별한 강화 효과 계산
    const specialEffects = getSpecialTierEffects(baseSkill.id, tier);
    
    const enhancement: SkillEnhancement = {
      baseSkillId: baseSkill.id,
      tier,
      tierName: tierNames[tier],
      enhancedSkill: createEnhancedSkill(baseSkill, tier, specialEffects),
      requiredMaterials: getRequiredMaterials(baseSkill.element!, tier),
      successRate: getSuccessRate(tier),
      cost: getCost(tier)
    };
    
    skillEnhancements.push(enhancement);
  }
});

// 스킬별 특별한 단계별 효과
function getSpecialTierEffects(skillId: string, tier: SkillTier): Partial<Skill> {
  const effects: Partial<Skill> = {};
  
  // 이중 화염탄 - 연속 공격 스킬
  if (skillId === 'skill-flame-burst') {
    if (tier === 3) effects.icon = '🔥🔥💥';
    if (tier === 4) effects.icon = '🔥🔥🔥';
    if (tier === 5) effects.icon = '🌋🔥🔥';
  }
  
  // 얼음 창 - DOT 스킬
  else if (skillId === 'skill-ice-shard') {
    if (tier === 3) effects.icon = '🧊❄️';
    if (tier === 4) effects.icon = '🧊❄️⚡';
    if (tier === 5) effects.icon = '🧊❄️💎';
  }
  
  // 번개 연타 - 다중 연속 공격
  else if (skillId === 'skill-chain-lightning') {
    if (tier === 3) effects.icon = '⚡⚡⚡';
    if (tier === 4) effects.icon = '🌩️⚡⚡';
    if (tier === 5) effects.icon = '🌩️⚡🔗';
  }
  
  // 맹독 감염 - 강력한 DOT
  else if (skillId === 'skill-toxic-cloud') {
    if (tier === 3) effects.icon = '☠️💀';
    if (tier === 4) effects.icon = '☠️💀💚';
    if (tier === 5) effects.icon = '☠️💀🌪️';
  }
  
  return effects;
}

// 강화에 필요한 재료 계산
function getRequiredMaterials(element: string, tier: SkillTier): Array<{itemId: string, count: number}> {
  switch (tier) {
    case 1:
      return [{ itemId: 'essence-fragment', count: 3 }, { itemId: 'bone-dust', count: 1 }];
    case 2:
      return [{ itemId: 'essence-fragment', count: 8 }, { itemId: 'monster-blood', count: 3 }];
    case 3:
      return [{ itemId: 'magic-crystal', count: 4 }, { itemId: 'elemental-core', count: 2 }];
    case 4:
      return [{ itemId: 'magic-crystal', count: 10 }, { itemId: 'soul-fragment', count: 5 }];
    case 5:
      return [{ itemId: 'ancient-rune', count: 6 }, { itemId: 'void-essence', count: 3 }];
    default:
      return [];
  }
}

// 성공률 계산
function getSuccessRate(tier: SkillTier): number {
  const rates = [100, 90, 75, 60, 40]; // 단계별 성공률
  return rates[tier - 1];
}

// 강화 비용 계산
function getCost(tier: SkillTier): number {
  const costs = [50, 100, 300, 800, 2000]; // 단계별 골드 비용 (1단계부터 비용 발생)
  return costs[tier - 1];
}

// 특정 스킬의 모든 강화 버전 가져오기
export function getSkillEnhancements(baseSkillId: string): SkillEnhancement[] {
  return skillEnhancements.filter(enhancement => 
    enhancement.baseSkillId === baseSkillId
  );
}

// 특정 단계의 스킬 가져오기
export function getEnhancedSkill(baseSkillId: string, tier: SkillTier): Skill | null {
  const enhancement = skillEnhancements.find(e => 
    e.baseSkillId === baseSkillId && e.tier === tier
  );
  return enhancement?.enhancedSkill || null;
}

// 모든 강화된 스킬 목록 (게임에서 사용할 전체 스킬 목록)
export const allSkills: Skill[] = skillEnhancements.map(e => e.enhancedSkill);