import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { 
  DungeonState, 
  DungeonRoom, 
  DungeonConfig, 
  DungeonLogEntry
} from '../types/dungeon'
import { generateDungeonFloor } from '../utils/dungeonGenerator'
import { useBattleStore } from './battleStore'
import { useGameStore } from './gameStore'
import { useInventoryStore } from './inventoryStore'

interface DungeonStore extends DungeonState {
  // 기존 기능
  startDungeon: (config?: DungeonConfig) => void
  enterRoom: (roomId: string) => void
  resolveBattleRoom: (success: boolean) => void
  advanceFloor: () => void
  resetDungeon: () => void
  addLog: (message: string) => void
  
  // 새로운 기능들
  initializeDungeonFromTemplate: (templateId: string) => boolean
  moveToAdjacentRoom: (direction: string) => boolean
  getCurrentRoom: () => DungeonRoom | null
  canMoveInDirection: (direction: string) => boolean
  getAvailableExits: () => string[]
  exitDungeon: () => void
  enterDungeonAgain: () => void
  clearCurrentRoom: () => void
  revealNextRooms: () => void
}

const initialState: DungeonState = {
  initialized: false,
  currentFloor: 0,
  currentRoomId: null,
  rooms: [],
  clearedFloors: [],
  completedDungeons: [],
  log: [],
  isInDungeon: false,
  canExitDungeon: false,
}

const MAX_LOG_LENGTH = 50

const updateCharacterHp = (amount: number) => {
  useGameStore.setState((state) => {
    if (!state.character) return state

    const currentStats = state.character.stats
    const healedHp = Math.min(currentStats.maxHp, currentStats.hp + amount)
    const healedMp = Math.min(currentStats.maxMp, currentStats.mp + Math.floor(amount / 2))

    return {
      character: {
        ...state.character!,
        stats: {
          ...currentStats,
          hp: healedHp,
          mp: healedMp,
        },
      },
    }
  })
}

const markRoomStatus = (rooms: DungeonRoom[], roomId: string, status: DungeonRoom['status']) =>
  rooms.map((room) => (room.id === roomId ? { ...room, status } : room))

