import React from 'react';

interface EventResultProps {
  eventType: string;
  effect: string;
  description: string;
  value?: number;
  onClose: () => void;
}

export const EventResult: React.FC<EventResultProps> = ({
  eventType,
  effect,
  description,
  value,
  onClose
}) => {
  // 이벤트 타입별 아이콘과 색상 설정
  const getEventStyle = () => {
    switch (effect) {
      case 'heal':
        return {
          icon: '💖',
          bgColor: 'bg-green-600',
          borderColor: 'border-green-500',
          title: '치유의 효과',
          color: 'text-green-400'
        };
      case 'buff':
        return {
          icon: '✨',
          bgColor: 'bg-blue-600',
          borderColor: 'border-blue-500',
          title: '신비한 축복',
          color: 'text-blue-400'
        };
      case 'mana':
        return {
          icon: '🔮',
          bgColor: 'bg-purple-600',
          borderColor: 'border-purple-500',
          title: '마력 회복',
          color: 'text-purple-400'
        };
      default:
        return {
          icon: '🌟',
          bgColor: 'bg-gray-600',
          borderColor: 'border-gray-500',
          title: '신비한 효과',
          color: 'text-gray-400'
        };
    }
  };

  const eventStyle = getEventStyle();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${eventStyle.bgColor} rounded-lg p-6 max-w-md w-full mx-4 border ${eventStyle.borderColor}`}>
        <div className="text-center">
          <div className={`text-3xl font-bold ${eventStyle.color} mb-4 flex items-center justify-center`}>
            <span className="mr-2">{eventStyle.icon}</span>
            {eventStyle.title}
          </div>
          
          <div className="space-y-4">
            {/* 이벤트 설명 */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-gray-200 font-medium mb-2">
                {description}
              </div>
              
              {/* 효과 값 표시 */}
              {value && effect === 'heal' && (
                <div className="text-green-300 font-bold text-xl">
                  HP +{value} 회복!
                </div>
              )}
              {value && effect === 'mana' && (
                <div className="text-blue-300 font-bold text-xl">
                  MP +{value} 회복!
                </div>
              )}
              {value && effect === 'buff' && (
                <div className="text-yellow-300 font-bold text-xl">
                  능력치 +{value} 증가!
                </div>
              )}
            </div>

            {/* 이벤트 타입별 추가 정보 */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-sm">
                {eventType === 'rest' && '🛏️ 휴식처에서 체력을 회복했습니다.'}
                {eventType === 'fountain' && '⛲ 마법의 샘에서 마력을 회복했습니다.'}
                {eventType === 'altar' && '🏛️ 신비한 제단에서 축복을 받았습니다.'}
                {eventType === 'merchant' && '🏪 떠돌이 상인을 만났습니다.'}
                {!['rest', 'fountain', 'altar', 'merchant'].includes(eventType) && 
                  '🌟 특별한 이벤트가 발생했습니다.'}
              </div>
            </div>
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={onClose}
            className={`mt-6 px-6 py-2 ${eventStyle.bgColor} hover:opacity-80 text-white font-semibold rounded-lg transition-colors border ${eventStyle.borderColor}`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};