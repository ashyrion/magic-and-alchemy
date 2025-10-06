import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Item, Material, EquipmentSlot, Stats } from '../types/gameTypes';
import type { InventoryState } from './types';
import { useGameStore } from './gameStore';
import { globalStoreEvents } from './types/events';
import { storeEvents } from './storeEvents';
import { calculateEquipmentStats } from '../utils/equipmentUtils';

const trackedStatLabels: Record<keyof Stats, string> = {
  strength: '힘',
  defense: '방어력',
  intelligence: '지능',
  agility: '민첩',
  attack: '공격력',
  magicAttack: '마법 공격력',
  magicDefense: '마법 방어력',
  hp: 'HP',
  maxHp: 'HP 최대치',
  mp: 'MP',
  maxMp: 'MP 최대치',
  fireResist: '화염 저항',
  iceResist: '냉기 저항',
  lightningResist: '번개 저항',
  poisonResist: '독 저항',
  speed: '속도',
  weight: '무게',
  vitality: '체력',
  wisdom: '지혜',
};

const trackedStatKeys: (keyof Stats)[] = ['attack', 'defense', 'magicAttack', 'magicDefense', 'strength', 'agility'];

const logEquipmentChange = (itemName: string, action: 'equip' | 'unequip', before: Stats | null, after: Stats | null) => {
  if (!before || !after) return;

  const changes: string[] = [];

  trackedStatKeys.forEach((key) => {
    const prev = typeof before[key] === 'number' ? (before[key] as number) : 0;
    const next = typeof after[key] === 'number' ? (after[key] as number) : 0;
    const delta = Math.round((next - prev) * 100) / 100;
    if (delta !== 0) {
      const label = trackedStatLabels[key];
      const formatted = `${label ?? key} ${delta > 0 ? '+' : ''}${delta}`;
      changes.push(formatted);
    }
  });

  const message = changes.length > 0
    ? `${itemName}을(를) ${action === 'equip' ? '장착' : '해제'}하여 ${changes.join(', ')} 변화가 발생했습니다.`
    : `${itemName}을(를) ${action === 'equip' ? '장착' : '해제'}했지만 주요 능력치 변화는 없습니다.`;

  storeEvents.emit('system-log', message);
  globalStoreEvents.addBattleLog(message, 'equipment');
};

interface InventoryStore extends InventoryState {
  // 기본 인벤토리 관리
  addItem: (item: Item) => boolean;
  removeItem: (itemId: string) => boolean;
  addMaterial: (material: Material) => boolean;
  removeMaterial: (materialId: string) => boolean;
  useItem: (itemId: string) => boolean;
  
  // 장비 관리
  equipItem: (itemId: string, slot?: EquipmentSlot) => boolean;
  unequipItem: (slot: EquipmentSlot) => boolean;
  swapEquipment: (slot: EquipmentSlot, newItemId: string) => boolean;
  
  // 무게 관리
  calculateCurrentWeight: () => number;
  updateWeightStatus: () => boolean;
  canAddWeight: (weight: number) => boolean;
  
  // 골드 관리
  addGold: (amount: number) => boolean;
  removeGold: (amount: number) => boolean;
  
  // 유틸리티
  hasSpace: () => boolean;
  findItem: (itemId: string) => Item | undefined;
  findMaterial: (materialId: string) => Material | undefined;
  getEquippedStats: () => { [key: string]: number };
  canEquipItem: (item: Item, slot?: EquipmentSlot) => boolean;
  checkEquipRequirements: (item: Item, slot?: EquipmentSlot) => { canEquip: boolean; errorMessage?: string };
}

