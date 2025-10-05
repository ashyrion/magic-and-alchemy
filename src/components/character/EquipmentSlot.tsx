import type { Item } from '../../types/gameTypes';
import { useGameStore } from '../../store/gameStore';
import { useInventoryStore } from '../../store/inventoryStore';

interface EquipmentSlotProps {
  slot: 'weapon' | 'armor' | 'accessory';
  label: string;
}

export const EquipmentSlot = ({ slot, label }: EquipmentSlotProps) => {
  const equipment = useGameStore((state) => state.equipment);
  const { equipItem, unequipItem } = useGameStore();
  const items = useInventoryStore((state) => state.items);

  const equippedItem = equipment[slot];
  
  // 해당 슬롯에 장착 가능한 아이템 필터링
  const equippableItems = items.filter(item => item.type === slot);

  const handleEquipItem = (item: Item | null) => {
    if (item === null) {
      // 해제할 때는 원래 장착된 아이템이 있는지 확인
      const currentItem = equipment[slot];
      if (currentItem) {
        unequipItem(slot);
      }
    } else {
      // 새 아이템 장착
      equipItem(item, slot);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="font-bold mb-2">{label}</div>
      <div className="relative min-h-[80px] bg-gray-800 rounded p-2">
        {equippedItem ? (
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => handleEquipItem(null)} // 장착 해제
          >
            <span>{equippedItem.name}</span>
            {equippedItem.stats && (
              <span className="text-sm text-gray-400">
                {equippedItem.stats.attack && `+${equippedItem.stats.attack} 공격`}
                {equippedItem.stats.defense && `+${equippedItem.stats.defense} 방어`}
              </span>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-center">장착된 아이템 없음</div>
        )}
      </div>

      {/* 장착 가능한 아이템 목록 */}
      {equippableItems.length > 0 && !equippedItem && (
        <div className="mt-2 space-y-1">
          <div className="text-sm text-gray-400 mb-1">장착 가능:</div>
          {equippableItems.map((item, index) => (
            <div
              key={`${slot}-${item.id}-${index}`}
              className="text-sm cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center justify-between"
              onClick={() => handleEquipItem(item)}
            >
              <span>{item.name}</span>
              {item.stats && (
                <span className="text-xs text-gray-400">
                  {item.stats.attack && `+${item.stats.attack} 공격`}
                  {item.stats.defense && `+${item.stats.defense} 방어`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};