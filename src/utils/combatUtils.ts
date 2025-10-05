import type { Character, Enemy, Skill, StatusEffect } from '../types/gameTypes';

export interface DamageDetail {
  baseDamage: number;
  criticalHit: boolean;
  finalDamage: number;
  elementModifier?: number;
}

export function calculateDamage(
  attacker: Character,
  target: Character | Enemy,
  skill?: Skill | null
): DamageDetail {
  const base = attacker.stats.attack;
  const defense = target.stats.defense;
  const critRate = attacker.stats.criticalRate || 0;
  const critDamage = attacker.stats.criticalDamage || 1.5;
  
  let damage = base;
  
  // 스킬 데미지 계산
  if (skill) {
    damage *= skill.power;
  }
  
  // 방어력 적용
  damage = Math.max(1, damage - defense);
  
  // 치명타 판정
  const isCritical = Math.random() < critRate;
  if (isCritical) {
    damage *= critDamage;
  }
  
  return {
    baseDamage: base,
    criticalHit: isCritical,
    finalDamage: Math.floor(damage)
  };
}

export function formatDamageMessage(
  damageDetail: DamageDetail,
  skillName?: string
): string {
  const skillText = skillName ? `${skillName}으로 ` : '';
  const criticalText = damageDetail.criticalHit ? '치명타! ' : '';
  return `${skillText}${criticalText}${damageDetail.finalDamage}의 피해를 입혔습니다!`;
}

export function calculateCombatRewards(enemies: Enemy[]) {
  let totalExperience = 0;
  let totalGold = 0;
  
  for (const enemy of enemies) {
    // 기본 경험치 계산
    const baseExp = enemy.rewards?.experience || enemy.level * 100;
    totalExperience += baseExp;
    
    // 기본 골드 계산
    const baseGold = enemy.rewards?.gold || enemy.level * 50;
    totalGold += baseGold;
  }
  
  return {
    experience: totalExperience,
    gold: totalGold
  };
}

export function applyEffectsToCharacter(
  character: Character,
  effects: { targetId: string; effect: StatusEffect; duration: number; }[]
): Character {
  // 캐릭터 복사본 생성
  const result = { ...character };
  
  // 해당 캐릭터에게 적용된 효과만 필터링
  const appliedEffects = effects.filter(e => e.targetId === character.id);
  
  // 각 효과 적용
  for (const { effect } of appliedEffects) {
    // 기본 스탯에 효과 적용
    if (effect.effects) {
      for (const { stat, value, isPercentage } of effect.effects) {
        const currentValue = result.stats[stat] || 0;
        
        if (isPercentage) {
          // 퍼센트 기반 수정
          result.stats[stat] = currentValue * (1 + value / 100);
        } else {
          // 고정값 수정
          result.stats[stat] = currentValue + value;
        }
      }
    }
    
    // DOT/HOT 효과 처리
    if (effect.type === 'dot' || effect.type === 'hot') {
      const tickPower = effect.tickPower || 0;
      if (effect.type === 'dot') {
        result.stats.hp -= tickPower;
      } else {
        result.stats.hp = Math.min(
          result.stats.hp + tickPower,
          result.stats.maxHp
        );
      }
    }
  }
  
  return result;
}