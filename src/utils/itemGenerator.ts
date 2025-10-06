import type { Item, GeneratedItem, ItemRarity, ItemAffix, Stats } from '../types/gameTypes';
import { itemPrefixes, itemSuffixes, rarityColors, rarityAffixRules } from '../data/itemAffixes';
import { v4 as uuidv4 } from 'uuid';

// 스탯을 합치는 유틸리티 함수
export function combineStats(...statsArray: Partial<Stats>[]): Partial<Stats> {
  const combined: Partial<Stats> = {};
  
  statsArray.forEach(stats => {
    if (stats) {
      Object.entries(stats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          combined[key] = (combined[key] || 0) + value;
        }
      });
    }
  });
  
  return combined;
}

// 아이템 타입에 적용 가능한 접사 필터링
function getApplicableAffixes(affixes: ItemAffix[], itemType: string): ItemAffix[] {
  return affixes.filter(affix => 
    !affix.itemTypes || affix.itemTypes.includes(itemType)
  );
}

// 등급에 따른 랜덤 접사 선택 (tier 제한 포함)
function selectRandomAffixes(
  availableAffixes: ItemAffix[], 
  count: number, 
  excludeIds: string[] = [],
  maxTier?: number
): ItemAffix[] {
  let filtered = availableAffixes.filter(affix => !excludeIds.includes(affix.id));
  
  // tier 제한이 있으면 적용
  if (maxTier !== undefined) {
    filtered = filtered.filter(affix => affix.tier <= maxTier);
  }
  
  const selected: ItemAffix[] = [];
  
  for (let i = 0; i < count && filtered.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const selectedAffix = filtered.splice(randomIndex, 1)[0];
    selected.push(selectedAffix);
  }
  
  return selected;
}

// 아이템 이름 생성 (접두사 + 기본이름 + 접미어)
function generateDisplayName(baseName: string, prefixes: ItemAffix[], suffixes: ItemAffix[]): string {
  let displayName = baseName;
  
  // 접두사 추가 (기본 이름 앞에)
  if (prefixes.length > 0) {
    const prefixNames = prefixes.map(p => p.name).join(' ');
    displayName = `${prefixNames} ${displayName}`;
  }
  
  // 접미어 추가 (기본 이름 뒤에 "of" 형태로)
  if (suffixes.length > 0) {
    const suffixNames = suffixes.map(s => s.name).join(', ');
    displayName = `${displayName} ${suffixNames}`;
  }
  
  return displayName;
}

// 기본 아이템을 등급이 있는 아이템으로 변환
export function generateEnhancedItem(baseItem: Item, targetRarity?: ItemRarity): GeneratedItem {
  // 등급 결정 (지정되지 않은 경우 확률적으로 결정)
  let rarity: ItemRarity;
  if (targetRarity) {
    rarity = targetRarity;
  } else {
    const rarityRoll = Math.random();
    if (rarityRoll < 0.75) rarity = 'common';
    else if (rarityRoll < 0.95) rarity = 'magic';
    else if (rarityRoll < 0.99) rarity = 'rare';
    else rarity = 'unique';
  }
  
  const rules = rarityAffixRules[rarity];
  let selectedPrefixes: ItemAffix[] = [];
  let selectedSuffixes: ItemAffix[] = [];
  
  // 일반 등급이 아닌 경우에만 접사 생성
  if (rarity !== 'common') {
    const availablePrefixes = getApplicableAffixes(itemPrefixes, baseItem.type);
    const availableSuffixes = getApplicableAffixes(itemSuffixes, baseItem.type);
    const maxTier = rules.maxTier; // tier 제한 가져오기
    
    // 접두사 개수 결정
    const prefixCount = Math.floor(Math.random() * (rules.prefixes.max - rules.prefixes.min + 1)) + rules.prefixes.min;
    selectedPrefixes = selectRandomAffixes(availablePrefixes, prefixCount, [], maxTier);
    
    // 접미어 개수 결정
    const suffixCount = Math.floor(Math.random() * (rules.suffixes.max - rules.suffixes.min + 1)) + rules.suffixes.min;
    selectedSuffixes = selectRandomAffixes(availableSuffixes, suffixCount, [], maxTier);
    
    // 매직 등급의 경우 최소 1개 보장
    if (rarity === 'magic' && selectedPrefixes.length === 0 && selectedSuffixes.length === 0) {
      if (Math.random() < 0.5 && availablePrefixes.length > 0) {
        selectedPrefixes = selectRandomAffixes(availablePrefixes, 1, [], maxTier);
      } else if (availableSuffixes.length > 0) {
        selectedSuffixes = selectRandomAffixes(availableSuffixes, 1, [], maxTier);
      }
    }
  }
  
  // 접사 스탯 합계 계산
  const prefixStats = combineStats(...selectedPrefixes.map(p => p.stats));
  const suffixStats = combineStats(...selectedSuffixes.map(s => s.stats));
  const affixStats = combineStats(prefixStats, suffixStats);
  
  // 최종 스탯 계산 (기본 스탯 + 접사 스탯)
  const finalStats = combineStats(baseItem.stats || {}, affixStats);
  
  // 표시 이름 생성
  const displayName = generateDisplayName(baseItem.name, selectedPrefixes, selectedSuffixes);
  
  // 생성된 아이템 반환
  const generatedItem: GeneratedItem = {
    ...baseItem,
    instanceId: uuidv4(),
    rarity,
    prefixes: selectedPrefixes,
    suffixes: selectedSuffixes,
    baseStats: baseItem.stats || {},
    affixStats,
    stats: finalStats,
    displayName,
    colorCode: rarityColors[rarity]
  };
  
  return generatedItem;
}

