import type { Character, Enemy, StatusEffect } from './gameTypes'

export interface DamageDetail {
  base: number
  skill: number
  criticalBonus: number
  defenseMitigation: number
  total: number
  isCritical: boolean
  wasDodged: boolean
  hitChance: number
  hitRoll: number
  type?: 'physical' | 'magic' | 'alchemy' | 'fire' | 'ice' | 'lightning' | 'poison' | 'neutral'
}

export type Combatant = Character | Enemy

export interface CombatRewards {
  experience: number
  gold: number
  items?: {
    id: string
    count: number
  }[]
}

export interface ResourceChange {
  value: number
  source: string
  isCritical?: boolean
  isOverTime?: boolean
}

export interface BattleLog {
  message: string
  type:
    | 'normal'
    | 'player-action'
    | 'enemy-action'
    | 'damage'
    | 'heal'
    | 'system'
    | 'equipment'
    | 'effect'
    | 'critical'
    | 'status'
    | 'resource'
  timestamp: number
  details?: {
    source?: string
    target?: string
    damage?: DamageDetail
    healing?: number
    effect?: StatusEffect
    resourceChanges?: ResourceChange[]
  }
}

export interface BattleState {
  inBattle: boolean
  player: Combatant | null
  enemy: Combatant | null
  turnOrder: string[]
  currentTurn: string | null
  currentRound: number
  battleLogs: BattleLog[]
  rewards?: CombatRewards
  eventUnsubscribe?: () => void
}
