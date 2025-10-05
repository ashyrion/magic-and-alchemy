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
        let leveledUp = false;

        set((state) => {
          if (!state.character) return state;

          const baseStats = state.baseStats ?? state.character.stats;
          const currentLevel = state.character.level;
          const requiredExp = currentLevel * 100;
          const totalExp = experience;

          if (totalExp < requiredExp) {
            return state;
          }

          const newLevel = currentLevel + 1;
          const statIncrease = {
            maxHp: 10,
            maxMp: 5,
            strength: 1,
            defense: 1,
            agility: currentLevel % 2 === 0 ? 1 : 0,
            intelligence: currentLevel % 2 === 0 ? 1 : 0,
          };

          const updatedBaseStats: Stats = { ...baseStats };
          Object.entries(statIncrease).forEach(([key, value]) => {
            const statKey = key as keyof Stats;
            const currentValue = typeof updatedBaseStats[statKey] === 'number' ? updatedBaseStats[statKey] as number : 0;
            updatedBaseStats[statKey] = (currentValue + value) as Stats[keyof Stats];
          });

          if (typeof updatedBaseStats.maxHp === 'number') {
            updatedBaseStats.hp = updatedBaseStats.maxHp as Stats[keyof Stats];
          }
          if (typeof updatedBaseStats.maxMp === 'number') {
            updatedBaseStats.mp = updatedBaseStats.maxMp as Stats[keyof Stats];
          }

          leveledUp = true;

          return {
            character: {
              ...state.character,
              level: newLevel,
              stats: updatedBaseStats,
            },
            baseStats: updatedBaseStats,
          };
        });

        if (leveledUp) {
          get().updateCharacterStats();
        }
      },

      incrementTime: () => 
        set((state) => ({ 
          gameTime: state.gameTime + 1 
        })),
      addSavePoint: (savePoint: SavePoint) => 
        set((state) => ({
          savePoints: [...state.savePoints, savePoint]
        })),
        
      equipItem: (item: Item) => {
        // 인벤토리 스토어의 상태 업데이트
        const inventoryStore = useInventoryStore.getState();
        inventoryStore.equipItem(item.id);

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

          const totalStats = get().calculateTotalStats();
          const mergedStats = overrideStats
            ? { ...totalStats, ...overrideStats }
            : totalStats;

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

        // HP/MP 최대값 제한
        if (typeof totalStats.maxHp === 'number') {
          const hp = typeof totalStats.hp === 'number' ? totalStats.hp : totalStats.maxHp;
          totalStats.hp = Math.min(hp, totalStats.maxHp) as Stats[keyof Stats];
        }
        if (typeof totalStats.maxMp === 'number') {
          const mp = typeof totalStats.mp === 'number' ? totalStats.mp : totalStats.maxMp;
          totalStats.mp = Math.min(mp, totalStats.maxMp) as Stats[keyof Stats];
        }

        return totalStats;
      },
    }),
    {
      name: 'GameStore',
    }
  )
);
