import type { Skill, Character, Enemy } from '../types/gameTypes';

// 스킬의 특별한 효과를 처리하는 유틸리티 함수들

export interface SkillEffectResult {
  additionalAttacks: number; // 추가 공격 횟수
  dotDamage: number; // 지속 피해량
  dotDuration: number; // 지속 시간 (턴)
  statusEffects: string[]; // 적용할 상태 효과
  healAmount: number; // 치유량
  specialEffect?: string; // 특별한 효과 설명
}

/**
 * 스킬의 특별한 효과를 계산합니다
 */
export function calculateSkillEffects(skill: Skill): SkillEffectResult {
  const result: SkillEffectResult = {
    additionalAttacks: 0,
    dotDamage: 0,
    dotDuration: 0,
    statusEffects: [],
    healAmount: 0
  };

  // 이중 화염탄 - 연속 공격
  if (skill.id.includes('skill-flame-burst')) {
    result.additionalAttacks = 1; // 기본 공격 + 1회 추가 = 총 2회
    result.statusEffects.push('burn'); // 화상 효과
    
    // 강화 단계별 추가 효과
    if (skill.id.includes('tier-4')) {
      result.dotDamage = Math.round(skill.power * 0.3);
      result.dotDuration = 3;
      result.specialEffect = '강화된 화상 효과';
    }
    if (skill.id.includes('tier-5')) {
      result.dotDamage = Math.round(skill.power * 0.5);
      result.dotDuration = 4;
      result.specialEffect = '폭발적인 화상 피해';
    }
  }
  
  // 얼음 창 - DOT 효과
  else if (skill.id.includes('skill-ice-shard')) {
    result.dotDamage = Math.round(skill.power * 0.4);
    result.dotDuration = 3;
    result.statusEffects.push('frostbite');
    
    // 강화 단계별 추가 효과
    if (skill.id.includes('tier-3')) {
      result.dotDuration = 4;
      result.specialEffect = '연장된 동상 효과';
    }
    if (skill.id.includes('tier-4')) {
      result.dotDuration = 4;
      result.statusEffects.push('slow');
      result.specialEffect = '동상 + 둔화 효과';
    }
    if (skill.id.includes('tier-5')) {
      result.dotDamage = Math.round(skill.power * 0.6);
      result.dotDuration = 5;
      result.statusEffects.push('frozen');
      result.specialEffect = '완전 빙결 효과';
    }
  }
  
  // 번개 연타 - 다중 연속 공격
  else if (skill.id.includes('skill-chain-lightning')) {
    result.additionalAttacks = 2; // 기본 공격 + 2회 추가 = 총 3회
    result.statusEffects.push('shocked');
    
    // 강화 단계별 추가 효과
    if (skill.id.includes('tier-3')) {
      result.statusEffects.push('electrified');
      result.specialEffect = '감전 상태 지속';
    }
    if (skill.id.includes('tier-5')) {
      result.statusEffects.push('paralyzed');
      result.specialEffect = '마비 효과 추가';
    }
  }
  
  // 맹독 감염 - 강력한 DOT
  else if (skill.id.includes('skill-toxic-cloud')) {
    result.dotDamage = Math.round(skill.power * 0.8);
    result.dotDuration = 5;
    result.statusEffects.push('poisoned');
    
    // 강화 단계별 추가 효과
    if (skill.id.includes('tier-3')) {
      result.dotDuration = 6;
      result.specialEffect = '강화된 독 지속 시간';
    }
    if (skill.id.includes('tier-4')) {
      result.statusEffects.push('weakened');
      result.specialEffect = '독 + 약화 효과';
    }
    if (skill.id.includes('tier-5')) {
      result.dotDamage = Math.round(skill.power * 1.2);
      result.dotDuration = 7;
      result.statusEffects.push('curse');
      result.specialEffect = '치명적인 독 - 회복 불가';
    }
  }
  
  // 기본 파이어볼 - 화상 DOT
  else if (skill.id.includes('skill-fireball')) {
    if (skill.id.includes('tier-2') || skill.id.includes('tier-3') || skill.id.includes('tier-4') || skill.id.includes('tier-5')) {
      result.dotDamage = Math.round(skill.power * 0.25);
      result.dotDuration = 2;
      result.statusEffects.push('burn');
    }
  }
  
  // 독침 - 기본 DOT
  else if (skill.id.includes('skill-poison-dart')) {
    result.dotDamage = Math.round(skill.power * 0.6);
    result.dotDuration = 3;
    result.statusEffects.push('poisoned');
    
    if (skill.id.includes('tier-4') || skill.id.includes('tier-5')) {
      result.dotDuration = 4;
      result.specialEffect = '지속 시간 연장';
    }
  }
  
  // 번개 화살 - 감전 효과
  else if (skill.id.includes('skill-lightning-bolt')) {
    if (skill.id.includes('tier-2') || skill.id.includes('tier-3') || skill.id.includes('tier-4') || skill.id.includes('tier-5')) {
      result.statusEffects.push('shocked');
    }
    if (skill.id.includes('tier-4') || skill.id.includes('tier-5')) {
      result.dotDamage = Math.round(skill.power * 0.2);
      result.dotDuration = 2;
      result.specialEffect = '감전 지속 피해';
    }
  }
  
  // 치유 스킬들
  else if (skill.id.includes('skill-heal')) {
    result.healAmount = skill.power;
    result.statusEffects.push('regeneration');
    
    if (skill.id.includes('tier-3') || skill.id.includes('tier-4') || skill.id.includes('tier-5')) {
      result.statusEffects.push('blessed');
      result.specialEffect = '축복 효과 추가';
    }
  }
  
  return result;
}

