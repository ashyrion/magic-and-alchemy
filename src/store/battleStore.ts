import { create } from 'zustand'
import type { BattleState, BattleLog, Combatant } from '../types/battle'
import type { Skill } from '../types/gameTypes'

interface BattleStore extends BattleState {
  startBattle: (player: Combatant, enemy: Combatant) => void
  endBattle: (victory?: boolean) => void
  addLog: (message: string, type: BattleLog['type'], details?: BattleLog['details']) => void
  nextTurn: () => void
  basicAttack: () => void
  useSkill: (skillId: string) => void
  enemyAction: () => void
  updatePlayerStats: (newStats: Combatant['stats']) => void
  syncPlayerSkills: (equippedSkills: Skill[]) => void
  syncWithGameStore: () => void
  attemptFlee: () => void
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  inBattle: false,
  player: null,
  enemy: null,
  turnOrder: [],
  currentTurn: null,
  currentRound: 0,
  battleLogs: [],

  startBattle: (player: Combatant, enemy: Combatant) => {
    set({
      inBattle: true,
      player,
      enemy,
      currentRound: 1,
      turnOrder: [player.id, enemy.id],
      currentTurn: player.id,
      battleLogs: []
    })
  },

  endBattle: (victory = false) => {
    // 던전에서 전투 중이었다면 승리 시 방을 클리어
    const wasInBattle = get().inBattle;
    console.log('[전투] 전투 종료:', { wasInBattle, victory });
    
    if (wasInBattle && victory) {
      console.log('[전투] 승리! 던전 방 클리어 시도');
      try {
        // 동적 import를 사용하여 순환 참조 방지
        import('./dungeonStore').then(({ useDungeonStore }) => {
          const dungeonState = useDungeonStore.getState();
          console.log('[전투] 던전 상태:', { 
            isInDungeon: dungeonState.isInDungeon, 
            currentRoomId: dungeonState.currentRoomId 
          });
          if (dungeonState.isInDungeon && dungeonState.currentRoomId) {
            dungeonState.clearCurrentRoom();
          }
        }).catch((error) => {
          console.error('[전투] 던전 스토어 import 실패:', error);
        });
      } catch (error) {
        console.error('[전투] 던전 방 클리어 오류:', error);
      }
    }

    set({
      inBattle: false,
      player: null,
      enemy: null,
      turnOrder: [],
      currentTurn: null,
      currentRound: 0,
      battleLogs: []
    })
  },

