
export interface Stats {
  // === 기본 스탯 (3가지) ===
  strength: number;      // 힘 -> 물리공격력, 방어력에 기여
  agility: number;       // 민첩 -> 회피, 크리티컬 확률에 기여  
  intelligence: number;  // 지능 -> 마법공격력, 크리티컬 피해, 저항에 기여

  // === 리소스 ===
  hp: number;            // 현재 생명력
  maxHp: number;         // 최대 생명력
  mp: number;            // 현재 마나
  maxMp: number;         // 최대 마나

  // === 파생 전투 스탯 (계산됨) ===
  attack: number;        // 물리 공격력 (strength 기반)
  magicAttack: number;   // 마법 공격력 (intelligence 기반)
  defense: number;       // 방어력 (strength + agility 기반)
  criticalRate: number;  // 치명타 확률 (agility 기반)
  criticalDamage: number;// 치명타 피해 (intelligence 기반)
  evasion: number;       // 회피율 (agility 기반)

  // === 속성 저항 ===
  fireResist: number;    // 화염 저항
  iceResist: number;     // 냉기 저항
  lightningResist: number; // 번개 저항
  poisonResist: number;  // 독 저항

  [key: string]: number | undefined; // 기타 스탯
}

export interface BaseCharacter {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  statusEffects: StatusEffect[];
  skills: Skill[];
  gold: number;
}

export interface Character extends BaseCharacter {
  type: 'normal';
  category: 'humanoid';
  isEnemy: false;
  experience: number;
  experienceToNext: number;
}

export interface Enemy extends BaseCharacter {
  type: 'normal' | 'elite' | 'boss';
  category: 'beast' | 'undead' | 'demon' | 'elemental' | 'humanoid';
  isEnemy: true;
  rewards?: {
    experience?: number;
    gold?: number;
    items?: {
      id: string;
      chance: number;
      count: number[];
    }[];
  };
}

export type SkillType = 'magic' | 'physical' | 'elemental' | 'heal' | 'buff' | 'debuff';
export type SkillElement = 'fire' | 'ice' | 'lightning' | 'earth' | 'water' | 'wind' | 'light' | 'dark' | 'poison' | 'neutral';
export type SkillCategory = 'offensive' | 'defensive' | 'support' | 'utility';

export interface Skill {
  id: string;
  name: string;
  type: SkillType | 'magic' | 'alchemy' | 'physical'; // 기존 호환성 유지
  element?: SkillElement;
  category?: SkillCategory;
  power: number;
  cost: number;
  cooldown?: number;       // 스킬 쿨타임 (턴 단위, 기본값 0)
  effects: StatusEffect[];
  targetType?: 'self' | 'enemy' | 'all' | 'ally';
  range?: number;           // 스킬 사거리
  accuracy?: number;        // 스킬 명중률 (기본 100%)
  description?: string;
  icon?: string;           // 스킬 아이콘 이모지 또는 문자
}

// 전투 중 스킬 상태
export interface BattleSkillState {
  skillId: string;
  currentCooldown: number; // 남은 쿨타임 턴 수
}

// 아이템 등급 시스템
export type ItemRarity = 'common' | 'magic' | 'rare' | 'unique';

// 접두사/접미어 시스템
export interface ItemAffix {
  id: string;
  name: string;
  type: 'prefix' | 'suffix';
  stats: Partial<Stats>;
  description: string;
  tier: number; // 1-5 (1이 가장 강력)
  requiredLevel?: number;
  itemTypes?: string[]; // 적용 가능한 아이템 타입
}

export interface GeneratedItem extends Item {
  rarity: ItemRarity;
  prefixes: ItemAffix[];
  suffixes: ItemAffix[];
  baseStats: Partial<Stats>; // 기본 스탯
  affixStats: Partial<Stats>; // 접두사/접미어 스탯
  displayName: string; // 접두사 + 기본이름 + 접미어
  colorCode: string; // CSS 색상 코드
}

export interface Item {
  id: string;
  instanceId?: string;     // 아이템 인스턴스 고유 ID
  name: string;
  icon?: string;           // 아이템 아이콘
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  weight: number;          // 무게 (키로그램)
  requiredLevel?: number;  // 사용 제한 레벨
  isEquipped?: boolean;    // 장착 상태
  stats?: Partial<Stats>;
  effects?: StatusEffect[];
  description?: string;
  originalId?: string;     // 연금술 아이템의 원본 ID (효과 처리용)
  rarity?: ItemRarity;     // 아이템 등급 (기존 아이템 호환성)
}

export type StatusEffectType = 'buff' | 'debuff' | 'dot' | 'hot' | 'stun' | 'silence' | 'root';
export type StatusEffectElement = 'fire' | 'ice' | 'lightning' | 'earth' | 'water' | 'wind' | 'light' | 'dark' | 'poison' | 'neutral';

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  type: StatusEffectType;
  element: StatusEffectElement;
  duration: number;
  remainingDuration?: number;  // 남은 지속시간 (전투 중에만 사용)
  stackable: boolean;
  maxStacks?: number;
  currentStacks?: number;      // 현재 중첩 수
  value: number;
  tickPower?: number;          // DOT/HOT 틱당 데미지/힐량
  tickPeriod?: number;         // 틱 주기 (기본 1턴마다)
  icon: string;                // 상태 효과 아이콘 이모지
  
  // 스탯 효과
  effects: Array<{
    stat: keyof Stats;
    value: number;
    isPercentage: boolean;
  }>;
  
  // 특수 효과 플래그
  isDisabling?: boolean;       // 행동 불가 효과 (스턴, 수면 등)
  preventsActions?: string[];  // 차단하는 행동 타입들 ['attack', 'skill', 'item']
  
  // 콜백 함수들
  onApply?: (target: BaseCharacter) => void;
  onRemove?: (target: BaseCharacter) => void;
  onTick?: (target: BaseCharacter) => number; // 틱 데미지/힐 반환
}

export type SavePoint = {
  id: string;
  timestamp: number;
  location: string;
};


export type Recipe = {
  id: string;
  name: string;
  materials: Array<{
    itemId: string;
    count: number;
  }>;
  result: Item;
  discoveredAt?: number;
};

export type CraftingEffect = {
  id: string;
  name: string;
  description: string;
  type: string;
  power: number;
};

export type CraftingHistoryEntry = {
  id: string;
  timestamp: number;
  recipe: Recipe;
  materials: Item[];
  result: Item;
  success: boolean;
};

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type Equipment = {
  [key in EquipmentSlot]: Item | null;
};

// 재료 아이템 타입
export type Material = Item & {
  type: 'material';
  effects?: StatusEffect[];
  description: string;
};

// 재료 스택 타입
export type MaterialStack = {
  material: Material;
  count: number;
};