/**
 * 스킬 사용 시 추가 공격을 처리합니다
 */
export function handleAdditionalAttacks(
  skill: Skill, 
  baseDamage: number
): number[] {
  const effects = calculateSkillEffects(skill);
  const damages = [baseDamage]; // 첫 번째 공격
  
  // 추가 공격들 (약간씩 데미지 감소)
  for (let i = 0; i < effects.additionalAttacks; i++) {
    const reductionFactor = 0.8 - (i * 0.1); // 두 번째: 80%, 세 번째: 70%
    const additionalDamage = Math.round(baseDamage * reductionFactor);
    damages.push(additionalDamage);
  }
  
  return damages;
}

/**
 * DOT 효과를 적용합니다
 */
export function applyDotEffects(skill: Skill, target: Character | Enemy): void {
  const effects = calculateSkillEffects(skill);
  
  if (effects.dotDamage > 0 && effects.dotDuration > 0) {
    // 실제 게임에서는 battleStore나 statusEffect 시스템과 연동
    console.log(`${target.name}에게 ${effects.dotDamage} 지속 피해를 ${effects.dotDuration}턴간 적용`);
    
    // statusEffects 배열에 DOT 효과 추가
    effects.statusEffects.forEach(effectId => {
      console.log(`${target.name}에게 ${effectId} 상태 효과 적용`);
    });
  }
}

/**
 * 스킬의 총 예상 데미지를 계산합니다 (UI 표시용)
 */
export function calculateTotalSkillDamage(skill: Skill): {
  directDamage: number;
  dotDamage: number;
  totalDamage: number;
  attackCount: number;
} {
  const effects = calculateSkillEffects(skill);
  const attackCount = 1 + effects.additionalAttacks;
  
  // 직접 피해 (다중 공격 시 감소 적용)
  let directDamage = skill.power;
  for (let i = 0; i < effects.additionalAttacks; i++) {
    const reductionFactor = 0.8 - (i * 0.1);
    directDamage += Math.round(skill.power * reductionFactor);
  }
  
  // 지속 피해
  const dotDamage = effects.dotDamage * effects.dotDuration;
  
  return {
    directDamage,
    dotDamage,
    totalDamage: directDamage + dotDamage,
    attackCount
  };
}