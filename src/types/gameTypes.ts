
export interface Stats {
  // 기본 스탯
  strength: number;       // 근력 (물리 피해 증가)
  defense: number;        // 물리 방어력
  intelligence: number;   // 지능 (마법 피해 증가)
  agility: number;       // 민첩 (회피율, 치명타율 증가)

  // 보조 스탯
  vitality: number;      // 체력
  wisdom: number;        // 지혜
  accuracy: number;      // 명중률
  speed: number;         // 행동 속도
  weight: number;        // 무게

  // 리소스
  hp: number;            // 현재 생명력
  maxHp: number;         // 최대 생명력
  mp: number;            // 현재 마나
  maxMp: number;         // 최대 마나

  // 전투 스탯
  attack: number;        // 물리 공격력
  magicAttack: number;   // 마법 공격력
  criticalRate: number;  // 치명타 확률
  criticalDamage: number;// 치명타 피해량
  physicalDefense: number; // 물리 방어력
  magicDefense: number;  // 마법 방어력
  evasion: number;      // 회피율

  // 리소스 관리
  hpRegen: number;      // HP 재생
  mpRegen: number;      // MP 재생
  resourceCostReduction: number; // 자원 소모량 감소

  // 속성 저항
  fireResist: number;
  iceResist: number;
  lightningResist: number;
  poisonResist: number;

  // 추가적인 전투 관련 파생 스탯
  dotResistance: number;
  hotBonus: number;
  recovery: number;

  [key: string]: number; // 기타 스탯
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

export interface Skill {
  id: string;
  name: string;
  type: 'magic' | 'alchemy' | 'physical';
  power: number;
  cost: number;
  effects: StatusEffect[];
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  weight: number;          // 무게 (키로그램)
  requiredLevel?: number;  // 사용 제한 레벨
  isEquipped?: boolean;    // 장착 상태
  stats?: Partial<Stats>;
  effects?: StatusEffect[];
  description?: string;
  originalId?: string;     // 연금술 아이템의 원본 ID (효과 처리용)
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff' | 'dot' | 'hot';
  duration: number;
  stackable: boolean;
  maxStacks?: number;
  value: number;
  tickPower?: number;
  tickPeriod?: number;
  element?: 'fire' | 'ice' | 'lightning' | 'poison' | 'neutral';
  effects: Array<{
    stat: keyof Stats;
    value: number;
    isPercentage: boolean;
  }>;
  
  onApply?: () => void;
  onRemove?: () => void;
  onTick?: () => void;
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