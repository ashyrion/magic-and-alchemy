import type {
  Stats,
  Item,
  StatusEffect,
  Skill,
  Character,
  Enemy
} from '../types/gameTypes';
import type { DamageDetail } from '../types/battle';

const STAT_CONSTANTS = {
  BASE_STATS: {
    criticalRate: 5,     // 기본 5% 치명타 확률
    criticalDamage: 150, // 기본 150% 치명타 데미지
    accuracy: 95,        // 기본 95% 명중률
    evasion: 5,         // 기본 5% 회피율
    hpRegen: 1,         // 기본 1 HP/턴 회복
    mpRegen: 1,         // 기본 1 MP/턴 회복
  },
  MIN_DAMAGE: 1,        // 최소 데미지
  RESISTANCE_FACTOR: 100, // 저항 계산에 사용되는 기준값
  ELEMENT_DAMAGE_BONUS: 0.5, // 속성 공격 기본 보너스 (50%)
  DEFENSE_SCALING: {    // 방어력 계산식에 사용되는 계수
    BASE: 100,          // 기본값
    SCALING: 100        // 스케일링 값
  }
} as const;

// 스탯 계산 결과 타입
interface StatCalculation {
  base: Stats;         // 기본 스탯
  equipment: Stats;    // 장비 보너스
  effects: Stats;      // 효과 보너스
  final: Stats;        // 최종 스탯
}

// 장비 스탯 계산
/**
 * 장비 스탯을 계산합니다.
 */
export function calculateEquipmentStats(
  baseStats: Stats,
  equipment: Item[]
): StatCalculation {
  // 초기 계산 결과 설정
  const result: StatCalculation = {
    base: { ...baseStats },
    equipment: {
      ...STAT_CONSTANTS.BASE_STATS,
      ...Object.keys(baseStats).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
    } as Stats,
    effects: Object.keys(baseStats).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}) as Stats,
    final: { ...baseStats }
  };

  // 장비 스탯 계산
  equipment.forEach(item => {
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          result.equipment[key as keyof Stats] += value;
        }
      });
    }
  });

  // 최종 스탯 계산
  Object.keys(baseStats).forEach(key => {
    result.final[key as keyof Stats] =
      result.base[key as keyof Stats] +
      result.equipment[key as keyof Stats] +
      result.effects[key as keyof Stats];
  });

  return result;
}

/**
 * 캐릭터의 현재 스탯에 상태 효과를 적용합니다.
 */
export function applyStatusEffects(
  baseStats: Stats,
  effects: StatusEffect[]
): StatCalculation {
  const result: StatCalculation = {
    base: { ...baseStats },
    equipment: Object.keys(baseStats).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}) as Stats,
    effects: Object.keys(baseStats).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}) as Stats,
    final: { ...baseStats }
  };

  effects.forEach(effect => {
    if (effect.effects) {
      effect.effects.forEach(({ stat, value, isPercentage }) => {
        const baseValue = result.base[stat];
        const effectValue = isPercentage ? baseValue * (value / 100) : value;
        result.effects[stat] += effectValue;
      });
    }
  });

  // 최종 스탯 계산
  Object.keys(baseStats).forEach(key => {
    const statKey = key as keyof Stats;
    result.final[statKey] = Math.max(
      0,
      result.base[statKey] +
      result.equipment[statKey] +
      result.effects[statKey]
    );
  });

  return result;
}

/**
 * 데미지를 계산합니다.
 */
