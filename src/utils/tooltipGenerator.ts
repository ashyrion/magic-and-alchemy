import type { Item, Material, GeneratedItem, StatusEffect } from '../types/gameTypes';

/**
 * 범용 아이템 툴팁 생성 함수
 */

// 아이템 타입별 색상 맵핑
const ITEM_TYPE_COLORS = {
  weapon: '#ff6b6b',
  armor: '#4ecdc4',
  accessory: '#ffe66d',
  consumable: '#a8e6cf',
  material: '#dda0dd'
};

// 희귀도별 색상
const RARITY_COLORS = {
  common: '#ffffff',
  magic: '#3b82f6',
  rare: '#eab308',
  unique: '#ea580c'
};

/**
 * GeneratedItem인지 확인하는 타입 가드
 */
function isGeneratedItem(item: Item | GeneratedItem): item is GeneratedItem {
  return 'rarity' in item && 'displayName' in item && 'colorCode' in item;
}

/**
 * 스탯을 HTML로 포매팅
 */
function formatStats(stats: Record<string, number | undefined>): string {
  if (!stats) return '';
  
  const statEntries = Object.entries(stats).filter(([, value]) => typeof value === 'number' && value !== 0);
  
  if (statEntries.length === 0) return '';
  
  return statEntries.map(([key, value]) => {
    const displayValue = typeof value === 'number' ? (value > 0 ? `+${value}` : `${value}`) : value;
    const statName = getStatDisplayName(key);
    const color = (value as number) > 0 ? '#4ade80' : '#f87171';
    return `<span style="color: ${color};">${displayValue} ${statName}</span>`;
  }).join('<br>');
}

/**
 * 스탯 키를 한글 이름으로 변환
 */
function getStatDisplayName(statKey: string): string {
  const statNames: Record<string, string> = {
    strength: '힘',
    agility: '민첩성',
    intelligence: '지능',
    hp: '생명력',
    maxHp: '최대 생명력',
    mp: '마나',
    maxMp: '최대 마나',
    attack: '공격력',
    magicAttack: '마법 공격력',
    defense: '방어력',
    magicDefense: '마법 방어력',
    criticalRate: '치명타율',
    criticalDamage: '치명타 피해',
    evasion: '회피율',
    fireResist: '화염 저항',
    iceResist: '냉기 저항',
    lightningResist: '번개 저항',
    poisonResist: '독 저항',
    hpRegen: 'HP 회복',
    mpRegen: 'MP 회복',
    vitality: '체력',
    wisdom: '지혜',
    accuracy: '명중률',
    speed: '속도'
  };
  
  return statNames[statKey] || statKey;
}

/**
 * 상태 효과를 HTML로 포매팅
 */
function formatEffects(effects: StatusEffect[]): string {
  if (!effects || effects.length === 0) return '';
  
  return effects.map(effect => {
    const effectColor = effect.type === 'buff' ? '#4ade80' : 
                       effect.type === 'debuff' ? '#f87171' : '#fbbf24';
    return `<span style="color: ${effectColor};">${effect.name}: ${effect.description || '효과 설명'}</span>`;
  }).join('<br>');
}

/**
 * 기본 아이템 툴팁 생성
 */
export function generateBasicItemTooltip(item: Item): string {
  const typeColor = ITEM_TYPE_COLORS[item.type] || '#ffffff';
  const itemName = item.name;
  const description = item.description || '';
  
  let html = `
    <div style="color: ${typeColor}; font-weight: bold; font-size: 14px; margin-bottom: 4px;">
      ${itemName}
    </div>
    <div style="color: #888; font-size: 11px; margin-bottom: 8px; text-transform: capitalize;">
      ${getItemTypeDisplayName(item.type)}
    </div>
  `;
  
  // 레벨 제한
  if (item.requiredLevel && item.requiredLevel > 1) {
    html += `
      <div style="color: #fbbf24; font-size: 12px; margin-bottom: 6px;">
        요구 레벨: ${item.requiredLevel}
      </div>
    `;
  }
  
  // 스탯
  if (item.stats) {
    const statsHtml = formatStats(item.stats);
    if (statsHtml) {
      html += `
        <div style="margin: 8px 0; padding: 6px; background-color: rgba(0,0,0,0.3); border-radius: 4px;">
          ${statsHtml}
        </div>
      `;
    }
  }
  
  // 효과 (소모품/재료용)
  if (item.effects) {
    const effectsHtml = formatEffects(item.effects);
    if (effectsHtml) {
      html += `
        <div style="margin: 8px 0; padding: 6px; background-color: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="color: #fbbf24; font-size: 11px; margin-bottom: 4px;">효과</div>
          ${effectsHtml}
        </div>
      `;
    }
  }
  
  // 설명
  if (description) {
    html += `
      <div style="color: #ccc; font-size: 11px; margin-top: 8px; font-style: italic; border-top: 1px solid #444; padding-top: 6px;">
        ${description}
      </div>
    `;
  }
  
  // 무게 정보
  if (item.weight) {
    html += `
      <div style="color: #888; font-size: 10px; margin-top: 6px;">
        무게: ${item.weight}kg
      </div>
    `;
  }
  
  return html;
}

