import React, { useState } from 'react';
import { useNewAlchemyStore } from '../stores/newAlchemyStore';
import { alchemyMaterials } from '../data/alchemyMaterials';
import type { ItemRarity } from '../stores/newAlchemyStore';
import { useInventoryStore } from '../store/inventoryStore';
import type { Item, Material, GeneratedItem, ItemRarity as GameItemRarity, ItemAffix } from '../types/gameTypes';
import { alchemyRecipes, newAlchemyRecipes, getPotionsByCategory } from '../data/alchemyRecipes';
import { generateUniversalItemTooltip } from '../utils/tooltipGenerator';
import { generateEnhancedItem, combineStats } from '../utils/itemGenerator';
import { rarityColors, rarityAffixRules } from '../data/itemAffixes';
import SkillEnhancementWorkshop from './SkillEnhancementWorkshop';
import './AlchemyWorkshop.stable.css';

// 재료 슬롯 컴포넌트 (인벤토리와 동일한 형태)
interface MaterialSlotWithTooltipProps {
  material: Material;
  count: number;
}

const MaterialSlotWithTooltip: React.FC<MaterialSlotWithTooltipProps> = ({ material, count }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    setElementRect(rect);
    
    const tooltipHeight = 300;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    
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
      <div className="bg-gray-700 border-2 border-gray-600 rounded-lg p-2 hover:border-blue-500 transition-colors cursor-pointer flex flex-col items-center justify-center h-20 w-16">
        <div className="flex flex-col items-center flex-grow justify-center">
          <div className="text-xl mb-1">
            {material.icon || '🧪'}
          </div>
          <div className="text-xs font-medium text-center truncate leading-tight text-purple-300">
            {material.name}
          </div>
        </div>
        
        <div className="flex justify-center">
          <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center font-semibold shadow-sm">
            {count}
          </span>
        </div>
      </div>

      {/* 툴팁 */}
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

// 선택 가능한 아이템 항목 (툴팁 포함)
interface SelectableItemProps {
  item: Item | GeneratedItem;
  isSelected: boolean;
  onClick: () => void;
}

const SelectableItem: React.FC<SelectableItemProps> = ({ item, isSelected, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    setElementRect(rect);
    
    const tooltipHeight = 300;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      setTooltipPosition('top');
    } else {
      setTooltipPosition('bottom');
    }
    setShowTooltip(true);
  };

  // 아이템 정보 추출
  const rarity = item.rarity || 'common';
  
  const isGeneratedItem = 'displayName' in item && 'colorCode' in item;
  const generatedItem = isGeneratedItem ? item as GeneratedItem : null;
  const displayName = generatedItem?.displayName || item.name;
  const itemColor = generatedItem?.colorCode || rarityColors[rarity as GameItemRarity] || '#ffffff';

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div 
        className={`flex items-center p-2 bg-gray-700 rounded-lg transition-all cursor-pointer border ${
          isSelected ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600 hover:bg-gray-600'
        }`}
        onClick={onClick}
      >
        <div className="text-lg mr-3">{item.icon || '📦'}</div>
        <div className="flex-1">
          <div 
            className="text-sm font-medium truncate"
            style={{ color: itemColor }}
          >
            {displayName}
          </div>
          <div className="text-xs text-gray-400">
            {item.type === 'weapon' ? '무기' : 
             item.type === 'armor' ? '방어구' : 
             item.type === 'accessory' ? '장신구' : item.type}
          </div>
        </div>
      </div>

      {/* 툴팁 */}
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

// 강화할 아이템 슬롯 컴포넌트 (아이콘 + 이름 + 툴팁)
interface UpgradeItemSlotProps {
  item: Item | GeneratedItem;
  onCancel: () => void;
}

const UpgradeItemSlot: React.FC<UpgradeItemSlotProps> = ({ item, onCancel }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'bottom' | 'top'>('bottom');

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    setElementRect(rect);
    
    const tooltipHeight = 300;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
      setTooltipPosition('top');
    } else {
      setTooltipPosition('bottom');
    }
    setShowTooltip(true);
  };

  // 아이템 정보 추출
  const isGeneratedItem = 'displayName' in item && 'colorCode' in item;
  const generatedItem = isGeneratedItem ? item as GeneratedItem : null;
  const displayName = generatedItem?.displayName || item.name;
  const rarity = item.rarity || 'common';
  const itemColor = generatedItem?.colorCode || rarityColors[rarity as GameItemRarity] || '#ffffff';
  const itemIcon = item.icon || '📦';

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="upgrade-item-slot">
        <div className="flex items-center p-3 bg-gray-700 rounded-lg border-2 border-gray-600">
          <div className="text-2xl mr-3">{itemIcon}</div>
          <div className="flex-1">
            <div 
              className="text-base font-medium"
              style={{ color: itemColor }}
            >
              {displayName}
            </div>
            <div className="text-sm text-gray-400">
              {item.type === 'weapon' ? '무기' : 
               item.type === 'armor' ? '방어구' : 
               item.type === 'accessory' ? '장신구' : item.type}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="ml-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            취소
          </button>
        </div>
      </div>

      {/* 툴팁 */}
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

