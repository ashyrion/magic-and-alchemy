import type { Combatant } from '../types/battle';

// 적의 행동을 결정하는 함수
export const decideEnemyAction = (enemy: Combatant): { type: 'skill' | 'basic', skillId?: string } => {
  // 스킬이 있고 MP가 충분한 경우 스킬 사용 확률 50%
  const availableSkills = enemy.skills.filter(skill => enemy.stats.mp >= skill.cost);
  if (availableSkills.length > 0 && Math.random() > 0.5) {
    // 랜덤하게 스킬 선택
    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    return { type: 'skill', skillId: randomSkill.id };
  }
  // 기본 공격
  return { type: 'basic' };
};