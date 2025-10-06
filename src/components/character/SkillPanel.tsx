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
  const getSkillTypeEmoji = (type?: Skill['type']) => {
    switch (type) {
      case 'magic':
        return '🔮';
      case 'alchemy':
        return '⚗️';
      case 'physical':
        return '⚔️';
      default:
        return '❓';
    }
  };

  return (
    <Slot
      size="lg"
      isEmpty={!skill}
      className={`h-full ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && skill && onClick?.(skill)}
    >
      {skill ? (
        <div className="flex flex-col h-full p-1 justify-between">
          {/* 상단: 아이콘과 이름 */}
          <div className="flex flex-col items-center flex-grow justify-center">
            <div className="text-xl mb-1">
              {getSkillTypeEmoji(skill.type)}
            </div>
            <div className="text-xs text-center font-medium leading-tight" title={skill.name}>
              {skill.name}
            </div>
          </div>
          
          {/* 하단: 정보 */}
          <div className="flex flex-col items-center space-y-0.5">
            <div className="text-xs text-blue-400">
              MP {skill.cost}
            </div>
            <div className={`text-xs px-1.5 py-0.5 rounded text-center w-full ${
              skill.type === 'magic' ? 'bg-blue-900 text-blue-200' : 
              skill.type === 'physical' ? 'bg-red-900 text-red-200' : 
              'bg-purple-900 text-purple-200'
            }`}>
              {skill.type === 'magic' ? '마법' : 
               skill.type === 'physical' ? '물리' : '연금술'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full items-center justify-center p-2">
          <div className="text-2xl mb-1 opacity-30">⭕</div>
          <div className="text-xs text-gray-500 text-center">슬롯 {index + 1}</div>
        </div>
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
          {Array.from({ length: MAX_EQUIPPED_SKILLS }).map((_, index) => (
            <div key={index} className="h-20">
              <SkillSlot
                index={index}
                skill={equippedSkills[index] || null}
                disabled={disabled}
                onClick={(skill) => skill && handleSkillClick(skill)}
              />
            </div>
          ))}
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
                
                const getSkillTypeEmoji = (type: Skill['type']) => {
                  switch (type) {
                    case 'magic': return '🔮';
                    case 'alchemy': return '⚗️';
                    case 'physical': return '⚔️';
                    default: return '❓';
                  }
                };

                return (
                  <Button
                    key={skill.id}
                    variant={isSelected ? "primary" : "ghost"}
                    fullWidth
                    disabled={buttonDisabled}
                    onClick={() => handleSkillClick(skill)}
                    className={`justify-between transition-colors p-3 ${
                      buttonDisabled ? 'opacity-50' : ''
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    title={!isCompatible ? '현재 장착할 수 없는 스킬입니다' : `${skill.effects.map(e => e.name).join(', ')}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getSkillTypeEmoji(skill.type)}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{skill.name}</span>
                          {skill.effects.some(effect => effect.duration > 0) && (
                            <span className="text-xs text-yellow-400 flex items-center">
                              ⏱️ 지속성
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-400">
                          MP {skill.cost}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          skill.type === 'magic' ? 'bg-blue-900 text-blue-200' : 
                          skill.type === 'physical' ? 'bg-red-900 text-red-200' : 
                          'bg-purple-900 text-purple-200'
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