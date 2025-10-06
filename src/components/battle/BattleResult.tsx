import React, { useState, useEffect } from 'react';
import type { Combatant } from '../../types/battle';
import { getItemById } from '../../data/items'; // getItemById 임포트

interface BattleResultProps {
  victory: boolean;
  enemy: Combatant;
  rewards: {
    experience: number;
    gold: number;
    items: { id: string; count: number }[]; // 타입 수정
  };
  onClose: () => void;
}

export const BattleResult: React.FC<BattleResultProps> = ({
  victory,
  enemy,
  rewards,
  onClose
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 승리/패배 모두에 대해 카운트다운 실행
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 카운트다운이 끝나면 자동으로 결과창 닫기
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-600">
        {/* 결과 헤더 */}
        <div className="text-center mb-6">
          {victory ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-green-400">승리!</h2>
              <p className="text-gray-300 mt-2">{enemy.name}을(를) 물리쳤습니다!</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">💀</div>
              <h2 className="text-2xl font-bold text-red-400">패배!</h2>
              <p className="text-gray-300 mt-2">{enemy.name}에게 패배했습니다...</p>
            </>
          )}
        </div>

        {/* 보상 정보 (승리 시에만 표시) */}
        {victory && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 text-center">
              획득 보상
            </h3>
            
            <div className="space-y-3">
              {/* 경험치 */}
              <div className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">⭐</span>
                  <span className="text-white">경험치</span>
                </div>
                <span className="text-blue-300 font-bold">+{rewards.experience} EXP</span>
              </div>

              {/* 골드 */}
              <div className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">🪙</span>
                  <span className="text-white">골드</span>
                </div>
                <span className="text-yellow-300 font-bold">+{rewards.gold}G</span>
              </div>

              {/* 아이템 */}
              {rewards.items.length > 0 && (
                <div className="bg-gray-700 rounded p-3">
                  <div className="flex items-center mb-2">
                    <span className="text-purple-400 mr-2">🎁</span>
                    <span className="text-white font-semibold">획득 아이템</span>
                  </div>
                  <div className="space-y-1">
                    {rewards.items.map((item, index) => {
                      const itemInfo = getItemById(item.id);
                      return (
                        <div key={index} className="text-purple-300 text-sm pl-6">
                          • {itemInfo ? `${itemInfo.name} x${item.count}` : `${item.id} x${item.count}`}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* 승리 시 자동 진행 안내 */}
            {countdown > 0 && (
              <div className="mt-4 text-center">
                <p className="text-green-300 text-sm">
                  {countdown}초 후 자동으로 던전 탐험을 계속합니다...
                </p>
              </div>
            )}
          </div>
        )}

        {/* 패배 시 안내 */}
        {!victory && (
          <div className="mb-6 text-center">
            <div className="bg-red-900 bg-opacity-50 rounded p-4">
              <p className="text-red-300 text-sm">
                던전에서 안전한 곳으로 이동됩니다.
                <br />
                회복 후 다시 도전해보세요!
              </p>
              {countdown > 0 && (
                <p className="text-yellow-400 text-lg font-bold mt-2">
                  {countdown}초 후 자동으로 마을로 이동합니다...
                </p>
              )}
            </div>
          </div>
        )}

        {/* 확인 버튼 */}
        <div className="text-center">
          <button
            onClick={onClose}
            className={`px-8 py-3 rounded font-semibold transition-colors ${
              victory
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
{victory 
              ? countdown > 0 ? `즉시 계속하기 (${countdown}초)` : '계속하기'
              : countdown > 0 ? `즉시 마을로 (${countdown}초)` : '마을로 이동'
            }
          </button>
        </div>
      </div>
    </div>
  );
};