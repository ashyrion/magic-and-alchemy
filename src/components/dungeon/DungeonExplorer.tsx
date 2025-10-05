import React from 'react';
import { useDungeonStore } from '../../store/dungeonStore';
import { useBattleStore } from '../../store/battleStore';
import { useGameStore } from '../../store/gameStore';
import { DUNGEON_TEMPLATES } from '../../data/dungeonData';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DungeonMap } from './DungeonMap';
import './DungeonMap.css';

interface DungeonExplorerProps {
  className?: string;
}

export const DungeonExplorer: React.FC<DungeonExplorerProps> = ({ className }) => {
  const {
    initialized,
    isInDungeon,
    currentRoomId,
    rooms,
    log,
    canExitDungeon,
    initializeDungeonFromTemplate,
    getCurrentRoom,
    getAvailableExits,
    moveToAdjacentRoom,
    enterRoom,
    exitDungeon,
    enterDungeonAgain,
    addLog
  } = useDungeonStore();

  const { startBattle } = useBattleStore();
  const { character } = useGameStore();



  const currentRoom = getCurrentRoom();
  const availableExits = getAvailableExits();

  // 던전 선택
  const handleSelectDungeon = (templateId: string) => {
    console.log('던전 선택:', templateId);
    const success = initializeDungeonFromTemplate(templateId);
    console.log('던전 초기화 결과:', success);
    if (!success) {
      console.error('던전 초기화 실패');
    }
  };

  // 방 입장 및 전투 시작
  const handleRoomClick = (roomId: string) => {
    console.log('방 클릭됨:', roomId);
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      console.log('방을 찾을 수 없음:', roomId);
      return;
    }

    // 접근성 체크: 현재 방에서 직접 연결된 방인지 확인
    const currentRoom = rooms.find(r => r.id === currentRoomId);
    if (currentRoom && currentRoom.id !== roomId) {
      const isConnected = currentRoom.connections && 
        currentRoom.connections.includes(`${room.position?.x}-${room.position?.y}`);
      
      if (!isConnected && room.type !== 'start' && room.status !== 'cleared') {
        console.log('접근 불가능한 방:', roomId);
        addLog('그 방으로 직접 갈 수 없습니다. 연결된 경로를 따라 이동하세요.');
        return;
      }
    }



    // 전투방인 경우 HP 체크
    if ((room.type === 'battle' || room.type === 'boss') && character) {
      const currentHp = typeof character.stats.hp === 'number' ? character.stats.hp : 0;
      if (currentHp <= 0) {
        addLog('HP가 부족해서 전투를 할 수 없습니다. 회복이 필요합니다.');
        return;
      }
    }

    console.log('방 타입:', room.type, '방 정보:', room);

    // 방으로 이동
    enterRoom(roomId);
    
    // 방 타입에 따른 처리
    if (room.type === 'battle' && room.payload && 'enemy' in room.payload) {
      if (room.status === 'cleared') {
        // 이미 클리어된 전투방은 전투하지 않음
        addLog(`이미 처치한 적이 있던 곳입니다. 평화롭습니다.`);
      } else if (character) {
        console.log('전투 시작:', character, room.payload.enemy);
        addLog(`${room.payload.enemy.name}과(와) 조우했습니다!`);
        startBattle(character, room.payload.enemy);
      } else {
        console.log('캐릭터가 없어서 전투 시작 불가');
      }
    } else if (room.type === 'boss' && room.payload && 'boss' in room.payload) {
      if (room.status === 'cleared') {
        // 이미 클리어된 보스방은 전투하지 않음
        addLog(`이미 처치한 보스가 있던 곳입니다. 평화롭습니다.`);
      } else if (character) {
        addLog(`보스 ${room.payload.boss.name}이(가) 나타났습니다!`);
        startBattle(character, room.payload.boss);
      }
    } else if (room.type === 'treasure') {
      if (room.status === 'cleared') {
        // 이미 열린 보물 상자
        addLog('이미 열어본 보물 상자입니다. 비어있습니다.');
      } else if (room.payload && !room.payload.isOpened && character) {
        // 새로운 보물 발견 및 획득
        const { addGold } = useGameStore.getState();
        addGold(room.payload.gold);
        addLog(`보물 상자를 발견했습니다! 금화 ${room.payload.gold}개를 획득했습니다.`);
        
        // 보물 상자를 열린 상태로 변경하고 방 클리어
        setTimeout(() => {
          const { clearCurrentRoom } = useDungeonStore.getState();
          clearCurrentRoom();
        }, 1000);
      }
    } else if (room.type === 'event') {
      // 이벤트 처리
      if (room.status === 'cleared') {
        addLog('이미 경험한 이벤트입니다.');
      } else if (room.payload && !room.payload.isCompleted && character) {
        const { setCharacter } = useGameStore.getState();
        
        // 치유 이벤트 처리
        if (room.payload.effect === 'heal' && room.payload.value) {
          const healAmount = room.payload.value;
          const maxHp = typeof character.stats.maxHp === 'number' ? character.stats.maxHp : 100;
          const currentHp = typeof character.stats.hp === 'number' ? character.stats.hp : 0;
          const newHp = Math.min(maxHp, currentHp + healAmount);
          
          const updatedCharacter = {
            ...character,
            stats: {
              ...character.stats,
              hp: newHp
            }
          };
          
          setCharacter(updatedCharacter);
          addLog(`${room.payload.description}에서 HP를 ${healAmount} 회복했습니다! (${currentHp} -> ${newHp})`);
          
          // 이벤트 완료 및 방 클리어
          setTimeout(() => {
            const { clearCurrentRoom } = useDungeonStore.getState();
            clearCurrentRoom();
          }, 1000);
        } else {
          addLog(`특별한 이벤트를 발견했습니다!`);
        }
      } else {
        addLog(`특별한 이벤트를 발견했습니다!`);
      }
    } else if (room.type === 'start') {
      // 시작방
      addLog(room.payload?.welcomeMessage || '던전의 입구입니다.');
    } else if (room.type === 'exit') {
      // 출구방
      if (room.payload?.isUnlocked) {
        addLog('던전의 출구입니다. 여기서 던전을 나갈 수 있습니다.');
      } else {
        addLog(room.payload?.unlockCondition || '출구가 잠겨있습니다.');
      }
    }
  };



  // 이동
  const handleMove = (direction: string) => {
    moveToAdjacentRoom(direction);
  };

  // 던전 나가기
  const handleExitDungeon = () => {
    exitDungeon();
    addLog('던전을 떠났습니다.');
  };

  if (!initialized) {
    // 던전 선택 화면
    return (
      <div className={`dungeon-explorer ${className || ''}`}>
        <Card title="던전 선택">
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">탐험할 던전을 선택하세요:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DUNGEON_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectDungeon(template.id)}
                >
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className={`px-2 py-1 rounded ${
                      template.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      template.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                      template.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {template.difficulty}
                    </span>
                    <span className="text-gray-500">Lv.{template.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`dungeon-explorer space-y-4 ${className || ''}`}>
      {/* 현재 상태 */}
      <Card title="던전 탐험">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">
              {isInDungeon ? '던전 탐험 중' : '던전 준비 완료'}
            </h3>
            {currentRoom ? (
              <p className="text-sm text-gray-600">
                현재 위치: {currentRoom.type} 방 ({currentRoom.id})
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                상태: {initialized ? '던전 준비됨' : '던전 미초기화'} | 방 개수: {rooms.length}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {initialized && !isInDungeon && (
              <Button 
                variant="primary"
                onClick={() => {
                  enterDungeonAgain();
                }}
              >
                던전 입장
              </Button>
            )}
            {canExitDungeon && currentRoom && (currentRoom.type === 'start' || currentRoom.type === 'exit') && (
              <Button 
                variant="secondary"
                onClick={handleExitDungeon}
              >
                던전 나가기
              </Button>
            )}
          </div>
        </div>

        {/* 현재 방 정보 */}
        {currentRoom && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2">
              {currentRoom.type === 'start' ? '시작점' :
               currentRoom.type === 'battle' ? '전투방' :
               currentRoom.type === 'treasure' ? '보물방' :
               currentRoom.type === 'event' ? '이벤트방' :
               currentRoom.type === 'boss' ? '보스방' :
               currentRoom.type === 'exit' ? '출구' : '알 수 없는 방'}
            </h4>
            
            {currentRoom.description && (
              <p className="text-sm text-gray-700 mb-2">{currentRoom.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs ${
                currentRoom.status === 'current' ? 'bg-blue-100 text-blue-800' :
                currentRoom.status === 'cleared' ? 'bg-green-100 text-green-800' :
                currentRoom.status === 'visible' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentRoom.status === 'current' ? '현재 위치' :
                 currentRoom.status === 'cleared' ? '클리어됨' :
                 currentRoom.status === 'visible' ? '탐색 가능' :
                 '숨겨짐'}
              </span>
              <span className="text-xs text-gray-500">
                난이도: {currentRoom.difficulty}
              </span>
            </div>
          </div>
        )}

        {/* 이동 옵션 */}
        {isInDungeon && availableExits.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">이동 가능한 방향:</h4>
            <div className="flex gap-2">
              {availableExits.map((direction) => (
                <Button
                  key={direction}
                  variant="secondary"
                  onClick={() => handleMove(direction)}
                >
                  {direction === 'north' ? '북쪽' :
                   direction === 'south' ? '남쪽' :
                   direction === 'east' ? '동쪽' :
                   direction === 'west' ? '서쪽' : direction}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 던전 맵 */}
        {isInDungeon && rooms.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">던전 맵:</h4>
            <DungeonMap 
              rooms={rooms}
              currentRoomId={currentRoomId}
              onRoomClick={handleRoomClick}
            />
          </div>
        )}


      </Card>

      {/* 던전 로그 */}
      <Card title="탐험 로그">
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
          {log.length === 0 ? (
            <div className="text-gray-500">로그가 없습니다.</div>
          ) : (
            log.slice(-10).map((entry) => (
              <div key={entry.id} className="mb-1">
                <span className="text-gray-500">
                  [{new Date(entry.timestamp).toLocaleTimeString()}]
                </span>{' '}
                <span className={
                  entry.type === 'system' ? 'text-blue-400' :
                  entry.type === 'combat' ? 'text-red-400' :
                  entry.type === 'discovery' ? 'text-yellow-400' :
                  entry.type === 'event' ? 'text-purple-400' :
                  'text-green-400'
                }>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};