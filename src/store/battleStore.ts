import { create } from 'zustand'
import type { BattleState, BattleLog, Combatant } from '../types/battle'
import type { Skill, BattleSkillState } from '../types/gameTypes'
import { statusEffectsData, skillStatusEffects } from '../data/statusEffects'

interface BattleResult {
  victory: boolean;
  enemy: Combatant;
  rewards: {
    experience: number;
    gold: number;
    items: string[];
  };
}

interface BattleStore extends BattleState {
  battleResult: BattleResult | null;
  showBattleResult: boolean;
  skillCooldowns: BattleSkillState[];  // 스킬 쿨타임 상태
  
  startBattle: (player: Combatant, enemy: Combatant) => void
  endBattle: (victory: boolean, enemy: Combatant, rewards: BattleResult['rewards']) => void
  addLog: (message: string, type: BattleLog['type'], details?: BattleLog['details']) => void
  nextTurn: () => void
  basicAttack: () => void
  useSkill: (skillId: string) => void
  enemyAction: () => void
  updatePlayerStats: (newStats: Combatant['stats']) => void
  syncPlayerSkills: (equippedSkills: Skill[]) => void
  syncWithGameStore: () => void
  attemptFlee: () => void
  closeBattleResult: () => void
  
  // 스킬 쿨타임 관리
  initializeSkillCooldowns: (skills: Skill[]) => void
  isSkillOnCooldown: (skillId: string) => boolean
  getSkillCooldown: (skillId: string) => number
  applySkillCooldown: (skillId: string) => void
  reduceAllCooldowns: () => void
  resetAllCooldowns: () => void
  
  // 상태 효과 관리
  applyStatusEffect: (target: 'player' | 'enemy', effectId: string) => void
  removeStatusEffect: (target: 'player' | 'enemy', effectId: string) => void
  processStatusEffects: (target: 'player' | 'enemy') => void
  processAllStatusEffects: () => void
  updateStatusEffectDurations: (target: 'player' | 'enemy') => void
  checkDisablingEffects: (target: 'player' | 'enemy') => boolean
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  inBattle: false,
  player: null,
  enemy: null,
  turnOrder: [],
  currentTurn: null,
  currentRound: 0,
  battleLogs: [],
  battleResult: null,
  showBattleResult: false,
  skillCooldowns: [],              // 스킬 쿨타임 상태

