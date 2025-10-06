import React, { useState } from 'react';
import { Card, Slot } from '../common';
import type { Item, Material, GeneratedItem } from '../../types/gameTypes';
import { useInventoryStore } from '../../store/inventoryStore';
import { useGameStore } from '../../store/gameStore';
import { generateUniversalItemTooltip } from '../../utils/tooltipGenerator';
import { getItemIcon, getConsumableEffectText } from '../../utils/iconUtils';

interface ItemSlotProps {
  item: Item | GeneratedItem;
  onClick?: (item: Item | GeneratedItem) => void;
  onUseItem?: (itemId: string) => void;
}

// 간결한 선형 장비 슬롯 컴포넌트
const EquipmentItemSlot = ({ item, onClick }: ItemSlotProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const character = useGameStore((state) => state.character);
  const currentLevel = character?.level || 1;
  const requiredLevel = item.requiredLevel || 1;
  const canEquip = currentLevel >= requiredLevel;
  const { equipItem } = useGameStore();
  
  // 아이템이 GeneratedItem인지 확인
  const isGeneratedItem = (item: Item | GeneratedItem): item is GeneratedItem => {
    return 'rarity' in item && 'displayName' in item && 'colorCode' in item;
  };
  
  const generatedItem = isGeneratedItem(item) ? item : null;
  const displayName = generatedItem?.displayName || item.name;
  const itemColor = generatedItem?.colorCode || '#FFFFFF';
  
  // 아이템 아이콘 반환
  const getItemIcon = () => {
    return item.icon || '📦';
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // rect 저장
    setElementRect(rect);
    
    // 더 정확한 툴팁 높이 예상
    const tooltipHeight = 400;
    const spaceBelow = windowHeight - (rect.bottom - scrollY);
    const spaceAbove = rect.top - scrollY;
    
    if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      setTooltipPosition('top');
    } else {
      setTooltipPosition('bottom');
    }
    setShowTooltip(true);
  };

  const handleClick = () => {
    if (['weapon', 'armor', 'accessory'].includes(item.type)) {
      if (canEquip) {
        // 장착 가능한 경우 장착 시도
        try {
          equipItem(item as Item, item.type as 'weapon' | 'armor' | 'accessory');
          console.log(`${displayName} 장착 완료`);
        } catch (error) {
          console.error('장비 장착 실패:', error);
        }
      } else {
        // 장착 불가능해도 클릭 이벤트는 처리 (정보 확인용)
        console.log(`${displayName}은(는) 레벨 ${requiredLevel} 이상이어야 장착할 수 있습니다.`);
      }
    }
    // 기본 클릭 이벤트 호출
    onClick?.(item);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div 
        className={`flex items-center p-2 bg-gray-700 rounded-lg transition-all ${
          canEquip ? 'hover:bg-gray-600 cursor-pointer border border-gray-600' : 'opacity-50 border border-red-500 cursor-not-allowed'
        }`}
        onClick={handleClick}
      >
        <div className="text-lg mr-3">{getItemIcon()}</div>
        <div className="flex-1">
          <div 
            className={`text-sm font-medium truncate ${
              !canEquip ? 'text-red-400' : ''
            }`}
            style={{ color: canEquip ? itemColor : undefined }}
          >
            {displayName}
          </div>
          {requiredLevel > 1 && (
            <div className={`text-xs ${
              canEquip ? 'text-green-400' : 'text-red-400'
            }`}>
              요구 레벨: {requiredLevel}
            </div>
          )}
        </div>
      </div>
      
      {/* 범용 툴팁 */}
      {showTooltip && (
        <div 
          className="absolute z-50"
          style={{ 
            position: 'fixed',
            ...(tooltipPosition === 'bottom' && elementRect ? 
              { top: `${elementRect.bottom + 4}px` } : 
              elementRect ? { bottom: `${window.innerHeight - elementRect.top + 4}px` } : {}
            ),
            left: elementRect ? `${Math.min(elementRect.left, window.innerWidth - 340)}px` : '0px',
            zIndex: 1000,
            backgroundColor: '#1a1a1a',
            border: '2px solid #444',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '280px',
            maxWidth: '320px',
            fontSize: '12px',
            lineHeight: '1.4',
            boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
            maxHeight: '380px',
            overflowY: 'auto'
          }}
          dangerouslySetInnerHTML={{
            __html: generateUniversalItemTooltip(item)
          }}
        />
      )}
    </div>
  );
};

