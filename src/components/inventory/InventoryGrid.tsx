import React from 'react';
import { Card, Slot } from '../common';
import type { Item, Material } from '../../types/gameTypes';
import { useInventoryStore } from '../../store/inventoryStore';

interface ItemSlotProps {
  item: Item;
  onClick?: (item: Item) => void;
  onUseItem?: (itemId: string) => void;
}

const ItemSlot = ({ item, onClick, onUseItem }: ItemSlotProps) => {
  const handleUseItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`아이템 사용 시도: ${item.name} (${item.id})`);
    console.log(`아이템 타입: ${item.type}`);
    console.log(`originalId: ${item.originalId}`);
    
    if (onUseItem) {
      const inventoryStore = useInventoryStore.getState();
      const success = inventoryStore.useItem(item.id);
      console.log(`사용 결과: ${success}`);
    } else {
      console.log('onUseItem 함수가 없습니다');
    }
  };

  return (
    <Slot
      icon={item.type}
      onClick={() => onClick?.(item)}
    >
      <div className="text-center">
        <div className="text-sm truncate">{item.name}</div>
        {item.stats && (
          <div className="text-xs text-gray-400">
            {item.stats.attack && `+${item.stats.attack} 공격`}
            {item.stats.defense && `+${item.stats.defense} 방어`}
          </div>
        )}
        {item.type === 'consumable' && item.originalId && (
          <div className="text-xs text-green-400 mb-1">
            {item.originalId === 'healing-potion-basic' && 'HP +40'}
            {item.originalId === 'mana-potion-basic' && 'MP +30'}
            {item.originalId === 'healing-potion-enhanced' && 'HP +80'}
            {item.originalId === 'super-potion' && 'HP +100, MP +50'}
          </div>
        )}
        {item.type === 'consumable' && (
          <button
            onClick={handleUseItem}
            className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            사용
          </button>
        )}
      </div>
    </Slot>
  );
};

// MaterialSlot은 MaterialStackSlot으로 대체되었습니다.

interface MaterialStackSlotProps {
  material: Material;
  count: number;
  onClick?: (material: Material) => void;
}

const MaterialStackSlot = ({ material, count, onClick }: MaterialStackSlotProps) => {
  return (
    <Slot
      icon={material.type}
      onClick={() => onClick?.(material)}
    >
      <div className="flex flex-col h-full justify-between p-1">
        <div className="text-xs font-medium text-center truncate leading-tight">
          {material.name}
        </div>
        <div className="flex justify-center mt-1">
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-6 text-center">
            {count}
          </span>
        </div>
      </div>
    </Slot>
  );
};

interface InventoryGridProps {
  onItemClick?: (item: Item) => void;
  onMaterialClick?: (material: Material) => void;
  className?: string;
}

export const InventoryGrid = ({
  onItemClick,
  onMaterialClick,
  className = ''
}: InventoryGridProps) => {
  const { items, materials, useItem, capacity, calculateCurrentWeight } = useInventoryStore();

  // 아이템을 카테고리별로 분류
  const equipmentItems = items.filter(item => ['weapon', 'armor', 'accessory'].includes(item.type));
  const consumableItems = items.filter(item => item.type === 'consumable');

  // 재료 스택 생성 (중복 제거)
  const materialStacks = materials.reduce((stacks, material) => {
    const existing = stacks.find(stack => stack.material.id === material.id);
    if (existing) {
      existing.count++;
    } else {
      stacks.push({ material, count: 1 });
    }
    return stacks;
  }, [] as Array<{ material: Material; count: number }>);

  // 용량 계산
  const currentWeight = calculateCurrentWeight();
  const weightPercentage = Math.min((currentWeight / capacity.maxWeight) * 100, 100);
  const itemCount = items.length;
  const materialCount = materials.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 용량 표시 */}
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-300 mb-2">인벤토리 상태</div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>아이템: {itemCount}/{capacity.maxItems}</span>
            <span>재료: {materialCount}개</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>무게: {currentWeight.toFixed(1)}/{capacity.maxWeight}kg</span>
            <span className={weightPercentage > 90 ? 'text-red-400' : weightPercentage > 70 ? 'text-yellow-400' : 'text-green-400'}>
              {weightPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                weightPercentage > 90 ? 'bg-red-500' : 
                weightPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${weightPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 장비 아이템 그리드 */}
      <Card title="장비">
        <div className="grid grid-cols-4 gap-2">
          {equipmentItems.length > 0 ? (
            equipmentItems.map((item, index) => (
              <ItemSlot
                key={`equipment-${item.id}-${index}`}
                item={item}
                onClick={onItemClick}
                onUseItem={useItem}
              />
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-500 py-4">
              보유한 장비가 없습니다
            </div>
          )}
        </div>
      </Card>

      {/* 소모품 그리드 */}
      <Card title="소모품">
        <div className="grid grid-cols-4 gap-2">
          {consumableItems.length > 0 ? (
            consumableItems.map((item, index) => (
              <ItemSlot
                key={`consumable-${item.id}-${index}`}
                item={item}
                onClick={onItemClick}
                onUseItem={useItem}
              />
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-500 py-4">
              보유한 소모품이 없습니다
            </div>
          )}
        </div>
      </Card>

      {/* 재료 그리드 (스크롤 추가) */}
      <Card title="재료">
        <div className="max-h-64 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-3 gap-2">
            {materialStacks.length > 0 ? (
              materialStacks.map((stack, index) => (
                <MaterialStackSlot
                  key={`material-${stack.material.id}-stack-${index}`}
                  material={stack.material}
                  count={stack.count}
                  onClick={onMaterialClick}
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-4">
                보유한 재료가 없습니다
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};