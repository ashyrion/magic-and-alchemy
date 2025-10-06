import React, { useState, useCallback, useEffect } from 'react';
import { DungeonCard } from './DungeonCard';
import type { DungeonRoom } from '../../types/dungeon';
import './DungeonCardMap.css';

interface DungeonMapProps {
  rooms: DungeonRoom[];
  currentRoomId: string | null;
  onRoomClick: (roomId: string) => void;
  className?: string;
}

export const DungeonMap: React.FC<DungeonMapProps> = ({
  rooms,
  currentRoomId,
  onRoomClick,
  className = ''
}) => {
  // 시작방 자동 뒤집기
  const startRoom = rooms.find(r => r.type === 'start');
  const initialFlipped = startRoom ? new Set([startRoom.id]) : new Set<string>();
  
  const [flippedCards, setFlippedCards] = useState<Set<string>>(initialFlipped);
  const [battleHighlight, setBattleHighlight] = useState<string | null>(null);

  // 방 상태 변화 감지하여 카드 플립 상태 업데이트
  useEffect(() => {
    const clearedRooms = rooms.filter(room => room.status === 'cleared' || room.status === 'in-progress');
    
    setFlippedCards(prev => {
      const newFlipped = new Set(prev);
      
      clearedRooms.forEach(room => {
        newFlipped.add(room.id);
      });
      
      // 시작방도 항상 뒤집어진 상태로 유지
      if (startRoom) {
        newFlipped.add(startRoom.id);
      }
      
      return newFlipped;
    });
  }, [rooms, startRoom]);
  
  // rooms가 변경될 때마다 시작방 뒤집기 상태 업데이트
  React.useEffect(() => {
    const newStartRoom = rooms.find(r => r.type === 'start');
    if (newStartRoom) {
      setFlippedCards(prev => {
        if (prev.has(newStartRoom.id)) {
          return prev; // 이미 뒤집어져 있으면 변경하지 않음
        }
        return new Set([...prev, newStartRoom.id]);
      });
    }
  }, [rooms]); // flippedCards 의존성 제거

  // 4x4 그리드 생성
  const createGrid = () => {
    const grid: (DungeonRoom | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
    
    rooms.forEach(room => {
      if (room.position && room.position.x < 4 && room.position.y < 4) {
        grid[room.position.y][room.position.x] = room;
      }
    });
    
    return grid;
  };

  // 접근 가능한 방들 계산 - 현재 위치에서 직접 연결된 방만 접근 가능
  const getAccessibleRooms = () => {
    const accessible = new Set<string>();
    
    // 현재 방이 없으면 시작방만 접근 가능
    if (!currentRoomId) {
      const startRoom = rooms.find(r => r.type === 'start');
      if (startRoom) {
        accessible.add(startRoom.id);
      }
      return accessible;
    }
    
    // 현재 방 찾기
    const currentRoom = rooms.find(r => r.id === currentRoomId);
    if (!currentRoom) {
      return accessible;
    }
    
    // 현재 방은 항상 접근 가능
    accessible.add(currentRoom.id);
    
    // 현재 방에서 직접 연결된 방들만 접근 가능
    if (currentRoom.connections && currentRoom.connections.length > 0) {
      currentRoom.connections.forEach(connectionKey => {
        const connectedRoom = rooms.find(r => {
          if (!r.position) return false;
          return `${r.position.x}-${r.position.y}` === connectionKey;
        });
        
        if (connectedRoom) {
          accessible.add(connectedRoom.id);
        }
      });
    }

    return accessible;
  };

  const handleCardClick = useCallback((room: DungeonRoom) => {
    // 카드 뒤집기 로직
    const isCardFlipped = flippedCards.has(room.id) || room.status !== 'hidden';
    
    if (!isCardFlipped) {
      // 카드를 뒤집는 경우
      if (room.type !== 'exit') {
        // 출구가 아닌 경우만 flippedCards 상태 업데이트
        setFlippedCards(prev => {
          const newSet = new Set([...prev, room.id]);
          console.log('[DungeonMap] 카드 뒤집기:', room.id, '전체:', [...newSet]);
          return newSet;
        });
      }
      
      // 전투 카드면 강조 효과
      if (room.type === 'battle') {
        setBattleHighlight(room.id);
        
        // 1초 후 전투로 이동
        setTimeout(() => {
          setBattleHighlight(null);
          onRoomClick(room.id);
        }, 1000);
      } else {
        // 다른 타입은 바로 처리 (출구 포함)
        setTimeout(() => {
          onRoomClick(room.id);
        }, 300);
      }
    } else {
      // 이미 뒤집어진 카드는 바로 처리
      onRoomClick(room.id);
    }
  }, [onRoomClick, flippedCards]);

  const grid = createGrid();
  const accessibleRooms = getAccessibleRooms();

  return (
    <div className={`dungeon-map-grid ${className}`}>
      <div className="grid-container">
        {grid.map((row, y) => 
          row.map((room, x) => (
            <DungeonCard
              key={`${x}-${y}`}
              room={room}
              isCurrentRoom={room?.id === currentRoomId}
              isAccessible={room ? accessibleRooms.has(room.id) : false}
              isFlipped={room ? flippedCards.has(room.id) : false}
              onCardClick={handleCardClick}
              className={`grid-card ${
                battleHighlight === room?.id ? 'battle-highlighting' : ''
              }`}
            />
          ))
        )}
      </div>
      
      {/* 연결선은 일단 제거 - 나중에 다시 처리 */}
    </div>
  );
};