import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { useDungeonStore } from '../../store/dungeonStore'
import { useGameStateStore } from '../../store/gameStateStore'

const Town: React.FC = () => {
  const { character, calculateTotalStats, gold } = useGameStore()
  const { startDungeon } = useDungeonStore()
  const { enterDungeon } = useGameStateStore()

  // 장비 스탯이 반영된 총 스탯 계산
  const totalStats = calculateTotalStats()

  const handleEnterDungeon = () => {
    console.log('[Town] 던전 입장 시도')
    // 새로운 던전 시작
    startDungeon()
    // 게임 위치를 던전으로 변경
    enterDungeon()
  }

  const handleFullHeal = () => {
    console.log('[Town] 완전 회복 시도')
    if (character && totalStats) {
      // 총 스탯에서 최대 HP/MP 가져오기
      const maxHP = totalStats.maxHp || totalStats.maxHP || character.stats.maxHp || character.stats.maxHP || 100;
      const maxMP = totalStats.maxMp || totalStats.maxMP || character.stats.maxMp || character.stats.maxMP || 50;
      
      console.log('[Town] 회복 전 상태:', {
        beforeHP: character.stats.currentHP ?? character.stats.hp,
        beforeMP: character.stats.currentMP ?? character.stats.mp,
        maxHP,
        maxMP
      });
      
      // 완전 회복 - 모든 HP/MP 필드 업데이트
      useGameStore.getState().updateCharacterStats({
        hp: maxHP,              // 레거시 필드
        currentHP: maxHP,       // 현재 사용 중인 필드
        maxHP: maxHP,          // 최대 HP
        maxHp: maxHP,          // 필드명 통일용
        mp: maxMP,              // 레거시 필드  
        currentMP: maxMP,       // 현재 사용 중인 필드
        maxMP: maxMP,          // 최대 MP
        maxMp: maxMP           // 필드명 통일용
      });
      
      console.log('[Town] 완전 회복 완료 - HP:', maxHP, 'MP:', maxMP);
    }
  }

  if (!character) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="bg-white p-6 rounded-lg shadow-md w-96">
          <h3 className="text-xl font-bold mb-2">오류</h3>
          <p>캐릭터 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🏘️ 연금술사의 마을</h1>
          <p className="text-lg text-green-600">평화로운 마을에서 휴식을 취하고 던전에 도전하세요</p>
        </div>

        {/* 캐릭터 상태 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">캐릭터 상태</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">💰 골드: {gold}G</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-700 font-medium">이름</p>
              <p className="font-semibold text-lg text-gray-900">{character.name}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">레벨</p>
              <p className="font-semibold text-lg text-gray-900">{character.level}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">체력</p>
              <p className="font-semibold text-lg text-red-600">
                {(() => {
                  // 현재 HP (모든 필드명 체크)
                  const currentHP = character.stats.currentHP ?? character.stats.hp ?? 0;
                  // 최대 HP (장비 보너스 포함)
                  const maxHP = totalStats.maxHp || totalStats.maxHP || character.stats.maxHp || character.stats.maxHP;
                  
                  return `${currentHP}/${maxHP}`;
                })()}
              </p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">마나</p>
              <p className="font-semibold text-lg text-blue-600">
                {(() => {
                  // 현재 MP
                  const currentMP = character.stats.mp || character.stats.currentMP || 0;
                  // 최대 MP (총 스탯에서 가져옴 - 장비 보너스 포함)
                  const maxMP = totalStats.maxMp || totalStats.maxMP || character.stats.maxMp || character.stats.maxMP || 80;
                  
                  // MP 표시
                  return `${currentMP}/${maxMP}`;
                })()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 font-medium">경험치</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-yellow-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(character.experience / character.experienceToNext) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {character.experience}/{character.experienceToNext}
              </span>
            </div>
          </div>

          {/* 상세 스탯 */}
          {totalStats && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold mb-3 text-gray-800">상세 능력치</h4>
              
              {/* 기본 3 스탯 */}
              <div className="mb-4">
                <h5 className="text-md font-semibold mb-2 text-gray-700">기본 스탯</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">STR (힘)</p>
                    <p className="font-bold text-orange-600">{totalStats.strength}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">AGI (민첩)</p>
                    <p className="font-bold text-yellow-600">{totalStats.agility}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">INT (지능)</p>
                    <p className="font-bold text-purple-600">{totalStats.intelligence}</p>
                  </div>
                </div>
              </div>
              
              {/* 전투 능력치 (파생 스탯) */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="text-md font-semibold mb-2 text-gray-700">전투 능력치</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500">공격력</p>
                    <p className="font-semibold text-red-600">{totalStats.attack}</p>
                    <p className="text-gray-400 text-xs">(힘×2)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">방어력</p>
                    <p className="font-semibold text-blue-600">{totalStats.defense.toFixed(1)}</p>
                    <p className="text-gray-400 text-xs">(힘×1.5 + 민×0.5)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">치명타율</p>
                    <p className="font-semibold text-yellow-600">{totalStats.criticalRate.toFixed(1)}%</p>
                    <p className="text-gray-400 text-xs">(민×0.5%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">치명타피해</p>
                    <p className="font-semibold text-purple-600">{totalStats.criticalDamage.toFixed(0)}%</p>
                    <p className="text-gray-400 text-xs">(지×2% + 150%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">회피율</p>
                    <p className="font-semibold text-cyan-600">{totalStats.evasion.toFixed(1)}%</p>
                    <p className="text-gray-400 text-xs">(민×1%)</p>
                  </div>
                </div>
              </div>
              
              {/* 속성 저항 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="text-md font-semibold mb-2 text-gray-700">속성 저항</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500">화염 저항</p>
                    <p className="font-semibold text-red-500">{totalStats.fireResist}</p>
                    <p className="text-gray-400 text-xs">(지×0.5)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">냉기 저항</p>
                    <p className="font-semibold text-blue-500">{totalStats.iceResist}</p>
                    <p className="text-gray-400 text-xs">(지×0.5)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">번개 저항</p>
                    <p className="font-semibold text-yellow-500">{totalStats.lightningResist}</p>
                    <p className="text-gray-400 text-xs">(지×0.5)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">독 저항</p>
                    <p className="font-semibold text-green-500">{totalStats.poisonResist}</p>
                    <p className="text-gray-400 text-xs">(지×0.5)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 마을 시설 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 던전 입구 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-bold mb-4">🏰 신비한 던전</h3>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                고대의 마법과 보물이 숨겨진 신비로운 던전입니다.
                <br />
                위험하지만 큰 보상이 기다리고 있습니다.
              </p>
              <button 
                onClick={handleEnterDungeon}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🗡️ 던전 입장
              </button>
            </div>
          </div>

          {/* 여관 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-4">🛏️ 평화로운 여관</h3>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                따뜻한 침대와 맛있는 음식으로 완전히 회복할 수 있습니다.
                <br />
                HP와 MP가 최대치까지 회복됩니다.
              </p>
              <button 
                onClick={handleFullHeal}
                disabled={(() => {
                  const currentHP = character.stats.currentHP ?? character.stats.hp ?? 0;
                  const maxHP = totalStats.maxHp || totalStats.maxHP || character.stats.maxHp || character.stats.maxHP;
                  const currentMP = character.stats.currentMP ?? character.stats.mp ?? 0;
                  const maxMP = totalStats.maxMp || totalStats.maxMP || character.stats.maxMp || character.stats.maxMP;
                  
                  // HP와 MP가 모두 최대치인 경우에만 비활성화
                  return currentHP === maxHP && currentMP === maxMP;
                })()}
                className={(() => {
                  const currentHP = character.stats.currentHP ?? character.stats.hp ?? 0;
                  const maxHP = totalStats.maxHp || totalStats.maxHP || character.stats.maxHp || character.stats.maxHP;
                  const currentMP = character.stats.currentMP ?? character.stats.mp ?? 0;
                  const maxMP = totalStats.maxMp || totalStats.maxMP || character.stats.maxMp || character.stats.maxMP;
                  
                  const isFullHealth = currentHP === maxHP && currentMP === maxMP;
                  
                  return `w-full px-6 py-3 rounded-lg transition-colors font-semibold ${
                    isFullHealth 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`;
                })()}
              >
                ❤️ 완전 회복 (무료)
              </button>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-xl font-bold mb-4">📜 마을 공지사항</h3>
          <div className="text-gray-600 space-y-2">
            <p>• 던전에서 사망하면 자동으로 마을로 돌아옵니다.</p>
            <p>• 각 던전 입장마다 새로운 던전이 생성됩니다.</p>
            <p>• 여관에서 언제든지 무료로 회복할 수 있습니다.</p>
            <p>• 던전에서 얻은 경험치와 골드는 마을에서도 유지됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Town