export function calculateDamage(
  attacker: Character | Enemy,
  defender: Character | Enemy,
  skill: Skill | null
): DamageDetail {
  const getStat = (entity: Character | Enemy, stat: keyof Stats): number => {
    const value = entity.stats[stat];
    return typeof value === 'number' ? value : 0;
  };

  const baseStatKey = skill && (skill.type === 'magic' || skill.type === 'alchemy') ? 'magicAttack' : 'attack';
  const defenseStatKey = skill && (skill.type === 'magic' || skill.type === 'alchemy') ? 'magicDefense' : 'defense';

  const baseContribution = getStat(attacker, baseStatKey);
  const skillContribution = skill ? skill.power : 0;
  const rawDamage = Math.max(0, baseContribution + skillContribution);

  const defenseValue = Math.max(0, getStat(defender, defenseStatKey));
  const defenseMitigationRatio = skill ? 0.35 : 0.25;
  let defenseMitigation = Math.round(defenseValue * defenseMitigationRatio);

  const accuracy = Math.max(0, getStat(attacker, 'accuracy') || STAT_CONSTANTS.BASE_STATS.accuracy);
  const evasion = Math.max(0, Math.min(95, getStat(defender, 'evasion') || STAT_CONSTANTS.BASE_STATS.evasion));
  const hitChance = Math.max(5, Math.min(95, accuracy - evasion));
  const hitRoll = Math.random() * 100;
  const wasDodged = hitRoll >= hitChance;

  let damageAfterDefense = Math.max(0, rawDamage - defenseMitigation);
  let criticalBonus = 0;
  let isCritical = false;

  if (!wasDodged) {
    const critRate = Math.max(0, Math.min(100, getStat(attacker, 'criticalRate') || STAT_CONSTANTS.BASE_STATS.criticalRate));
    if (Math.random() * 100 < critRate) {
      isCritical = true;
      const critDamageMultiplier = Math.max(1, (getStat(attacker, 'criticalDamage') || STAT_CONSTANTS.BASE_STATS.criticalDamage) / 100);
      criticalBonus = Math.round(damageAfterDefense * (critDamageMultiplier - 1));
      damageAfterDefense += criticalBonus;
    }
  } else {
    defenseMitigation = rawDamage;
    damageAfterDefense = 0;
  }

  const totalDamage = wasDodged ? 0 : Math.max(1, Math.round(damageAfterDefense));

  return {
    base: Math.round(baseContribution),
    skill: Math.round(skillContribution),
    criticalBonus,
    defenseMitigation: Math.round(defenseMitigation),
    total: totalDamage,
    isCritical,
    wasDodged,
    hitChance: Math.round(hitChance * 10) / 10,
    hitRoll: Math.round(hitRoll * 10) / 10,
    type: skill?.type || 'physical',
  };
}

export function formatDamageMessage(
  damageDetail: DamageDetail,
  skillName?: string
): string {
  const actionLabel = skillName ?? '공격';

  if (damageDetail.wasDodged) {
    return `${actionLabel}이(가) 빗나갔습니다! (명중률 ${damageDetail.hitChance.toFixed(1)}%, 굴림 ${damageDetail.hitRoll.toFixed(1)}%)`;
  }

  const parts: string[] = [];
  parts.push(`기본 ${damageDetail.base}`);
  if (damageDetail.skill > 0) {
    parts.push(`스킬 ${damageDetail.skill}`);
  }
  if (damageDetail.isCritical && damageDetail.criticalBonus > 0) {
    parts.push(`치명타 +${damageDetail.criticalBonus}`);
  }

  const mitigationText = damageDetail.defenseMitigation > 0
    ? `방어로 ${damageDetail.defenseMitigation} 경감`
    : null;

  const breakdown = parts.join(' + ');
  const mitigationSuffix = mitigationText ? `, ${mitigationText}` : '';
  return `${actionLabel}: ${breakdown}${mitigationSuffix} ⇒ 총 ${damageDetail.total} 피해`;
}

interface DropTable {
  rarity: number;
  quantity: number[];
  levelRequired?: number;
  category?: string[];
  typeBonus?: {
    [key: string]: number;
  };
}

const DROP_TABLES: { [key: string]: DropTable } = {
  herb: {
    rarity: 30,
    quantity: [1, 3],
    category: ['beast', 'humanoid'],
    typeBonus: { elite: 20, boss: 50 },
  },
  stone: {
    rarity: 25,
    quantity: [1, 2],
    category: ['elemental'],
    typeBonus: { elite: 15, boss: 40 },
  },
  crystal: {
    rarity: 15,
    quantity: [1, 2],
    category: ['elemental', 'demon'],
    typeBonus: { elite: 25, boss: 60 },
  },
  rare_herb: {
    rarity: 10,
    quantity: [1, 1],
    levelRequired: 5,
    category: ['beast', 'humanoid'],
    typeBonus: { elite: 30, boss: 70 },
  },
  magic_crystal: {
    rarity: 8,
    quantity: [1, 1],
    levelRequired: 10,
    category: ['elemental', 'demon'],
    typeBonus: { elite: 35, boss: 80 },
  },
  ancient_relic: {
    rarity: 5,
    quantity: [1, 1],
    levelRequired: 15,
    category: ['undead', 'demon'],
    typeBonus: { elite: 40, boss: 90 },
  },
  legendary_essence: {
    rarity: 2,
    quantity: [1, 1],
    levelRequired: 20,
    typeBonus: { elite: 50, boss: 100 },
  },
  dragon_scale: {
    rarity: 1,
    quantity: [1, 1],
    levelRequired: 25,
    category: ['beast', 'elemental'],
    typeBonus: { boss: 100 },
  },
};

