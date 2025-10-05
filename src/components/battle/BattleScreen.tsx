import { useBattleStore } from '../../store/battleStore';
import { useGameStore } from '../../store/gameStore';
import type { Combatant } from '../../types/battle';
import type { Skill } from '../../types/gameTypes';
import { BattleLog } from './BattleLog';

import { useEffect } from 'react';

export const BattleScreen = () => {
  // State 및 핸들러 정의
  const { player, enemy, currentTurn, inBattle, syncPlayerSkills, updatePlayerStats, attemptFlee } = useBattleStore();
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
  

  


  if (!inBattle || !player || !enemy) {
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
    <div>
      {/* 적 캐릭터 */}
      <div className="mb-8">
        {renderCharacter(enemy)}
      </div>

        {/* 배틀 로그 */}
        <div className="mb-8">
          <BattleLog />
          <div className="mt-2 text-center text-gray-400">
            {`현재 ${currentTurn === player.id ? '플레이어' : '적'}의 턴입니다.`}
          </div>
        </div>

        {/* 플레이어 캐릭터 */}
        <div className="mb-8">
          {renderCharacter(player)}
        </div>

        {/* 전투 컨트롤 */}
        <div className="bg-gray-800 rounded p-4">
          {/* 스킬 목록 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* 전투 중에는 player.skills 사용, 전투 전에는 equippedSkills 사용 */}
            {(player?.skills?.length > 0) ? (
              player.skills.map((skill: Skill) => (
                <button
                  key={skill.id}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (currentTurn === player.id) {
                      useBattleStore.getState().useSkill(skill.id);
                    }
                  }}
                  disabled={currentTurn !== player.id || player.stats.mp < skill.cost}
                >
                  <div className="font-bold">{skill.name}</div>
                  <div className="text-xs text-gray-400">
                    MP {skill.cost} / 위력 {skill.power}
                  </div>
                  <div className="text-xs text-blue-400">
                    타입: {skill.type}
                  </div>
                </button>
              ))
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
      </div>
  );
};