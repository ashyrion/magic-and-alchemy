import React, { useState } from 'react';
import { useNewAlchemyStore } from '../stores/newAlchemyStore';
import { alchemyMaterials } from '../data/alchemyMaterials';
import type { ItemRarity } from '../stores/newAlchemyStore';
import './AlchemyWorkshop.stable.css';

const AlchemyWorkshop: React.FC = () => {
  const {
    materials,
    craftPotion,
    upgradeItem,
    upgradeSkill,
    getAvailableRecipes,
    lastCraftResult
  } = useNewAlchemyStore();

  const [activeTab, setActiveTab] = useState<'craft' | 'upgrade-item' | 'upgrade-skill'>('craft');
  const [selectedItem, setSelectedItem] = useState<{name: string; rarity: ItemRarity; [key: string]: unknown} | null>(null);

  // 사용 가능한 레시피들 가져오기
  const availableRecipes = getAvailableRecipes();

  const handleCraft = (recipeId: string) => {
    const result = craftPotion(recipeId);
    console.log('Craft result:', result);
  };

  const handleUpgradeItem = (upgradeFrom: ItemRarity, upgradeTo: ItemRarity, useCatalyst = false) => {
    if (!selectedItem) return;
    
    const result = upgradeItem(selectedItem, upgradeFrom, upgradeTo, useCatalyst);
    console.log('Upgrade result:', result);
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
                    <span className="material-count">{materials[material.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="simple-recipe-grid">
              {availableRecipes.map((recipe) => {
                const canCraft = recipe.materials.every((mat) => 
                  (materials[mat.id] || 0) >= mat.count
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
                        const hasEnough = (materials[mat.id] || 0) >= mat.count;
                        
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
              
              <div className="upgrade-grid">
                {(['normal', 'magic', 'rare'] as const).map(fromRarity => {
                  const toRarity = fromRarity === 'normal' ? 'magic' : 
                                   fromRarity === 'magic' ? 'rare' : 'unique' as ItemRarity;
                  
                  const requirements = alchemyMaterials
                    .slice(0, 3)
                    .map(mat => ({ materialId: mat.id, count: 5 }));

                  const canUpgrade = requirements.every(req => 
                    (materials[req.materialId] || 0) >= req.count
                  );

                  return (
                    <div key={fromRarity} className="upgrade-card">
                      <div className="upgrade-type">
                        {fromRarity} → {toRarity}
                      </div>
                      
                      <div className="upgrade-requirements">
                        <h4>필요 재료:</h4>
                        {requirements.map(req => {
                          const material = alchemyMaterials.find(m => m.id === req.materialId);
                          const hasEnough = (materials[req.materialId] || 0) >= req.count;
                          
                          return (
                            <div key={req.materialId} className="requirement-item">
                              <span className="requirement-name">{material?.name}</span>
                              <span className={`requirement-amount ${!hasEnough ? 'insufficient' : ''}`}>
                                {materials[req.materialId] || 0} / {req.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="upgrade-success-rate">성공률: 75%</div>

                      <button 
                        className="upgrade-button"
                        disabled={!canUpgrade || !selectedItem}
                        onClick={() => handleUpgradeItem(fromRarity, toRarity)}
                      >
                        강화하기
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="materials-display">
                <h4>테스트용 아이템 선택:</h4>
                <div className="materials-grid">
                  {(['normal', 'magic', 'rare'] as const).map(rarity => (
                    <button
                      key={rarity}
                      className={`material-item ${selectedItem?.rarity === rarity ? 'selected' : ''}`}
                      onClick={() => setSelectedItem({ name: `테스트 ${rarity} 아이템`, rarity })}
                    >
                      테스트 {rarity} 아이템
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upgrade-skill' && (
          <div>
            <div className="upgrade-section">
              <h3 className="upgrade-title">스킬 강화</h3>
              
              <div className="upgrade-grid">
                {[1, 2, 3].map(tier => {
                  const skillId = `test-skill-${tier}`;
                  const requirements = alchemyMaterials
                    .slice(tier - 1, tier + 2)
                    .map(mat => ({ materialId: mat.id, count: tier * 3 }));

                  const canUpgrade = requirements.every(req => 
                    (materials[req.materialId] || 0) >= req.count
                  );

                  return (
                    <div key={tier} className="upgrade-card">
                      <div className="upgrade-type">
                        스킬 티어 {tier} → {tier + 1}
                      </div>
                      
                      <div className="upgrade-requirements">
                        <h4>필요 재료:</h4>
                        {requirements.map(req => {
                          const material = alchemyMaterials.find(m => m.id === req.materialId);
                          const hasEnough = (materials[req.materialId] || 0) >= req.count;
                          
                          return (
                            <div key={req.materialId} className="requirement-item">
                              <span className="requirement-name">{material?.name}</span>
                              <span className={`requirement-amount ${!hasEnough ? 'insufficient' : ''}`}>
                                {materials[req.materialId] || 0} / {req.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="upgrade-success-rate">성공률: {90 - tier * 10}%</div>

                      <button 
                        className="upgrade-button"
                        disabled={!canUpgrade}
                        onClick={() => handleUpgradeSkill(skillId, tier)}
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