const TYPE_REWARDS = {
  normal: { exp: 1.0, gold: 1.0 },
  elite: { exp: 2.0, gold: 2.5 },
  boss: { exp: 5.0, gold: 7.0 },
};

export function calculateCombatRewards(
  enemies: Enemy[],
  playerLevel: number
): {
  experience: number;
  gold: number;
  items: { id: string; count: number; }[];
} {
  let totalExperience = 0;
  let totalGold = 0;
  const items: { id: string; count: number; }[] = [];

  enemies.forEach(enemy => {
    // 기본 경험치 계산
    const baseExp = enemy.rewards?.experience ?? (enemy.level * 10);
    
    // 레벨 차이에 따른 보정
    const levelDiff = enemy.level - playerLevel;
    const levelMultiplier = 1 + Math.max(-0.5, Math.min(0.5, levelDiff * 0.1)); // -50% ~ +50%
    
    // 타입 보너스 적용
    const typeMultiplier = TYPE_REWARDS[enemy.type].exp;
    totalExperience += Math.floor(baseExp * levelMultiplier * typeMultiplier);

    // 골드 계산
    const baseGold = enemy.rewards?.gold ?? (enemy.level * 5);
    const randomMultiplier = 0.8 + Math.random() * 0.4; // 80%~120%
    const goldTypeMultiplier = TYPE_REWARDS[enemy.type].gold;
    totalGold += Math.floor(baseGold * randomMultiplier * goldTypeMultiplier);

    // 고정 아이템 드롭 처리
    enemy.rewards?.items?.forEach(item => {
      const roll = Math.random() * 100;
      if (roll < item.chance) {
        const [min, max] = item.count;
        const count = min + Math.floor(Math.random() * (max - min + 1));
        addItemToRewards(items, item.id, count);
      }
    });

    // 일반 드롭 테이블 처리
    Object.entries(DROP_TABLES).forEach(([itemId, dropInfo]) => {
      // 레벨 요구사항 체크
      if (dropInfo.levelRequired && enemy.level < dropInfo.levelRequired) {
        return;
      }

      // 카테고리 체크
      if (dropInfo.category && !dropInfo.category.includes(enemy.category)) {
        return;
      }

      // 기본 확률 + 타입 보너스
      let finalRarity = dropInfo.rarity;
      if (dropInfo.typeBonus && enemy.type in dropInfo.typeBonus) {
        finalRarity += dropInfo.typeBonus[enemy.type];
      }

      // 드롭 확률 판정
      const roll = Math.random() * 100;
      if (roll < finalRarity) {
        const [min, max] = dropInfo.quantity;
        const count = min + Math.floor(Math.random() * (max - min + 1));
        addItemToRewards(items, itemId, count);
      }
    });
  });

  return {
    experience: totalExperience,
    gold: totalGold,
    items
  };
}

function addItemToRewards(
  items: { id: string; count: number; }[],
  itemId: string,
  count: number
): void {
  const existingItem = items.find(item => item.id === itemId);
  if (existingItem) {
    existingItem.count += count;
  } else {
    items.push({ id: itemId, count });
  }
}

/**
 * 리소스 회복/소모량을 계산합니다.
 */
interface ResourceChange {
  value: number;      // 변경량
  source: string;     // 변경 원인 (힐링, 데미지, 스킬 등)
  isCritical?: boolean;// 치명타 여부
  isOverTime?: boolean;// 시간에 따른 효과 여부
}

/**
 * HP/MP 등의 리소스를 갱신하고 변경사항을 반환합니다.
 */
interface ResourceUpdate {
  stats: Stats;       // 갱신된 스탯
  changes: {         // 리소스별 변경사항
    hp?: ResourceChange[];
    mp?: ResourceChange[];
  };
}

export const RESOURCE_CONSTANTS = {
  NORMAL_REGEN: {
    hpPercent: 0.05,    // 기본 HP 회복 (최대 HP의 5%)
    mpPercent: 0.08     // 기본 MP 회복 (최대 MP의 8%)
  },
  COMBAT_REGEN: {
    hpPercent: 0,    // 전투 중 자동 회복 없음
    mpPercent: 0     // 전투 중 자동 회복 없음
  },
  CRITICAL_HEAL: {
    chance: 10,         // 치명타 회복 확률 (10%)
    multiplier: 1.5     // 치명타 회복량 증가 (150%)
  },
  RESOURCE_FLOOR: 0,    // 최소 리소스량
} as const;