const AlchemyWorkshop: React.FC = () => {
  const {
    // upgradeSkill, // 스킬 강화 시스템에서 직접 처리
    lastCraftResult,
    knownRecipes
  } = useNewAlchemyStore();
  


  const { materials: inventoryMaterials, addItem, items: inventoryItems, removeMaterial, removeItem, addMaterial } = useInventoryStore();
  // const { learnedSkills } = useGameStore(); // 스킬 강화 시스템에서 직접 처리

  // inventoryStore 기준으로 단순화 (동기화 로직 제거)

  const [activeTab, setActiveTab] = useState<'craft' | 'upgrade-item' | 'upgrade-skill'>('craft');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUpgradeType, setSelectedUpgradeType] = useState<'normal-to-magic' | 'magic-to-rare' | 'rare-to-unique' | null>(null);
  const [selectedUpgradeItemId, setSelectedUpgradeItemId] = useState<string | null>(null);
  
  // 모달 상태
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalResult, setModalResult] = useState<{
    success: boolean;
    title: string;
    message: string;
  } | null>(null);

  // subscribe directly to skills so UI updates reactively
  // const canUpgradeSkill = useNewAlchemyStore(state => state.canUpgradeSkill); // 스킬 강화 시스템에서 직접 처리

  // 재료 개수를 세는 헬퍼 함수 (inventoryStore 기준)
  const getMaterialCount = (materialId: string): number => {
    return inventoryMaterials.reduce((count, material) => {
      if (material.id === materialId) return count + 1;
      return count;
    }, 0);
  };

  // 등급을 한글로 변환하는 함수
  const getRarityKoreanName = (rarity: string): string => {
    const rarityNames: Record<string, string> = {
      'common': '일반등급',
      'magic': '매직등급', 
      'rare': '레어등급',
      'unique': '유니크등급'
    };
    return rarityNames[rarity] || rarity;
  };

  // AlchemyMaterial을 Material로 변환
  const convertToMaterial = (alchemyMaterial: typeof alchemyMaterials[0]): Material => {
    // AlchemyMaterial rarity를 ItemRarity로 변환
    const rarityMapping: Record<string, GameItemRarity> = {
      'common': 'common',
      'uncommon': 'magic',
      'rare': 'rare', 
      'epic': 'rare',
      'legendary': 'unique'
    };
    
    return {
      id: alchemyMaterial.id,
      name: alchemyMaterial.name,
      description: alchemyMaterial.description,
      type: 'material' as const,
      weight: 0.1,
      icon: alchemyMaterial.icon,
      rarity: rarityMapping[alchemyMaterial.rarity] || 'common',
      effects: []
    };
  };

  // 포션 이름 변환 헬퍼 함수
  const getPotionDisplayName = (potionId: string): string => {
    // 기존 alchemyRecipes에서 찾기
    const oldRecipe = alchemyRecipes.find(recipe => recipe.result.id === potionId);
    if (oldRecipe) {
      return oldRecipe.result.name;
    }
    
    // newAlchemyRecipes에서 찾기
    const newRecipe = newAlchemyRecipes.find(recipe => 
      recipe.results.some(result => result.id === potionId)
    );
    if (newRecipe) {
      return newRecipe.name;
    }
    
    // 찾지 못한 경우 ID를 이름으로 변환
    return potionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // 등급별 최대 접사 개수 제한 함수
  const limitAffixesByRarity = (
    prefixes: ItemAffix[], 
    suffixes: ItemAffix[], 
    rarity: ItemRarity
  ): { prefixes: ItemAffix[], suffixes: ItemAffix[] } => {
    const rules = rarityAffixRules[rarity as keyof typeof rarityAffixRules];
    if (!rules) return { prefixes, suffixes };
    
    // 중복 제거 - affix의 이름으로 중복 체크
    const uniquePrefixes = prefixes.filter((prefix, index, self) =>
      index === self.findIndex(p => p.name === prefix.name)
    );
    const uniqueSuffixes = suffixes.filter((suffix, index, self) =>
      index === self.findIndex(s => s.name === suffix.name)
    );
    
    return {
      prefixes: uniquePrefixes.slice(0, rules.prefixes.max),
      suffixes: uniqueSuffixes.slice(0, rules.suffixes.max)
    };
  };

  // 사용 가능한 레시피들 가져오기 (카테고리 시스템으로 대체됨)

  const handleCraft = (recipeId: string) => {
    // 제작 전 재료 확인 및 소모
    const recipe = newAlchemyRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // 재료 보유 확인
    const canCraft = recipe.materials.every((mat) => 
      getMaterialCount(mat.id) >= mat.count
    );

    if (!canCraft) {
      console.log('재료 부족으로 제작 불가');
      return;
    }

    // inventoryStore에서 재료 소모
    recipe.materials.forEach(material => {
      for (let i = 0; i < material.count; i++) {
        removeMaterial(material.id);
      }
    });

    // 성공률 체크 (독립적으로)
    const isSuccess = Math.random() * 100 < recipe.successRate;
    
    if (isSuccess) {
      console.log('제작 성공!');
      
      // 성공 시 포션을 인벤토리에 추가
      if (recipe.results) {
        recipe.results.forEach(resultItem => {
          // count만큼 아이템 생성
          for (let i = 0; i < resultItem.count; i++) {
            // 기존 alchemyRecipes에서 포션 데이터 찾기
            let potionRecipe = alchemyRecipes.find(recipe => recipe.result.id === resultItem.id);
            
            // 새로운 시스템 레시피에서도 찾기
            if (!potionRecipe) {
              const newRecipe = newAlchemyRecipes.find(recipe => 
                recipe.results.some(result => result.id === resultItem.id)
              );
              
              if (newRecipe) {
                // newAlchemyRecipe를 기존 Recipe 형식으로 변환
                potionRecipe = {
                  id: newRecipe.id,
                  name: newRecipe.name,
                  materials: [],
                  result: {
                    id: resultItem.id,
                    name: newRecipe.name,
                    type: 'consumable' as const,
                    weight: 0.2,
                    description: newRecipe.description,
                    stats: {}
                  }
                };
              }
            }
            
            if (potionRecipe) {
              // 레시피에서 찾은 경우
              const potionItem: Item = {
                ...potionRecipe.result,
                originalId: resultItem.id,
                instanceId: `${resultItem.id}-${Date.now()}`,
              };
              addItem(potionItem);
            } else {
              // 찾지 못한 경우 기본 포션 생성
              const item: Item = {
                id: resultItem.id,
                name: resultItem.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                type: 'consumable',
                weight: 0.1,
                originalId: resultItem.id,
                description: `${resultItem.id} 포션`,
                instanceId: `${resultItem.id}-${Date.now()}`,
                rarity: 'common',
                stats: {},
              };
              addItem(item);
            }
          }
        });
      }

      setModalResult({ 
        success: true, 
        title: '성공', 
        message: '포션 제작이 완료되었습니다!' 
      });
      setShowResultModal(true);
      setTimeout(() => setShowResultModal(false), 2000);
    } else {
      console.log('제작 실패!');
      setModalResult({ 
        success: false, 
        title: '실패', 
        message: '포션 제작에 실패했습니다. 다시 시도해 주세요.' 
      });
      setShowResultModal(true);
      setTimeout(() => setShowResultModal(false), 2000);
    }
  };

  const handleUpgradeItem = (upgradeTo: ItemRarity) => {
    console.log('=== 강화 시작 ===');
    console.log('선택된 아이템 ID:', selectedUpgradeItemId);
    console.log('목표 등급:', upgradeTo);
    
    if (!selectedUpgradeItemId) {
      console.log('선택된 아이템 ID가 없습니다');
      return;
    }

    const selectedItem = inventoryItems.find(item => item.instanceId === selectedUpgradeItemId);
    console.log('찾은 아이템:', selectedItem);
    
    if (!selectedItem) {
      console.log('아이템을 찾을 수 없습니다');
      return;
    }
    
    // 재료 확인 및 소모 로직을 직접 구현
    const requirements = alchemyMaterials
      .slice(0, 3)
      .map(mat => ({ materialId: mat.id, count: 5 }));

    // 재료 충분한지 확인
    console.log('필요한 재료:', requirements);
    
    const canUpgrade = requirements.every(req => {
      const currentCount = getMaterialCount(req.materialId) || 0;
      const hasEnough = currentCount >= req.count;
      console.log(`재료 ${req.materialId}: ${currentCount}/${req.count}, 충족: ${hasEnough}`);
      return hasEnough;
    });

    if (!canUpgrade) {
      console.log('재료가 부족합니다');
      alert('강화에 필요한 재료가 부족합니다!');
      return;
    }

    // 성공률 계산 (75%)
    const successRate = 75;
    const isSuccess = Math.random() * 100 < successRate;

    // 재료 소모 (성공/실패 공통)
    // 실패 시에는 일부만 소모되도록 아래에서 처리
    requirements.forEach(req => {
      for (let i = 0; i < req.count; i++) {
        removeMaterial(req.materialId);
      }
    });

    if (isSuccess) {
      // 기존 속성 유지 업그레이드 로직
      let upgradedItem: GeneratedItem;
      
      if ('displayName' in selectedItem && 'rarity' in selectedItem) {
        // 이미 GeneratedItem인 경우 - 기존 접사 유지하면서 새로운 접사 추가
        const currentItem = selectedItem as GeneratedItem;
        
        // 새로운 접사를 위해 임시로 기본 아이템 생성
        const baseItem: Item = {
          id: currentItem.id,
          name: currentItem.name,
          type: currentItem.type,
          weight: currentItem.weight || 1,
          requiredLevel: currentItem.requiredLevel || 1,
          description: currentItem.description,
          icon: currentItem.icon,
          stats: currentItem.baseStats || {},
          instanceId: currentItem.instanceId
        };
        
        // 새로운 등급에 맞는 아이템 생성
        const newGeneratedItem = generateEnhancedItem(baseItem, upgradeTo as GameItemRarity);
        
        // 기존 접사와 새로운 접사 결합
        const combinedPrefixes = [...(currentItem.prefixes || []), ...(newGeneratedItem.prefixes || [])];
        const combinedSuffixes = [...(currentItem.suffixes || []), ...(newGeneratedItem.suffixes || [])];
        
        // 등급별 최대 접사 개수 제한 적용
        const limitedAffixes = limitAffixesByRarity(
          combinedPrefixes, 
          combinedSuffixes, 
          upgradeTo as ItemRarity
        );
        
        // 제한된 접사들의 스탯 재계산
        let limitedAffixStats: Record<string, number> = {};
        [...limitedAffixes.prefixes, ...limitedAffixes.suffixes].forEach(affix => {
          limitedAffixStats = combineStats(limitedAffixStats, affix.stats || {});
        });
        
        // 최종 스탯 계산 (기본 스탯 + 제한된 접사 스탯)
        const finalStats = combineStats(currentItem.baseStats || {}, limitedAffixStats);
        
        // 새로운 displayName 생성 (제한된 접사로)
        let newDisplayName = currentItem.name;
        if (limitedAffixes.prefixes.length > 0) {
          const prefixNames = limitedAffixes.prefixes.map(p => p.name).join(' ');
          newDisplayName = `${prefixNames} ${newDisplayName}`;
        }
        if (limitedAffixes.suffixes.length > 0) {
          const suffixNames = limitedAffixes.suffixes.map(s => s.name).join(' ');
          newDisplayName = `${newDisplayName} ${suffixNames}`;
        }
        
        upgradedItem = {
          ...currentItem,
          rarity: upgradeTo as GameItemRarity,
          prefixes: limitedAffixes.prefixes,
          suffixes: limitedAffixes.suffixes,
          affixStats: limitedAffixStats,
          stats: finalStats,
          displayName: newDisplayName,
          colorCode: rarityColors[upgradeTo as GameItemRarity],
          instanceId: selectedItem.instanceId
        };
        
      } else {
        // 기본 Item인 경우 - 새로운 GeneratedItem 생성
        const baseItem: Item = {
          id: selectedItem.id,
          name: selectedItem.name,
          type: selectedItem.type,
          weight: selectedItem.weight || 1,
          requiredLevel: selectedItem.requiredLevel || 1,
          description: selectedItem.description,
          icon: selectedItem.icon,
          stats: selectedItem.stats || {},
          instanceId: selectedItem.instanceId
        };
        
        upgradedItem = {
          ...generateEnhancedItem(baseItem, upgradeTo as GameItemRarity),
          instanceId: selectedItem.instanceId
        };
      }
      
      console.log('업그레이드 전:', selectedItem);
      console.log('업그레이드 후:', upgradedItem);
      
      // 인벤토리에서 기존 아이템을 제거하고 새 아이템을 추가합니다.
      removeItem(selectedUpgradeItemId);
      addItem(upgradedItem);

      // 이름 표시용 - displayName 우선 사용
      const beforeName = ('displayName' in selectedItem) ? selectedItem.displayName || selectedItem.name : selectedItem.name;
      const afterName = upgradedItem.displayName || upgradedItem.name;
      
      console.log(`${beforeName}을(를) ${afterName} (${upgradeTo} 등급)으로 업그레이드했습니다!`);
      
      // 모달 표시
      setModalResult({
        success: true,
        title: '업그레이드 성공!',
        message: `${beforeName} → ${afterName}`
      });
      setShowResultModal(true);
    } else {
      // 실패 시 일부 재료 손실 (30%)
      // 이미 위에서 모든 재료를 제거했으므로, 70%를 다시 돌려주는 방식으로 구현
      requirements.forEach(req => {
        const refundAmount = Math.floor(req.count * 0.7); // 70% 환급
        const material = alchemyMaterials.find(m => m.id === req.materialId);
        if (material) {
          for (let i = 0; i < refundAmount; i++) {
            addMaterial(convertToMaterial(material));
          }
        }
      });

      console.log(`${selectedItem.name} 업그레이드에 실패했습니다...`);
      
      // 모달 표시
      setModalResult({
        success: false,
        title: '업그레이드 실패',
        message: `${selectedItem.name} 업그레이드에 실패했습니다...`
      });
      setShowResultModal(true);
    }
  };

  // 스킬 강화는 이제 SkillEnhancementWorkshop에서 처리
  // const handleUpgradeSkill = (skillId: string, currentTier: number, useCatalyst = false) => {
  //   const result = upgradeSkill(skillId, currentTier, useCatalyst);
  //   console.log('Skill upgrade result:', result);
  // };

  return (
    <div className="simple-alchemy-container">
      <h2 className="simple-alchemy-title">연금술 작업대</h2>
      
      <div className="simple-tabs">
        <button 
          className={`simple-tab-button ${activeTab === 'craft' ? 'active' : ''}`}
          onClick={() => setActiveTab('craft')}
        >
          🧪 제작
        </button>
        <button 
          className={`simple-tab-button ${activeTab === 'upgrade-item' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrade-item')}
        >
          ⬆️ 아이템 강화
        </button>
        <button 
          className={`simple-tab-button ${activeTab === 'upgrade-skill' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrade-skill')}
        >
          🔧 스킬 강화
        </button>
      </div>

      <div className="simple-tab-content">
        {activeTab === 'craft' && (
          <div>
            <div className="materials-display">
              <h3 className="materials-title">보유 재료</h3>
              <div className="materials-grid-inventory-style">
                {alchemyMaterials.map(material => {
                  const count = getMaterialCount(material.id) || 0;
                  return (
                    <MaterialSlotWithTooltip
                      key={material.id}
                      material={convertToMaterial(material)}
                      count={count}
                    />
                  );
                })}
              </div>
            </div>

            {!selectedCategory ? (
              // 카테고리 선택 화면
              <div className="category-selection">
                <h3 className="category-title">제작할 포션 종류를 선택하세요</h3>
                <div className="category-grid">
                  {getPotionsByCategory(knownRecipes).map((category) => (
                    <div 
                      key={category.id}
                      className="category-card"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="category-icon">{category.icon}</div>
                      <h4 className="category-name">{category.name}</h4>
                      <p className="category-description">{category.description}</p>
                      <div className="category-recipes-count">
                        {category.recipes.length}개의 레시피
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 선택된 카테고리의 레시피들
              <div className="category-recipes">
                <div className="category-header">
                  <button 
                    className="back-button"
                    onClick={() => setSelectedCategory(null)}
                  >
                    ← 카테고리 선택으로 돌아가기
                  </button>
                  <h3>{getPotionsByCategory(knownRecipes).find(cat => cat.id === selectedCategory)?.name}</h3>
                </div>

                <div className="simple-recipe-grid">
                  {getPotionsByCategory(knownRecipes)
                    .find(cat => cat.id === selectedCategory)?.recipes
                    .map((recipe) => {
                      const canCraft = recipe.materials.every((mat) => 
                        (getMaterialCount(mat.id) || 0) >= mat.count
                      );

                      return (
                        <div 
                          key={recipe.id} 
                          className={`simple-recipe-card ${!canCraft ? 'unavailable' : ''}`}
                        >
                          <div className="recipe-header">
                            <h4 className="recipe-name">
                              {recipe.icon} {recipe.name}
                              {recipe.tier && (
                                <span className={`tier-badge tier-${recipe.tier}`}>
                                  {recipe.tier === 1 ? '작은' : recipe.tier === 2 ? '중간' : '대형'}
                                </span>
                              )}
                            </h4>
                          </div>
                          <p className="recipe-description">{recipe.description}</p>
                          
                          <div className="recipe-materials">
                            {recipe.materials.map((mat) => {
                              const material = alchemyMaterials.find(m => m.id === mat.id);
                              const hasEnough = (getMaterialCount(mat.id) || 0) >= mat.count;
                              
                              return (
                                <span 
                                  key={mat.id} 
                                  className={`material-tag ${!hasEnough ? 'insufficient' : ''}`}
                                >
                                  {material?.name || mat.id} x{mat.count}
                                </span>
                              );
                            })}
                          </div>

                          {recipe.results && (
                            <div className="recipe-effects">
                              {recipe.results.map((result, idx) => (
                                <div key={idx} className="effect-item">
                                  {getPotionDisplayName(result.id)} x{result.count}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="recipe-success-rate">
                            성공률: {recipe.successRate}%
                          </div>

                          <div className="action-buttons">
                            <button 
                              className="craft-button" 
                              disabled={!canCraft}
                              onClick={() => handleCraft(recipe.id)}
                            >
                              제작하기
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upgrade-item' && (
          <div>
            <div className="upgrade-section">
              <h3 className="upgrade-title">아이템 강화</h3>
              
              {!selectedUpgradeType ? (
                // 강화 타입 선택
                <div className="upgrade-type-selection">
                  <h4>강화할 등급을 선택하세요:</h4>
                  
                  {/* 테스트용 아이템 추가 버튼 */}
                  <div style={{marginBottom: '20px', padding: '10px', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px'}}>
                    <h5>테스트용 아이템 추가:</h5>
                    <button 
                      onClick={() => {
                        const testItem: Item = {
                          id: 'test-weapon-' + Date.now(),
                          instanceId: 'test-weapon-' + Date.now(),
                          name: '테스트 검',
                          type: 'weapon',
                          weight: 2.0,
                          rarity: 'common',
                          description: '테스트용 일반 무기',
                          stats: {}
                        };
                        addItem(testItem);
                        console.log('테스트 아이템 추가:', testItem);
                      }}
                      style={{margin: '5px', padding: '5px 10px'}}
                    >
                      일반 무기 추가
                    </button>
                    <button 
                      onClick={() => {
                        const testItem: Item = {
                          id: 'test-armor-' + Date.now(),
                          instanceId: 'test-armor-' + Date.now(),
                          name: '테스트 갑옷',
                          type: 'armor',
                          weight: 5.0,
                          rarity: 'magic',
                          description: '테스트용 매직 갑옷',
                          stats: {}
                        };
                        addItem(testItem);
                        console.log('테스트 아이템 추가:', testItem);
                      }}
                      style={{margin: '5px', padding: '5px 10px'}}
                    >
                      매직 갑옷 추가
                    </button>
                    <button 
                      onClick={() => {
                        // 테스트용 재료들 추가
                        const materials = ['essence-fragment', 'monster-blood', 'bone-dust'];
                        materials.forEach(matId => {
                          for(let i = 0; i < 10; i++) {
                            const material: Material = {
                              id: matId,
                              name: matId,
                              type: 'material',
                              weight: 0.1,
                              description: '테스트용 재료',
                              rarity: 'common',
                              effects: []
                            };
                            addMaterial(material);
                          }
                        });
                        console.log('테스트 재료 추가 완료');
                      }}
                      style={{margin: '5px', padding: '5px 10px'}}
                    >
                      재료 추가 (각 10개)
                    </button>
                    <button 
                      onClick={() => {
                        console.log('현재 인벤토리 아이템들:', inventoryItems);
                        console.log('현재 재료들:', inventoryMaterials);
                      }}
                      style={{margin: '5px', padding: '5px 10px'}}
                    >
                      인벤토리 확인
                    </button>
                  </div>

                  <div className="upgrade-type-buttons">
                    <button 
                      className="upgrade-type-button"
                      onClick={() => setSelectedUpgradeType('normal-to-magic')}
                    >
                      <div className="upgrade-type-info">
                        <span className="upgrade-type-name">일반 → 매직</span>
                        <span className="upgrade-type-desc">기본 아이템을 매직 등급으로</span>
                      </div>
                    </button>
                    <button 
                      className="upgrade-type-button"
                      onClick={() => setSelectedUpgradeType('magic-to-rare')}
                    >
                      <div className="upgrade-type-info">
                        <span className="upgrade-type-name">매직 → 레어</span>
                        <span className="upgrade-type-desc">매직 아이템을 레어 등급으로</span>
                      </div>
                    </button>
                    <button 
                      className="upgrade-type-button"
                      onClick={() => setSelectedUpgradeType('rare-to-unique')}
                    >
                      <div className="upgrade-type-info">
                        <span className="upgrade-type-name">레어 → 유니크</span>
                        <span className="upgrade-type-desc">레어 아이템을 유니크 등급으로</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : !selectedUpgradeItemId ? (
                // 아이템 선택
                <div className="item-selection">
                  <div className="selection-header">
                    <h4>
                      {selectedUpgradeType === 'normal-to-magic' && '일반등급 → 매직등급 강화할 아이템 선택'}
                      {selectedUpgradeType === 'magic-to-rare' && '매직등급 → 레어등급 강화할 아이템 선택'}
                      {selectedUpgradeType === 'rare-to-unique' && '레어등급 → 유니크등급 강화할 아이템 선택'}
                    </h4>
                    <button 
                      className="back-button"
                      onClick={() => setSelectedUpgradeType(null)}
                    >
                      ← 다른 등급 선택
                    </button>
                  </div>
                  
                  <div className="item-selection-container">
                    {(() => {
                      // 선택된 강화 타입에 맞는 아이템 필터링
                      const targetRarity = selectedUpgradeType === 'normal-to-magic' ? 'common' :
                                         selectedUpgradeType === 'magic-to-rare' ? 'magic' :
                                         selectedUpgradeType === 'rare-to-unique' ? 'rare' : null;
                      
                      console.log('=== 아이템 필터링 디버그 ===');
                      console.log('선택된 강화 타입:', selectedUpgradeType);
                      console.log('타겟 등급:', targetRarity);
                      console.log('전체 인벤토리 아이템:', inventoryItems);
                      console.log('아이템 개수:', inventoryItems.length);
                      console.log('중복 체크:', inventoryItems.map(item => `${item.name} (${item.instanceId})`));
                      
                      const availableItems = inventoryItems.filter(item => {
                        const itemRarity = item.rarity || 'common';
                        const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
                        const rarityMatch = itemRarity === targetRarity;
                        const matches = rarityMatch && isEquipment;
                        
                        console.log(`아이템: ${item.name} (ID: ${item.instanceId})`);
                        console.log(`- 아이템 등급: "${itemRarity}", 타겟 등급: "${targetRarity}", 등급 매치: ${rarityMatch}`);
                        console.log(`- 아이템 타입: ${item.type}, 장비인가: ${isEquipment}`);
                        console.log(`- 최종 매치: ${matches}`);
                        console.log('---');
                        return matches;
                      });
                      
                      console.log('필터링된 아이템:', availableItems);
                      
                      return availableItems.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {availableItems.map(item => (
                            <SelectableItem
                              key={item.instanceId}
                              item={item}
                              isSelected={selectedUpgradeItemId === item.instanceId}
                              onClick={() => setSelectedUpgradeItemId(item.instanceId || null)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="no-equipment-message">
                          해당 등급의 아이템이 인벤토리에 없습니다.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                // 강화 진행
                <div className="upgrade-confirmation">
                  <div className="materials-display">
                    <h4>강화할 아이템:</h4>
                    {(() => {
                      const selectedItem = inventoryItems.find(item => item.instanceId === selectedUpgradeItemId);
                      if (!selectedItem) return <div className="no-item-selected">선택된 아이템이 없습니다.</div>;
                      
                      return (
                        <UpgradeItemSlot 
                          item={selectedItem}
                          onCancel={() => setSelectedUpgradeItemId(null)}
                        />
                      );
                    })()}
                  </div>
                  
                  <div className="upgrade-grid">
                    {(() => {
                      const selectedItem = inventoryItems.find(item => item.instanceId === selectedUpgradeItemId);
                      if (!selectedItem) return null;
                      
                      const fromRarity = selectedItem.rarity || 'common';
                      const toRarity = selectedUpgradeType === 'normal-to-magic' ? 'magic' :
                                     selectedUpgradeType === 'magic-to-rare' ? 'rare' :
                                     selectedUpgradeType === 'rare-to-unique' ? 'unique' : null;
                      
                      if (!toRarity) return null;

                      const requirements = alchemyMaterials
                        .slice(0, 3)
                        .map(mat => ({ materialId: mat.id, count: 5 }));

                      // 재료 충족 여부만 확인 (기존 canUpgradeItem은 너무 복잡)
                      const canUpgrade = requirements.every(req => {
                        const currentCount = getMaterialCount(req.materialId) || 0;
                        return currentCount >= req.count;
                      });

                      return (
                        <div className="upgrade-card">
                          <div className="upgrade-type">
                            {getRarityKoreanName(fromRarity)} → {getRarityKoreanName(toRarity)}
                          </div>
                          
                          <div className="upgrade-requirements">
                            <h4>필요 재료:</h4>
                            <div className="requirements-grid">
                              {requirements.map(req => {
                                const material = alchemyMaterials.find(m => m.id === req.materialId);
                                const hasEnough = (getMaterialCount(req.materialId) || 0) >= req.count;
                                const currentCount = getMaterialCount(req.materialId) || 0;
                                
                                return (
                                  <div key={req.materialId} className="requirement-slot">
                                    <div className={`requirement-item-display ${!hasEnough ? 'insufficient' : ''}`}>
                                      <div className="requirement-icon">
                                        {material?.icon || '🧪'}
                                      </div>
                                      <div className="requirement-info">
                                        <div className="requirement-name">{material?.name}</div>
                                        <div className={`requirement-count ${!hasEnough ? 'text-red-400' : 'text-green-400'}`}>
                                          {currentCount} / {req.count}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="upgrade-success-rate">성공률: 75%</div>

                          <div className="action-buttons">
                            <button 
                              className="upgrade-button"
                              disabled={!canUpgrade}
                              onClick={() => {
                                console.log('강화 버튼 클릭!');
                                console.log('toRarity:', toRarity);
                                console.log('강화 가능 상태:', canUpgrade);
                                console.log('필요 재료:', requirements.map(req => ({
                                  material: req.materialId,
                                  needed: req.count,
                                  have: getMaterialCount(req.materialId) || 0
                                })));
                                console.log('canUpgrade:', canUpgrade);
                                handleUpgradeItem(toRarity);
                              }}
                            >
                              강화하기
                            </button>
                            <button 
                              className="cancel-button"
                              onClick={() => setSelectedUpgradeItemId(null)}
                            >
                              다른 아이템 선택
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'upgrade-skill' && (
          <SkillEnhancementWorkshop />
        )}
      </div>

      {lastCraftResult && (
        <div className="materials-display">
          <h4>결과: {lastCraftResult}</h4>
        </div>
      )}

      {/* 업그레이드 결과 모달 */}
      {showResultModal && modalResult && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modalResult.success ? 'success' : 'failure'}`}>
              <h3>{modalResult.title}</h3>
            </div>
            <div className="modal-body">
              <p>{modalResult.message}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button"
                onClick={() => {
                  setShowResultModal(false);
                  // 모달을 닫을 때만 상태 초기화 (성공한 경우)
                  if (modalResult.success) {
                    setSelectedUpgradeItemId(null);
                    setSelectedUpgradeType(null);
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlchemyWorkshop;