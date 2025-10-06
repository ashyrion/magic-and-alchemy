import React from 'react';
import type { DungeonRoom } from '../../types/dungeon';

interface DungeonRoomNodeProps {
  room: DungeonRoom;
  isCurrentRoom: boolean;
  isAccessible: boolean;
  onRoomClick: (roomId: string) => void;
  className?: string;
}

export const DungeonRoomNode: React.FC<DungeonRoomNodeProps> = ({
  room,
  isCurrentRoom,
  isAccessible,
  onRoomClick,
  className = ''
}) => {
  const getRoomIcon = () => {
    switch (room.type) {
      case 'start': return '🚪';
      case 'battle': return '⚔️';
      case 'treasure': return '💰';
      case 'event': return '❓';
      case 'empty': return '🏛️'; // 빈방 아이콘
      case 'boss': return '👹';
      case 'exit': return '🚩';
      default: return '🔘';
    }
  };

  const getRoomStatusClass = () => {
    if (isCurrentRoom) return 'current-room';
    if (room.status === 'cleared') return 'cleared-room';
    if (room.status === 'visible' || room.status === 'in-progress') return 'accessible-room';
    return 'hidden-room';
  };

  const getRoomTypeClass = () => {
    return `room-${room.type}`;
  };

  const canClick = isAccessible && room.status !== 'hidden';

  return (
    <div 
      className={`dungeon-room-node ${getRoomStatusClass()} ${getRoomTypeClass()} ${className}`}
      onClick={() => canClick && onRoomClick(room.id)}
      style={{
        cursor: canClick ? 'pointer' : 'not-allowed',
        opacity: room.status === 'hidden' ? 0.3 : room.status === 'cleared' ? 0.8 : 1,
      }}
    >
      <div className="room-icon">
        {getRoomIcon()}
      </div>
      <div className="room-info">
        <div className="room-name">
          {room.type === 'start' ? '시작' :
           room.type === 'battle' ? '전투' :
           room.type === 'treasure' ? '보물' :
           room.type === 'event' ? '이벤트' :
           room.type === 'empty' ? '빈방' :
           room.type === 'boss' ? '보스' :
           room.type === 'exit' ? '출구' : '방'}
        </div>
        {room.difficulty && (
          <div className="room-difficulty">Lv.{room.difficulty}</div>
        )}
      </div>
      {isCurrentRoom && (
        <div className="current-marker">📍</div>
      )}
    </div>
  );
};