import type { Item, Material } from '../types/gameTypes';

// 아이템 타입별 기본 아이콘 매핑
const typeIconMap: Record<string, string> = {
  // 장비류
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  
  // 소모품류 - 특정 아이템 ID에 따라 다르게 설정
  consumable: '🧪',
  
  // 재료류 - 카테고리별 세분화
  material: '📦'
};

// 소모품 전용 아이콘 매핑 (originalId 또는 id 기반)
const consumableIconMap: Record<string, string> = {
  // 체력 물약류
  'healing-potion-basic': '🧪',
  'potion-health-small': '🧪',
  'potion-health-medium': '🧪',
  'health-potion': '🧪',
  
  // 마나 물약류
  'mana-potion-basic': '🔵',
  'potion-mana-small': '🔵',
  'potion-mana-medium': '🔵',
  'mana-potion': '🔵',
  
  // 강화/특수 물약류
  'healing-potion-enhanced': '🟢',
  'super-potion': '✨',
  'speed-potion': '💨',
  
  // 기타 소모품
  'scroll': '📜',
  'bomb': '💣'
};

// 재료 카테고리별 아이콘 매핑
const materialIconMap: Record<string, string> = {
  // 허브류
  'herb-red-grass': '🌿',
  'herb-blue-flower': '🌸',
  'herb-golden-root': '🌱',
  'herb-healing': '🌿',
  
  // 광물류
  'mineral-iron-ore': '⛏️',
  'mineral-silver-dust': '✨',
  'iron-ore': '⛏️',
  'silver-ore': '💠',
  
  // 크리스탈류
  'crystal-clear-shard': '💎',
  'crystal-mana-essence': '🔮',
  'mana-crystal': '🔮',
  
  // 정수류 (원소)
  'essence-fire-spark': '🔥',
  'essence-ice-fragment': '❄️',
  'fire-essence': '🔥',
  'ice-essence': '❄️',
  'lightning-essence': '⚡',
  'earth-essence': '🪨',
  
  // 기타 재료
  'mushroom': '🍄',
  'bone': '🦴',
  'feather': '🪶',
  'scale': '🐟',
  'gem': '💎'
};

/**
 * 아이템의 적절한 아이콘을 반환합니다.
 * 1. 아이템에 직접 설정된 icon 속성을 우선 사용
 * 2. 소모품의 경우 originalId나 id에 따른 특수 아이콘 매핑
 * 3. 재료의 경우 id에 따른 카테고리별 아이콘 매핑
 * 4. 기본 타입별 아이콘 사용
 * 5. 최종적으로 기본 아이콘 반환
 */
export function getItemIcon(item: Item | Material): string {
  // 1. 아이템에 직접 설정된 아이콘이 있으면 우선 사용
  if (item.icon) {
    return item.icon;
  }
  
  // 2. 소모품의 경우 특수 매핑 적용
  if (item.type === 'consumable') {
    // originalId 우선 확인 (연금술 아이템)
    const originalId = 'originalId' in item ? (item as { originalId?: string }).originalId : undefined;
    if (originalId && consumableIconMap[originalId]) {
      return consumableIconMap[originalId];
    }
    
    // 일반 id로 확인
    if (consumableIconMap[item.id]) {
      return consumableIconMap[item.id];
    }
    
    // 이름 기반 추정
    const name = item.name.toLowerCase();
    if (name.includes('치유') || name.includes('체력') || name.includes('health')) {
      return '🧪';
    }
    if (name.includes('마나') || name.includes('mana')) {
      return '🔵';
    }
    if (name.includes('강화') || name.includes('super') || name.includes('enhanced')) {
      return '✨';
    }
  }
  
  // 3. 재료의 경우 세부 매핑 적용
  if (item.type === 'material') {
    // 정확한 id 매칭
    if (materialIconMap[item.id]) {
      return materialIconMap[item.id];
    }
    
    // 부분 매칭으로 카테고리 추정
    const id = item.id.toLowerCase();
    const name = item.name.toLowerCase();
    
    if (id.includes('herb') || name.includes('허브') || name.includes('풀') || name.includes('꽃')) {
      return '🌿';
    }
    if (id.includes('mineral') || id.includes('ore') || name.includes('광석') || name.includes('가루')) {
      return '⛏️';
    }
    if (id.includes('crystal') || name.includes('크리스탈') || name.includes('정수')) {
      return '💎';
    }
    if (id.includes('essence') || name.includes('정수') || name.includes('조각')) {
      if (name.includes('화염') || name.includes('fire')) return '🔥';
      if (name.includes('얼음') || name.includes('ice')) return '❄️';
      if (name.includes('번개') || name.includes('lightning')) return '⚡';
      return '🔮';
    }
  }
  
  // 4. 기본 타입별 아이콘 적용
  if (typeIconMap[item.type]) {
    return typeIconMap[item.type];
  }
  
  // 5. 최종 기본 아이콘
  return '📦';
}

/**
 * 아이템 타입에 따른 기본 색상을 반환합니다.
 */
export function getItemTypeColor(item: Item | Material): string {
  switch (item.type) {
    case 'weapon':
      return '#ff6b6b'; // 빨간색 계열
    case 'armor':
      return '#4dabf7'; // 파란색 계열
    case 'accessory':
      return '#69db7c'; // 초록색 계열
    case 'consumable':
      return '#ffd43b'; // 노란색 계열
    case 'material':
      return '#9775fa'; // 보라색 계열
    default:
      return '#adb5bd'; // 회색 계열
  }
}

/**
 * 소모품 아이템의 효과를 간략하게 표시하는 텍스트를 반환합니다.
 */
export function getConsumableEffectText(item: Item): string {
  const originalId = 'originalId' in item ? (item as { originalId?: string }).originalId : undefined;
  
  // originalId 기반 매핑 (연금술 아이템)
  const effectMap: Record<string, string> = {
    'healing-potion-basic': 'HP +40',
    'mana-potion-basic': 'MP +30',
    'healing-potion-enhanced': 'HP +80',
    'super-potion': 'HP +100, MP +50',
    'potion-health-small': 'HP +30',
    'potion-mana-small': 'MP +25',
    'potion-health-medium': 'HP +60',
    'potion-mana-medium': 'MP +50'
  };
  
  if (originalId && effectMap[originalId]) {
    return effectMap[originalId];
  }
  
  // stats 기반 추정
  if (item.stats) {
    const effects: string[] = [];
    if (item.stats.hp) effects.push(`HP +${item.stats.hp}`);
    if (item.stats.mp) effects.push(`MP +${item.stats.mp}`);
    if (effects.length > 0) return effects.join(', ');
  }
  
  // description에서 추출 시도
  if (item.description) {
    const desc = item.description.toLowerCase();
    if (desc.includes('hp') && desc.includes('회복')) {
      const match = desc.match(/(\d+)/);
      if (match) return `HP +${match[1]}`;
    }
    if (desc.includes('mp') && desc.includes('회복')) {
      const match = desc.match(/(\d+)/);
      if (match) return `MP +${match[1]}`;
    }
  }
  
  return '';
}