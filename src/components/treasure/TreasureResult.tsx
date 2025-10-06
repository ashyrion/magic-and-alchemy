import React from 'react';

interface TreasureResultProps {
  gold: number;
  items?: string[];
  onClose: () => void;
}

export const TreasureResult: React.FC<TreasureResultProps> = ({
  gold,
  items = [],
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-yellow-500">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-4">
            🏆 보물 발견!
          </div>
          
          <div className="space-y-4">
            {/* 골드 획득 */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-yellow-300 font-semibold">획득한 골드</div>
              <div className="text-2xl font-bold text-yellow-400">
                {gold} 골드
              </div>
            </div>

            {/* 아이템 획득 (있는 경우) */}
            {items.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-blue-300 font-semibold mb-2">획득한 아이템</div>
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <div key={index} className="text-blue-200">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};