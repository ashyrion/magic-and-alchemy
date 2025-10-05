import type { 
  Character, 
  Enemy, 
  Item, 
  Material, 
  MaterialStack,
  Recipe, 
  SavePoint, 
  Skill,
  StatusEffect,
  Stats
} from '../types/gameTypes';

export interface GameState {
  character: Character | null;
  baseStats: Stats | null;
  inventory: Item[];
  learnedSkills: Skill[];
  equippedSkills: Skill[]; // 장착된 스킬 (최대 4개)
  gold: number;
  gameTime: number;
  savePoints: SavePoint[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
}

export interface CombatState {
  inCombat: boolean;
  enemies: Enemy[];
  turn: number;
  initiative: string[];
  activeCharacterId: string | null;
  selectedSkill: Skill | null;
  selectedTarget: Character | null;
  playerCharacter: Character | null;
  activeEffects: {
    targetId: string;
    effect: StatusEffect;
    duration: number;
  }[];
  actionQueue: {
    actorId: string;
    action: string;
    targetId: string;
  }[];
}

export interface InventoryState {
  items: Item[];
  materials: Material[];
  materialStacks: MaterialStack[]; // 재료 스택
  capacity: {
    maxItems: number;      // 최대 아이템 수
    maxWeight: number;     // 최대 아이템 무게 (키로그램)
  };
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  gold: number;
  
  // 유틸리티 속성들
  currentWeight?: number;  // 현재 무게
  isOverweight?: boolean;  // 무게 초과 여부
}

export interface CraftingState {
  knownRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  selectedMaterials: Material[];
  craftingQueue: {
    recipe: Recipe;
    materials: Material[];
    progress: number;
  }[];
  discoveredEffects: string[];
  discoveredRecipes: Recipe[];
  craftingResult: Item | null;
  craftingHistory: {
    recipe: Recipe;
    materials: Material[];
    result: Item;
    timestamp: number;
  }[];
}