// 여러 아이템을 한번에 생성
export function generateEnhancedItems(baseItems: Item[], count: number = 1): GeneratedItem[] {
  const generated: GeneratedItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomBaseItem = baseItems[Math.floor(Math.random() * baseItems.length)];
    generated.push(generateEnhancedItem(randomBaseItem));
  }
  
  return generated;
}

// 특정 등급의 아이템 생성
export function generateItemWithRarity(baseItem: Item, rarity: ItemRarity): GeneratedItem {
  return generateEnhancedItem(baseItem, rarity);
}

// 스탯 이름을 한글로 변환
function getStatDisplayName(statKey: string): string {
  const statNames: { [key: string]: string } = {
    strength: '힘',
    defense: '방어력',
    intelligence: '지능',
    agility: '민첩',
    vitality: '체력',
    attack: '공격력',
    magicAttack: '마법 공격력',
    hp: '생명력',
    maxHp: '최대 생명력',
    mp: '마나',
    maxMp: '최대 마나',
    criticalRate: '치명타율',
    criticalDamage: '치명타 피해',
    physicalDefense: '물리 방어력',
    magicDefense: '마법 방어력',
    evasion: '회피율',
    hpRegen: '생명력 재생',
    mpRegen: '마나 재생',
    fireResist: '화염 저항',
    iceResist: '냉기 저항',
    lightningResist: '번개 저항',
    poisonResist: '독 저항',
  };
  
  return statNames[statKey] || statKey;
}

// 아이템 상세 설명 생성 (툴팁용)
export function generateItemTooltip(item: GeneratedItem): string {
  const lines: string[] = [];
  
  // 아이템 이름 (색상 포함)
  lines.push(`<div style="color: ${item.colorCode}; font-weight: bold; font-size: 14px; margin-bottom: 4px;">`);
  lines.push(`  ${item.displayName}`);
  lines.push('</div>');
  
  // 아이템 정보
  lines.push(`<div style="color: #888; font-size: 12px; margin-bottom: 8px;">`);
  lines.push(`  ${getItemTypeDisplayName(item.type)} | ${getRarityDisplayName(item.rarity)}`);
  if (item.requiredLevel) {
    lines.push(`<br>필요 레벨: ${item.requiredLevel}`);
  }
  lines.push('</div>');
  
  // 총 스탯 표시 (기본 + 접사)
  const totalStats = { ...item.stats };
  const hasStats = Object.values(totalStats).some(value => value && value !== 0);
  
  if (hasStats) {
    lines.push(`<div style="margin-bottom: 8px;">`);
    Object.entries(totalStats).forEach(([stat, value]) => {
      if (value && value !== 0) {
        const displayName = getStatDisplayName(stat);
        const color = value > 0 ? '#4CAF50' : '#F44336';
        lines.push(`  <div style="color: ${color}; font-size: 12px;">`);
        lines.push(`    ${displayName}: ${value > 0 ? '+' : ''}${value}`);
        lines.push('  </div>');
      }
    });
    lines.push('</div>');
  }
  
  // 접사 효과 요약 (간단히)
  const allAffixes = [...item.prefixes, ...item.suffixes];
  if (allAffixes.length > 0) {
    lines.push(`<div style="color: #66B3FF; font-size: 11px; margin-top: 8px; border-top: 1px solid #444; padding-top: 4px;">`);
    allAffixes.forEach(affix => {
      lines.push(`  • ${affix.name}`);
    });
    lines.push('</div>');
  }
  
  return lines.join('');
}

// 아이템 타입 표시명
function getItemTypeDisplayName(type: string): string {
  const typeNames: { [key: string]: string } = {
    weapon: '무기',
    armor: '방어구',
    accessory: '장신구',
    consumable: '소비품',
    material: '재료'
  };
  return typeNames[type] || type;
}

// 등급 표시명
function getRarityDisplayName(rarity: string): string {
  const rarityNames: { [key: string]: string } = {
    common: '일반',
    magic: '매직',
    rare: '레어',
    unique: '유니크'
  };
  return rarityNames[rarity] || rarity;
}