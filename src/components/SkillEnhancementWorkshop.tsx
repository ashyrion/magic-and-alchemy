import React, { useState, useEffect } from 'react';
import { Card, Button, Slot } from './common';
import type { Skill } from '../types/gameTypes';
import { useGameStore } from '../store/gameStore';
import type { SkillTier } from '../data/skillEnhancementData';
import { useSkillEnhancementStore } from '../store/skillEnhancementStore';
import { alchemyMaterials } from '../data/alchemyMaterials';
import { useInventoryStore } from '../store/inventoryStore';
import { skillEnhancements, baseSkills } from '../data/skillEnhancementData';
import { generateUniversalItemTooltip } from '../utils/tooltipGenerator';
import './SkillEnhancementWorkshop.css';

interface SkillEnhancementWorkshopProps {
  onClose?: () => void;
}

// 스킬 슬롯 컴포넌트 (툴팁 포함)
interface SkillSlotWithTooltipProps {
  skill: Skill | null;
  tier: SkillTier;
  isUnlocked: boolean;
  canEnhance: boolean;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const SkillSlotWithTooltip: React.FC<SkillSlotWithTooltipProps> = ({
  skill, tier, isUnlocked, canEnhance, isSelected, onClick, className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // 티어별 색상 결정
  const getTierColor = (tier: SkillTier): string => {
    switch (tier) {
      case 1: return 'tier-1';
      case 2: return 'tier-2';
      case 3: return 'tier-3';
      default: return '';
    }
  };

  if (!skill || !isUnlocked) {
    return (
      <Slot 
        size="lg" 
        isEmpty={true}
        className={`skill-slot locked ${className}`}
      >
        <div className="text-gray-500 text-xs">잠김</div>
      </Slot>
    );
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Slot
        size="lg"
        isEmpty={false}
        className={`skill-slot ${getTierColor(tier)} cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-yellow-400' : ''
        } ${!isUnlocked ? 'opacity-50 grayscale' : ''} ${
          canEnhance ? 'hover:ring-2 hover:ring-blue-400' : ''
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex flex-col h-full p-1 justify-between">
          <div className="flex flex-col items-center flex-grow justify-center">
            <div className="text-lg mb-1">
              {skill.icon}
            </div>
            <div className="text-center">
              <div className="text-xs font-medium truncate w-full mb-1">
                {skill.name}
              </div>
              <div className="flex items-center justify-center text-xs">
                <span className="text-yellow-400 font-bold">
                  {tier}단계
                </span>
              </div>
            </div>
          </div>
        </div>
      </Slot>
      
      {/* 툴팁 */}
      {showTooltip && skill && (
        <div className="tooltip">
          <div dangerouslySetInnerHTML={{ 
            __html: generateUniversalItemTooltip(skill) 
          }} />
        </div>
      )}
    </div>
  );
};

const SkillEnhancementWorkshop: React.FC<SkillEnhancementWorkshopProps> = () => {
  const {
    selectedBaseSkillId,
    selectedTier,
    isEnhancing,
    enhancementResult,
    playerSkillProgress,
    selectSkillForEnhancement,
    attemptSkillEnhancement,
    canEnhanceSkill,
    clearSelection,
    clearEnhancementResult
  } = useSkillEnhancementStore();


  // 스킬 그룹 정의
  const skillGroups = {
    fire: {
      name: '화염',
      skills: ['skill-fireball'],
      icon: '🔥'
    },
    ice: {
      name: '냉기', 
      skills: ['skill-ice-shard'],
      icon: '🧊'
    },
    lightning: {
      name: '번개',
      skills: ['skill-lightning-bolt'],
      icon: '⚡'
    },
    poison: {
      name: '독',
      skills: ['skill-poison-dart'], 
      icon: '☠️'
    },
    light: {
      name: '빛',
      skills: ['skill-heal'],
      icon: '💚'
    },
    dark: {
      name: '어둠',
      skills: ['skill-life-drain'],
      icon: '🩸'
    }
  };

  type SkillGroupKey = keyof typeof skillGroups;

  const [selectedSkillGroup, setSelectedSkillGroup] = useState<SkillGroupKey | null>('fire');
  const [showEnhancementResult, setShowEnhancementResult] = useState(false);

  // 강화 결과 표시 관리
  useEffect(() => {
    if (enhancementResult) {
      setShowEnhancementResult(true);
      const timer = setTimeout(() => {
        setShowEnhancementResult(false);
        clearEnhancementResult();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [enhancementResult, clearEnhancementResult]);

  // 스킬 선택 핸들러
  const handleSkillSelect = (baseSkillId: string, tier: SkillTier) => {
    selectSkillForEnhancement(baseSkillId, tier);
  };

  // 강화 시도 핸들러
  const handleEnhanceAttempt = async () => {
    if (!selectedBaseSkillId || !selectedTier) return;
    
    await attemptSkillEnhancement(selectedBaseSkillId, selectedTier);
    
    // 강화 결과 확인 후 성공시에만 선택 해제
    if (enhancementResult === 'success') {
      setTimeout(() => {
        clearSelection();
      }, 2000);
    }
  };

  // 재료 개수 확인
  const getMaterialCount = (materialId: string): number => {    
    // inventoryItems는 장비/소모품이고, 재료는 useInventoryStore.getState().materials에 있습니다.
    // 재료는 중첩되지 않으므로, ID가 일치하는 재료의 개수를 셉니다.
    return useInventoryStore.getState().materials.filter(m => m.id === materialId).length;
  };

  // 골드 확인
  const getGold = (): number => {
    // 골드는 gameStore에서 직접 가져와야 합니다.
    const gameStore = useGameStore.getState();
    return gameStore.gold;
  };

  // 강화 가능 여부 확인 (재료 & 골드)
  const canAffordEnhancement = (baseSkillId: string, targetTier: SkillTier): boolean => {
    const enhancement = skillEnhancements.find(e => 
      e.baseSkillId === baseSkillId && e.tier === targetTier
    );
    
    if (!enhancement) return false;

    // 골드 확인
    const currentGold = getGold();
    if (currentGold < enhancement.cost) return false;

    // 재료 확인 (임시로 빈 배열로 처리)
    const materials = enhancement.requiredMaterials || [];
    return materials.every((material) => {
      const count = getMaterialCount(material.itemId);
      return count >= material.count;
    });
  };

  // 강화 세부 정보 렌더링
  const renderEnhancementDetails = () => {
    if (!selectedBaseSkillId || !selectedTier) {
      return (
        <div className="enhancement-placeholder">
          <p className="text-gray-400 text-center">스킬을 선택해주세요</p>
        </div>
      );
    }

    const enhancement = skillEnhancements.find(e => 
      e.baseSkillId === selectedBaseSkillId && e.tier === selectedTier
    );

    const baseSkill = baseSkills.find(s => s.id === selectedBaseSkillId);
    
    if (!enhancement || !baseSkill) {
      return (
        <div className="enhancement-placeholder">
          <p className="text-red-400 text-center">강화 정보를 찾을 수 없습니다</p>
        </div>
      );
    }

    const canEnhance = canEnhanceSkill(selectedBaseSkillId, selectedTier);
    const canAfford = canAffordEnhancement(selectedBaseSkillId, selectedTier);
    const currentGold = getGold();

    return (
      <div className="enhancement-details w-full">
        <div className="selected-skill mb-4">
          <h4 className="text-md font-bold mb-2 text-center">선택된 스킬</h4>
          <div className="skill-info flex items-center justify-center gap-2 mb-3">
            <span className="text-lg">{baseSkill.icon}</span>
            <span className="font-medium">{baseSkill.name}</span>
            <span className="text-yellow-400 font-bold">{selectedTier}단계</span>
          </div>
        </div>

        {/* 재료 및 비용 */}
        <div className="requirements mb-4">
          <h5 className="text-sm font-bold mb-2 text-center">필요 재료</h5>
          <div className="materials grid grid-cols-2 gap-2 mb-3">
            {(enhancement.requiredMaterials || []).map((material) => {
              const materialDetails = alchemyMaterials.find(m => m.id === material.itemId);
              const currentCount = getMaterialCount(material.itemId);
              const hasEnough = currentCount >= material.count;
              
              return (
                <div key={material.itemId} className={`material-item p-2 rounded border flex justify-between items-center ${
                  hasEnough ? 'border-green-400/50' : 'border-red-400/50'
                }`}>
                  <div className="flex items-center flex-grow min-w-0">
                    <span className="mr-2">{materialDetails?.icon || '❓'}</span>
                    <span className="text-xs font-medium truncate">{materialDetails?.name || material.itemId}</span>
                  </div>
                  <span className={`text-xs ml-2 flex-shrink-0 ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                    {currentCount} / {material.count}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className={`cost-info p-2 rounded border ${
            currentGold >= enhancement.cost ? 'border-yellow-400 bg-yellow-50' : 'border-red-400 bg-red-50'
          }`}>
            <div className="text-xs font-medium">비용</div>
            <div className={`text-xs ${currentGold >= enhancement.cost ? 'text-yellow-600' : 'text-red-600'}`}>
              {currentGold.toLocaleString()} / {enhancement.cost.toLocaleString()} 골드
            </div>
          </div>
        </div>

        {/* 성공률 */}
        <div className="success-rate mb-4 text-center">
          <div className="text-sm font-medium">성공률: 
            <span className="text-blue-400 font-bold ml-1">{enhancement.successRate}%</span>
          </div>
        </div>

        {/* 강화 결과 표시 */}
        {showEnhancementResult && (
          <div className={`enhancement-result p-3 rounded mb-4 text-center ${
            enhancementResult === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {enhancementResult === 'success' ? '✅ 강화 성공!' : '❌ 강화 실패...'}
          </div>
        )}

        {/* 강화 버튼 */}
        <div className="enhancement-button-container w-full">
          <Button
            variant="primary"
            size="lg"
            className={`w-full ${!canEnhance || !canAfford || isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleEnhanceAttempt}
            disabled={!canEnhance || !canAfford || isEnhancing}
          >
            {isEnhancing ? '강화 중...' : `스킬 강화`}
          </Button>
          
          {!canEnhance && (
            <p className="text-red-400 text-xs mt-2 text-center">
              강화 조건을 만족하지 않습니다
            </p>
          )}
          
          {canEnhance && !canAfford && (
            <p className="text-red-400 text-xs mt-2 text-center">
              재료 또는 골드가 부족합니다
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="skill-enhancement-card w-full max-w-4xl mx-auto">
      <div className="skill-enhancement-workshop">
        {/* 속성 선택 탭 */}
        <div className="mb-4 w-full">
          <div className="flex flex-wrap gap-1 mb-3 justify-center">
            {Object.entries(skillGroups).map(([key, group]) => {
              const hasSkills = group.skills.some(skillId => 
                playerSkillProgress.some(p => p.baseSkillId === skillId)
              );
              
              if (!hasSkills) return null;
              
              return (
                <Button
                  key={key}
                  variant={selectedSkillGroup === key ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedSkillGroup(selectedSkillGroup === key ? null : key as SkillGroupKey)}
                  className="text-xs px-2 py-1"
                >
                  {group.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 상단: 스킬 선택 영역 */}
        <div className="skill-selection-area w-full mb-6">
          <h3 className="text-lg font-bold mb-4 text-center">보유 스킬</h3>
          
          <div className="skills-container">
            {selectedSkillGroup && (
              <div className="skill-group">
                <div className="skill-group-header mb-3 text-center">
                  <h4 className="text-md font-bold flex items-center justify-center gap-2">
                    <span>{skillGroups[selectedSkillGroup].icon}</span>
                    <span>{skillGroups[selectedSkillGroup].name}</span>
                  </h4>
                </div>
                
                <div className="skills-grid">
                  {skillGroups[selectedSkillGroup].skills.map(skillId => {
                    const progress = playerSkillProgress.find(p => p.baseSkillId === skillId);
                    const baseSkill = baseSkills.find(s => s.id === skillId);
                    
                    if (!progress || !baseSkill) return null;

                    return (
                      <div key={skillId} className="skill-progression">
                        <div className="skill-name text-center mb-2 font-medium text-sm">
                          {baseSkill.name}
                        </div>
                        <div className="skill-tiers flex gap-1 justify-center flex-wrap">
                          {[1, 2, 3, 4, 5].map(tier => {
                            const isUnlocked = progress.unlockedTiers.includes(tier as SkillTier);
                            const canEnhance = canEnhanceSkill(skillId, tier as SkillTier);
                            const canAfford = canAffordEnhancement(skillId, tier as SkillTier);
                            const isSelected = selectedBaseSkillId === skillId && selectedTier === tier;
                            
                            // 재료/골드 부족 시 비활성화
                            const isDisabled = !canAfford && canEnhance;
                            
                            return (
                              <SkillSlotWithTooltip
                                key={tier}
                                skill={baseSkill}
                                tier={tier as SkillTier}
                                isUnlocked={isUnlocked || canEnhance}
                                canEnhance={canEnhance && canAfford}
                                isSelected={isSelected}
                                onClick={() => handleSkillSelect(skillId, tier as SkillTier)}
                                className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 하단: 강화 영역 */}
        <div className="enhancement-area w-full">
          <h3 className="text-lg font-bold mb-4 text-center">스킬 강화</h3>
          <div>
            {renderEnhancementDetails()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SkillEnhancementWorkshop;