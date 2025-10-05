import React, { useState } from 'react';
import type { DungeonRoom } from '../../types/dungeon';

interface DungeonCardProps {
  room: DungeonRoom | null;
  isCurrentRoom: boolean;
  isAccessible: boolean;
  isFlipped: boolean;
  onCardClick: (room: DungeonRoom) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DungeonCard: React.FC<DungeonCardProps> = ({
  room,
  isCurrentRoom,
  isAccessible,
  isFlipped,
  onCardClick,
  className = '',
  style
}) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const getRoomIcon = () => {
    if (!room) return '';
    switch (room.type) {
      case 'start': return '🚪';
      case 'battle': return '⚔️';
      case 'treasure': return '💰';
      case 'event': return '❓';
      case 'boss': return '👹';
      case 'exit': return '🚩';
      default: return '🔘';
    }
  };

  const getRoomTypeColor = () => {
    if (!room) return '#2d3748';
    switch (room.type) {
      case 'start': return '#4299e1';
      case 'battle': return '#e53e3e';
      case 'treasure': return '#d69e2e';
      case 'event': return '#9f7aea';
      case 'boss': return '#742a2a';
      case 'exit': return '#38a169';
      default: return '#2d3748';
    }
  };

  const handleClick = () => {
    if (!room || !isAccessible) return;
    
    if (!isFlipped && room.status === 'hidden') {
      // 카드 뒤집기 애니메이션
      setIsFlipping(true);
      setTimeout(() => {
        setIsFlipping(false);
        onCardClick(room);
      }, 600); // 0.6초 후 콜백 실행
    } else {
      onCardClick(room);
    }
  };

  if (!room) {
    return (
      <div className={`dungeon-card empty-card ${className}`}>
        <div className="card-content">
          <div className="empty-marker">∅</div>
        </div>
      </div>
    );
  }

  // 출구는 한번 방문하거나 뒤집어지면 계속 앞면 표시, 시작방은 항상 표시
  const showFront = room.type === 'start' || 
                   room.status === 'cleared' || 
                   (room.type === 'exit' && (isCurrentRoom || isFlipped)) ||
                   (room.type !== 'exit' && isFlipped);

  return (
    <div 
      className={`dungeon-card ${className} ${
        isCurrentRoom ? 'current-room' : ''
      } ${
        isAccessible ? 'accessible' : 'inaccessible'
      } ${
        isFlipping ? 'flipping' : ''
      } ${
        room.status === 'cleared' ? 'cleared' : ''
      } ${
        showFront ? 'flipped' : ''
      }`}
      onClick={handleClick}
      style={{
        cursor: isAccessible ? 'pointer' : 'not-allowed',
        ...style
      }}
    >
      <div className={`card-inner ${showFront ? 'flipped' : ''}`}>
        {/* 뒷면 */}
        <div className="card-back">
          <div className="card-pattern">
            <div className="pattern-lines"></div>
            <div className="mystery-text">?</div>
          </div>
        </div>
        
        {/* 앞면 */}
        <div 
          className="card-front"
          style={{
            borderColor: getRoomTypeColor(),
            backgroundColor: showFront ? getRoomTypeColor() + '20' : 'transparent'
          }}
        >
          <div className="room-icon" style={{ color: getRoomTypeColor() }}>
            {getRoomIcon()}
          </div>
          <div className="room-info">
            <div className="room-name">
              {room.type === 'start' ? '입구' :
               room.type === 'battle' ? '전투' :
               room.type === 'treasure' ? '보물' :
               room.type === 'event' ? '이벤트' :
               room.type === 'boss' ? '보스' :
               room.type === 'exit' ? '출구' : '방'}
            </div>
            {room.difficulty && room.difficulty > 1 && (
              <div className="room-difficulty">Lv.{Math.floor(room.difficulty)}</div>
            )}
          </div>
          
          {isCurrentRoom && (
            <div className="current-marker">📍</div>
          )}
          
          {room.status === 'cleared' && (
            <div className="cleared-marker">✓</div>
          )}
        </div>
      </div>
      
      {/* 전투 카드일 때 강조 효과 */}
      {isFlipping && room.type === 'battle' && (
        <div className="battle-highlight">
          <div className="battle-text">전투!</div>
        </div>
      )}
    </div>
  );
};