// 기존 그리드 형태 ItemSlot (소비품용)
const ItemSlot = ({ item, onClick, onUseItem }: ItemSlotProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');
  const character = useGameStore((state) => state.character);
  const currentLevel = character?.level || 1;
  const requiredLevel = item.requiredLevel || 1;
  const canEquip = currentLevel >= requiredLevel;
  
  // 아이템이 GeneratedItem인지 확인
  const isGeneratedItem = (item: Item | GeneratedItem): item is GeneratedItem => {
    return 'rarity' in item && 'displayName' in item && 'colorCode' in item;
  };
  
  const generatedItem = isGeneratedItem(item) ? item : null;
  const displayName = generatedItem?.displayName || item.name;
  const itemColor = generatedItem?.colorCode || '#FFFFFF';

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // rect 저장
    setElementRect(rect);
    
    // 툴팁 높이 예상
    const tooltipHeight = 300;
    const spaceBelow = windowHeight - (rect.bottom - scrollY);
    const spaceAbove = rect.top - scrollY;
    
    if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      setTooltipPosition('top');
    } else {
      setTooltipPosition('bottom');
    }
    setShowTooltip(true);
  };
  
  const handleUseItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`아이템 사용 시도: ${displayName} (${item.instanceId})`);
    console.log(`아이템 타입: ${item.type}`);
    console.log(`originalId: ${item.originalId}`);
    
    if (onUseItem && item.instanceId) {
      const inventoryStore = useInventoryStore.getState();
      const success = inventoryStore.useItem(item.instanceId);
      console.log(`사용 결과: ${success}`);
    } else {
      console.log('onUseItem 함수가 없거나 instanceId가 없습니다');
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Slot
        size="lg"
        onClick={() => onClick?.(item)}
        className={`transition-all h-full ${
          ['weapon', 'armor', 'accessory'].includes(item.type) && !canEquip 
            ? 'opacity-50 border-red-500 border' 
            : ''
        }`}
      >
        <div className="flex flex-col h-full p-1">
          {/* 상단: 아이콘과 이름 */}
          <div className="flex flex-col items-center flex-grow justify-center">
            <div className="text-xl">
              {getItemIcon(item)}
            </div>
            <div 
              className={`text-xs text-center truncate leading-tight font-medium max-w-full ${
                ['weapon', 'armor', 'accessory'].includes(item.type) && !canEquip 
                  ? 'text-red-400' 
                  : ''
              }`}
              style={{ color: canEquip ? itemColor : undefined }}
              title={displayName} // 전체 이름을 툴팁으로 표시
            >
              {displayName}
            </div>
          </div>
        
          {/* 하단: 효과 및 버튼 (소모품만) */}
          {item.type === 'consumable' ? (
            <div className="flex flex-col items-center space-y-1 mt-1">
              <div className="text-xs text-green-400 font-medium">
                {getConsumableEffectText(item)}
              </div>
              <button
                onClick={handleUseItem}
                className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full"
              >
                사용
              </button>
            </div>
          ) : (
            /* 장비 아이템의 레벨 제한 표시 */
            ['weapon', 'armor', 'accessory'].includes(item.type) && requiredLevel > 1 && (
              <div className={`text-xs font-semibold text-center mt-1 ${
                canEquip ? 'text-green-400' : 'text-red-400'
              }`}>
                Lv.{requiredLevel}
              </div>
            )
          )}
      </div>
      </Slot>
      
      {/* 범용 툴팁 - fixed 포지셔닝 사용 */}
      {showTooltip && (
        <div 
          style={{
            position: 'fixed',
            ...(tooltipPosition === 'bottom' && elementRect ? 
              { top: `${elementRect.bottom + 8}px` } : 
              elementRect ? { bottom: `${window.innerHeight - elementRect.top + 8}px` } : {}
            ),
            left: elementRect ? `${Math.min(elementRect.left, window.innerWidth - 320)}px` : '0px',
            zIndex: 1000,
            backgroundColor: '#1a1a1a',
            border: '2px solid #444',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '280px',
            maxWidth: '320px',
            fontSize: '12px',
            lineHeight: '1.4',
            boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
            maxHeight: '380px',
            overflowY: 'auto',
            color: 'white'
          }}
          dangerouslySetInnerHTML={{
            __html: generateUniversalItemTooltip(item)
          }}
        />
      )}
    </div>
  );
};