export const useDungeonStore = create<DungeonStore>()(
  devtools((set, get) => ({
    ...initialState,

    addLog: (message: string) => {
      const entry: DungeonLogEntry = {
        id: uuidv4(),
        type: 'system',
        message,
        timestamp: Date.now(),
      }
      set((state) => {
        const nextLog = [...state.log, entry]
        if (nextLog.length > MAX_LOG_LENGTH) nextLog.shift()
        return {
          log: nextLog,
        }
      })
    },

    startDungeon: (config) => {
      const rooms = generateDungeonFloor(1, config)
      const startRoom = rooms.find(r => r.type === 'start') || rooms[0]
      
      set({
        initialized: true,
        currentFloor: 1,
        rooms,
        currentRoomId: startRoom?.id || null,
        clearedFloors: [],
        log: [],
        isInDungeon: true,
        canExitDungeon: true
      })
      
      get().addLog('던전 탐험을 시작합니다! 입구에 도착했습니다.')
    },

    enterRoom: (roomId) => {
      const state = get()
      if (!state.initialized) {
        get().addLog('던전이 시작되지 않았습니다. `startDungeon`을 먼저 호출하세요.')
        return
      }

      const targetRoom = state.rooms.find((room) => room.id === roomId)
      if (!targetRoom) {
        get().addLog('해당 방을 찾을 수 없습니다.')
        return
      }

      // 클리어된 방에 재입장 시 중복 이벤트 방지
      if (targetRoom.status === 'cleared') {
        set({ currentRoomId: roomId });
        get().addLog('이미 클리어한 방입니다.');
        return;
      }

      // 현재 위치 업데이트
      set({
        currentRoomId: roomId,
        rooms: markRoomStatus(state.rooms, roomId, 'in-progress'),
      })

      if (targetRoom.type === 'battle') {
        const player = useGameStore.getState().character
        if (!player) {
          get().addLog('플레이어 캐릭터 정보를 찾을 수 없어 전투를 시작할 수 없습니다.')
          return
        }

        useBattleStore.getState().startBattle(player, targetRoom.payload.enemy)
        get().addLog(`${targetRoom.payload.enemy.name}와의 전투를 시작합니다.`)
        return
      }

      if (targetRoom.type === 'treasure') {
        const inventory = useInventoryStore.getState()
        const { items, gold } = targetRoom.payload
        let collected = 0

        items.forEach((item) => {
          if (inventory.addItem(item)) {
            collected += 1
          }
        })
        inventory.addGold(gold)

        set({
          rooms: markRoomStatus(get().rooms, roomId, 'cleared'),
        })
        get().addLog(`보물 상자를 열어 골드 ${gold}와 아이템 ${collected}개를 획득했습니다.`)
        return
      }

      if (targetRoom.type === 'event') {
        if (targetRoom.payload.effect === 'heal') {
          updateCharacterHp(targetRoom.payload.value)
          get().addLog(`휴식 이벤트로 HP/MP가 회복되었습니다. (+${targetRoom.payload.value})`)
        } else {
          get().addLog('이벤트 방을 탐험했지만 아직 해당 효과는 구현되지 않았습니다.')
        }
        set({
          rooms: markRoomStatus(get().rooms, roomId, 'cleared'),
        })
        return
      }

      if (targetRoom.type === 'start') {
        get().addLog('던전의 입구입니다.')
        return
      }

      if (targetRoom.type === 'exit') {
        get().addLog('던전의 출구에 도달했습니다! 다음 층으로 이동할 수 있습니다.')
        return
      }
    },

    resolveBattleRoom: (success) => {
      const { currentRoomId, rooms } = get()
      if (!currentRoomId) return

      if (success) {
        set({
          rooms: markRoomStatus(rooms, currentRoomId, 'cleared'),
        })
        get().addLog('전투에서 승리했습니다. 방을 클리어했습니다.')
      } else {
        // 전투 실패 시에도 방은 뒤집어진 상태 유지 (카드 시스템에서 한번 뒤집은 카드는 계속 보임)
        set({
          rooms: markRoomStatus(rooms, currentRoomId, 'in-progress'),
        })
        get().addLog('전투에서 패배했습니다. 다시 도전할 수 있습니다.')
      }
      set({ currentRoomId: null })
    },

    advanceFloor: () => {
      const state = get()
      if (!state.initialized) return
      const floorSummary = {
        floor: state.currentFloor,
        rooms: state.rooms,
      }
      const nextFloor = state.currentFloor + 1
      const nextRooms = generateDungeonFloor(nextFloor)
      set({
        currentFloor: nextFloor,
        currentRoomId: null,
        rooms: nextRooms,
        clearedFloors: [...state.clearedFloors, floorSummary],
      })
      get().addLog(`${nextFloor}층으로 내려갑니다. 난이도가 상승합니다.`)
    },

    resetDungeon: () => {
      set(initialState)
    },

    // 새로운 메서드들
    initializeDungeonFromTemplate: (templateId: string): boolean => {
      try {
        // 기존 startDungeon을 활용하여 던전 시작
        get().startDungeon({ roomsPerFloor: 8 });
        
        // 첫 번째 방으로 자동 입장
        const { rooms, currentRoomId } = get();
        if (rooms.length > 0 && currentRoomId) {
          get().enterRoom(currentRoomId);
        }
        
        get().addLog(`던전 "${templateId}"을(를) 시작합니다. 탐험을 시작하세요!`);
        return true;
      } catch (error) {
        console.error('던전 초기화 실패:', error);
        get().addLog('던전 초기화에 실패했습니다.');
        return false;
      }
    },

    moveToAdjacentRoom: (direction: string): boolean => {
      const currentRoom = get().getCurrentRoom();
      if (!currentRoom || !get().canMoveInDirection(direction)) {
        return false;
      }
      
      // 4x4 카드 시스템에서는 사용되지 않는 레거시 함수
      const rooms = get().rooms;
      const adjacentRoom = rooms.find(r => r.id !== currentRoom.id && r.status === 'cleared');
      
      if (adjacentRoom) {
        get().enterRoom(adjacentRoom.id);
        get().addLog(`${direction} 방향으로 이동했습니다.`);
        return true;
      }
      
      return false;
    },

    getCurrentRoom: (): DungeonRoom | null => {
      const { currentRoomId, rooms } = get();
      return rooms.find(r => r.id === currentRoomId) || null;
    },

    canMoveInDirection: (direction: string): boolean => {
      const currentRoom = get().getCurrentRoom();
      if (!currentRoom) return false;
      
      // 4x4 카드 시스템에서는 사용되지 않는 레거시 함수
      // 접근 가능한 방들은 DungeonMap에서 처리
      const hasRoomsInDirection = get().rooms.some(r => 
        r.id !== currentRoom.id && 
        (r.status === 'cleared' || r.status === 'in-progress')
      );
      
      // direction 매개변수 사용 (향후 실제 방향 계산에 활용)
      return hasRoomsInDirection && ['north', 'south', 'east', 'west'].includes(direction);
    },

    getAvailableExits: (): string[] => {
      const currentRoom = get().getCurrentRoom();
      if (!currentRoom) return [];
      
      // 사용 가능한 출구 방향들 반환
      const exits: string[] = [];
      if (get().canMoveInDirection('north')) exits.push('north');
      if (get().canMoveInDirection('south')) exits.push('south');
      if (get().canMoveInDirection('east')) exits.push('east');
      if (get().canMoveInDirection('west')) exits.push('west');
      
      return exits;
    },

    exitDungeon: (): void => {
      set({
        isInDungeon: false,
        canExitDungeon: false,
        currentRoomId: null
      });
      get().addLog('던전에서 나왔습니다.');
    },

    enterDungeonAgain: (): void => {
      const { rooms } = get();
      
      // 가장 마지막 클리어된 방 또는 시작방 찾기
      const lastClearedRoom = rooms
        .filter(r => r.status === 'cleared')
        .sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0))
        .pop();
      
      const startRoom = rooms.find(r => r.type === 'start');
      const targetRoom = lastClearedRoom || startRoom || rooms[0];
      
      set({
        isInDungeon: true,
        canExitDungeon: true,
        currentRoomId: targetRoom?.id || null
      });
      
      get().addLog('던전에 다시 입장했습니다!');
    },

    clearCurrentRoom: (): void => {
      const { currentRoomId } = get();
      if (!currentRoomId) {
        console.log('[던전] clearCurrentRoom: 현재 방이 없음');
        return;
      }

      console.log('[던전] 방 클리어 중:', currentRoomId);

      // 현재 방을 클리어 상태로 변경
      set(state => ({
        rooms: markRoomStatus(state.rooms, currentRoomId, 'cleared')
      }));

      // 다음 방들을 visible로 만들기
      get().revealNextRooms();
      
      get().addLog('방을 클리어했습니다!');
      console.log('[던전] 방 클리어 완료:', currentRoomId);
    },

    revealNextRooms: (): void => {
      // 4x4 카드 시스템에서는 flippedCards로 관리하므로 여기서는 특별한 처리 불필요
      // 연결된 방들은 접근성 로직에서 자동으로 처리됨
      console.log('[던전] revealNextRooms 호출됨 (카드 시스템에서는 불필요)');
    },
  }))
)
