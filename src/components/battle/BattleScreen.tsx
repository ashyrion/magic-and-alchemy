import { useBattleStore } from '../../store/battleStore';
import { useGameStore } from '../../store/gameStore';
import type { Combatant } from '../../types/battle';
import type { Skill } from '../../types/gameTypes';
import { BattleLog } from './BattleLog';
import { BattleResult } from './BattleResult';

import { useEffect } from 'react';

export const BattleScreen = () => {
  // State 및 핸들러 정의
  const { 
    player, 
    enemy, 
    currentTurn, 
    inBattle, 
    syncPlayerSkills, 
    updatePlayerStats, 
    attemptFlee,
    battleResult,
    showBattleResult,
    closeBattleResult,
    isSkillOnCooldown,
    getSkillCooldown
  } = useBattleStore();
  const equippedSkills = useGameStore((state) => state.equippedSkills);
  const character = useGameStore((state) => state.character);
  
  // 실시간 스킬 동기화 (전투 중이고 스킬 목록이 변경되었을 때만)
  useEffect(() => {
    if (inBattle && player && equippedSkills) {
      // 현재 플레이어 스킬과 장착된 스킬이 다른 경우에만 동기화
      const currentSkillIds = player.skills.map(s => s.id).sort().join(',');
      const equippedSkillIds = equippedSkills.map(s => s.id).sort().join(',');
      
      if (currentSkillIds !== equippedSkillIds) {
        syncPlayerSkills(equippedSkills);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equippedSkills]);

  // 디버그: showBattleResult 상태 추적
  useEffect(() => {
    console.log('[BattleScreen] showBattleResult 상태 변화:', showBattleResult);
    console.log('[BattleScreen] battleResult:', battleResult);
  }, [showBattleResult, battleResult]);

  // 캐릭터 상태 실시간 동기화
  useEffect(() => {
    if (inBattle && player && character) {
      // HP/MP가 다른 경우에만 동기화
      if (player.stats.hp !== character.stats.hp || player.stats.mp !== character.stats.mp) {
        updatePlayerStats({
          ...player.stats,
          hp: character.stats.hp,
          mp: character.stats.mp,
          maxHp: character.stats.maxHp,
          maxMp: character.stats.maxMp
        });
        console.log('[BattleScreen] 캐릭터 상태 동기화:', {
          playerHP: player.stats.hp,
          characterHP: character.stats.hp,
          playerMP: player.stats.mp,
          characterMP: character.stats.mp
        });
      }
    }
  }, [character, inBattle, player, updatePlayerStats]);
  

  


  // 전투 결과 화면이 표시되어야 하는 경우, 전투 화면 위에 오버레이로 표시
  const shouldShowBattleResult = showBattleResult && battleResult;

  // 전투 중이거나 결과 표시 중일 때만 화면 유지, 그 외에는 "전투가 시작되지 않았습니다" 표시
  if (!player || !enemy) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 text-lg mb-4">전투가 시작되지 않았습니다.</div>
        <div className="text-sm text-gray-400">
          디버그: inBattle={String(inBattle)}, player={player ? 'OK' : 'NULL'}, enemy={enemy ? 'OK' : 'NULL'}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          잠시 후 자동으로 전투가 시작됩니다...
        </div>
      </div>
    );
  }

  const renderCharacter = (combatant: Combatant) => (
    <div className={`p-4 ${combatant.isEnemy ? 'text-right' : 'text-left'}`}>
      <div className={`text-xl font-bold ${currentTurn === combatant.id ? 'text-yellow-500' : 'text-white'}`}>
        {combatant.name}
      </div>
      
      {/* HP 바 */}
      <div className="my-2">
        <div className="text-sm">HP: {combatant.stats.hp}/{combatant.stats.maxHp}</div>
        <div className="w-full h-4 bg-gray-700 rounded">
          <div
            className="h-full bg-red-600 rounded transition-all"
            style={{ width: `${(combatant.stats.hp / combatant.stats.maxHp) * 100}%` }}
          />
        </div>
      </div>

      {/* MP 바 */}
      <div className="my-2">
        <div className="text-sm">MP: {combatant.stats.mp}/{combatant.stats.maxMp}</div>
        <div className="w-full h-3 bg-gray-700 rounded">
          <div
            className="h-full bg-blue-600 rounded transition-all"
            style={{ width: `${(combatant.stats.mp / combatant.stats.maxMp) * 100}%` }}
          />
        </div>
      </div>

      {/* 상태 효과 */}
      {combatant.statusEffects && combatant.statusEffects.length > 0 && (
        <div className="my-3">
          <div className="text-xs text-gray-400 mb-1">상태 효과</div>
          <div className="flex flex-wrap gap-1">
            {combatant.statusEffects.map((effect, index) => (
              <div
                key={`${effect.id}-${index}`}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  effect.type === 'buff' ? 'bg-green-700 text-green-100' :
                  effect.type === 'debuff' ? 'bg-red-700 text-red-100' :
                  effect.type === 'dot' ? 'bg-orange-700 text-orange-100' :
                  effect.type === 'hot' ? 'bg-blue-700 text-blue-100' :
                  'bg-gray-700 text-gray-100'
                }`}
                title={`${effect.description} (${effect.remainingDuration || effect.duration}턴 남음)`}
              >
                <span className="mr-1">{effect.icon}</span>
                <span>{effect.name}</span>
                {effect.currentStacks && effect.currentStacks > 1 && (
                  <span className="ml-1 font-bold">x{effect.currentStacks}</span>
                )}
                <span className="ml-1 text-xs opacity-75">
                  {effect.remainingDuration || effect.duration}턴
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기본 스탯 */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
        <div>ATK: {(combatant.stats.strength || 0) + (combatant.stats.attack || 0)}</div>
        <div>INT: {combatant.stats.intelligence}</div>
        <div>AGI: {combatant.stats.agility}</div>
        <div>DEF: {combatant.stats.defense}</div>
      </div>
    </div>
  );

  return (
    <div className="battle-screen min-h-screen bg-gradient-to-b from-red-900 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* 전투 정보 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">전투</h2>
          <div className="text-lg text-red-300">
            {currentTurn === player.id ? '당신의 차례' : `${enemy.name}의 차례`}
          </div>
        </div>

        {/* 전투 참가자 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {renderCharacter(player)}
          {renderCharacter(enemy)}
        </div>

        {/* 전투 컨트롤 */}
        <div className="bg-gray-800 rounded p-4 mb-6">
          {/* 스킬 목록 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(player?.skills?.length > 0) ? (
              player.skills.map((skill: Skill) => {
                const isOnCooldown = isSkillOnCooldown(skill.id);
                const cooldownRemaining = getSkillCooldown(skill.id);
                const isDisabled = currentTurn !== player.id || 
                                   player.stats.mp < skill.cost || 
                                   isOnCooldown;
                
                return (
                <button
                  key={skill.id}
                  className={`p-2 rounded transition-all ${
                    isDisabled 
                      ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  } ${
                    isOnCooldown ? 'border border-red-500' : ''
                  }`}
                  onClick={() => {
                    if (currentTurn === player.id && !isOnCooldown) {
                      useBattleStore.getState().useSkill(skill.id);
                    }
                  }}
                  disabled={isDisabled}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{skill.name}</span>
                    <span className="text-lg">{skill.icon}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    MP {skill.cost} / 위력 {skill.power}
                  </div>
                  <div className="text-xs">
                    <span className={`${
                      skill.element === 'fire' ? 'text-red-400' :
                      skill.element === 'ice' ? 'text-blue-400' :
                      skill.element === 'lightning' ? 'text-yellow-400' :
                      skill.element === 'poison' ? 'text-green-400' :
                      skill.element === 'light' ? 'text-white' :
                      skill.element === 'dark' ? 'text-purple-400' :
                      'text-gray-400'
                    }`}>
                      {skill.element} {skill.type}
                    </span>
                    {skill.cooldown && skill.cooldown > 0 && (
                      <span className="ml-1 text-gray-500">(쿨타임: {skill.cooldown}턴)</span>
                    )}
                  </div>
                  {isOnCooldown && (
                    <div className="text-xs text-red-400 font-bold">
                      쿨타임: {cooldownRemaining}턴 남음
                    </div>
                  )}
                </button>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-4">
                장착된 스킬이 없습니다. 스킬 패널에서 스킬을 장착하세요.
              </div>
            )}
          </div>

          {/* 기본 행동 */}
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (currentTurn === player.id) {
                  useBattleStore.getState().basicAttack();
                }
              }}
              disabled={currentTurn !== player.id}
            >
              기본 공격
            </button>

            <button
              className="px-4 py-2 bg-red-900 rounded hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (currentTurn === player.id) {
                  attemptFlee();
                }
              }}
              disabled={currentTurn !== player.id}
            >
              도망가기
            </button>
          </div>
        </div>

        {/* 전투 로그 */}
        <div className="mt-6">
          <BattleLog />
        </div>
      </div>
      
      {/* 전투 결과 오버레이 - 전투 화면 위에 표시 */}
      {shouldShowBattleResult && battleResult && (
        <BattleResult
          victory={battleResult.victory}
          enemy={battleResult.enemy}
          rewards={battleResult.rewards}
          onClose={closeBattleResult}
        />
      )}
    </div>
  );
};