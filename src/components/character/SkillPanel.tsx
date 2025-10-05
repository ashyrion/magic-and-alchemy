import { useState } from 'react';
import { Card, Button, Slot } from '../common';
import type { Skill } from '../../types/gameTypes';
import { useGameStore } from '../../store/gameStore';

interface SkillSlotProps {
  skill: Skill | null;
  index: number;
  disabled?: boolean;
  onClick?: (skill: Skill | null) => void;
}

const SkillSlot = ({ skill, index, disabled, onClick }: SkillSlotProps) => {
  const getSkillTypeIcon = (type?: Skill['type']) => {
    switch (type) {
      case 'magic':
        return 'skill';
      case 'alchemy':
      case 'physical':
        return 'accessory';
      default:
        return 'empty';
    }
  };

  return (
    <Slot
      icon={getSkillTypeIcon(skill?.type)}
      isEmpty={!skill}
      label={`슬롯 ${index + 1}`}
      className={disabled ? 'opacity-50' : ''}
      onClick={() => !disabled && skill && onClick?.(skill)}
    >
      {skill ? (
        <div className="text-center w-full" title={skill.name}>
          <div className="text-sm truncate font-medium">{skill.name}</div>
          <div className="text-xs text-gray-400">
            MP {skill.cost} / {skill.power}
          </div>
          {/* 효과 정보 표시 */}
          {skill.effects.length > 0 && (
            <div className="text-xs text-gray-500 truncate mt-1">
              {skill.effects.map(effect => effect.name).join(', ')}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-500 text-sm">비어있음</span>
      )}
    </Slot>
  );
};

const MAX_EQUIPPED_SKILLS = 4;

interface SkillPanelProps {
  disabled?: boolean;
  onSkillsChange?: (skills: Skill[]) => void;
}

export const SkillPanel = ({ disabled = false, onSkillsChange }: SkillPanelProps) => {
  const learnedSkills = useGameStore((state) => state.learnedSkills);
  const equippedSkills = useGameStore((state) => state.equippedSkills);
  const { equipSkill, unequipSkill } = useGameStore();
  const [error, setError] = useState<string | null>(null);

  const handleSkillClick = (skill: Skill) => {
    if (disabled) return;
    
    try {
      const isEquipped = equippedSkills.find(s => s.id === skill.id);
      
      if (isEquipped) {
        // 장착 해제
        const success = unequipSkill(skill.id);
        if (!success) {
          setError('스킬 장착 해제 중 오류가 발생했습니다.');
          return;
        }
      } else {
        // 장착
        if (equippedSkills.length >= MAX_EQUIPPED_SKILLS) {
          setError('최대 장착 가능한 스킬 수를 초과했습니다.');
          return;
        }
        
        const success = equipSkill(skill);
        if (!success) {
          setError('스킬 장착 중 오류가 발생했습니다.');
          return;
        }
      }

      onSkillsChange?.(equippedSkills);
      setError(null);
    } catch (err) {
      console.error('스킬 선택 중 오류 발생:', err);
      setError('스킬 선택 중 오류가 발생했습니다.');
    }
  };

  const isSkillCompatible = (skill: Skill): boolean => {
    // 스킬 호환성 검사 로직
    const incompatibleTypes = equippedSkills.filter(s => {
      // 마법과 연금술을 동시에 사용할 수 없는 경우
      if ((skill.type === 'magic' || skill.type === 'physical') && s.type === 'alchemy') return true;
      if (skill.type === 'alchemy' && (s.type === 'magic' || s.type === 'physical')) return true;
      return false;
    });

    return incompatibleTypes.length === 0;
  };

  return (
    <Card title="스킬">
      <div className="space-y-6">
        {/* 장착된 스킬 슬롯 */}
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="장착된 스킬 목록">
          {Array.from({ length: MAX_EQUIPPED_SKILLS }).map((_, index) => {
            const skill = equippedSkills[index] || null;
            const isCompatible = skill ? isSkillCompatible(skill) : true;
            
            return (
              <SkillSlot
                key={index}
                index={index}
                skill={skill}
                disabled={disabled || !isCompatible}
                onClick={(skill) => skill && handleSkillClick(skill)}
              />
            );
          })}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center" role="alert">
            {error}
          </div>
        )}

        {/* 보유 스킬 목록 */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-400">보유 스킬</div>
          <div className="space-y-2">
            {learnedSkills.length > 0 ? (
              learnedSkills.map((skill) => {
                const isSelected = equippedSkills.some(s => s.id === skill.id);
                const isCompatible = isSkillCompatible(skill);
                const buttonDisabled = disabled || (!isCompatible && !isSelected);
                
                return (
                  <Button
                    key={skill.id}
                    variant={isSelected ? "primary" : "ghost"}
                    fullWidth
                    disabled={buttonDisabled}
                    onClick={() => handleSkillClick(skill)}
                    className={`justify-between transition-colors ${
                      buttonDisabled ? 'opacity-50' : ''
                    }`}
                    title={!isCompatible ? '현재 장착할 수 없는 스킬입니다' : `${skill.effects.map(e => e.name).join(', ')}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.effects.some(effect => effect.duration > 0) && (
                          <span className="text-xs text-yellow-500">
                            지속성
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">
                          MP {skill.cost}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          skill.type === 'magic' || skill.type === 'physical' 
                            ? 'bg-blue-900 text-blue-200' 
                            : 'bg-purple-900 text-purple-200'
                        }`}>
                          {skill.type === 'magic' ? '마법' : 
                           skill.type === 'physical' ? '물리' : '연금술'}
                        </span>
                      </div>
                    </div>
                  </Button>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">
                습득한 스킬이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};