/**
 * GeneratedItem (강화/접사 아이템) 툴팁 생성
 */
export function generateEnhancedItemTooltip(item: GeneratedItem): string {
  const rarityColor = RARITY_COLORS[item.rarity] || '#ffffff';
  
  let html = `
    <div style="color: ${rarityColor}; font-weight: bold; font-size: 14px; margin-bottom: 4px;">
      ${item.displayName || item.name}
    </div>
    <div style="color: #888; font-size: 11px; margin-bottom: 8px;">
      <span style="text-transform: capitalize;">${getItemTypeDisplayName(item.type)}</span>
      <span style="color: ${rarityColor}; margin-left: 8px; text-transform: capitalize;">${getRarityDisplayName(item.rarity)}</span>
    </div>
  `;
  
  // 레벨 제한
  if (item.requiredLevel && item.requiredLevel > 1) {
    html += `
      <div style="color: #fbbf24; font-size: 12px; margin-bottom: 6px;">
        요구 레벨: ${item.requiredLevel}
      </div>
    `;
  }
  
  // 기본 스탯
  if (item.baseStats) {
    const baseStatsHtml = formatStats(item.baseStats);
    if (baseStatsHtml) {
      html += `
        <div style="margin: 8px 0; padding: 6px; background-color: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 4px;">기본 능력치</div>
          ${baseStatsHtml}
        </div>
      `;
    }
  }
  
  // 접사 스탯
  if (item.affixStats) {
    const affixStatsHtml = formatStats(item.affixStats);
    if (affixStatsHtml) {
      html += `
        <div style="margin: 8px 0; padding: 6px; background-color: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="color: #4ade80; font-size: 11px; margin-bottom: 4px;">마법 속성</div>
          ${affixStatsHtml}
        </div>
      `;
    }
  }
  
  // 접두사/접미사 목록
  const affixes = [...(item.prefixes || []), ...(item.suffixes || [])];
  if (affixes.length > 0) {
    html += `
      <div style="margin: 8px 0; padding: 6px; background-color: rgba(0,0,0,0.3); border-radius: 4px;">
        <div style="color: #8b5cf6; font-size: 11px; margin-bottom: 4px;">마법 속성</div>
        ${affixes.map(affix => `<div style="color: #a78bfa; font-size: 11px;">${affix.name}: ${affix.description}</div>`).join('')}
      </div>
    `;
  }
  
  // 설명
  if (item.description) {
    html += `
      <div style="color: #ccc; font-size: 11px; margin-top: 8px; font-style: italic; border-top: 1px solid #444; padding-top: 6px;">
        ${item.description}
      </div>
    `;
  }
  
  return html;
}

/**
 * 재료 아이템 툴팁 생성
 */
export function generateMaterialTooltip(material: Material, count?: number): string {
  let html = `
    <div style="color: ${ITEM_TYPE_COLORS.material}; font-weight: bold; font-size: 14px; margin-bottom: 4px;">
      ${material.name}
      ${count ? ` (x${count})` : ''}
    </div>
    <div style="color: #888; font-size: 11px; margin-bottom: 8px;">
      재료
    </div>
  `;
  
  // 효과
  if (material.effects) {
    const effectsHtml = formatEffects(material.effects);
    if (effectsHtml) {
      html += `
        <div style="margin: 8px 0; padding: 6px; background-color: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="color: #fbbf24; font-size: 11px; margin-bottom: 4px;">연금술 효과</div>
          ${effectsHtml}
        </div>
      `;
    }
  }
  
  // 설명
  if (material.description) {
    html += `
      <div style="color: #ccc; font-size: 11px; margin-top: 8px; font-style: italic; border-top: 1px solid #444; padding-top: 6px;">
        ${material.description}
      </div>
    `;
  }
  
  return html;
}

/**
 * 범용 아이템 툴팁 생성 (모든 타입 지원)
 */
export function generateUniversalItemTooltip(item: Item | GeneratedItem | Material, count?: number): string {
  // GeneratedItem 처리
  if (isGeneratedItem(item)) {
    return generateEnhancedItemTooltip(item);
  }
  
  // Material 처리  
  if (item.type === 'material') {
    return generateMaterialTooltip(item as Material, count);
  }
  
  // 기본 Item 처리
  return generateBasicItemTooltip(item);
}

/**
 * 아이템 타입 표시명
 */
function getItemTypeDisplayName(type: string): string {
  const typeNames: Record<string, string> = {
    weapon: '무기',
    armor: '방어구',
    accessory: '장신구',
    consumable: '소모품',
    material: '재료'
  };
  
  return typeNames[type] || type;
}

/**
 * 희귀도 표시명
 */
function getRarityDisplayName(rarity: string): string {
  const rarityNames: Record<string, string> = {
    common: '일반',
    magic: '마법',
    rare: '희귀',
    unique: '유니크'
  };
  
  return rarityNames[rarity] || rarity;
}