export const useInventoryStore = create<InventoryStore>()(
  devtools(
    (set, get) => ({
      // 상태
      items: [],
      materials: [],
      materialStacks: [],
      capacity: {
        maxItems: 20,
        maxWeight: 50 // 50kg
      },
      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      },
      gold: 0,
      currentWeight: 0,
      isOverweight: false,

      // 무게 관련 메서드
      calculateCurrentWeight() {
        const { items, materials, equipment } = get();
        const itemsWeight = items.reduce((sum: number, item: Item) => sum + item.weight, 0);
        const materialsWeight = materials.reduce((sum: number, material: Material) => sum + (material.weight || 0), 0);
        const equipmentWeight = Object.values(equipment)
          .filter((item): item is Item => item !== null)
          .reduce((sum: number, item: Item) => sum + item.weight, 0);

        return itemsWeight + materialsWeight + equipmentWeight;
      },

      updateWeightStatus() {
        const currentWeight = get().calculateCurrentWeight();
        const isOverweight = currentWeight > get().capacity.maxWeight;

        set({
          currentWeight,
          isOverweight
        });

        // 무게 초과시 패널티 적용
        if (isOverweight) {
          const gameStore = useGameStore.getState();
          if (gameStore.character?.stats) {
            gameStore.updateCharacterStats({
              agility: Math.max(1, gameStore.character.stats.agility! * 0.7),
            });
          }
        }

        return isOverweight;
      },

      canAddWeight(weight: number) {
        const { currentWeight, capacity } = get();
        return (currentWeight! + weight) <= capacity.maxWeight;
      },

      // 인벤토리 관리 액션
      addItem(item: Item) {
        if (!get().hasSpace() || !get().canAddWeight(item.weight)) {
          return false;
        }

        set((state) => ({
          items: [...state.items, { ...item, isEquipped: false }]
        }));

        get().updateWeightStatus();
        return true;
      },
      
      removeItem(itemId: string) {
        const item = get().findItem(itemId);
        if (!item || item.isEquipped) return false;

        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));

        get().updateWeightStatus();
        return true;
      },
      
      addMaterial(material: Material) {
        if (!get().hasSpace() || !get().canAddWeight(material.weight)) {
          return false;
        }

        set((state) => ({
          materials: [...state.materials, material]
        }));

        get().updateWeightStatus();
        return true;
      },
      
      removeMaterial(materialId: string) {
        const material = get().findMaterial(materialId);
        if (!material) return false;

        // 첫 번째 매칭되는 재료만 제거
        let removed = false;
        set((state) => ({
          materials: state.materials.filter((material) => {
            if (!removed && material.id === materialId) {
              removed = true;
              return false; // 이 항목을 제거
            }
            return true; // 다른 항목들은 유지
          })
        }));

        get().updateWeightStatus();
        return removed;
      },
      
      useItem(itemId: string) {
        console.log(`[useItem] 시작 - 아이템 ID: ${itemId}`);
        
        const item = get().findItem(itemId);
        console.log(`[useItem] 아이템 찾기 결과:`, item);
        
        if (!item) {
          console.log('[useItem] 아이템을 찾을 수 없습니다');
          return false;
        }
        
        if (item.type !== 'consumable') {
          console.log(`[useItem] 소모품이 아닙니다. 타입: ${item.type}`);
          return false;
        }

        // 아이템 효과 적용
        const gameStore = useGameStore.getState();
        console.log('[useItem] 게임 스토어:', gameStore.character ? '캐릭터 있음' : '캐릭터 없음');
        console.log('[useItem] originalId:', item.originalId);
        
        if (gameStore.character && item.originalId) {
          let effectApplied = false;
          
          // 연금술 아이템별 효과 처리
          switch (item.originalId) {
            case 'healing-potion-basic': {
              console.log('[useItem] 기본 치유 물약 케이스 진입');
              // 기본 치유 물약 - 40 HP 회복
              const currentHp = gameStore.character.stats.hp || 0;
              const maxHp = gameStore.character.stats.maxHp || 100;
              const healAmount = Math.min(40, maxHp - currentHp);
              
              console.log(`[useItem] HP 상태: ${currentHp}/${maxHp}, 회복량: ${healAmount}`);
              
              if (healAmount > 0) {
                const newHp = currentHp + healAmount;
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  hp: newHp
                });
                
                // 전투 스토어와 동기화는 별도로 처리하지 않음 (게임 스토어가 우선)
                
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${healAmount}의 체력을 회복했습니다.`);
                effectApplied = true;
                console.log('[useItem] 효과 적용됨');
              } else {
                storeEvents.emit('system-log', '체력이 이미 최대입니다.');
                console.log('[useItem] 체력이 최대여서 사용 취소');
                effectApplied = false; // 체력이 최대여도 아이템은 소모하지 않음
              }
              break;
            }
              
            case 'mana-potion-basic': {
              // 기본 마나 물약 - 30 MP 회복
              const currentMp = gameStore.character.stats.mp || 0;
              const maxMp = gameStore.character.stats.maxMp || 50;
              const manaAmount = Math.min(30, maxMp - currentMp);
              
              if (manaAmount > 0) {
                const newMp = currentMp + manaAmount;
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  mp: newMp
                });
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${manaAmount}의 마나를 회복했습니다.`);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '마나가 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            case 'healing-potion-enhanced': {
              // 강화 치유 물약 - 80 HP 회복
              const currentHpEnh = gameStore.character.stats.hp || 0;
              const maxHpEnh = gameStore.character.stats.maxHp || 100;
              const healAmountEnh = Math.min(80, maxHpEnh - currentHpEnh);
              
              if (healAmountEnh > 0) {
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  hp: currentHpEnh + healAmountEnh
                });
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${healAmountEnh}의 체력을 회복했습니다.`);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '체력이 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            case 'potion-health-small': {
              // 작은 체력 물약 - 30 HP 회복
              const currentHp = gameStore.character.stats.hp || 0;
              const maxHp = gameStore.character.stats.maxHp || 100;
              const healAmount = Math.min(30, maxHp - currentHp);
              
              if (healAmount > 0) {
                const newHp = currentHp + healAmount;
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  hp: newHp
                });
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${healAmount}의 체력을 회복했습니다.`);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '체력이 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            case 'potion-mana-small': {
              // 작은 마나 물약 - 25 MP 회복
              const currentMp = gameStore.character.stats.mp || 0;
              const maxMp = gameStore.character.stats.maxMp || 50;
              const manaAmount = Math.min(25, maxMp - currentMp);
              
              if (manaAmount > 0) {
                const newMp = currentMp + manaAmount;
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  mp: newMp
                });
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${manaAmount}의 마나를 회복했습니다.`);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '마나가 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            case 'potion-health-medium': {
              // 체력 물약 - 60 HP 회복
              const currentHp = gameStore.character.stats.hp || 0;
              const maxHp = gameStore.character.stats.maxHp || 100;
              const healAmount = Math.min(60, maxHp - currentHp);
              
              if (healAmount > 0) {
                const newHp = currentHp + healAmount;
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  hp: newHp
                });
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${healAmount}의 체력을 회복했습니다.`);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '체력이 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            case 'potion-mana-medium': {
              // 마나 물약 - 50 MP 회복
              const currentMp = gameStore.character.stats.mp || 0;
              const maxMp = gameStore.character.stats.maxMp || 50;
              const manaAmount = Math.min(50, maxMp - currentMp);
              
              if (manaAmount > 0) {
                const newMp = currentMp + manaAmount;
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  mp: newMp
                });
                storeEvents.emit('system-log', `${item.name}을(를) 사용하여 ${manaAmount}의 마나를 회복했습니다.`);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '마나가 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            case 'super-potion': {
              // 만능 물약 - 100 HP, 50 MP 회복
              const currentHpSuper = gameStore.character.stats.hp || 0;
              const maxHpSuper = gameStore.character.stats.maxHp || 100;
              const currentMpSuper = gameStore.character.stats.mp || 0;
              const maxMpSuper = gameStore.character.stats.maxMp || 50;
              
              const healAmountSuper = Math.min(100, maxHpSuper - currentHpSuper);
              const manaAmountSuper = Math.min(50, maxMpSuper - currentMpSuper);
              
              if (healAmountSuper > 0 || manaAmountSuper > 0) {
                gameStore.updateCharacterStats({
                  ...gameStore.character.stats,
                  hp: currentHpSuper + healAmountSuper,
                  mp: currentMpSuper + manaAmountSuper
                });
                
                let message = `${item.name}을(를) 사용하여 `;
                if (healAmountSuper > 0 && manaAmountSuper > 0) {
                  message += `${healAmountSuper}의 체력과 ${manaAmountSuper}의 마나를 회복했습니다.`;
                } else if (healAmountSuper > 0) {
                  message += `${healAmountSuper}의 체력을 회복했습니다.`;
                } else {
                  message += `${manaAmountSuper}의 마나를 회복했습니다.`;
                }
                
                storeEvents.emit('system-log', message);
                effectApplied = true;
              } else {
                storeEvents.emit('system-log', '체력과 마나가 이미 최대입니다.');
                effectApplied = false;
              }
              break;
            }
              
            default:
              storeEvents.emit('system-log', '알 수 없는 아이템입니다.');
              return false;
          }
          
          // 효과가 적용되었다면 아이템 제거
          if (effectApplied) {
            const removed = get().removeItem(itemId);
            if (removed) {
              console.log(`${item.name} 사용 완료 및 제거됨`);
              return true;
            } else {
              console.log(`${item.name} 사용 효과는 적용되었지만 제거 실패`);
              return true; // 효과는 적용되었으므로 true 반환
            }
          } else {
            console.log(`${item.name} 사용 효과 적용되지 않음`);
            return false; // 효과가 적용되지 않았으므로 false 반환
          }
        }
        
        console.log('[useItem] 캐릭터가 없거나 originalId가 없음');
        return false;
      },

      // 장비 관리 액션
      equipItem(itemId: string, slot?: EquipmentSlot) {
        const { items } = get();
        const itemIndex = items.findIndex(item => item.id === itemId && !item.isEquipped);
        if (itemIndex === -1) {
          console.log('장착 실패: 아이템을 찾을 수 없습니다.');
          return false;
        }
        
        const item = items[itemIndex];
        const equipCheck = get().checkEquipRequirements(item, slot);
        
        if (!equipCheck.canEquip) {
          // 에러 메시지 로그 및 이벤트 발생
          console.log(`장착 실패: ${equipCheck.errorMessage}`);
          
          // storeEvents를 사용하여 에러 메시지를 전송
          import('./storeEvents').then(({ storeEvents }) => {
            storeEvents.emit('equipment-error', equipCheck.errorMessage!);
          }).catch(console.error);
          
          return false;
        }

        const targetSlot = slot || (item.type as EquipmentSlot);
        const currentEquipped = get().equipment[targetSlot];
        const prevStats = useGameStore.getState().character?.stats
          ? { ...useGameStore.getState().character!.stats } as Stats
          : null;

        if (currentEquipped) {
          set((state) => ({
            items: [...state.items, { ...currentEquipped, isEquipped: false }]
          }));
        }

        set((state) => ({
          items: state.items.filter((_, index) => index !== itemIndex),
          equipment: {
            ...state.equipment,
            [targetSlot]: { ...item, isEquipped: true }
          }
        }));

        useGameStore.getState().updateCharacterStats();
        const updatedStats = useGameStore.getState().character?.stats ?? null;
        logEquipmentChange(item.name, 'equip', prevStats, updatedStats);

        get().updateWeightStatus();
        return true;
      },
      
      unequipItem(slot: EquipmentSlot) {
        const { equipment } = get();
        if (!equipment[slot] || !get().hasSpace()) return false;

        const item = equipment[slot]!;
        const prevStats = useGameStore.getState().character?.stats
          ? { ...useGameStore.getState().character!.stats } as Stats
          : null;

        set((state) => ({
          equipment: {
            ...state.equipment,
            [slot]: null
          },
          items: [...state.items, { ...item, isEquipped: false }]
        }));

        useGameStore.getState().updateCharacterStats();
        const updatedStats = useGameStore.getState().character?.stats ?? null;
        logEquipmentChange(item.name, 'unequip', prevStats, updatedStats);

        get().updateWeightStatus();
        return true;
      },
      
      swapEquipment(slot: EquipmentSlot, newItemId: string) {
        if (!get().canEquipItem({ id: newItemId } as Item, slot)) return false;
        return get().equipItem(newItemId, slot);
      },

      // 골드 관리 액션
      addGold(amount: number) {
        if (amount <= 0) return false;
        set((state) => ({
          gold: state.gold + amount
        }));
        return true;
      },
      
      removeGold(amount: number) {
        const { gold } = get();
        if (amount <= 0 || gold < amount) return false;
        set((state) => ({
          gold: state.gold - amount
        }));
        return true;
      },

      // 유틸리티 메서드
      hasSpace() {
        const { items, capacity } = get();
        // 아이템만 체크 (재료는 별도 공간으로 취급)
        return items.length < capacity.maxItems;
      },
      
      findItem(itemId: string) {
        return get().items.find(item => item.id === itemId);
      },
      
      findMaterial(materialId: string) {
        return get().materials.find(material => material.id === materialId);
      },
      
      getEquippedStats() {
        const { equipment } = get();
        return calculateEquipmentStats(equipment);
      },
      
      canEquipItem(item: Item, slot?: EquipmentSlot) {
        // 아이템 타입 검증
        if (!['weapon', 'armor', 'accessory'].includes(item.type)) return false;
        
        // 슬롯 호환성 검증
        if (slot && slot !== item.type) return false;
        
        // 레벨 제한 검증
        const character = useGameStore.getState().character;
        if (character && item.requiredLevel && character.level < item.requiredLevel) {
          return false;
        }
        
        return true;
      },
      
      // 상세한 에러 메시지와 함께 장착 가능 여부를 반환
      checkEquipRequirements(item: Item, slot?: EquipmentSlot): { canEquip: boolean; errorMessage?: string } {
        // 아이템 타입 검증
        if (!['weapon', 'armor', 'accessory'].includes(item.type)) {
          return { canEquip: false, errorMessage: `${item.name}은(는) 장착할 수 없는 아이템입니다.` };
        }
        
        // 슬롯 호환성 검증
        if (slot && slot !== item.type) {
          return { canEquip: false, errorMessage: `${item.name}은(는) ${slot} 슬롯에 장착할 수 없습니다.` };
        }
        
        // 레벨 제한 검증
        const character = useGameStore.getState().character;
        if (character && item.requiredLevel && character.level < item.requiredLevel) {
          return { 
            canEquip: false, 
            errorMessage: `${item.name}을(를) 장착하려면 레벨 ${item.requiredLevel}이 필요합니다. (현재 레벨: ${character.level})` 
          };
        }
        
        return { canEquip: true };
      }
    }),
    {
      name: 'InventoryStore'
    }
  )
);