/**
 * HP/MP 등의 리소스를 업데이트합니다.
 */
export function updateResourceStats(
  stats: Stats,
  inCombat: boolean = false,
  effects: StatusEffect[] = []
): ResourceUpdate {
  const result: ResourceUpdate = {
    stats: { ...stats },
    changes: {}
  };

  // 기본 회복량 계산
  const baseRegen = inCombat ? RESOURCE_CONSTANTS.COMBAT_REGEN : RESOURCE_CONSTANTS.NORMAL_REGEN;
  
  // HP 회복 처리
  const hpChanges: ResourceChange[] = [];
  
  // 기본 재생
  const baseHpRegen = Math.floor(stats.maxHp * baseRegen.hpPercent + (stats.hpRegen || 0));
  if (baseHpRegen > 0) {
    hpChanges.push({
      value: baseHpRegen,
      source: 'regen',
      isOverTime: true
    });
  }

  // 상태 효과로 인한 HP 변화
  effects.forEach(effect => {
    if (effect.type === 'hot') {
      // 시간당 회복
      const healAmount = effect.tickPower || 0;
      if (healAmount > 0) {
        // 치명타 회복 판정
        const isCritical = Math.random() * 100 < RESOURCE_CONSTANTS.CRITICAL_HEAL.chance;
        const finalHeal = isCritical
          ? healAmount * RESOURCE_CONSTANTS.CRITICAL_HEAL.multiplier
          : healAmount;
          
        hpChanges.push({
          value: Math.floor(finalHeal),
          source: effect.name,
          isCritical,
          isOverTime: true
        });
      }
    } else if (effect.type === 'dot') {
      // 시간당 피해
      const damage = effect.tickPower || 0;
      if (damage > 0) {
        hpChanges.push({
          value: -Math.floor(damage),
          source: effect.name,
          isOverTime: true
        });
      }
    }
  });

  // MP 회복 처리
  const mpChanges: ResourceChange[] = [];
  
  // 기본 재생
  const baseMpRegen = Math.floor(stats.maxMp * baseRegen.mpPercent + (stats.mpRegen || 0));
  if (baseMpRegen > 0) {
    mpChanges.push({
      value: baseMpRegen,
      source: 'regen',
      isOverTime: true
    });
  }

  // 상태 효과로 인한 MP 변화 (필요한 경우 추가)

  // 변경사항 누적 및 최종값 계산
  if (hpChanges.length > 0) {
    result.changes.hp = hpChanges;
    result.stats.hp = Math.max(
      RESOURCE_CONSTANTS.RESOURCE_FLOOR,
      Math.min(
        stats.maxHp,
        stats.hp + hpChanges.reduce((sum, change) => sum + change.value, 0)
      )
    );
  }

  if (mpChanges.length > 0) {
    result.changes.mp = mpChanges;
    result.stats.mp = Math.max(
      RESOURCE_CONSTANTS.RESOURCE_FLOOR,
      Math.min(
        stats.maxMp,
        stats.mp + mpChanges.reduce((sum, change) => sum + change.value, 0)
      )
    );
  }

  return result;
}

/**
 * 리소스 비용을 계산합니다.
 */
export function calculateResourceCost(
  stats: Stats,
  action: {
    hpCost?: number;
    mpCost?: number;
    hpCostPercent?: number;
    mpCostPercent?: number;
  }
): { hp: number; mp: number } {
  return {
    hp: Math.floor(
      (action.hpCost || 0) +
      (action.hpCostPercent ? stats.maxHp * (action.hpCostPercent / 100) : 0)
    ),
    mp: Math.floor(
      (action.mpCost || 0) +
      (action.mpCostPercent ? stats.maxMp * (action.mpCostPercent / 100) : 0)
    )
  };
}

/**
 * 리소스 소모를 적용합니다.
 */
export function applyResourceCost(
  stats: Stats,
  costs: { hp: number; mp: number }
): ResourceUpdate {
  const result: ResourceUpdate = {
    stats: { ...stats },
    changes: {}
  };

  if (costs.hp > 0) {
    result.changes.hp = [{
      value: -costs.hp,
      source: 'cost'
    }];
    result.stats.hp = Math.max(0, stats.hp - costs.hp);
  }

  if (costs.mp > 0) {
    result.changes.mp = [{
      value: -costs.mp,
      source: 'cost'
    }];
    result.stats.mp = Math.max(0, stats.mp - costs.mp);
  }

  return result;
}