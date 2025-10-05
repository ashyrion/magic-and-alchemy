import React, { useState } from 'react';
import { useAlchemyStore } from '../stores/alchemyStore';
import { useInventoryStore } from '../store/inventoryStore';
import './AlchemyWorkshop.css';

// 재료 ID를 실제 이름으로 변환하는 헬퍼 함수
const getMaterialName = (materialId: string) => {
  switch (materialId) {
    case 'mat-1': return '붉은 허브';
    case 'mat-2': return '파란 크리스탈';
    case 'mat-3': return '황금 가루';
    default: return materialId;
  }
};

const AlchemyWorkshop: React.FC = () => {
  const {
    level,
    experience,
    recentResults,
    getAvailableRecipes,
    attemptCrafting
  } = useAlchemyStore();

  const { materials } = useInventoryStore();
  
  // 재료 상태 변화에 따른 실시간 업데이트를 위한 변수들
  const materialCounts = materials.reduce((acc, material) => {
    acc[material.id] = (acc[material.id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [craftingResult, setCraftingResult] = useState<string | null>(null);

  const availableRecipes = getAvailableRecipes();
  const selectedRecipe = selectedRecipeId 
    ? availableRecipes.find(r => r.id === selectedRecipeId) 
    : null;

  const handleCraft = () => {
    if (!selectedRecipeId) return;
    
    const result = attemptCrafting(selectedRecipeId);
    let message = result.message;
    
    // 성공 시 결과물 정보 추가
    if (result.success && result.results.length > 0) {
      const resultNames = result.results.map(r => {
        const getResultName = (id: string) => {
          switch (id) {
            case 'healing-potion-basic': return '기본 치유 물약';
            case 'mana-potion-basic': return '기본 마나 물약';
            case 'healing-potion-enhanced': return '강화 치유 물약';
            case 'super-potion': return '만능 물약';
            case 'fire-weapon-enhancement': return '화염 무기 강화';
            case 'alchemy-mastery': return '연금술 숙련 스킬';
            default: return id;
          }
        };
        return `${getResultName(r.id)} ${r.count}개`;
      });
      message += ` (획득: ${resultNames.join(', ')})`;
    }
    
    setCraftingResult(message);
    
    // 3초 후 메시지 제거
    setTimeout(() => {
      setCraftingResult(null);
    }, 3000);
  };

  const getExperienceToNextLevel = () => {
    const nextLevelExp = level * 100;
    return nextLevelExp - experience;
  };

  return (
    <div className="alchemy-workshop">
      <div className="workshop-header">
        <h2>연금술 작업실</h2>
        <div className="alchemy-info">
          <div className="level-info">
            <span>레벨: {level}</span>
            <span>경험치: {experience}</span>
            <span>다음 레벨까지: {getExperienceToNextLevel()}</span>
          </div>
        </div>
      </div>

      <div className="workshop-content">
        {/* 레시피 목록 */}
        <div className="recipe-section">
          <h3>사용 가능한 레시피</h3>
          <div className="recipe-list horizontal-grid">
            {availableRecipes.map(recipe => {
              // 실시간으로 재료 충분 여부 확인
              const canCraft = recipe.requiredMaterials.every(required => {
                const ownedCount = materialCounts[required.materialId] || 0;
                return ownedCount >= required.count;
              });
              
              return (
                <div 
                  key={recipe.id}
                  className={`recipe-item ${selectedRecipeId === recipe.id ? 'selected' : ''} ${
                    !canCraft ? 'disabled' : ''
                  }`}
                  onClick={() => setSelectedRecipeId(recipe.id)}
                >
                <div className="recipe-name">{recipe.name}</div>
                <div className="recipe-difficulty">
                  {recipe.difficulty === 'basic' ? '초급' : 
                   recipe.difficulty === 'intermediate' ? '중급' : 
                   recipe.difficulty === 'advanced' ? '고급' : '마스터'}
                </div>
                <div className="recipe-success-rate">성공률: {recipe.successRate || 50}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 재료 인벤토리 */}
        <div className="materials-inventory">
          <h3>보유 재료</h3>
          <div className="materials-list horizontal-grid">
            {materials.map((material, index) => (
              <div key={`material-${material.id}-${index}`} className="material-item">
                <span className="material-name">{material.name}</span>
                <span className="material-description">{material.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 레시피 상세 정보 */}
        <div className="recipe-details">
          {selectedRecipe ? (
            <div className="recipe-detail-content">
              <h3>{selectedRecipe.name}</h3>
              <p className="recipe-description">{selectedRecipe.description}</p>
              
              <div className="required-materials">
                <h4>필요한 재료:</h4>
                {selectedRecipe.requiredMaterials.map(material => {
                  const ownedCount = materialCounts[material.materialId] || 0;
                  const hasEnough = ownedCount >= material.count;
                  
                  return (
                    <div 
                      key={material.materialId} 
                      className={`material-requirement ${hasEnough ? 'sufficient' : 'insufficient'}`}
                    >
                      <span className="material-name">{getMaterialName(material.materialId)}</span>
                      <span className="material-count">
                        {ownedCount} / {material.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="expected-results">
                <h4>예상 결과:</h4>
                {selectedRecipe.results.map((result, index) => {
                  // 결과물 이름 매핑
                  const getResultName = (id: string) => {
                    switch (id) {
                      case 'healing-potion-basic': return '기본 치유 물약';
                      case 'mana-potion-basic': return '기본 마나 물약';
                      case 'healing-potion-enhanced': return '강화 치유 물약';
                      case 'super-potion': return '만능 물약';
                      case 'fire-weapon-enhancement': return '화염 무기 강화';
                      case 'alchemy-mastery': return '연금술 숙련 스킬';
                      default: return id;
                    }
                  };
                  
                  return (
                    <div key={index} className="result-item">
                      <span className="result-name">{getResultName(result.id)}</span>
                      <span className="result-chance">{result.chance}% 확률</span>
                      <span className="result-count">{result.count}개</span>
                    </div>
                  );
                })}
              </div>

              <button 
                className="craft-button"
                onClick={handleCraft}
                disabled={!selectedRecipe.requiredMaterials.every(required => {
                  const ownedCount = materialCounts[required.materialId] || 0;
                  return ownedCount >= required.count;
                })}
              >
                {selectedRecipe.requiredMaterials.every(required => {
                  const ownedCount = materialCounts[required.materialId] || 0;
                  return ownedCount >= required.count;
                }) ? '제작하기' : '재료 부족'}
              </button>
            </div>
          ) : (
            <div className="no-recipe-selected">
              <p>레시피를 선택하세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 제작 결과 메시지 */}
      {craftingResult && (
        <div className="crafting-result">
          {craftingResult}
        </div>
      )}

      {/* 최근 결과 */}
      <div className="recent-results">
        <h3>최근 제작 결과</h3>
        <div className="results-list">
          {recentResults.slice(0, 5).map((result, index) => {
            // 레시피 이름 매핑
            const getRecipeName = (id: string) => {
              switch (id) {
                case 'basic-healing-potion': return '기본 치유 물약';
                case 'basic-mana-potion': return '기본 마나 물약';
                case 'enhanced-healing-potion': return '강화 치유 물약';
                case 'fire-enhancement': return '화염 강화';
                case 'experimental-super-potion': return '실험용 만능 물약';
                default: return id;
              }
            };
            
            return (
              <div 
                key={index} 
                className={`result-entry ${result.success ? 'success' : 'failure'}`}
              >
                <span className="result-recipe">{getRecipeName(result.recipeId)}</span>
                <span className="result-status">
                  {result.success ? '성공' : '실패'}
                </span>
                <span className="result-exp">+{result.experienceGained} 경험치</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlchemyWorkshop;