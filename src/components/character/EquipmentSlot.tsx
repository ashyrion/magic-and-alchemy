import React, { useState } from 'react';
import type { Item, GeneratedItem, EquipmentSlot as EquipmentSlotType } from '../../types/gameTypes';
import { useGameStore } from '../../store/gameStore';
import { generateUniversalItemTooltip } from '../../utils/tooltipGenerator';

interface EquipmentSlotProps {
  slotType: EquipmentSlotType;
  item?: Item | GeneratedItem;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ slotType, item }) => {
  const { unequipItem } = useGameStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  const handleClick = () => {
    if (item) {
      unequipItem(slotType);
    }
  };

  const isGeneratedItem = (item: Item | GeneratedItem): item is GeneratedItem => {
    return 'rarity' in item && 'displayName' in item;
  };

  const getDisplayName = (item: Item | GeneratedItem): string => {
    return isGeneratedItem(item) ? item.displayName || item.name : item.name;
  };

  const getRarityColor = (item: Item | GeneratedItem): string => {
    if (!isGeneratedItem(item)) return '#ffffff';
    
    switch (item.rarity) {
      case 'magic': return '#3b82f6';
      case 'rare': return '#eab308';
      case 'unique': return '#ea580c';
      default: return '#ffffff';
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // rect 저장
    setElementRect(rect);
    
    // 더 정확한 툴팁 높이 예상 (최대 400px)
    const tooltipHeight = 400;
    const spaceBelow = windowHeight - (rect.bottom - scrollY);
    const spaceAbove = rect.top - scrollY;
    
    // 아래쪽 공간이 충분하지 않고 위쪽 공간이 더 크면 위로 표시
    if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      setTooltipPosition('top');
    } else {
      setTooltipPosition('bottom');
    }
    setShowTooltip(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '60px' }}>
      <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
        {slotType}
      </div>
      
      {item ? (
        <div 
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
          style={{ 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px', 
            border: '1px solid #333', 
            borderRadius: '4px', 
            backgroundColor: '#2a2a2a', 
            cursor: 'pointer',
            color: getRarityColor(item)
          }}
        >
          <span>{item.icon || '📦'}</span>
          <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getDisplayName(item)}
          </span>
          
          {/* 범용 툴팁 */}
          {showTooltip && (
            <div 
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
      ) : (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            border: '2px dashed #444',
            borderRadius: '4px',
            color: '#666',
            fontSize: '12px'
          }}
        >
          Empty
        </div>
      )}
    </div>
  );
};

export default EquipmentSlot;
