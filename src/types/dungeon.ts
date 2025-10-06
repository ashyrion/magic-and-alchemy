import type { Combatant } from './battle'
import type { Item, Material } from './gameTypes'

// 던전과 방 기본 타입
export type DungeonType = 'forest' | 'cave' | 'ruins' | 'tower';
export type DungeonDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type Direction = 'north' | 'south' | 'east' | 'west';

// 확장된 방 상태
export type RoomStatus = 'hidden' | 'visible' | 'current' | 'in-progress' | 'cleared' | 'locked';

// 이벤트 타입 확장
export type EventType = 
  | 'heal'        // 치유의 샘
  | 'buff'        // 버프 제단
  | 'shop'        // 상점
  | 'fountain'    // 마나 회복 샘
  | 'trap'        // 함정
  | 'puzzle'      // 퍼즐
  | 'merchant'    // 떠돌이 상인
  | 'altar'       // 신비한 제단
  | 'rest';       // 휴식처

// 보상 시스템
export interface Reward {
  type: 'item' | 'material' | 'gold' | 'experience';
  item?: Item;
  material?: Material;
  amount?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// 방 기본 구조 확장
type RoomBase = {
  id: string
  position: { x: number; y: number }
  status: RoomStatus
  difficulty: number
  connections: string[] // 좌표 기반 연결 ("x-y" 형식)
  description?: string
  flavorText?: string
}

export type BattleRoom = RoomBase & {
  type: 'battle'
  payload: {
    enemy: Combatant
    rewards: Reward[]
  }
}

export type TreasureRoom = RoomBase & {
  type: 'treasure'
  payload: {
    gold: number
    items: Item[]
    materials: Material[]
    isOpened: boolean
  }
}

export type EventRoom = RoomBase & {
  type: 'event'
  payload: {
    eventType: EventType
    effect: 'heal' | 'buff' | 'shop' | 'damage' | 'reward'
    value: number
    description: string
    isCompleted: boolean
    rewards?: Reward[]
  }
}

export type EmptyRoom = RoomBase & {
  type: 'empty'
  payload: {
    canRest: boolean
    description: string
  }
}

export type BossRoom = RoomBase & {
  type: 'boss'
  payload: {
    boss: Combatant
    rewards: Reward[]
    isDefeated: boolean
  }
}

export type StartRoom = RoomBase & {
  type: 'start'
  payload: {
    welcomeMessage: string
  }
}

export type ExitRoom = RoomBase & {
  type: 'exit'
  payload: {
    isUnlocked: boolean
    unlockCondition?: string
  }
}

// 통합된 방 타입
export type DungeonRoom = BattleRoom | TreasureRoom | EventRoom | EmptyRoom | BossRoom | StartRoom | ExitRoom

// 던전 레이아웃
export interface DungeonLayout {
  width: number
  height: number
  rooms: DungeonRoom[]
  startRoomId: string
  exitRoomId: string
  bossRoomId?: string
  roomConnections: Map<string, string[]>
}

// 던전 템플릿
export interface DungeonTemplate {
  id: string
  name: string
  type: DungeonType
  difficulty: DungeonDifficulty
  level: number
  description: string
  
  // 생성 설정
  minRooms: number
  maxRooms: number
  width: number
  height: number
  
  // 방 생성 확률
  battleRoomChance: number
  treasureRoomChance: number
  eventRoomChance: number
  
  // 적과 보상 풀
  enemyPool: Combatant[]
  bossEnemy?: Combatant
  rewardPools: {
    common: Reward[]
    uncommon: Reward[]
    rare: Reward[]
    boss: Reward[]
  }
}

// 던전 진행 상태 확장
export interface DungeonProgress {
  dungeonId: string
  templateId: string
  currentRoomId: string
  visitedRooms: string[]
  completedRooms: string[]
  
  // 통계
  roomsCleared: number
  totalRooms: number
  enemiesDefeated: number
  treasuresFound: number
  goldEarned: number
  experienceGained: number
  
  // 상태 플래그
  isCompleted: boolean
  isAbandoned: boolean
  bossDefeated: boolean
  
  // 시간 추적
  startTime: number
  endTime?: number
  totalTime?: number
}

// 던전 플로어 (기존 호환성 유지)
export interface DungeonFloor {
  floor: number
  rooms: DungeonRoom[]
}

// 로그 엔트리 확장
export interface DungeonLogEntry {
  id: string
  type: 'system' | 'combat' | 'discovery' | 'event' | 'reward'
  message: string
  timestamp: number
  roomId?: string
  data?: Record<string, unknown>
}

// 던전 상태 (확장)
export interface DungeonState {
  initialized: boolean
  
  // 현재 던전 정보
  currentDungeon?: DungeonTemplate
  currentLayout?: DungeonLayout
  currentProgress?: DungeonProgress
  
  // 현재 위치
  currentFloor: number
  currentRoomId: string | null
  
  // 방 데이터
  rooms: DungeonRoom[]
  
  // 완료된 던전들
  clearedFloors: DungeonFloor[]
  completedDungeons: DungeonProgress[]
  
  // 로그
  log: DungeonLogEntry[]
  
  // 임시 상태
  isInDungeon: boolean
  canExitDungeon: boolean
}

// 던전 생성 설정 (확장)
export interface DungeonConfig {
  // 기본 설정
  roomsPerFloor?: number
  treasureChance?: number
  eventChance?: number
  
  // 레이아웃 설정
  layoutType?: 'linear' | 'branched' | 'maze' | 'grid'
  guaranteeRest?: boolean
  guaranteeTreasure?: boolean
  
  // 난이도 설정
  enemyLevelMultiplier?: number
  rewardMultiplier?: number
  
  // 시드 (절차적 생성용)
  seed?: number
}

// 이벤트 결과
export interface EventResult {
  success: boolean
  message: string
  rewards?: Reward[]
  penalties?: {
    hpLoss?: number
    mpLoss?: number
    goldLoss?: number
  }
  effects?: {
    heal?: number
    buffType?: string
    buffDuration?: number
  }
}
