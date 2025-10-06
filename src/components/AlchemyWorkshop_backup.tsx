// 새로운 단순한 연금술 워크샵 컴포넌트
export { default } from './SimpleAlchemyWorkshop';
import React, { useState } from 'react';
import { useAlchemyStore } from '../stores/alchemyStore';
import { useAdvancedAlchemyStore } from '../stores/advancedAlchemyStore';
import { useInventoryStore } from '../store/inventoryStore';
import { alchemySpecializations, alchemyEquipment, alchemyResearches, experimentTypes } from '../data/alchemyAdvanced';
import './AlchemyWorkshop_new.css';

// 재료 ID를 실제 이름으로 변환하는 헬퍼 함수
const getMaterialName = (materialId: string) => {
  switch (materialId) {
    case 'mat-1': return '붉은 허브';
    case 'mat-2': return '파란 크리스탈';
    case 'mat-3': return '황금 가루';
    default: return materialId;
  }
};

// 아이콘 헬퍼 함수들
const getSpecializationIcon = (specId: string) => {
  switch (specId) {
    case 'battle': return '⚔️';
    case 'healing': return '🏥';
    case 'enhancement': return '✨';
    case 'transmutation': return '🔄';
    default: return '🧪';
  }
};

const getEquipmentIcon = (equipmentId: string) => {
  switch (equipmentId) {
    case 'cauldron-basic': case 'cauldron-advanced': case 'cauldron-master': return '🏺';
    case 'flame-basic': case 'flame-advanced': case 'flame-master': return '🔥';
    case 'table-basic': case 'table-advanced': case 'table-master': return '📋';
    case 'kit-basic': case 'kit-advanced': case 'kit-master': return '🧰';
    default: return '🔧';
  }
};

const getRecipeIcon = (recipeId: string) => {
  if (recipeId.includes('potion')) return '🧪';
  if (recipeId.includes('elixir')) return '🍶';
  if (recipeId.includes('scroll')) return '📜';
  if (recipeId.includes('crystal')) return '💎';
  if (recipeId.includes('powder')) return '✨';
  return '🔬';
};

const getMaterialIcon = (materialId: string) => {
  switch (materialId) {
    case 'mat-1': return '🌿';  // 붉은 허브
    case 'mat-2': return '💎';  // 파란 크리스탈
    case 'mat-3': return '✨';  // 황금 가루
    default: return '📦';
  }
};

const getResearchIcon = (researchId: string) => {
  switch (researchId) {
    case 'advanced-brewing': return '🧪';
    case 'elemental-fusion': return '🌟';
    case 'crystal-resonance': return '💎';
    case 'herb-mastery': return '🌿';
    case 'alchemical-theory': return '📚';
    default: return '🔬';
  }
};

