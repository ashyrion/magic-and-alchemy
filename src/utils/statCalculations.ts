import type { Stats } from '../types/gameTypes';

/**
 * 새로운 스탯 시스템의 파생 스탯 계산 함수들
 */

// 기본 스탯에서 파생 스탯을 계산하는 함수
export function calculateDerivedStats(baseStats: Partial<Stats>): Partial<Stats> {
  const str = baseStats.strength || 0;
  const agi = baseStats.agility || 0;
  const int = baseStats.intelligence || 0;

  return {
    // 물리 공격력: 힘 * 2 + 기본값
    attack: Math.floor(str * 2) + (baseStats.attack || 0),
    
    // 마법 공격력: 지능 * 2 + 기본값
    magicAttack: Math.floor(int * 2) + (baseStats.magicAttack || 0),
    
    // 방어력: 힘 * 1.5 + 민첩 * 0.5 + 기본값
    defense: Math.floor(str * 1.5 + agi * 0.5) + (baseStats.defense || 0),
    
    // 크리티컬 확률: 민첩 * 0.5% + 기본값 (최대 50%, 퍼센트 단위)
    criticalRate: Math.min(50, (agi * 0.5) + (baseStats.criticalRate || 0)),
    
    // 크리티컬 피해: 지능 * 2% + 150% + 기본값 (퍼센트 단위)
    criticalDamage: (int * 2) + 150 + (baseStats.criticalDamage || 0),
    
    // 회피율: 민첩 * 1 + 기본값 (최대 30%, 퍼센트 단위)
    evasion: Math.min(30, (agi * 1) + (baseStats.evasion || 0)),
    
    // 저항은 지능의 영향 + 기본값
    fireResist: Math.floor(int * 0.5) + (baseStats.fireResist || 0),
    iceResist: Math.floor(int * 0.5) + (baseStats.iceResist || 0),
    lightningResist: Math.floor(int * 0.5) + (baseStats.lightningResist || 0),
    poisonResist: Math.floor(int * 0.5) + (baseStats.poisonResist || 0)
  };
}

// 스탯을 합치는 유틸리티 함수 (기존 것 개선)
export function combineStats(...statsArray: Partial<Stats>[]): Partial<Stats> {
  const combined: Partial<Stats> = {};
  
  statsArray.forEach(stats => {
    if (stats) {
      Object.entries(stats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          combined[key] = (combined[key] || 0) + value;
        }
      });
    }
  });
  
  return combined;
}

// 최종 스탯 계산 (기본 스탯 + 장비 보너스 + 파생 스탯)
export function calculateFinalStats(
  baseStats: Partial<Stats>, 
  equipmentStats: Partial<Stats>
): Stats {
  // 기본 스탯과 장비 스탯을 먼저 합침
  const combinedBaseStats = combineStats(baseStats, equipmentStats);
  
  // 파생 스탯 계산
  const derivedStats = calculateDerivedStats(combinedBaseStats);
  
  // 최종 스탯 = 기본+장비 + 파생
  const finalStats = combineStats(combinedBaseStats, derivedStats);
  
  // 기본값 보장 (퍼센트 단위로 통일)
  const defaults = {
    strength: 0,
    agility: 0,
    intelligence: 0,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 0,
    magicAttack: 0,
    defense: 0,
    criticalRate: 5,      // 기본 5%
    criticalDamage: 150,  // 기본 150%
    evasion: 5,           // 기본 5%
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    poisonResist: 0
  };
  
  return Object.assign(defaults, finalStats) as Stats;
}

// 스탯 표시용 한글 이름
export const statDisplayNames: { [key: string]: string } = {
  // 기본 스탯
  strength: '힘',
  agility: '민첩',
  intelligence: '지능',
  
  // 리소스
  hp: '생명력',
  maxHp: '최대 생명력',
  mp: '마나',
  maxMp: '최대 마나',
  
  // 전투 스탯
  attack: '물리 공격력',
  magicAttack: '마법 공격력',
  defense: '방어력',
  criticalRate: '치명타 확률',
  criticalDamage: '치명타 피해',
  evasion: '회피율',
  
  // 속성 저항
  fireResist: '화염 저항',
  iceResist: '냉기 저항',
  lightningResist: '번개 저항',
  poisonResist: '독 저항'
};

// 퍼센트로 표시할 스탯들
export const percentageStats = new Set([
  'criticalRate',
  'criticalDamage', 
  'evasion'
]);

// 저항 스탯들
export const resistanceStats = new Set([
  'fireResist',
  'iceResist', 
  'lightningResist',
  'poisonResist'
]);