    addLog: (message, type, details) => {
    set(state => ({
      battleLogs: [
        ...state.battleLogs,
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          message,
          type,
          details
        }
      ]
    }))
  },

  nextTurn: () => {
    const { turnOrder, currentTurn, enemy } = get()
    const currentIndex = turnOrder.indexOf(currentTurn || '')
    const nextIndex = (currentIndex + 1) % turnOrder.length
    const nextTurnId = turnOrder[nextIndex]
    
    set(state => ({
      currentTurn: nextTurnId,
      currentRound: nextIndex === 0 ? state.currentRound + 1 : state.currentRound
    }))

    // 적의 턴이면 자동으로 적 행동 실행
    if (enemy && nextTurnId === enemy.id) {
      // 약간의 딜레이를 주어 턴 변경이 보이도록 함
      setTimeout(() => {
        get().enemyAction()
      }, 1000)
    }
  },

  basicAttack: () => {
    const { player, enemy, currentTurn } = get()
    if (!player || !enemy || currentTurn !== player.id) return

    // 명중률 계산
    const hitChance = Math.min(95, Math.max(5, (player.stats.accuracy || 85) - (enemy.stats.evasion || 0)))
    const hitRoll = Math.random() * 100
    const isHit = hitRoll <= hitChance

    if (!isHit) {
      // 회피됨
      const dodgeDetail = {
        base: 0,
        skill: 0,
        criticalBonus: 0,
        defenseMitigation: 0,
        total: 0,
        isCritical: false,
        wasDodged: true,
        hitChance,
        hitRoll: Math.round(hitRoll)
      }

      get().addLog(`${player.name}의 공격을 ${enemy.name}이(가) 회피했습니다!`, 'player-action', {
        source: player.name,
        target: enemy.name,
        damage: dodgeDetail
      })
      get().nextTurn()
      return
    }

    // 크리티컬 계산
    const criticalChance = player.stats.criticalRate || 5
    const criticalRoll = Math.random() * 100
    const isCritical = criticalRoll <= criticalChance

    // 기본 공격 데미지 계산
    const baseDamage = (player.stats.strength || 0) + (player.stats.attack || 0)
    const randomMultiplier = 0.8 + Math.random() * 0.4 // 80% ~ 120% 랜덤
    const finalBaseDamage = Math.floor(baseDamage * randomMultiplier)
    
    // 크리티컬 보너스
    const criticalMultiplier = isCritical ? (player.stats.criticalDamage || 150) / 100 : 1
    const criticalBonus = isCritical ? Math.floor(finalBaseDamage * (criticalMultiplier - 1)) : 0
    
    // 방어력 적용
    const defenseMitigation = enemy.stats.defense || 0
    const finalDamage = Math.max(1, Math.floor((finalBaseDamage + criticalBonus) - defenseMitigation))
    
    // 적 HP 감소
    const newEnemyHp = Math.max(0, enemy.stats.hp - finalDamage)
    
    set(state => ({
      ...state,
      enemy: {
        ...enemy,
        stats: {
          ...enemy.stats,
          hp: newEnemyHp
        }
      }
    }))

    // 상세 로그 추가
    const damageDetail = {
      base: baseDamage,
      skill: 0,
      criticalBonus,
      defenseMitigation,
      total: finalDamage,
      isCritical,
      wasDodged: false,
      hitChance,
      hitRoll: Math.round(hitRoll)
    }

    get().addLog(
      `${player.name}이(가) 기본 공격으로 ${finalDamage}의 피해를 입혔습니다!`, 
      isCritical ? 'critical' : 'player-action',
      {
        source: player.name,
        target: enemy.name,
        damage: damageDetail
      }
    )

    // 적이 죽었는지 확인
    if (newEnemyHp <= 0) {
      get().addLog(`${enemy.name}을(를) 처치했습니다!`, 'system')
      get().endBattle(true) // 승리
      return
    }

    // 턴 넘기기
    get().nextTurn()
  },

  useSkill: (skillId: string) => {
    const { player, enemy, currentTurn } = get()
    if (!player || !enemy || currentTurn !== player.id) return



    // 플레이어의 스킬에서 찾기 (이미 장착된 스킬들이 전투 시작시 복사됨)
    const skill = player.skills.find((s: Skill) => s.id === skillId)
    
    if (!skill) {
      get().addLog(`해당 스킬을 찾을 수 없습니다! (찾는 ID: ${skillId})`, 'system')
      return
    }

    // MP 체크
    if (player.stats.mp < skill.cost) {
      get().addLog('MP가 부족합니다!', 'system')
      return
    }

    // MP 소모
    const newPlayerMp = player.stats.mp - skill.cost
    
    // 스킬 타입에 따른 처리
    if (skill.type === 'alchemy' && skill.name === '힐링 포션') {
      // 힐링 포션: 플레이어 회복
      const healAmount = skill.power
      const newPlayerHp = Math.min(player.stats.maxHp, player.stats.hp + healAmount)
      
      set(state => ({
        ...state,
        player: {
          ...player,
          stats: {
            ...player.stats,
            hp: newPlayerHp,
            mp: newPlayerMp
          }
        }
      }))

      get().addLog(
        `${player.name}이(가) ${skill.name}을(를) 사용하여 ${healAmount}의 체력을 회복했습니다!`,
        'player-action',
        {
          source: player.name,
          target: player.name,
          damage: {
            base: healAmount,
            skill: 0,
            criticalBonus: 0,
            defenseMitigation: 0,
            total: healAmount,
            isCritical: false,
            wasDodged: false,
            hitChance: 100,
            hitRoll: 100,
            type: 'alchemy'
          }
        }
      )
    } else {
      // 공격 스킬 (파이어볼 등)
      const isPhysicalSkill = skill.type === 'physical'
      const basePower = isPhysicalSkill 
        ? (player.stats.strength || 0) + (player.stats.attack || 0)
        : (player.stats.intelligence || 0) + (player.stats.magicAttack || 0)
      
      // 랜덤 변동 추가 (80% ~ 120%)
      const randomMultiplier = 0.8 + Math.random() * 0.4
      const randomizedSkillPower = Math.floor(skill.power * randomMultiplier)
      const totalSkillDamage = randomizedSkillPower + basePower
      const damage = Math.max(1, totalSkillDamage - (enemy.stats.defense || 0))
      
      // 적 HP 감소
      const newEnemyHp = Math.max(0, enemy.stats.hp - damage)
      
      set(state => ({
        ...state,
        player: {
          ...player,
          stats: {
            ...player.stats,
            mp: newPlayerMp
          }
        },
        enemy: {
          ...enemy,
          stats: {
            ...enemy.stats,
            hp: newEnemyHp
          }
        }
      }))

      // 게임 스토어의 캐릭터 MP도 동기화
      const syncGameStoreMp = async () => {
        try {
          const { useGameStore } = await import('./gameStore')
          const gameStore = useGameStore.getState()
          if (gameStore.character) {
            gameStore.updateCharacterStats({
              ...gameStore.character.stats,
              mp: newPlayerMp
            })
            console.log('[전투] 플레이어 MP 동기화:', newPlayerMp)
          }
        } catch (error) {
          console.error('게임 스토어 MP 동기화 오류:', error)
        }
      }
      syncGameStoreMp()

      // 로그 추가
      get().addLog(
        `${player.name}이(가) ${skill.name}을(를) 사용하여 ${damage}의 피해를 입혔습니다!`, 
        'player-action',
        {
          source: player.name,
          target: enemy.name,
          damage: {
            base: basePower,
            skill: randomizedSkillPower,
            criticalBonus: 0,
            defenseMitigation: enemy.stats.defense || 0,
            total: damage,
            isCritical: false,
            wasDodged: false,
            hitChance: 100,
            hitRoll: 100,
            type: skill.type === 'magic' ? 'magic' : 'physical'
          }
        }
      )

      // 적이 죽었는지 확인
      if (newEnemyHp <= 0) {
        get().addLog(`${enemy.name}을(를) 처치했습니다!`, 'system')
        get().endBattle(true) // 승리
        return
      }
    }

    // 턴 넘기기
    get().nextTurn()
  },

  enemyAction: () => {
    const { player, enemy, currentTurn } = get()
    if (!player || !enemy || currentTurn !== enemy.id) return

    // 적 기본 공격 데미지 계산 (랜덤성 포함)
    const baseDamage = (enemy.stats.strength || 0) + (enemy.stats.attack || 0)
    const randomMultiplier = 0.8 + Math.random() * 0.4 // 80% ~ 120% 랜덤
    const finalBaseDamage = Math.floor(baseDamage * randomMultiplier)
    const damage = Math.max(1, finalBaseDamage - (player.stats.defense || 0))
    
    // 플레이어 HP 감소
    const newPlayerHp = Math.max(0, player.stats.hp - damage)
    
    set(state => ({
      ...state,
      player: state.player ? {
        ...state.player,
        stats: {
          ...state.player.stats,
          hp: newPlayerHp
        }
      } : null
    }))

    // 게임 스토어의 캐릭터 정보도 동기화
    const syncGameStore = async () => {
      try {
        const { useGameStore } = await import('./gameStore')
        const gameStore = useGameStore.getState()
        if (gameStore.character) {
          gameStore.updateCharacterStats({
            ...gameStore.character.stats,
            hp: newPlayerHp
          })
          console.log('[전투] 플레이어 HP 동기화:', newPlayerHp)
        }
      } catch (error) {
        console.error('게임 스토어 동기화 오류:', error)
      }
    }
    syncGameStore()

    // 로그 추가
    get().addLog(`${enemy.name}이(가) 기본 공격으로 ${damage}의 피해를 입혔습니다!`, 'enemy-action')

    // 플레이어가 죽었는지 확인
    if (newPlayerHp <= 0) {
      get().addLog(`패배했습니다...`, 'system')
      get().endBattle(false) // 패배
      return
    }

    // 턴 넘기기
    get().nextTurn()
  },

  updatePlayerStats: (newStats: Combatant['stats']) => {
    const { player } = get()
    if (!player) return

    set(state => ({
      ...state,
      player: {
        ...player,
        stats: newStats
      }
    }))
  },

  // 실시간으로 게임스토어의 장착된 스킬과 동기화 (외부에서 스킬 목록 전달)
  syncPlayerSkills: (equippedSkills: Skill[]) => {
    const { player } = get()
    if (!player) return
    
    // 이미 같은 스킬 목록이면 업데이트하지 않음
    const currentSkillIds = player.skills.map(s => s.id).sort().join(',')
    const newSkillIds = equippedSkills.map(s => s.id).sort().join(',')
    
    if (currentSkillIds === newSkillIds) {
      return // 변경사항 없음
    }
    
    set(state => ({
      ...state,
      player: state.player ? {
        ...state.player,
        skills: equippedSkills
      } : null
    }))
  },

  // 게임 스토어와 실시간 동기화
  syncWithGameStore: () => {
    // 이 메서드는 외부에서 호출될 때 사용됩니다
    console.log('[Battle] syncWithGameStore 호출됨')
  },

  // 확률 기반 도망가기 시스템
  attemptFlee: () => {
    const { player, enemy } = get()
    if (!player || !enemy) return

    // 도망 확률 계산 (민첩성 기반, 기본 70%)
    const baseFleeChance = 70
    const agilityBonus = (player.stats.agility - enemy.stats.agility) * 2
    const fleeChance = Math.max(10, Math.min(95, baseFleeChance + agilityBonus))
    
    const fleeRoll = Math.random() * 100
    const fleeSuccess = fleeRoll <= fleeChance
    
    if (fleeSuccess) {
      get().addLog(`도망에 성공했습니다! (확률: ${Math.round(fleeChance)}%)`, 'system')
      get().endBattle(false) // 도망은 패배로 처리
    } else {
      get().addLog(`도망에 실패했습니다... (확률: ${Math.round(fleeChance)}%)`, 'system')
      // 도망 실패 시 턴 넘기기
      get().nextTurn()
    }
  }
}))