const AlchemyWorkshop: React.FC = () => {
  const {
    level: basicLevel,
    experience: basicExp,
    getAvailableRecipes,
    attemptCrafting
  } = useAlchemyStore();

  const {
    level: advancedLevel,
    experience: advancedExp,
    specialization,
    completedResearches,
    knownRecipes,
    ownedEquipment,
    activeEquipment,
    totalCrafted,
    successfulCrafts,
    masterworksCrafted,
    selectSpecialization,
    purchaseEquipment,
    activateEquipment,
    deactivateEquipment,
    attemptExperiment,
    completeResearch,
    getAllAvailableRecipes,
    calculateSuccessRate,
    getEquipmentBonuses
  } = useAdvancedAlchemyStore();

  const { materials } = useInventoryStore();
  
  // 재료 상태 변화에 따른 실시간 업데이트를 위한 변수들
  const materialCounts = materials.reduce((acc, material) => {
    acc[material.id] = (acc[material.id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<string>('normal');
  const [craftingResult, setCraftingResult] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ x: number; y: number; content: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'craft' | 'equipment' | 'research' | 'stats'>('craft');

  // 기본 + 고급 레시피 목록
  const basicRecipes = getAvailableRecipes();
  const advancedRecipes = getAllAvailableRecipes();
  const allRecipes = [...basicRecipes, ...advancedRecipes];
  
  const selectedRecipe = selectedRecipeId ? 
    allRecipes.find(r => r.id === selectedRecipeId) : null;

  const handleCraft = () => {
    if (!selectedRecipeId) return;
    
    let result;
    const isAdvancedRecipe = advancedRecipes.some(r => r.id === selectedRecipeId);
    
    if (isAdvancedRecipe) {
      result = attemptExperiment(selectedRecipeId, selectedExperiment);
    } else {
      result = attemptCrafting(selectedRecipeId);
    }
    
    setCraftingResult(result.message);
    
    setTimeout(() => {
      setCraftingResult(null);
    }, 3000);
  };

  const showTooltip = (event: React.MouseEvent, content: string) => {
    setHoveredItem({
      x: event.clientX + 10,
      y: event.clientY + 10,
      content
    });
  };

  const hideTooltip = () => {
    setHoveredItem(null);
  };

  const getSpecializationTooltip = (spec: {name: string, description: string, bonuses: {[key: string]: number | string | string[]}, unlockLevel: number}) => {
    return `${spec.name}\n${spec.description}\n\n보너스:\n${Object.entries(spec.bonuses)
      .map(([key, value]) => `• ${key}: +${value}${typeof value === 'number' ? '%' : ''}`)
      .join('\n')}\n\n필요 레벨: ${spec.unlockLevel}`;
  };

  const getEquipmentTooltip = (equipment: {name: string, description: string, effects: {[key: string]: number | string | string[]}, cost: number, requiredLevel: number}) => {
    return `${equipment.name}\n${equipment.description}\n\n효과:\n${Object.entries(equipment.effects)
      .map(([key, value]) => `• ${key}: +${value}${typeof value === 'number' ? '%' : ''}`)
      .join('\n')}\n\n가격: ${equipment.cost} 골드\n필요 레벨: ${equipment.requiredLevel}`;
  };

  const getRecipeTooltip = (recipe: {id: string, name: string, description: string, requiredMaterials: Array<{materialId: string, count: number}>, difficulty: string}) => {
    const successRate = calculateSuccessRate(recipe.id, selectedExperiment);
    return `${recipe.name}\n${recipe.description}\n\n필요 재료:\n${recipe.requiredMaterials
      .map((mat: {materialId: string, count: number}) => `• ${getMaterialName(mat.materialId)} x${mat.count}`)
      .join('\n')}\n\n성공률: ${successRate}%\n난이도: ${recipe.difficulty}`;
  };

  const currentSpecialization = specialization ? 
    alchemySpecializations.find(s => s.id === specialization) : null;
  const equipmentBonuses = getEquipmentBonuses();

  return (
    <div className="alchemy-workshop">
      <div className="workshop-header">
        <h2>🧪 연금술 작업실</h2>
        <div className="alchemy-status">
          <div className="level-display">
            <span className="level-badge">기본 Lv.{basicLevel}</span>
            <span className="level-badge advanced">고급 Lv.{advancedLevel}</span>
          </div>
          <div className="exp-bars">
            <div className="exp-bar">
              <span>기본 경험치: {basicExp}</span>
              <div className="exp-fill" style={{ width: `${(basicExp % 100)}%` }}></div>
            </div>
            <div className="exp-bar">
              <span>고급 경험치: {advancedExp}</span>
              <div className="exp-fill advanced" style={{ width: `${(advancedExp % 150)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="workshop-tabs">
        <button 
          className={`tab-btn ${activeTab === 'craft' ? 'active' : ''}`}
          onClick={() => setActiveTab('craft')}
        >
          🧪 제작
        </button>
        <button 
          className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          ⚗️ 장비
        </button>
        <button 
          className={`tab-btn ${activeTab === 'research' ? 'active' : ''}`}
          onClick={() => setActiveTab('research')}
        >
          📚 연구
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 통계
        </button>
      </div>

      <div className="workshop-content">
        {activeTab === 'craft' && (
          <div className="craft-panel">
            <div className="left-panel">
              {/* 특화 정보 */}
              {currentSpecialization && (
                <div className="specialization-info">
                  <h3>🎯 현재 특화</h3>
                  <div 
                    className="specialization-card active"
                    onMouseEnter={(e) => showTooltip(e, getSpecializationTooltip(currentSpecialization))}
                    onMouseLeave={hideTooltip}
                  >
                    <span className="spec-icon">{getSpecializationIcon(currentSpecialization.id)}</span>
                    <div className="spec-info">
                      <span className="spec-name">{currentSpecialization.name}</span>
                      <span className="spec-level">Lv.{advancedLevel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 활성 장비 */}
              <div className="active-equipment">
                <h3>⚗️ 활성 장비</h3>
                <div className="equipment-grid">
                  {activeEquipment.map(equipId => {
                    const equipment = alchemyEquipment.find(e => e.id === equipId);
                    return equipment ? (
                      <div 
                        key={equipId}
                        className="equipment-slot active"
                        onMouseEnter={(e) => showTooltip(e, getEquipmentTooltip(equipment))}
                        onMouseLeave={hideTooltip}
                      >
                        <span className="equipment-icon">⚗️</span>
                        <span className="equipment-name">{equipment.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* 장비 보너스 */}
              <div className="bonuses-display">
                <h3>📈 현재 보너스</h3>
                <div className="bonus-list">
                  <div className="bonus-item">
                    <span>성공률: +{equipmentBonuses.successRateBonus}%</span>
                  </div>
                  <div className="bonus-item">
                    <span>경험치: +{equipmentBonuses.expBonus}%</span>
                  </div>
                  <div className="bonus-item">
                    <span>품질: +{equipmentBonuses.qualityBonus}%</span>
                  </div>
                </div>
              </div>

              {/* 재료 인벤토리 */}
              <div className="materials-section">
                <h3>🧰 보유 재료</h3>
                <div className="materials-grid">
                  {materials.map((material, index) => (
                    <div 
                      key={`material-${material.id}-${index}`} 
                      className="material-slot"
                      onMouseEnter={(e) => showTooltip(e, `${material.name}\n${material.description}`)}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="material-icon">{getMaterialIcon(material.id)}</span>
                      <span className="material-name">{material.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="center-panel">
              {/* 레시피 목록 */}
              <div className="recipe-section">
                <h3>📜 사용 가능한 레시피</h3>
                <div className="recipe-grid">
                  {allRecipes.map(recipe => {
                    const canCraft = recipe.requiredMaterials.every(required => {
                      const ownedCount = materialCounts[required.materialId] || 0;
                      return ownedCount >= required.count;
                    });
                    
                    const isAdvanced = advancedRecipes.some(r => r.id === recipe.id);
                    
                    return (
                      <div 
                        key={recipe.id}
                        className={`recipe-slot ${selectedRecipeId === recipe.id ? 'selected' : ''} ${
                          !canCraft ? 'disabled' : ''
                        } ${isAdvanced ? 'advanced' : 'basic'}`}
                        onClick={() => setSelectedRecipeId(recipe.id)}
                        onMouseEnter={(e) => showTooltip(e, getRecipeTooltip(recipe))}
                        onMouseLeave={hideTooltip}
                      >
                        <span className="recipe-icon">
                          {getRecipeIcon(recipe.id)}
                        </span>
                        <div className="recipe-info">
                          <span className="recipe-name">{recipe.name}</span>
                          <span className="recipe-difficulty">{
                            recipe.difficulty === 'basic' ? '초급' : 
                            recipe.difficulty === 'intermediate' ? '중급' : 
                            recipe.difficulty === 'advanced' ? '고급' : '마스터'
                          }</span>
                        </div>
                        {isAdvanced && <span className="advanced-badge">고급</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="right-panel">
              {/* 선택된 레시피 정보 */}
              {selectedRecipe ? (
                <div className="recipe-details">
                  <h3>🔬 제작 상세</h3>
                  <div className="recipe-header">
                    <span className="recipe-icon-large">
                      {getRecipeIcon(selectedRecipe.id)}
                    </span>
                    <div className="recipe-title">
                      <h4>{selectedRecipe.name}</h4>
                      <p>{selectedRecipe.description}</p>
                    </div>
                  </div>

                  <div className="required-materials">
                    <h4>필요 재료</h4>
                    {selectedRecipe.requiredMaterials.map(material => {
                      const ownedCount = materialCounts[material.materialId] || 0;
                      const hasEnough = ownedCount >= material.count;
                      
                      return (
                        <div 
                          key={material.materialId} 
                          className={`material-requirement ${hasEnough ? 'sufficient' : 'insufficient'}`}
                        >
                          <span className="material-icon">
                            {getMaterialIcon(material.materialId)}
                          </span>
                          <span className="material-name">{getMaterialName(material.materialId)}</span>
                          <span className="material-count">
                            {ownedCount} / {material.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 실험 옵션 (고급 레시피인 경우) */}
                  {advancedRecipes.some(r => r.id === selectedRecipe.id) && (
                    <div className="experiment-options">
                      <h4>실험 유형</h4>
                      {experimentTypes
                        .filter(exp => advancedLevel >= exp.minLevel)
                        .map(expType => (
                          <label key={expType.id} className="experiment-option">
                            <input
                              type="radio"
                              name="experiment"
                              value={expType.id}
                              checked={selectedExperiment === expType.id}
                              onChange={(e) => setSelectedExperiment(e.target.value)}
                            />
                            <span className="experiment-name">{expType.name}</span>
                          </label>
                        ))}
                    </div>
                  )}

                  <div className="craft-info">
                    <div className="success-rate">
                      성공률: {calculateSuccessRate(selectedRecipe.id, selectedExperiment)}%
                    </div>
                  </div>

                  <button 
                    className="craft-btn"
                    onClick={handleCraft}
                    disabled={!selectedRecipe.requiredMaterials.every(required => {
                      const ownedCount = materialCounts[required.materialId] || 0;
                      return ownedCount >= required.count;
                    })}
                  >
                    {selectedRecipe.requiredMaterials.every(required => {
                      const ownedCount = materialCounts[required.materialId] || 0;
                      return ownedCount >= required.count;
                    }) ? '🧪 제작하기' : '❌ 재료 부족'}
                  </button>
                </div>
              ) : (
                <div className="no-recipe-selected">
                  <p>레시피를 선택해주세요</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="equipment-panel">
            <div className="equipment-shop">
              <h3>🛒 장비 상점</h3>
              <div className="equipment-list">
                {alchemyEquipment
                  .filter(eq => !ownedEquipment.includes(eq.id) && advancedLevel >= eq.requiredLevel)
                  .map(equipment => (
                    <div 
                      key={equipment.id} 
                      className="equipment-shop-item"
                      onMouseEnter={(e) => showTooltip(e, getEquipmentTooltip(equipment))}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="equipment-icon">{getEquipmentIcon(equipment.id)}</span>
                      <div className="equipment-info">
                        <span className="equipment-name">{equipment.name}</span>
                        <span className="equipment-cost">{equipment.cost} 골드</span>
                      </div>
                      <button 
                        className="purchase-btn"
                        onClick={() => purchaseEquipment(equipment.id)}
                      >
                        구매
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="owned-equipment">
              <h3>📦 보유 장비</h3>
              <div className="equipment-inventory">
                {ownedEquipment.map(equipId => {
                  const equipment = alchemyEquipment.find(e => e.id === equipId);
                  const isActive = activeEquipment.includes(equipId);
                  
                  return equipment ? (
                    <div 
                      key={equipId} 
                      className={`equipment-item ${isActive ? 'active' : ''}`}
                      onMouseEnter={(e) => showTooltip(e, getEquipmentTooltip(equipment))}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="equipment-icon">{getEquipmentIcon(equipment.id)}</span>
                      <span className="equipment-name">{equipment.name}</span>
                      <button 
                        className="toggle-btn"
                        onClick={() => isActive ? deactivateEquipment(equipId) : activateEquipment(equipId)}
                      >
                        {isActive ? '비활성' : '활성화'}
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {!specialization && (
              <div className="specialization-selection">
                <h3>🎯 특화 분야 선택</h3>
                <div className="specialization-grid">
                  {alchemySpecializations
                    .filter(spec => advancedLevel >= spec.unlockLevel)
                    .map(spec => (
                      <div 
                        key={spec.id} 
                        className="specialization-option"
                        onClick={() => selectSpecialization(spec.id)}
                        onMouseEnter={(e) => showTooltip(e, getSpecializationTooltip(spec))}
                        onMouseLeave={hideTooltip}
                      >
                        <span className="spec-icon">{getSpecializationIcon(spec.id)}</span>
                        <div className="spec-details">
                          <span className="spec-name">{spec.name}</span>
                          <span className="spec-desc">{spec.description}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="research-panel">
            <h3>📚 연구 진행</h3>
            <div className="research-list">
              {alchemyResearches
                .filter(research => advancedLevel >= research.requirements.level)
                .map(research => {
                  const isCompleted = completedResearches.includes(research.id);
                  
                  return (
                    <div 
                      key={research.id} 
                      className={`research-item ${isCompleted ? 'completed' : ''}`}
                      onMouseEnter={(e) => showTooltip(e, 
                        `${research.name}\n${research.description}\n\n보상:\n${research.rewards.newRecipes?.map(r => `• ${r}`).join('\n') || '• 특별 능력 해금'}`
                      )}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="research-icon">{getResearchIcon(research.id)}</span>
                      <div className="research-info">
                        <h4>{research.name}</h4>
                        <p>{research.description}</p>
                      </div>
                      {!isCompleted && (
                        <button 
                          className="research-btn"
                          onClick={() => completeResearch(research.id)}
                        >
                          연구 완료
                        </button>
                      )}
                      {isCompleted && <span className="completed-badge">✅</span>}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-panel">
            <h3>📊 연금술 통계</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🧪</span>
                <div className="stat-info">
                  <span className="stat-value">{totalCrafted}</span>
                  <span className="stat-label">총 제작</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <div className="stat-info">
                  <span className="stat-value">{successfulCrafts}</span>
                  <span className="stat-label">성공 제작</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💎</span>
                <div className="stat-info">
                  <span className="stat-value">{masterworksCrafted}</span>
                  <span className="stat-label">걸작 제작</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📜</span>
                <div className="stat-info">
                  <span className="stat-value">{knownRecipes.length}</span>
                  <span className="stat-label">보유 레시피</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📈</span>
                <div className="stat-info">
                  <span className="stat-value">
                    {totalCrafted > 0 ? ((successfulCrafts / totalCrafted) * 100).toFixed(1) : 0}%
                  </span>
                  <span className="stat-label">성공률</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚗️</span>
                <div className="stat-info">
                  <span className="stat-value">{activeEquipment.length}</span>
                  <span className="stat-label">활성 장비</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 툴팁 */}
      {hoveredItem && (
        <div 
          className="tooltip"
          style={{
            position: 'fixed',
            left: hoveredItem.x,
            top: hoveredItem.y,
            zIndex: 1000
          }}
        >
          {hoveredItem.content.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {/* 제작 결과 메시지 */}
      {craftingResult && (
        <div className="crafting-result">
          {craftingResult}
        </div>
      )}
    </div>
  );
};

export default AlchemyWorkshop;