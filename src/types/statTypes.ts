import type { Stats, StatusEffect } from './gameTypes';

export interface StatModifier {
  type: 'flat' | 'percentage';
  stat: keyof Stats;
  value: number;
}

export interface StatCalculation {
  // 기본, 장비, 효과, 최종 스탯
  base: Stats;
  equipment: Stats;
  effects: Array<StatusEffect>;
  final: Stats & {
    effectiveStrength: number;
    effectiveDefense: number;
    effectiveIntelligence: number;
    effectiveAgility: number;
  };
}