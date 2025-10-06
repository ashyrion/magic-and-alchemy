import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Character, Item, SavePoint, Skill, EquipmentSlot, Stats } from '../types/gameTypes';
import type { GameState } from './types';
import { globalStoreEvents } from './types/events';
import { useInventoryStore } from './inventoryStore';
import { calculateEquipmentStats } from '../utils/equipmentUtils';

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
      
      equipSkill: (skill: Skill) => {
        const { equippedSkills } = get();
        
        // 이미 장착된 스킬인지 확인
        if (equippedSkills.find(s => s.id === skill.id)) return false;
        
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
        inventoryStore.equipItem(item.id, slot);

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
          const currentHp = state.character.stats.currentHP;
          const currentMp = state.character.stats.currentMP;

          const totalStats = get().calculateTotalStats();
          
          // 현재 HP/MP를 유지 (최대값을 넘지 않도록 제한)
          const maxHP = totalStats.maxHP || totalStats.maxHp || 100;
          const maxMP = totalStats.maxMP || totalStats.maxMp || 50;
          
          const preservedStats = {
            ...totalStats,
            // HP 계산
            hp: typeof currentHp === 'number' ? Math.min(currentHp, maxHP) : maxHP,
            currentHP: typeof currentHp === 'number' ? Math.min(currentHp, maxHP) : maxHP,
            maxHP: maxHP,
            maxHp: maxHP,
            // MP 계산 - 현재 MP는 기본값을 유지, 최대 MP는 장비 보너스 포함
            mp: typeof currentMp === 'number' ? Math.min(currentMp, maxMP) : (state.character.stats.mp || 80),
            currentMP: typeof currentMp === 'number' ? Math.min(currentMp, maxMP) : (state.character.stats.mp || 80),
            maxMP: maxMP,
            maxMp: maxMP
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
            state.character.stats.currentHP + hpAmount,
            state.character.stats.maxHP
          );
          const newMP = Math.min(
            state.character.stats.currentMP + mpAmount,
            state.character.stats.maxMP
          );

          const updatedCharacter = {
            ...state.character,
            stats: {
              ...state.character.stats,
              currentHP: newHP,
              currentMP: newMP
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
        const totalStats = { ...baseStats } as Stats;
        
        // 장비 스탯 계산
        const equipmentStats = calculateEquipmentStats(state.equipment);
        
        // 기본 스탯에 장비 스탯 추가
        Object.entries(equipmentStats).forEach(([key, value]) => {
          if (typeof value !== 'number') return;
          const statKey = key as keyof Stats;
          const current = totalStats[statKey];
          const numericCurrent = typeof current === 'number' ? current : 0;
          totalStats[statKey] = (numericCurrent + value) as Stats[keyof Stats];
        });

        // HP 최대값도 장비 보너스를 반영해야 함
        // hp 보너스가 있으면 maxHp도 그만큼 증가
        if (equipmentStats.hp && equipmentStats.hp > 0) {
          totalStats.maxHp = (totalStats.maxHp || 0) + equipmentStats.hp;
          totalStats.maxHP = totalStats.maxHp; // 필드명 통일
        }

        // MP 최대값도 장비 보너스를 반영해야 함
        // mp 보너스가 있으면 maxMp도 그만큼 증가
        if (equipmentStats.mp && equipmentStats.mp > 0) {
          totalStats.maxMp = (totalStats.maxMp || 0) + equipmentStats.mp;
          totalStats.maxMP = totalStats.maxMp; // 필드명 통일
        }

        return totalStats;
      },
    }),
    {
      name: 'GameStore',
    }
  )
);