  startBattle: (player: Combatant, enemy: Combatant) => {
    // 스킬 쿨타임 초기화
    get().initializeSkillCooldowns(player.skills);
    
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

    endBattle: (victory: boolean, enemy: Combatant, rewards: BattleResult['rewards']) => {
    console.log('endBattle 호출됨:', { victory, enemy: enemy.name, rewards });
    
    // 전투 종료 시 모든 스킬 쿨타임 리셋
    get().resetAllCooldowns();
    
    const battleResult: BattleResult = {
      victory,
      enemy,
      rewards
    };
    
    console.log('전투 상태 업데이트 전:', get());
    
    set((state) => ({
      ...state,
      inBattle: false,
      showBattleResult: true,
      battleResult,
      currentTurn: null,
      // 전투 결과 표시 중에는 플레이어와 적 데이터를 유지
      // player: null,
      // enemy: null
    }));
    
    console.log('전투 상태 업데이트 후:', get());
  },

    closeBattleResult: async () => {
    const state = get();
    const wasVictory = state.battleResult?.victory || false;
    const rewards = state.battleResult?.rewards;
    
    console.log('[전투] 결과 화면 닫기 시작 - 승리:', wasVictory);
    
    // 전투 승리 시 보상 지급
    if (wasVictory && rewards) {
      try {
        const { useGameStore } = await import('./gameStore');
        const gameStore = useGameStore.getState();
        
        // 경험치 획득
        if (rewards.experience > 0) {
          gameStore.addExperience(rewards.experience);
          console.log('[전투] 경험치 지급:', rewards.experience);
        }
        
        // 골드 획득
        if (rewards.gold > 0) {
          gameStore.addGold(rewards.gold);
          console.log('[전투] 골드 지급:', rewards.gold);
        }
      } catch (error) {
        console.error('[전투] 보상 지급 실패:', error);
      }
    }
    
    // 결과 화면 닫기 및 전투 데이터 정리
    set({ 
      battleResult: null, 
      showBattleResult: false,
      player: null,
      enemy: null
    });
    
    // 후속 처리
    if (wasVictory) {
      // 전투 승리 시 던전 방 클리어
      console.log('[전투] 던전 방 클리어 시도');
      try {
        const { useDungeonStore } = await import('./dungeonStore');
        const dungeonState = useDungeonStore.getState();
        console.log('[전투] 던전 상태:', { 
          isInDungeon: dungeonState.isInDungeon, 
          currentRoomId: dungeonState.currentRoomId 
        });
        if (dungeonState.isInDungeon && dungeonState.currentRoomId) {
          dungeonState.clearCurrentRoom();
          console.log('[전투] 던전 방 클리어 완료');
        }
      } catch (error) {
        console.error('[전투] 던전 클리어 실패:', error);
      }
    } else {
      // 전투 패배 시 마을로 이동
      console.log('[전투] 전투 패배 - 마을로 이동');
      try {
        const [{ useGameStore }, { useGameStateStore }] = await Promise.all([
          import('./gameStore'),
          import('./gameStateStore')
        ]);
        
        const gameState = useGameStore.getState();
        const gameStateStore = useGameStateStore.getState();
        
        // 캐릭터 HP를 1로 설정 (죽지 않게 하되 위험 상태로)
        if (gameState.character) {
          const currentHP = gameState.character.stats.currentHP ?? gameState.character.stats.hp ?? 0;
          
          // HP가 0 이하인 경우 1로 설정 (모든 HP 필드 업데이트)
          if (currentHP <= 0) {
            console.log('[전투] 패배 시 HP 상태:', {
              currentHP: gameState.character.stats.currentHP,
              hp: gameState.character.stats.hp,
              selectedHP: currentHP
            });
            
            // updateCharacterStats를 사용하여 모든 HP 필드를 안전하게 업데이트
            gameState.updateCharacterStats({
              hp: 1,              // 레거시 필드
              currentHP: 1,       // 현재 사용 중인 필드
            });
            
            console.log('[전투] 캐릭터 HP를 1로 설정 완료');
          }
        }
        
        // 마을로 이동
        gameStateStore.goToTown();
        console.log('[전투] 마을로 이동 완료');
      } catch (error) {
        console.error('[전투] 패배 처리 실패:', error);
      }
    }
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
    const { turnOrder, currentTurn, enemy, player } = get()
    const currentIndex = turnOrder.indexOf(currentTurn || '')
    const nextIndex = (currentIndex + 1) % turnOrder.length
    const nextTurnId = turnOrder[nextIndex]
    
    // 새로운 라운드 시작 시 추가 처리
    if (nextIndex === 0) {
      get().reduceAllCooldowns();
      
      // 모든 상태 효과 처리 (DOT/HOT 등)
      get().processAllStatusEffects();
      
      // 상태 효과 지속시간 감소
      get().updateStatusEffectDurations('player');
      get().updateStatusEffectDurations('enemy');
      
      // 전투 종료 체크 (DOT로 인한 죽음)
      if (player && player.stats.hp <= 0) {
        get().addLog(`${player.name}이(가) 상태 효과로 인해 쓰러졌습니다!`, 'system');
        const rewards = { experience: 0, gold: 0, items: [] };
        get().endBattle(false, enemy!, rewards);
        return;
      }
      
      if (enemy && enemy.stats.hp <= 0) {
        get().addLog(`${enemy.name}이(가) 상태 효과로 인해 쓰러졌습니다!`, 'system');
        const rewards = {
          experience: Math.floor((enemy.level || 1) * 10 + Math.random() * 20),
          gold: Math.floor((enemy.level || 1) * 5 + Math.random() * 10),
          items: []
        };
        get().endBattle(true, enemy, rewards);
        return;
      }
    }
    
    set(state => ({
      currentTurn: nextTurnId,
      currentRound: nextIndex === 0 ? state.currentRound + 1 : state.currentRound
    }))

    // 행동 불가 효과 체크
    const isPlayerDisabled = get().checkDisablingEffects('player');
    const isEnemyDisabled = get().checkDisablingEffects('enemy');
    
    // 적의 턴이면서 행동 가능하면 자동으로 적 행동 실행
    if (enemy && nextTurnId === enemy.id && !isEnemyDisabled) {
      // 약간의 딜레이를 주어 턴 변경이 보이도록 함
      setTimeout(() => {
        get().enemyAction()
      }, 1000)
    } else if (nextTurnId === enemy?.id && isEnemyDisabled) {
      // 적이 행동 불가 상태면 턴 스킵
      get().addLog(`${enemy.name}이(가) 상태 효과로 인해 행동할 수 없습니다!`, 'system');
      setTimeout(() => {
        get().nextTurn()
      }, 500)
    } else if (nextTurnId === player?.id && isPlayerDisabled) {
      // 플레이어가 행동 불가 상태면 턴 스킵
      get().addLog(`${player.name}이(가) 상태 효과로 인해 행동할 수 없습니다!`, 'system');
      setTimeout(() => {
        get().nextTurn()
      }, 500)
    }
  },

  basicAttack: () => {
    const { player, enemy, currentTurn } = get()
    if (!player || !enemy || currentTurn !== player.id) return

    // 5단계 방어 시스템 적용
    // 1단계: 회피 체크
    const playerAccuracy = player.stats.accuracy || 85
    const enemyEvasion = enemy.stats.evasion || 10
    const attackHitChance = Math.max(10, playerAccuracy - enemyEvasion)
    const evaded = Math.random() * 100 > attackHitChance

    let damage = 0
    let logMessage = `${player.name}이(가) 기본 공격을 시도했습니다!`
    
    if (evaded) {
      logMessage += ` 하지만 ${enemy.name}이(가) 회피했습니다!`
    } else {
      // 2단계: 기본 데미지 계산
      const basePower = (player.stats.strength || 0) + (player.stats.attack || 0)
      const randomMultiplier = 0.8 + Math.random() * 0.4 // 80% ~ 120% 랜덤
      damage = Math.floor(basePower * randomMultiplier)
      
      // 3단계: 크리티컬 히트 체크
      const playerCriticalChance = player.stats.criticalRate || 5
      const isCritical = Math.random() * 100 < playerCriticalChance
      if (isCritical) {
        damage = Math.floor(damage * 1.5)
        logMessage += ` 크리티컬 히트!`
      }
      
      // 4단계: 방어력 적용
      damage = Math.max(1, damage - (enemy.stats.defense || 0))
      
      // 5단계: 데미지 경감 적용
      const enemyDamageReduction = enemy.stats.damageReduction || 0
      if (enemyDamageReduction > 0) {
        const reducedAmount = Math.floor(damage * enemyDamageReduction / 100)
        damage = Math.max(1, damage - reducedAmount)
        logMessage += ` (${enemyDamageReduction}% 데미지 경감 적용)`
      }
      
      logMessage += ` ${damage}의 데미지를 입혔습니다!`
    }
    
    // 전투 로그 추가 (실제 크리티컬 결과 사용)
    const actualCritical = !evaded && Math.random() * 100 < (player.stats.criticalRate || 5)
    const hitRoll = Math.random() * 100
    get().addLog(logMessage, 'player-action', {
      source: player.name,
      target: enemy.name,
      damage: {
        base: evaded ? 0 : Math.floor(((player.stats.strength || 0) + (player.stats.attack || 0)) * (0.8 + Math.random() * 0.4)),
        skill: 0,
        criticalBonus: actualCritical ? Math.floor(damage * 0.5) : 0,
        defenseMitigation: Math.max(0, (enemy.stats.defense || 0)),
        total: evaded ? 0 : damage,
        isCritical: actualCritical,
        wasDodged: evaded,
        hitChance: attackHitChance,
        hitRoll: Math.round(hitRoll),
        type: 'physical'
      }
    })

    if (evaded) {
      get().nextTurn()
      return
    }

    // === 적 HP 감소 및 사망 체크 ===
    const newEnemyHp = Math.max(0, enemy.stats.hp - damage)
    
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

    // === 마나 리젠 (기본공격 시) ===
    const currentMana = player.stats.mana || 0;
    const maxMana = player.stats.maxMana || 100;
    const manaRegen = Math.floor(maxMana * 0.15); // 최대 마나의 15% 회복
    const newMana = Math.min(maxMana, currentMana + manaRegen);
    
    if (manaRegen > 0) {
      const newPlayerStats = {
        ...player.stats,
        mana: newMana
      };
      
      set(state => ({
        ...state,
        player: {
          ...player,
          stats: newPlayerStats
        }
      }));
      
      // 게임 스토어와 동기화
      get().updatePlayerStats(newPlayerStats);
      
      get().addLog(`기본공격으로 마나를 ${manaRegen} 회복했습니다! (${currentMana} → ${newMana})`, 'system');
    }

    // 적이 죽었는지 확인
    if (newEnemyHp <= 0) {
      get().addLog(`${enemy.name}을(를) 처치했습니다!`, 'system')
      
      // 보상 계산
      const rewards = {
        experience: Math.floor((enemy.level || 1) * 10 + Math.random() * 20),
        gold: Math.floor((enemy.level || 1) * 5 + Math.random() * 10),
        items: [] // TODO: 나중에 아이템 드롭 시스템 추가
      };
      
      get().endBattle(true, enemy, rewards)
      return
    }

    // 턴 넘기기
    get().nextTurn()
  },

  useSkill: (skillId: string) => {
    const { player, enemy, currentTurn } = get()
    if (!player || !enemy || currentTurn !== player.id) return

    // 쿨타임 체크
    if (get().isSkillOnCooldown(skillId)) {
      const remainingCooldown = get().getSkillCooldown(skillId);
      get().addLog(`${skillId} 스킬은 아직 쿨타임입니다! (${remainingCooldown}턴 남음)`, 'system')
      return
    }

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
    if (skill.name === '힐링 포션' || skill.name === '치유' || skill.name.includes('회복') || skill.name.includes('힐')) {
      // 치유 스킬: 플레이어 회복
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

      // 게임 스토어의 캐릭터 HP/MP도 동기화
      const syncGameStore = async () => {
        try {
          const { useGameStore } = await import('./gameStore')
          const gameStore = useGameStore.getState()
          if (gameStore.character) {
            gameStore.updateCharacterStats({
              ...gameStore.character.stats,
              hp: newPlayerHp,
              currentHP: newPlayerHp,  // HP 필드명 통일을 위해 추가
              mp: newPlayerMp,
              currentMP: newPlayerMp   // MP 필드명 통일을 위해 추가
            })
            console.log('[전투] 치유 후 플레이어 HP/MP 동기화:', { hp: newPlayerHp, mp: newPlayerMp })
          }
        } catch (error) {
          console.error('게임 스토어 HP/MP 동기화 오류:', error)
        }
      }
      syncGameStore()

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
      
      // 치유 스킬의 상태 효과 적용
      const statusEffectsToApply = skillStatusEffects[skillId] || [];
      statusEffectsToApply.forEach(effectId => {
        get().applyStatusEffect('player', effectId);
      });
      
      // 스킬 쿨타임 적용
      get().applySkillCooldown(skillId);
      
      // 턴 넘기기
      get().nextTurn()
      return
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
      
      // 5단계 방어 시스템 적용
      // 1단계: 회피 체크
      const playerAccuracy = (player.stats.accuracy || 50) + (isPhysicalSkill ? 0 : 10) // 마법 스킬은 명중률 보너스
      const enemyEvasion = enemy.stats.evasion || 10
      const skillHitChance = Math.max(10, playerAccuracy - enemyEvasion)
      const evaded = Math.random() * 100 > skillHitChance
      
      let damage = 0
      let logMessage = `${player.name}이(가) ${skill.name}을(를) 사용했습니다!`
      
      if (evaded) {
        logMessage += ` 하지만 ${enemy.name}이(가) 회피했습니다!`
      } else {
        // 2단계: 기본 데미지 계산
        damage = totalSkillDamage
        
        // 3단계: 크리티컬 히트 체크
        const playerCriticalChance = player.stats.criticalChance || 5
        const isCritical = Math.random() * 100 < playerCriticalChance
        if (isCritical) {
          damage = Math.floor(damage * 1.5)
          logMessage += ` 크리티컬 히트!`
        }
        
        // 4단계: 방어력 적용
        damage = Math.max(1, damage - (enemy.stats.defense || 0))
        
        // 5단계: 데미지 경감 적용
        const enemyDamageReduction = enemy.stats.damageReduction || 0
        if (enemyDamageReduction > 0) {
          const reducedAmount = Math.floor(damage * enemyDamageReduction / 100)
          damage = Math.max(1, damage - reducedAmount)
          logMessage += ` (${enemyDamageReduction}% 데미지 경감 적용)`
        }
        
        logMessage += ` ${damage}의 데미지를 입혔습니다!`
      }
      
      // 적 HP 감소
      const newEnemyHp = Math.max(0, enemy.stats.hp - damage)
      
      // 전투 로그 추가
      const actualCritical = !evaded && Math.random() * 100 < (player.stats.criticalChance || 5)
      const skillHitRoll = Math.random() * 100
      get().addLog(logMessage, 'player-action', {
        source: player.name,
        target: enemy.name,
        damage: {
          base: randomizedSkillPower,
          skill: basePower,
          criticalBonus: actualCritical ? Math.floor(damage * 0.5) : 0,
          defenseMitigation: Math.max(0, (enemy.stats.defense || 0)),
          total: evaded ? 0 : damage,
          isCritical: actualCritical,
          wasDodged: evaded,
          hitChance: skillHitChance,
          hitRoll: Math.round(skillHitRoll),
          type: isPhysicalSkill ? 'physical' : 'magic'
        }
      })
      
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
              mp: newPlayerMp,
              currentMP: newPlayerMp  // MP 필드명 통일을 위해 추가
            })
            console.log('[전투] 플레이어 MP 동기화:', { mp: newPlayerMp, currentMP: newPlayerMp })
          }
        } catch (error) {
          console.error('게임 스토어 MP 동기화 오류:', error)
        }
      }
      syncGameStoreMp()

      // 공격 스킬의 상태 효과 적용 (적에게)
      if (!evaded) {
        const statusEffectsToApply = skillStatusEffects[skillId] || [];
        statusEffectsToApply.forEach(effectId => {
          get().applyStatusEffect('enemy', effectId);
        });
      }
      
      // 적이 죽었는지 확인
      if (newEnemyHp <= 0) {
        get().addLog(`${enemy.name}을(를) 처치했습니다!`, 'system')
        
        // 보상 계산
        const rewards = {
          experience: Math.floor((enemy.level || 1) * 10 + Math.random() * 20),
          gold: Math.floor((enemy.level || 1) * 5 + Math.random() * 10),
          items: [] // TODO: 나중에 아이템 드롭 시스템 추가
        };
        
        get().endBattle(true, enemy, rewards)
        return
      }
    }

    // 스킬 쿨타임 적용
    get().applySkillCooldown(skillId);
    
    // 턴 넘기기
    get().nextTurn()
  },

  enemyAction: () => {
    const { player, enemy, currentTurn } = get()
    if (!player || !enemy || currentTurn !== enemy.id) return

    // === 1단계: 회피 체크 ===
    const playerEvasion = player.stats.evasion || 0;
    const enemyAccuracy = enemy.stats.accuracy || 85;
    
    // 회피율 계산 (회피력 vs 적 명중률)
    const hitChance = Math.max(10, enemyAccuracy - playerEvasion); // 최소 10% 명중률 보장
    const evadeRoll = Math.random() * 100;
    
    if (evadeRoll >= hitChance) {
      // 회피 성공!
      get().addLog(`${player.name}이(가) 적의 공격을 회피했습니다!`, 'player-action');
      get().nextTurn();
      return;
    }

    // === 2단계: 데미지 계산 ===
    // 적의 기본 공격력
    const enemyAttack = (enemy.stats.strength || 0) + (enemy.stats.attack || 0);
    const randomMultiplier = 0.8 + Math.random() * 0.4; // 80% ~ 120% 랜덤
    let baseDamage = Math.floor(enemyAttack * randomMultiplier);

    // === 3단계: 크리티컬 체크 ===
    const enemyCritRate = enemy.stats.criticalRate || 5;
    const critRoll = Math.random() * 100;
    let isCritical = false;
    
    if (critRoll < enemyCritRate) {
      isCritical = true;
      const critMultiplier = (enemy.stats.criticalDamage || 150) / 100;
      baseDamage = Math.floor(baseDamage * critMultiplier);
      get().addLog(`${enemy.name}의 치명타 공격!`, 'enemy-action');
    }

    // === 4단계: 방어력 적용 ===
    const playerDefense = player.stats.defense || player.stats.physicalDefense || 0;
    
    // 방어력은 데미지를 직접 차감하되, 최소 데미지 보장
    let finalDamage = Math.max(isCritical ? Math.floor(baseDamage * 0.5) : 1, baseDamage - playerDefense);

    // === 5단계: 추가 데미지 경감 ===
    // DOT 저항력을 일반 데미지 경감으로도 활용
    const damageReduction = (player.stats.dotResistance || 0) / 100;
    if (damageReduction > 0) {
      finalDamage = Math.floor(finalDamage * (1 - Math.min(0.5, damageReduction))); // 최대 50% 경감
    }

    // 최종 데미지는 최소 1 보장
    finalDamage = Math.max(1, finalDamage);
    
    // 플레이어 HP 감소
    const newPlayerHp = Math.max(0, player.stats.hp - finalDamage)
    
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
            hp: newPlayerHp,
            currentHP: newPlayerHp  // HP 필드명 통일을 위해 추가
          })
          console.log('[전투] 플레이어 HP 동기화:', { hp: newPlayerHp, currentHP: newPlayerHp })
        }
      } catch (error) {
        console.error('게임 스토어 동기화 오류:', error)
      }
    }
    syncGameStore()

    // 로그 추가 (상세한 전투 정보 포함)
    let logMessage = `${enemy.name}이(가) `;
    if (isCritical) {
      logMessage += `치명타로 ${finalDamage}의 피해를 입혔습니다! 💥`;
    } else {
      logMessage += `기본 공격으로 ${finalDamage}의 피해를 입혔습니다.`;
    }
    
    if (damageReduction > 0) {
      logMessage += ` (${Math.floor(damageReduction * 100)}% 경감됨)`;
    }
    
    get().addLog(logMessage, 'enemy-action')

    // 플레이어가 죽었는지 확인
    if (newPlayerHp <= 0) {
      get().addLog(`패배했습니다...`, 'system')
      
      // 패배 시 빈 보상
      const rewards = {
        experience: 0,
        gold: 0,
        items: []
      };
      
      get().endBattle(false, enemy, rewards)
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
      
      // 도망 시 빈 보상
      const rewards = {
        experience: 0,
        gold: 0,
        items: []
      };
      
      get().endBattle(false, enemy, rewards)
    } else {
      get().addLog(`도망에 실패했습니다... (확률: ${Math.round(fleeChance)}%)`, 'system')
      // 도망 실패 시 턴 넘기기
      get().nextTurn()
    }
  },

  // === 스킬 쿨타임 관리 함수들 ===
  
  initializeSkillCooldowns: (skills: Skill[]) => {
    const cooldowns: BattleSkillState[] = skills.map(skill => ({
      skillId: skill.id,
      currentCooldown: 0  // 전투 시작 시 모든 스킬 사용 가능
    }));
    
    set(state => ({
      ...state,
      skillCooldowns: cooldowns
    }));
  },

  isSkillOnCooldown: (skillId: string) => {
    const { skillCooldowns } = get();
    const skillState = skillCooldowns.find(state => state.skillId === skillId);
    return skillState ? skillState.currentCooldown > 0 : false;
  },

  getSkillCooldown: (skillId: string) => {
    const { skillCooldowns } = get();
    const skillState = skillCooldowns.find(state => state.skillId === skillId);
    return skillState ? skillState.currentCooldown : 0;
  },

  applySkillCooldown: (skillId: string) => {
    const { player } = get();
    if (!player) return;

    const skill = player.skills.find(s => s.id === skillId);
    if (!skill) return;

    const cooldownTurns = skill.cooldown || 0;
    
    set(state => ({
      ...state,
      skillCooldowns: state.skillCooldowns.map(cooldownState =>
        cooldownState.skillId === skillId
          ? { ...cooldownState, currentCooldown: cooldownTurns }
          : cooldownState
      )
    }));
  },

  reduceAllCooldowns: () => {
    set(state => ({
      ...state,
      skillCooldowns: state.skillCooldowns.map(cooldownState => ({
        ...cooldownState,
        currentCooldown: Math.max(0, cooldownState.currentCooldown - 1)
      }))
    }));
  },

  resetAllCooldowns: () => {
    set(state => ({
      ...state,
      skillCooldowns: state.skillCooldowns.map(cooldownState => ({
        ...cooldownState,
        currentCooldown: 0
      }))
    }));
  },

  // === 상태 효과 관리 함수들 ===
  
  applyStatusEffect: (target: 'player' | 'enemy', effectId: string) => {
    const effectTemplate = statusEffectsData[effectId];
    if (!effectTemplate) {
      console.warn(`상태 효과 ${effectId}를 찾을 수 없습니다`);
      return;
    }

    set(state => {
      const targetCombatant = target === 'player' ? state.player : state.enemy;
      if (!targetCombatant) return state;

      const existingEffect = targetCombatant.statusEffects.find(e => e.id === effectId);
      
      if (existingEffect && effectTemplate.stackable && effectTemplate.maxStacks) {
        // 중첩 가능한 효과 처리
        const newStacks = Math.min(
          (existingEffect.currentStacks || 1) + 1,
          effectTemplate.maxStacks
        );
        
        const updatedEffect = {
          ...existingEffect,
          currentStacks: newStacks,
          remainingDuration: effectTemplate.duration // 지속시간 갱신
        };
        
        const updatedEffects = targetCombatant.statusEffects.map(e =>
          e.id === effectId ? updatedEffect : e
        );
        
        return {
          ...state,
          [target]: {
            ...targetCombatant,
            statusEffects: updatedEffects
          }
        };
      } else if (!existingEffect) {
        // 새로운 효과 적용
        const newEffect = {
          ...effectTemplate,
          remainingDuration: effectTemplate.duration,
          currentStacks: 1
        };
        
        return {
          ...state,
          [target]: {
            ...targetCombatant,
            statusEffects: [...targetCombatant.statusEffects, newEffect]
          }
        };
      }
      
      return state;
    });
    
    get().addLog(`${target === 'player' ? '플레이어' : '적'}에게 ${effectTemplate.name} 효과가 적용되었습니다!`, 'status');
  },

  removeStatusEffect: (target: 'player' | 'enemy', effectId: string) => {
    set(state => {
      const targetCombatant = target === 'player' ? state.player : state.enemy;
      if (!targetCombatant) return state;

      const updatedEffects = targetCombatant.statusEffects.filter(e => e.id !== effectId);
      
      return {
        ...state,
        [target]: {
          ...targetCombatant,
          statusEffects: updatedEffects
        }
      };
    });
  },

  processStatusEffects: (target: 'player' | 'enemy') => {
    const { player, enemy, addLog } = get();
    const targetCombatant = target === 'player' ? player : enemy;
    
    if (!targetCombatant) return;

    targetCombatant.statusEffects.forEach(effect => {
      if (effect.onTick && (effect.type === 'dot' || effect.type === 'hot')) {
        const tickDamage = effect.onTick(targetCombatant);
        
        if (tickDamage > 0) {
          // 피해 (DOT)
          set(state => {
            const currentTarget = target === 'player' ? state.player : state.enemy;
            if (!currentTarget) return state;
            
            const newHp = Math.max(0, currentTarget.stats.hp - tickDamage);
            return {
              ...state,
              [target]: {
                ...currentTarget,
                stats: {
                  ...currentTarget.stats,
                  hp: newHp
                }
              }
            };
          });
          
          const stackText = effect.currentStacks && effect.currentStacks > 1 
            ? ` (${effect.currentStacks}중첩)` : '';
          addLog(
            `${effect.name}${stackText}로 ${tickDamage} 피해! ${effect.icon}`, 
            'damage'
          );
        } else if (tickDamage < 0) {
          // 치유 (HOT)
          const healAmount = Math.abs(tickDamage);
          set(state => {
            const currentTarget = target === 'player' ? state.player : state.enemy;
            if (!currentTarget) return state;
            
            const newHp = Math.min(currentTarget.stats.maxHp, currentTarget.stats.hp + healAmount);
            return {
              ...state,
              [target]: {
                ...currentTarget,
                stats: {
                  ...currentTarget.stats,
                  hp: newHp
                }
              }
            };
          });
          
          const stackText = effect.currentStacks && effect.currentStacks > 1 
            ? ` (${effect.currentStacks}중첩)` : '';
          addLog(
            `${effect.name}${stackText}로 ${healAmount} 회복! ${effect.icon}`, 
            'heal'
          );
        }
      }
    });
  },

  processAllStatusEffects: () => {
    get().processStatusEffects('player');
    get().processStatusEffects('enemy');
  },

  updateStatusEffectDurations: (target: 'player' | 'enemy') => {
    set(state => {
      const targetCombatant = target === 'player' ? state.player : state.enemy;
      if (!targetCombatant) return state;

      const updatedEffects = targetCombatant.statusEffects
        .map(effect => ({
          ...effect,
          remainingDuration: Math.max(0, (effect.remainingDuration || effect.duration) - 1)
        }))
        .filter(effect => (effect.remainingDuration || 0) > 0); // 지속시간이 끝난 효과 제거

      return {
        ...state,
        [target]: {
          ...targetCombatant,
          statusEffects: updatedEffects
        }
      };
    });
  },

  checkDisablingEffects: (target: 'player' | 'enemy') => {
    const targetCombatant = target === 'player' ? get().player : get().enemy;
    if (!targetCombatant) return false;

    return targetCombatant.statusEffects.some(effect => effect.isDisabling);
  }
}))
