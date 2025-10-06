import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Character, Item, SavePoint, Skill, EquipmentSlot, Stats } from '../types/gameTypes';
import type { GameState } from './types';
import { globalStoreEvents } from './types/events';
import { useInventoryStore } from './inventoryStore';
import { useSkillEnhancementStore } from './skillEnhancementStore';
import { calculateEquipmentStats } from '../utils/equipmentUtils';
import { calculateFinalStats } from '../utils/statCalculations';

// 인벤토리 상태를 동기화하는 함수
const syncInventoryState = () => {
  const inventoryState = useInventoryStore.getState();
  return {
    inventory: inventoryState.items,
    equipment: inventoryState.equipment
  };
};

interface GameStore extends GameState {
  setCharacter: (character: Character | null) => void;
  setInventory: (items: Item[]) => void;
  addSkill: (skill: Skill) => void;
  equipSkill: (skill: Skill) => boolean;
  unequipSkill: (skillId: string) => boolean;
  addGold: (amount: number) => void;
  addExperience: (experience: number) => void;
  incrementTime: () => void;
  addSavePoint: (savePoint: SavePoint) => void;
  equipItem: (item: Item, slot: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  getEquippedItems: () => Item[];
  updateCharacterStats: (overrideStats?: Partial<Stats>) => void;
  healCharacter: (hpAmount: number, mpAmount: number) => void;
  calculateTotalStats: () => Character['stats'];
  
  // 스킬 강화 시스템 연동
  getPlayerSkills: () => Skill[];
  unlockBaseSkill: (baseSkillId: string) => void;
  getAvailableSkills: () => Skill[];
  
  // 개발용
  unlockBasicSkillsForTesting: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // 상태 초기화 - inventoryStore와 동기화
      ...syncInventoryState(),
      character: null,
      baseStats: null,
      learnedSkills: [],
      equippedSkills: [],
      gold: 0,
      gameTime: 0,
      savePoints: [],

      // 액션
      setCharacter: (character: Character | null) =>
        set({
          character,
          baseStats: character ? { ...character.stats } as Stats : null,
        }),
      setInventory: (items: Item[]) =>
        set({ inventory: items }),
      addSkill: (skill: Skill) => 
        set((state) => {
          const newLearnedSkills = [...state.learnedSkills, skill];
          
          // 캐릭터에도 스킬 추가
          const updatedCharacter = state.character ? {
            ...state.character,
            skills: [...(state.character.skills || []), skill]
          } : state.character;
          
          return {
            learnedSkills: newLearnedSkills,
            character: updatedCharacter
          };
        }),
      
      // 스킬 강화 시스템 연동 메서드들
      getPlayerSkills: () => {
        const enhancementStore = useSkillEnhancementStore.getState();
        return enhancementStore.getPlayerSkills();
      },
      
      unlockBaseSkill: (baseSkillId: string) => {
        const enhancementStore = useSkillEnhancementStore.getState();
        enhancementStore.unlockBaseSkill(baseSkillId);
        
        // learnedSkills에도 추가 (현재 최고 단계 스킬)
        const currentSkill = enhancementStore.getCurrentSkill(baseSkillId);
        if (currentSkill) {
          get().addSkill(currentSkill);
        }
      },
      
      getAvailableSkills: () => {
        // 스킬 강화 시스템에서 현재 사용 가능한 스킬들 가져오기
        const enhancementStore = useSkillEnhancementStore.getState();
        const enhancedSkills = enhancementStore.getPlayerSkills();
        
        // 기존 learnedSkills와 강화된 스킬들을 합치되 중복 제거
        const { learnedSkills } = get();
        const allSkills = [...learnedSkills];
        
        enhancedSkills.forEach(skill => {
          // 같은 baseSkillId를 가진 기존 스킬이 있으면 교체, 없으면 추가
          const baseId = skill.id.split('-tier-')[0];
          const existingIndex = allSkills.findIndex(s => s.id.startsWith(baseId));
          
          if (existingIndex >= 0) {
            allSkills[existingIndex] = skill; // 더 높은 단계로 교체
          } else {
            allSkills.push(skill); // 새 스킬 추가
          }
        });
        
        return allSkills;
      },
      
      equipSkill: (skill: Skill) => {
        const { equippedSkills } = get();
        
        // 이미 장착된 스킬인지 확인 (기본 스킬 ID로 체크)
        const baseSkillId = skill.id.split('-tier-')[0];
        const existingSkill = equippedSkills.find(s => s.id.startsWith(baseSkillId));
        
        if (existingSkill) {
          // 같은 기본 스킬의 더 높은 단계로 교체
          set(state => ({
            equippedSkills: state.equippedSkills.map(s => 
              s.id.startsWith(baseSkillId) ? skill : s
            )
          }));
          return true;
        }
        
        // 최대 4개 제한
        if (equippedSkills.length >= 4) return false;
        
        set(state => ({
          equippedSkills: [...state.equippedSkills, skill]
        }));
        
        return true;
      },
      
      unequipSkill: (skillId: string) => {
        const { equippedSkills } = get();
        const skillExists = equippedSkills.find(s => s.id === skillId);
        
        if (!skillExists) return false;
        
        set(state => ({
          equippedSkills: state.equippedSkills.filter(s => s.id !== skillId)
        }));
        
        return true;
      },
      addGold: (amount: number) => 
        set((state) => ({ 
          gold: state.gold + amount 
        })),

      addExperience: (experience: number) => {
        set((state) => {
          if (!state.character) return state;

          const newExp = state.character.experience + experience;
          let remainingExp = newExp;
          let currentLevel = state.character.level;
          let expToNext = state.character.experienceToNext;
          let updatedStats = { ...state.character.stats };

          // 레벨업 체크
          while (remainingExp >= expToNext) {
            remainingExp -= expToNext;
            currentLevel++;
            expToNext = currentLevel * 100; // 다음 레벨까지 필요한 경험치
            
            // 레벨업 시 스탯 증가
            updatedStats.maxHp = (updatedStats.maxHp || 100) + 10;
            updatedStats.maxMp = (updatedStats.maxMp || 50) + 5;
            updatedStats.hp = updatedStats.maxHp; // 레벨업 시 완전 회복
            updatedStats.mp = updatedStats.maxMp; // 레벨업 시 완전 회복
            updatedStats.strength = (updatedStats.strength || 0) + 1;
            updatedStats.intelligence = (updatedStats.intelligence || 0) + 1;
            updatedStats.agility = (updatedStats.agility || 0) + 1;
            updatedStats.defense = (updatedStats.defense || 0) + 1;
            updatedStats.attack = (updatedStats.attack || 0) + 1;
            updatedStats.magicAttack = (updatedStats.magicAttack || 0) + 2;
          }

          return {
            ...state,
            character: {
              ...state.character,
              experience: remainingExp,
              experienceToNext: expToNext,
              level: currentLevel,
              stats: updatedStats
            }
          };
        });
      },

      incrementTime: () => 
        set((state) => ({ 
          gameTime: state.gameTime + 1 
        })),
      addSavePoint: (savePoint: SavePoint) => 
        set((state) => ({
          savePoints: [...state.savePoints, savePoint]
        })),
        
      equipItem: (item: Item, slot?: EquipmentSlot) => {
        // 인벤토리 스토어의 상태 업데이트
        const inventoryStore = useInventoryStore.getState();
        if (item.instanceId) {
          inventoryStore.equipItem(item.instanceId, slot);
        }

        // 게임 스토어의 상태도 업데이트
        const inventoryState = useInventoryStore.getState();
        set((state) => ({
          ...state,
          equipment: inventoryState.equipment
        }));

        // 스탯 재계산
        get().updateCharacterStats();

        // 전투 중일 때만 로그 추가
        if (globalStoreEvents.isInBattle()) {
          globalStoreEvents.addBattleLog(
            `${item.name}을(를) 장착했습니다.`,
            'equipment'
          );
        }
      },

      unequipItem: (slot: EquipmentSlot) => {
        const oldItem = get().equipment[slot];
        if (!oldItem) return;

        // 인벤토리 스토어의 상태 업데이트
        const inventoryStore = useInventoryStore.getState();
        inventoryStore.unequipItem(slot);

        // 게임 스토어의 상태도 업데이트
        const inventoryState = useInventoryStore.getState();
        set((state) => ({
          ...state,
          equipment: inventoryState.equipment
        }));

        // 스탯 재계산
        get().updateCharacterStats();

        // 전투 중일 때만 로그 추가
        if (globalStoreEvents.isInBattle()) {
          globalStoreEvents.addBattleLog(
            `${oldItem.name}을(를) 해제했습니다.`,
            'equipment'
          );
        }
      },

      getEquippedItems: () => {
        const state = get();
        return Object.values(state.equipment).filter((item): item is Item => item !== null);
      },

      updateCharacterStats: (overrideStats?: Partial<Stats>) => {
        set((state) => {
          if (!state.character) return state;

          // 현재 HP/MP 보존
          const currentHp = state.character.stats.hp;
          const currentMp = state.character.stats.mp;

          const totalStats = get().calculateTotalStats();
          
          // 현재 HP/MP를 유지 (최대값을 넘지 않도록 제한)
          const maxHp = totalStats.maxHp || 100;
          const maxMp = totalStats.maxMp || 50;
          
          const preservedStats = {
            ...totalStats,
            // HP 계산
            hp: typeof currentHp === 'number' ? Math.min(currentHp, maxHp) : maxHp,
            maxHp: maxHp,
            // MP 계산
            mp: typeof currentMp === 'number' ? Math.min(currentMp, maxMp) : (state.character.stats.mp || 80),
            maxMp: maxMp
          };

          const mergedStats = overrideStats
            ? { ...preservedStats, ...overrideStats }
            : preservedStats;

          const updatedCharacter = {
            ...state.character,
            stats: mergedStats as Stats
          };

          return {
            ...state,
            character: updatedCharacter
          };
        });

        // 전투 중일 때 전투 스토어도 동기화
        const updatedCharacter = get().character;
        if (updatedCharacter) {
          try {
            // 동적 import를 사용하여 순환 참조 방지
            import('./battleStore').then(({ useBattleStore }) => {
              const battleState = useBattleStore.getState();
              if (battleState.inBattle && battleState.player) {
                battleState.updatePlayerStats(updatedCharacter.stats);
                console.log('[GameStore] 전투 상태와 동기화됨:', {
                  hp: updatedCharacter.stats.hp,
                  mp: updatedCharacter.stats.mp
                });
              }
            }).catch(() => {
              // 전투 스토어가 없거나 오류 시 무시
            });
          } catch {
            // 오류 시 무시
          }
        }
      },

      healCharacter: (hpAmount: number, mpAmount: number) => {
        set((state) => {
          if (!state.character) return state;
          
          const newHP = Math.min(
            state.character.stats.hp + hpAmount,
            state.character.stats.maxHp
          );
          const newMP = Math.min(
            state.character.stats.mp + mpAmount,
            state.character.stats.maxMp
          );

          const updatedCharacter = {
            ...state.character,
            stats: {
              ...state.character.stats,
              hp: newHP,
              mp: newMP
            }
          };

          return {
            ...state,
            character: updatedCharacter
          };
        });
      },

      calculateTotalStats: () => {
        const state = get();
        if (!state.character) return {} as Character['stats'];

        const baseStats = state.baseStats ?? state.character.stats;
        
        // 장비 스탯 계산
        const equipmentStats = calculateEquipmentStats(state.equipment);
        
        // 새로운 스탯 시스템으로 최종 스탯 계산
        const finalStats = calculateFinalStats(baseStats, equipmentStats);
        
        // 현재 HP/MP 유지 (최대값이 변경되어도 현재값은 유지)
        finalStats.hp = baseStats.hp || finalStats.hp;
        finalStats.mp = baseStats.mp || finalStats.mp;
        
        return finalStats;
      },
      
      // 개발용: 기본 스킬들을 해금하는 함수
      unlockBasicSkillsForTesting: () => {
        const state = get();
        const { unlockBaseSkill, addGold, addSkill, learnedSkills } = state;
        
        // 이미 스킬이 있는지 확인
        if (learnedSkills.length >= 6) {
          console.log('⚠️ 이미 스킬이 해금되어 있습니다. 초기화 후 다시 시도하세요.');
          return;
        }
        
        console.log('🚀 기본 스킬 해금 시작...');
        
        // 간단한 더미 스킬 데이터로 먼저 추가
        const basicSkills = [
          {
            id: 'skill-fireball',
            name: '파이어발',
            type: 'elemental',
            element: 'fire',
            category: 'offensive',
            power: 12,
            cost: 12,
            cooldown: 3,
            targetType: 'enemy',
            range: 4,
            accuracy: 90,
            effects: [],
            icon: '🔥',
            description: '화염구를 발사하여 적에게 화상을 입힙니다.'
          },
          {
            id: 'skill-ice-shard',
            name: '아이스 샤드',
            type: 'elemental',
            element: 'ice',
            category: 'offensive', 
            power: 10,
            cost: 10,
            cooldown: 3,
            targetType: 'enemy',
            range: 3,
            accuracy: 85,
            effects: [],
            icon: '🧊',
            description: '얼음 조각을 발사하여 동상 효과를 주어요.'
          },
          {
            id: 'skill-lightning-bolt',
            name: '라이트닝 볼트',
            type: 'elemental',
            element: 'lightning',
            category: 'offensive',
            power: 14,
            cost: 14,
            cooldown: 4,
            targetType: 'enemy',
            range: 5,
            accuracy: 80,
            effects: [],
            icon: '⚡',
            description: '번개를 발사하여 감전 효과를 주어요.'
          },
          {
            id: 'skill-poison-dart',
            name: '포이즊 다트',
            type: 'elemental',
            element: 'poison',
            category: 'offensive',
            power: 8,
            cost: 8,
            cooldown: 2,
            targetType: 'enemy',
            range: 4,
            accuracy: 90,
            effects: [],
            icon: '☠️',
            description: '독침을 발사하여 지속 독 데미지를 죾어요.'
          },
          {
            id: 'skill-heal',
            name: '힐',
            type: 'heal',
            element: 'light',
            category: 'support',
            power: 20,
            cost: 12,
            cooldown: 3,
            targetType: 'ally',
            range: 3,
            accuracy: 100,
            effects: [],
            icon: '💚',
            description: '체력을 회복시켜요.'
          },
          {
            id: 'skill-life-drain',
            name: '라이프 드레인',
            type: 'elemental',
            element: 'dark',
            category: 'offensive',
            power: 8,
            cost: 10,
            cooldown: 3,
            targetType: 'enemy',
            range: 3,
            accuracy: 85,
            effects: [],
            icon: '🩸',
            description: '생명력을 흡수하여 자신을 회복시켜요.'
          }
        ];
        
        // learnedSkills에 추가
        basicSkills.forEach(skill => {
          try {
            addSkill(skill as Skill);
            console.log(`✅ ${skill.name} 추가됨`);
          } catch (error) {
            console.error(`❌ ${skill.name} 추가 실패:`, error);
          }
        });
        
        // 스킬 강화 시스템에도 등록
        const basicSkillIds = basicSkills.map(s => s.id);
        basicSkillIds.forEach(skillId => {
          unlockBaseSkill(skillId);
        });
        

      },
      
      // 개발용: 모든 스킬과 진행도 초기화
      resetAllSkills: () => {
        const enhancementStore = useSkillEnhancementStore.getState();
        
        // 기존 스킬 시스템 초기화
        set((state) => ({
          ...state,
          learnedSkills: [],
          equippedSkills: []
        }));
        
        // 스킬 강화 시스템 초기화
        enhancementStore.resetProgress();
        
        console.log('🔄 모든 스킬이 초기화되었습니다!');
      },
    }),
    {
      name: 'GameStore',
    }
  )
);
