import type { Character, Equipment, Item, StatusEffect, Stats } from '../types/gameTypes';
import type { StatCalculation } from '../types/statTypes';

function createEmptyStats(): Stats {
  return {
    strength: 0,
    defense: 0,
    intelligence: 0,
    agility: 0,
    maxHp: 0,
    hp: 0,
    maxMp: 0,
    mp: 0,
    attack: 0,
    magicAttack: 0,
    criticalRate: 0,
    criticalDamage: 1.5,
    physicalDefense: 0,
    magicDefense: 0,
    evasion: 0,
    accuracy: 0,
    hpRegen: 0,
    mpRegen: 0,
    resourceCostReduction: 0,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0,
    speed: 0,
    weight: 0,
    vitality: 0,
    wisdom: 0,
    dotResistance: 0,
    hotBonus: 0,
    recovery: 0
  };
}

// 장비로부터 스탯 보너스 계산
export function calculateEquipmentStats(equipment: Equipment): StatCalculation {
  const base = createEmptyStats();
  const equipmentStats = createEmptyStats();

  // 장비 슬롯별 스탯 계산
  Object.values(equipment).forEach(item => {
    if (!item || !item.stats) return;

    // 기본 스탯 적용
    Object.entries(item.stats).forEach(([key, value]) => {
      if (key in equipmentStats && typeof value === 'number') {
        (equipmentStats[key as keyof Stats] as number) += value;
      }
    });
  });

  const equipEffects: StatusEffect[] = [];
  Object.values(equipment).forEach(item => {
    if (item?.effects) {
      equipEffects.push(...item.effects);
    }
  });

  // 최종 스탯 계산
  const final: Stats & {
    effectiveStrength: number;
    effectiveDefense: number;
    effectiveIntelligence: number;
    effectiveAgility: number;
  } = {
    ...base,
    ...equipmentStats,
    effectiveStrength: equipmentStats.strength,
    effectiveDefense: equipmentStats.defense,
    effectiveIntelligence: equipmentStats.intelligence,
    effectiveAgility: equipmentStats.agility
  };

  return {
    base,
    equipment: equipmentStats,
    effects: equipEffects,
    final
  };
}

// 최종 스탯 계산
export function calculateFinalStats(
  character: Character,
  equipment: Equipment | Item[],
  activeEffects: Array<{ effect: StatusEffect, duration: number }>
): StatCalculation {
  // 장비 스탯 계산
  const equipStats = Array.isArray(equipment)
    ? calculateEquipmentStats({ weapon: null, armor: null, accessory: null })
    : calculateEquipmentStats(equipment);

  // 최종 스탯 기본값 설정
  const final: Stats & {
    effectiveStrength: number;
    effectiveDefense: number;
    effectiveIntelligence: number;
    effectiveAgility: number;
  } = {
    ...character.stats,
    effectiveStrength: character.stats.strength + equipStats.final.strength,
    effectiveDefense: character.stats.defense + equipStats.final.defense,
    effectiveIntelligence: character.stats.intelligence + equipStats.final.intelligence,
    effectiveAgility: character.stats.agility + equipStats.final.agility
  };

  // 활성 효과 적용
  activeEffects.forEach(({ effect }) => {
    effect.effects.forEach(({ stat, value, isPercentage }) => {
      const currentValue = final[stat as keyof typeof final];
      if (typeof currentValue === 'number') {
        const modifier = isPercentage ? currentValue * (value / 100) : value;
        const updatedValue = currentValue + modifier;
        (final[stat as keyof typeof final] as number) = updatedValue;

        // 유효 스탯 업데이트
        if (stat === 'strength') final.effectiveStrength = updatedValue;
        if (stat === 'defense') final.effectiveDefense = updatedValue;
        if (stat === 'intelligence') final.effectiveIntelligence = updatedValue;
        if (stat === 'agility') final.effectiveAgility = updatedValue;
      }
    });
  });

  // HP/MP 최대값 제한 및 유효성 검사
  final.hp = Math.min(Math.max(0, final.hp), Math.max(1, final.maxHp));
  final.mp = Math.min(Math.max(0, final.mp), Math.max(0, final.maxMp));
  
  // 추가 안전 검사: maxMp가 0 이하이면 mp도 0으로 설정
  if (final.maxMp <= 0) {
    final.mp = 0;
    final.maxMp = Math.max(0, final.maxMp);
  }
  
  // 디버그: MP 초과 상황 감지
  if (final.mp > final.maxMp) {
    console.warn('[statCalculator] MP 초과 감지:', {
      mp: final.mp,
      maxMp: final.maxMp,
      character: character.name,
      equipment: Object.entries(equipment).map(([slot, item]) => ({ slot, item: item?.name }))
    });
    final.mp = final.maxMp; // 강제로 제한
  }

  return {
    base: { ...character.stats },
    equipment: equipStats.equipment,
    effects: [...equipStats.effects, ...activeEffects.map(ae => ae.effect)],
    final
  };
}