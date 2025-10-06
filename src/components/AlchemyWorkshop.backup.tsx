import React, { useState } from 'react';
import { useNewAlchemyStore } from '../stores/newAlchemyStore';
import { alchemyMaterials, skillUpgradeRequirements } from '../data/alchemyMaterials';
import type { ItemRarity } from '../stores/newAlchemyStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useGameStore } from '../store/gameStore';
import type { Item, Material } from '../types/gameTypes';
import { alchemyRecipes } from '../data/alchemyRecipes';
import './AlchemyWorkshop.stable.css';

const AlchemyWorkshop: React.FC = () => {
  const {
    craftPotion,
    upgradeSkill,
    getAvailableRecipes,
    lastCraftResult
  } = useNewAlchemyStore();

  const { materials: inventoryMaterials, addItem, items: inventoryItems, removeMaterial, removeItem, addMaterial } = useInventoryStore();
  const { learnedSkills } = useGameStore();

  const [activeTab, setActiveTab] = useState<'craft' | 'upgrade-item' | 'upgrade-skill'>('craft');
  const [selectedUpgradeType, setSelectedUpgradeType] = useState<'normal-to-magic' | 'magic-to-rare' | 'rare-to-unique' | null>(null);
  const [selectedUpgradeItemId, setSelectedUpgradeItemId] = useState<string | null>(null);

  // subscribe directly to equipment and skills so UI updates reactively
  const canUpgradeItem = useNewAlchemyStore(state => state.canUpgradeItem);
  const canUpgradeSkill = useNewAlchemyStore(state => state.canUpgradeSkill);

  // 재료 개수를 세는 헬퍼 함수 (inventoryStore의 materials 배열에서)
  const getMaterialCount = (materialId: string) => {
    return inventoryMaterials.filter(m => m.id === materialId).length;
  };

  // 사용 가능한 레시피들 가져오기
  const availableRecipes = getAvailableRecipes();

  const handleCraft = (recipeId: string) => {
    const result = craftPotion(recipeId);
    console.log('Craft result:', result);
    
    // 성공 시 포션을 인벤토리에 추가
    if (result && result.success && result.results) {
      result.results.forEach(resultItem => {
        // count만큼 아이템 생성
        for (let i = 0; i < resultItem.count; i++) {
          // alchemyRecipes에서 포션 데이터 찾기
          const potionRecipe = alchemyRecipes.find(recipe => recipe.result.id === resultItem.id);
          
          if (potionRecipe) {
            // 기존 레시피에서 찾은 경우
            const potionItem: Item = {
              ...potionRecipe.result,
              originalId: resultItem.id
            };
            addItem(potionItem);
          } else {
            // 찾지 못한 경우 기본 포션 생성
            const item: Item = {
              id: resultItem.id,
              name: resultItem.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // ID를 이름으로 변환
              type: 'consumable',
              weight: 0.1,
              originalId: resultItem.id,
              description: `${resultItem.id} 포션`
            };
            addItem(item);
          }
        }
      });
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

    if (isSuccess) {
      // 재료 소모
      requirements.forEach(req => {
        for (let i = 0; i < req.count; i++) {
          removeMaterial(req.materialId);
        }
      });

      // 기존 아이템 제거
      removeItem(selectedUpgradeItemId);

      // 새로운 등급의 아이템 추가
      const upgradedItem: Item = Object.assign({}, selectedItem, {
        rarity: upgradeTo,
        name: selectedItem.name.replace(/\[.*\]/, '').trim() + ` [${upgradeTo}]`
      });
      addItem(upgradedItem);

      console.log(`${selectedItem.name}을(를) ${upgradeTo} 등급으로 업그레이드했습니다!`);
      alert(`${selectedItem.name}을(를) ${upgradeTo} 등급으로 업그레이드 성공!`);
      
      // 상태 초기화
      setSelectedUpgradeItemId(null);
      setSelectedUpgradeType(null);
    } else {
      // 실패 시 일부 재료 손실 (30%)
      requirements.forEach(req => {
        const lossAmount = Math.ceil(req.count * 0.3);
        for (let i = 0; i < lossAmount; i++) {
          removeMaterial(req.materialId);
        }
      });

      console.log(`${selectedItem.name} 업그레이드에 실패했습니다...`);
      alert(`${selectedItem.name} 업그레이드에 실패했습니다...`);
    }
  };

  const handleUpgradeSkill = (skillId: string, currentTier: number, useCatalyst = false) => {
    const result = upgradeSkill(skillId, currentTier, useCatalyst);
    console.log('Skill upgrade result:', result);
  };

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
              <div className="materials-grid">
                {alchemyMaterials.map(material => (
                  <div key={material.id} className="material-item">
                    <span className="material-name">{material.name}</span>
                    <span className="material-count">{getMaterialCount(material.id) || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="simple-recipe-grid">
              {availableRecipes.map((recipe) => {
                const canCraft = recipe.materials.every((mat) => 
                  (getMaterialCount(mat.id) || 0) >= mat.count
                );

                return (
                  <div 
                    key={recipe.id} 
                    className={`simple-recipe-card ${!canCraft ? 'unavailable' : ''}`}
                  >
                    <h4 className="recipe-name">{recipe.name}</h4>
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
                            {result.type}: {result.id} x{result.count}
                          </div>
                        ))}
                      </div>
                    )}

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

            {availableRecipes.length === 0 && (
              <div className="no-recipes-message">
                아직 발견된 레시피가 없습니다. 몬스터를 처치해서 레시피를 발견해보세요!
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
                          description: '테스트용 일반 무기'
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
                          description: '테스트용 매직 갑옷'
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
                              description: '테스트용 재료'
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
                      {selectedUpgradeType === 'normal-to-magic' && '일반 등급 아이템 선택'}
                      {selectedUpgradeType === 'magic-to-rare' && '매직 등급 아이템 선택'}
                      {selectedUpgradeType === 'rare-to-unique' && '레어 등급 아이템 선택'}
                    </h4>
                    <button 
                      className="back-button"
                      onClick={() => setSelectedUpgradeType(null)}
                    >
                      ← 다른 등급 선택
                    </button>
                  </div>
                  
                  <div className="materials-grid">
                    {(() => {
                      // 선택된 강화 타입에 맞는 아이템 필터링
                      const targetRarity = selectedUpgradeType === 'normal-to-magic' ? 'common' :
                                         selectedUpgradeType === 'magic-to-rare' ? 'magic' :
                                         selectedUpgradeType === 'rare-to-unique' ? 'rare' : null;
                      
                      console.log('=== 아이템 필터링 디버그 ===');
                      console.log('선택된 강화 타입:', selectedUpgradeType);
                      console.log('타겟 등급:', targetRarity);
                      console.log('전체 인벤토리 아이템:', inventoryItems);
                      
                      const availableItems = inventoryItems.filter(item => {
                        const itemRarity = item.rarity || 'common';
                        const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
                        const rarityMatch = itemRarity === targetRarity;
                        const matches = rarityMatch && isEquipment;
                        
                        console.log(`아이템: ${item.name}`);
                        console.log(`- 아이템 등급: "${itemRarity}", 타겟 등급: "${targetRarity}", 등급 매치: ${rarityMatch}`);
                        console.log(`- 아이템 타입: ${item.type}, 장비인가: ${isEquipment}`);
                        console.log(`- 최종 매치: ${matches}`);
                        console.log('---');
                        return matches;
                      });
                      
                      console.log('필터링된 아이템:', availableItems);
                      
                      return availableItems.length > 0 ? availableItems.map(item => {
                        const rarity = item.rarity || 'common';
                        const rarityColors: Record<string, string> = {
                          common: '#a0aec0',
                          magic: '#667eea', 
                          rare: '#6666ff',
                          unique: '#ffa500'
                        };
                        const rarityNames: Record<string, string> = {
                          common: '일반',
                          magic: '매직',
                          rare: '레어', 
                          unique: '유니크'
                        };
                        
                        return (
                          <button
                            key={item.instanceId}
                            className={`material-item ${selectedUpgradeItemId === item.instanceId ? 'selected' : ''}`}
                            onClick={() => setSelectedUpgradeItemId(item.instanceId!)}
                            title={`${item.name} [${rarityNames[rarity]}]${item.description ? '\n' + item.description : ''}`}
                            style={{
                              borderColor: selectedUpgradeItemId === item.instanceId ? rarityColors[rarity] : undefined
                            }}
                          >
                            <div className="equipment-details">
                              <span 
                                className="equipment-name" 
                                style={{ color: rarityColors[rarity] }}
                              >
                                {item.name} [{rarityNames[rarity]}]
                              </span>
                              <span className={`equipment-rarity ${rarity}`}>{item.type}</span>
                            </div>
                            {selectedUpgradeItemId === item.instanceId && <span className="selected-indicator">✓</span>}
                          </button>
                        );
                      }) : (
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
                    <h4>강화할 아이템: {inventoryItems.find(item => item.instanceId === selectedUpgradeItemId)?.name}</h4>
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

                      const canUpgrade = canUpgradeItem(fromRarity as ItemRarity, toRarity as ItemRarity);

                      return (
                        <div className="upgrade-card">
                          <div className="upgrade-type">
                            {fromRarity} → {toRarity}
                          </div>
                          
                          <div className="upgrade-requirements">
                            <h4>필요 재료:</h4>
                            {requirements.map(req => {
                              const material = alchemyMaterials.find(m => m.id === req.materialId);
                              const hasEnough = (getMaterialCount(req.materialId) || 0) >= req.count;
                              
                              return (
                                <div key={req.materialId} className="requirement-item">
                                  <span className="requirement-name">{material?.name}</span>
                                  <span className={`requirement-amount ${!hasEnough ? 'insufficient' : ''}`}>
                                    {getMaterialCount(req.materialId) || 0} / {req.count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="upgrade-success-rate">성공률: 75%</div>

                          <div className="action-buttons">
                            <button 
                              className="upgrade-button"
                              disabled={!canUpgrade}
                              onClick={() => {
                                console.log('강화 버튼 클릭!');
                                console.log('toRarity:', toRarity);
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
          <div>
            <div className="upgrade-section">
              <h3 className="upgrade-title">스킬 강화</h3>
              
              <div className="upgrade-grid">
                {learnedSkills.slice(0, 3).map((skill, index) => {
                  const currentTier = index + 1; // 간단하게 인덱스로 티어 표시
                  const canUpgrade = canUpgradeSkill(currentTier);

                  const tierKey = `skill-tier-${currentTier}` as keyof typeof skillUpgradeRequirements;
                  const reqObj = skillUpgradeRequirements[tierKey];
                  const requirements = reqObj ? reqObj.materials : [];

                  return (
                    <div key={skill.id} className="upgrade-card">
                      <div className="upgrade-type">
                        {skill.name} 티어 {currentTier} → {currentTier + 1}
                      </div>
                      
                      <div className="upgrade-requirements">
                        <h4>필요 재료:</h4>
                        {requirements.map((req, idx) => {
                          const material = alchemyMaterials.find(m => m.id === req.id);
                          const materialId = req.id;
                          const hasEnough = (getMaterialCount(materialId) || 0) >= req.count;
                          
                          return (
                            <div key={idx} className="requirement-item">
                              <span className="requirement-name">{material?.name || materialId}</span>
                              <span className={`requirement-amount ${!hasEnough ? 'insufficient' : ''}`}>
                                {getMaterialCount(materialId) || 0} / {req.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="upgrade-success-rate">성공률: {reqObj ? reqObj.successRate : 0}%</div>

                      <button 
                        className="upgrade-button"
                        disabled={!canUpgrade}
                        onClick={() => handleUpgradeSkill(skill.id, currentTier)}
                      >
                        업그레이드
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {lastCraftResult && (
        <div className="materials-display">
          <h4>결과: {lastCraftResult}</h4>
        </div>
      )}
    </div>
  );
};

export default AlchemyWorkshop;