// MaterialSlot은 MaterialStackSlot으로 대체되었습니다.

interface MaterialStackSlotProps {
  material: Material;
  count: number;
  onClick?: (material: Material) => void;
}

const MaterialStackSlot = ({ material, count, onClick }: MaterialStackSlotProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // rect 저장
    setElementRect(rect);
    
    // 툴팁 높이 예상
    const tooltipHeight = 300;
    const spaceBelow = windowHeight - (rect.bottom - scrollY);
    const spaceAbove = rect.top - scrollY;
    
    if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      setTooltipPosition('top');
    } else {
      setTooltipPosition('bottom');
    }
    setShowTooltip(true);
  };
  
  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Slot
        size="lg"
        onClick={() => onClick?.(material)}
        className="h-full"
      >
        <div className="flex flex-col h-full justify-between p-2">
          {/* 아이콘과 이름 */}
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-1">
              {getItemIcon(material)}
            </div>
            <div className="text-xs font-medium text-center truncate leading-tight">
              {material.name}
            </div>
          </div>
          
          {/* 개수 표시 */}
          <div className="flex justify-center">
            <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center font-semibold shadow-sm">
              {count}
            </span>
          </div>
        </div>
      </Slot>
      
      {/* 재료 툴팁 - fixed 포지셔닝 사용 */}
      {showTooltip && (
        <div 
          style={{
            position: 'fixed',
            ...(tooltipPosition === 'bottom' && elementRect ? 
              { top: `${elementRect.bottom + 8}px` } : 
              elementRect ? { bottom: `${window.innerHeight - elementRect.top + 8}px` } : {}
            ),
            left: elementRect ? `${Math.min(elementRect.left, window.innerWidth - 320)}px` : '0px',
            zIndex: 1000,
            backgroundColor: '#1a1a1a',
            border: '2px solid #444',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '280px',
            maxWidth: '320px',
            fontSize: '12px',
            lineHeight: '1.4',
            boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
            maxHeight: '380px',
            overflowY: 'auto',
            color: 'white'
          }}
          dangerouslySetInnerHTML={{
            __html: generateUniversalItemTooltip(material, count)
          }}
        />
      )}
    </div>
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

      {/* 장비 아이템 리스트 */}
      <Card title="장비">
        <div className="space-y-2">
          {equipmentItems.length > 0 ? (
            equipmentItems.map((item, index) => (
              <EquipmentItemSlot
                key={`equipment-${item.instanceId || item.id}-${index}`}
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

      {/* 소모품 그리드 - 더 큰 슬롯과 여백 */}
      <Card title="소모품">
        <div className="grid grid-cols-3 gap-3">
          {consumableItems.length > 0 ? (
            consumableItems.map((item, index) => (
              <div key={`consumable-${item.instanceId || item.id}-${index}`} className="h-20">
                <ItemSlot
                  item={item}
                  onClick={onItemClick}
                  onUseItem={useItem}
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-8">
              보유한 소모품이 없습니다
            </div>
          )}
        </div>
      </Card>

      {/* 재료 그리드 - 더 큰 슬롯과 여백 (스크롤 추가) */}
      <Card title="재료">
        <div className="max-h-64 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-3 gap-3">
            {materialStacks.length > 0 ? (
              materialStacks.map((stack, index) => (
                <div key={`material-${stack.material.id}-stack-${index}`} className="h-20">
                  <MaterialStackSlot
                    material={stack.material}
                    count={stack.count}
                    onClick={onMaterialClick}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-8">
                보유한 재료가 없습니다
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};