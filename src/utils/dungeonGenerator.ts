import { v4 as uuidv4 } from 'uuid'
import { getEnemiesForDungeonLevel, getBossForDungeonLevel } from '../data/enemyData'
import { testItems } from '../data/gameData'
import { generateEnhancedItem } from './itemGenerator'
import type { DungeonRoom, DungeonConfig, EventType } from '../types/dungeon'
import type { GeneratedItem } from '../types/gameTypes'

// 이벤트 타입별 데이터
const EVENT_DATA = {
  // 긍정적 이벤트 (30%)
  positive: [
    {
      type: 'heal' as EventType,
      name: '치유의 샘',
      description: '신비한 샘에서 맑은 물을 마십니다.',
      effect: 'heal' as const,
      minValue: 30,
      maxValue: 60
    },
    {
      type: 'fountain' as EventType,
      name: '마나 샘',
      description: '마법의 기운이 느껴지는 샘입니다.',
      effect: 'heal' as const,
      minValue: 20,
      maxValue: 40
    },
    {
      type: 'buff' as EventType,
      name: '축복의 제단',
      description: '신성한 기운이 당신을 강화합니다.',
      effect: 'buff' as const,
      minValue: 15,
      maxValue: 25
    }
  ],
  // 부정적 이벤트 (70%)
  negative: [
    {
      type: 'trap' as EventType,
      name: '함정',
      description: '바닥에 숨겨진 함정에 걸렸습니다!',
      effect: 'damage' as const,
      minValue: 10,
      maxValue: 25
    },
    {
      type: 'trap' as EventType,
      name: '독가스 함정',
      description: '독가스가 분출됩니다!',
      effect: 'damage' as const,
      minValue: 15,
      maxValue: 30
    },
    {
      type: 'altar' as EventType,
      name: '저주받은 제단',
      description: '어둠의 기운이 당신을 약화시킵니다.',
      effect: 'damage' as const,
      minValue: 5,
      maxValue: 20
    },
    {
      type: 'puzzle' as EventType,
      name: '수상한 보물상자',
      description: '상자를 열었지만 함정이었습니다!',
      effect: 'damage' as const,
      minValue: 8,
      maxValue: 18
    }
  ]
}

// 보물 타입별 데이터
const TREASURE_DATA = {
  // 보통 보상 (90%)
  common: {
    goldMin: 30,
    goldMax: 80,
    itemCount: 1,
    itemPool: testItems.slice(0, Math.ceil(testItems.length * 0.7)) // 전체 아이템의 70%
  },
  // 레어 보상 (10%)
  rare: {
    goldMin: 100,
    goldMax: 200,
    itemCount: 2,
    itemPool: testItems.slice(Math.ceil(testItems.length * 0.7)) // 전체 아이템의 30%
  }
}



const DEFAULT_CONFIG: Required<DungeonConfig> = {
  roomsPerFloor: 10, // 밸런스 조정: 12 -> 10 (더 적은 방)
  treasureChance: 0.12,  // 밸런스 조정: 0.2 -> 0.12 (보물방 12%)
  eventChance: 0.08,     // 밸런스 조정: 0.15 -> 0.08 (이벤트방 8%)
  layoutType: 'grid',
  guaranteeRest: false,
  guaranteeTreasure: false,
  enemyLevelMultiplier: 1.0,
  rewardMultiplier: 1.0,
  seed: 12345
}

// 방 타입별 최대 개수 제한 (더 엄격하게)
const ROOM_LIMITS = {
  treasure: 1,  // 보물방 최대 1개로 감소
  event: 1,     // 이벤트방 최대 1개로 감소
  empty: 4      // 빈방 최대 4개로 증가
}

// 랜덤 이벤트 생성
const generateRandomEvent = () => {
  const isPositive = Math.random() < 0.3; // 30% 긍정, 70% 부정
  const eventPool = isPositive ? EVENT_DATA.positive : EVENT_DATA.negative;
  const eventData = eventPool[Math.floor(Math.random() * eventPool.length)];
  
  const value = Math.floor(
    eventData.minValue + Math.random() * (eventData.maxValue - eventData.minValue)
  );
  
  return {
    eventType: eventData.type,
    name: eventData.name,
    effect: eventData.effect,
    value: value,
    description: eventData.description,
    isPositive
  };
};

// 랜덤 보물 생성 (새로운 아이템 시스템 사용)
const generateRandomTreasure = (floorNumber: number, adjustedRewardMultiplier: number) => {
  const isRare = Math.random() < 0.1; // 10% 레어, 90% 보통
  const treasureData = isRare ? TREASURE_DATA.rare : TREASURE_DATA.common;
  
  const gold = Math.floor(
    (treasureData.goldMin + Math.random() * (treasureData.goldMax - treasureData.goldMin)) * 
    adjustedRewardMultiplier
  );
  
  const items: GeneratedItem[] = [];
  const availableItems = treasureData.itemPool.length > 0 ? treasureData.itemPool : testItems;
  
  for (let i = 0; i < treasureData.itemCount; i++) {
    if (availableItems.length > 0) {
      const baseItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      
      // 던전 층수에 따른 등급 확률 조정
      let rarityRoll = Math.random();
      let targetRarity: 'common' | 'magic' | 'rare' | 'unique';
      
      // 높은 층일수록 좋은 아이템 확률 증가
      const floorBonus = Math.min(floorNumber * 0.02, 0.15); // 최대 15% 보너스로 감소
      
      if (rarityRoll < 0.70 - floorBonus) targetRarity = 'common';
      else if (rarityRoll < 0.92 - floorBonus) targetRarity = 'magic';
      else if (rarityRoll < 0.985) targetRarity = 'rare';
      else targetRarity = 'unique';
      
      // 레어 보물의 경우 최소 매직 등급 보장
      if (isRare && targetRarity === 'common') {
        targetRarity = 'magic';
      }
      
      const enhancedItem = generateEnhancedItem(baseItem, targetRarity);
      items.push(enhancedItem);
    }
  }
  
  return {
    gold,
    items,
    isRare
  };
};

// 빈방 생성 (연결되어 있지만 아무 이벤트가 없는 방)
const generateEmptyRoom = (pos: { x: number; y: number }, floorNumber: number): DungeonRoom => {
  const emptyDescriptions = [
    '텅 빈 방입니다. 먼지만 쌓여있고 특별한 것은 없습니다.',
    '오래된 방입니다. 아무도 없고 조용합니다.',
    '이미 누군가가 다녀간 것 같은 방입니다. 휴식을 취할 수 있을 것 같습니다.',
    '평범한 빈 방입니다. 잠시 숨을 돌릴 수 있습니다.'
  ];
  
  return {
    id: uuidv4(),
    type: 'empty', // 새로운 타입으로 변경
    status: 'hidden',
    difficulty: floorNumber,
    position: pos,
    connections: [],
    description: emptyDescriptions[Math.floor(Math.random() * emptyDescriptions.length)],
    payload: {
      canRest: true,
      description: '평화로운 장소입니다. 잠시 휴식을 취할 수 있습니다.'
    }
  };
};

const GRID_SIZE = 4

interface Position {
  x: number
  y: number
}

// BFS로 최단경로 찾기
const findPath = (start: Position, end: Position, grid: (DungeonRoom | null)[][]): Position[] => {
  if (start.x === end.x && start.y === end.y) return [start]
  
  const queue = [{ pos: start, path: [start] }]
  const visited = new Set<string>()
  
  while (queue.length > 0) {
    const current = queue.shift()!
    const { pos, path } = current
    const key = `${pos.x}-${pos.y}`
    
    if (visited.has(key)) continue
    visited.add(key)
    
    const directions = [
      { dx: 0, dy: -1 }, // 위
      { dx: 0, dy: 1 },  // 아래  
      { dx: -1, dy: 0 }, // 왼쪽
      { dx: 1, dy: 0 }   // 오른쪽
    ]
    
    for (const { dx, dy } of directions) {
      const newX = pos.x + dx
      const newY = pos.y + dy
      const newKey = `${newX}-${newY}`
      
      if (newX >= 0 && newX < GRID_SIZE && 
          newY >= 0 && newY < GRID_SIZE && 
          !visited.has(newKey) && 
          grid[newY][newX] !== null) {
        
        const newPath = [...path, { x: newX, y: newY }]
        
        // 목적지 도달
        if (newX === end.x && newY === end.y) {
          return newPath
        }
        
        queue.push({ pos: { x: newX, y: newY }, path: newPath })
      }
    }
  }
  
  return []
}

// 양방향 연결 생성 함수
const addBidirectionalConnection = (rooms: DungeonRoom[], pos1: Position, pos2: Position): void => {
  const room1 = rooms.find(r => r.position && r.position.x === pos1.x && r.position.y === pos1.y)
  const room2 = rooms.find(r => r.position && r.position.x === pos2.x && r.position.y === pos2.y)
  
  if (room1 && room2) {
    const key1to2 = `${pos2.x}-${pos2.y}`
    const key2to1 = `${pos1.x}-${pos1.y}`
    
    if (!room1.connections.includes(key1to2)) {
      room1.connections.push(key1to2)
    }
    if (!room2.connections.includes(key2to1)) {
      room2.connections.push(key2to1)
    }
  }
}

// 연결 생성 및 검증
const createConnections = (rooms: DungeonRoom[], grid: (DungeonRoom | null)[][]): void => {
  const startRoom = rooms.find(r => r.type === 'start')!
  const exitRoom = rooms.find(r => r.type === 'exit')!
  
  // 1단계: 보장된 경로 찾기
  const guaranteedPath = findPath(startRoom.position!, exitRoom.position!, grid)
  
  console.log('보장된 경로:', guaranteedPath)
  
  if (guaranteedPath.length === 0) {
    console.error('입구에서 출구로의 경로를 찾을 수 없습니다!')
    return
  }
  
  // 2단계: 보장된 경로를 따라 양방향 연결 생성
  for (let i = 0; i < guaranteedPath.length - 1; i++) {
    const current = guaranteedPath[i]
    const next = guaranteedPath[i + 1]
    
    addBidirectionalConnection(rooms, current, next)
  }
  
  // 3단계: 추가 양방향 연결 생성 (연결성 개선을 위해 확률 증가)
  rooms.forEach(room => {
    if (!room.position) return
    
    const { x, y } = room.position
    const directions = [
      { dx: 0, dy: -1 }, // 위
      { dx: 0, dy: 1 },  // 아래
      { dx: -1, dy: 0 }, // 왼쪽
      { dx: 1, dy: 0 }   // 오른쪽
    ]
    
    directions.forEach(({ dx, dy }) => {
      const newX = x + dx
      const newY = y + dy
      
      if (newX >= 0 && newX < GRID_SIZE && 
          newY >= 0 && newY < GRID_SIZE && 
          grid[newY][newX] !== null) {
        
        const connectionKey = `${newX}-${newY}`
        const targetPos = { x: newX, y: newY }
        const currentPos = { x, y }
        
        // 연결성 개선: 70% 확률로 추가 양방향 연결 (이미 연결된 경우 제외)
        if (Math.random() < 0.7 && !room.connections.includes(connectionKey)) {
          addBidirectionalConnection(rooms, currentPos, targetPos)
        }
      }
    })
  })
  
  // 4단계: 고립된 방 양방향 연결 (최소 1개 연결 보장)
  rooms.forEach(room => {
    if (!room.position || room.connections.length > 0) return
    
    const { x, y } = room.position
    const directions = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, 
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ]
    
    for (const { dx, dy } of directions) {
      const newX = x + dx
      const newY = y + dy
      
      if (newX >= 0 && newX < GRID_SIZE && 
          newY >= 0 && newY < GRID_SIZE && 
          grid[newY][newX] !== null) {
        
        const currentPos = { x, y }
        const targetPos = { x: newX, y: newY }
        addBidirectionalConnection(rooms, currentPos, targetPos)
        console.log(`고립된 방 ${room.type} (${x},${y})에 양방향 연결 추가: ${newX},${newY}`)
        break
      }
    }
  })
  
  // 최종 검증
  const finalPath = findPath(startRoom.position!, exitRoom.position!, grid)
  console.log('최종 입구-출구 경로:', finalPath.length > 0 ? '연결됨' : '연결 안됨')
}

export const generateDungeonFloor = (
  floorNumber: number, 
  config: DungeonConfig = {}
): DungeonRoom[] => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  // 던전 레벨에 따른 난이도 조정
  const levelMultiplier = 1 + (floorNumber - 1) * 0.3; // 30%씩 증가
  const adjustedEnemyMultiplier = (mergedConfig.enemyLevelMultiplier || 1.0) * levelMultiplier;
  const adjustedRewardMultiplier = (mergedConfig.rewardMultiplier || 1.0) * (1 + (floorNumber - 1) * 0.2); // 20%씩 증가
  
  const { roomsPerFloor, treasureChance, eventChance } = mergedConfig

  let grid: (DungeonRoom | null)[][] = [];
  let rooms: DungeonRoom[] = [];
  let selectedPositions: Position[] = [];
  let entrancePos: Position | undefined;
  let exitPos: Position | undefined;
  let pathFound = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100; // 무한 루프 방지

  while (!pathFound && attempts < MAX_ATTEMPTS) {
    attempts++;
    const tempGrid: (DungeonRoom | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    const positions: Position[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        positions.push({ x, y });
      }
    }
    
    const shuffledPositions = positions.sort(() => Math.random() - 0.5);
    selectedPositions = shuffledPositions.slice(0, Math.min(roomsPerFloor, 16));
    
    entrancePos = selectedPositions[0];
    exitPos = selectedPositions[selectedPositions.length - 1];

    // 경로 탐색을 위해 임시 그리드에 위치 표시
    selectedPositions.forEach(pos => {
      tempGrid[pos.y][pos.x] = { id: 'temp', type: 'empty' } as DungeonRoom;
    });

    if (entrancePos && exitPos) {
      const path = findPath(entrancePos, exitPos, tempGrid);
      if (path.length > 0) {
        pathFound = true;
      }
    }
  }

  if (!pathFound) {
    console.error(`Dungeon Generation Warning: Could not find a guaranteed path after ${MAX_ATTEMPTS} attempts. The dungeon may be unbeatable.`);
  }

  // 최종 확정된 위치로 실제 그리드와 방 목록 생성
  grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  rooms = [];
  
  // 첫 번째는 입구, 마지막은 출구
  // entrancePos와 exitPos가 while 루프에서 할당되었으므로 non-null assertion 사용
  entrancePos = entrancePos!;
  exitPos = exitPos!;
  
  // 시작방 생성
  const startRoom: DungeonRoom = {
    id: uuidv4(),
    type: 'start',
    status: 'hidden',
    difficulty: 1,
    position: entrancePos,
    connections: [],
    description: '던전의 입구입니다.',
    payload: {
      welcomeMessage: '던전에 오신 것을 환영합니다!'
    }
  }
  grid[entrancePos.y][entrancePos.x] = startRoom
  rooms.push(startRoom)
  
  // 출구방 생성
  const exitRoom: DungeonRoom = {
    id: uuidv4(),
    type: 'exit',
    status: 'hidden',
    difficulty: floorNumber,
    position: exitPos,
    connections: [],
    description: '던전의 출구입니다.',
    payload: {
      isUnlocked: false,
      unlockCondition: '모든 방을 클리어하세요'
    }
  }
  grid[exitPos.y][exitPos.x] = exitRoom
  rooms.push(exitRoom)
  
  // 방 타입별 개수 추적
  const roomCounts = {
    treasure: 0,
    event: 0,
    empty: 0,
    battle: 0
  }
  
  // 나머지 방들 생성
  for (let i = 1; i < selectedPositions.length - 1; i++) {
    const pos = selectedPositions[i]
    
    // 5층마다 보스룸 생성 여부 결정 (마지막에서 두 번째 방에만)
    const shouldGenerateBoss = (floorNumber % 5 === 0) && (i === selectedPositions.length - 2);
    
    let room: DungeonRoom
    
    if (shouldGenerateBoss) {
      // 보스방 생성
      const boss = getBossForDungeonLevel(floorNumber);
      
      if (boss) {
        const scaledBoss = { ...boss };
        
        // 보스 스탯 조정
        if (scaledBoss.stats && adjustedEnemyMultiplier !== 1.0) {
          const scaledStats = { ...scaledBoss.stats }
          Object.entries(scaledBoss.stats).forEach(([key, value]) => {
            if (typeof value === 'number') {
              // 보스는 일반 몬스터보다 더 강하게 (1.5배 추가)
              scaledStats[key] = Math.max(1, Math.floor(value * adjustedEnemyMultiplier * 1.5))
            } else {
              scaledStats[key] = value
            }
          })
          scaledBoss.stats = scaledStats
          scaledBoss.level = Math.max(scaledBoss.level || 1, floorNumber)
        }
        
        room = {
          id: uuidv4(),
          type: 'boss',
          status: 'hidden',
          difficulty: floorNumber * 1.5, // 보스룸은 더 어려움
          position: pos,
          connections: [],
          description: `강력한 ${scaledBoss.name}이(가) 기다리고 있습니다.`,
          payload: {
            boss: scaledBoss,
            rewards: [],
            isDefeated: false
          }
        }
      } else {
        // 보스가 없으면 일반 전투방으로 대체
        const availableEnemies = getEnemiesForDungeonLevel(floorNumber);
        const enemy = { ...availableEnemies[Math.floor(Math.random() * availableEnemies.length)] }
        
        // 적 레벨 조정
        if (enemy.stats && adjustedEnemyMultiplier !== 1.0) {
          const scaledStats = { ...enemy.stats }
          Object.entries(enemy.stats).forEach(([key, value]) => {
            if (typeof value === 'number') {
              scaledStats[key] = Math.max(1, Math.floor(value * adjustedEnemyMultiplier))
            } else {
              scaledStats[key] = value
            }
          })
          enemy.stats = scaledStats
          enemy.level = Math.max(enemy.level || 1, floorNumber)
        }
        
        room = {
          id: uuidv4(),
          type: 'battle',
          status: 'hidden',
          difficulty: floorNumber,
          position: pos,
          connections: [],
          description: '적의 기척이 느껴집니다.',
          payload: {
            enemy: enemy,
            rewards: []
          }
        }
        roomCounts.battle++
      }
    } else {
      // 방 타입 결정 로직 (제한 고려)
      const rand = Math.random()
      
      if (rand < treasureChance && roomCounts.treasure < ROOM_LIMITS.treasure) {
        // 보물방 생성 (제한 내에서)
        const treasureData = generateRandomTreasure(floorNumber, adjustedRewardMultiplier)
        
        room = {
          id: uuidv4(),
          type: 'treasure',
          status: 'hidden',
          difficulty: floorNumber,
          position: pos,
          connections: [],
          description: treasureData.isRare ? 
            '반짝이는 빛이 새어나오는 보물 상자가 있습니다!' : 
            '보물이 숨겨진 방입니다.',
          payload: {
            items: treasureData.items,
            gold: treasureData.gold,
            materials: [],
            isOpened: false
          }
        }
        roomCounts.treasure++
      } else if (rand < treasureChance + eventChance && roomCounts.event < ROOM_LIMITS.event) {
        // 이벤트방 생성 (제한 내에서)
        const eventData = generateRandomEvent()
        
        room = {
          id: uuidv4(),
          type: 'event',
          status: 'hidden',
          difficulty: floorNumber,
          position: pos,
          connections: [],
          description: eventData.description,
          payload: {
            eventType: eventData.eventType,
            effect: eventData.effect,
            value: eventData.value,
            description: eventData.isPositive ? 
              `${eventData.name}을(를) 발견했습니다!` : 
              `위험한 ${eventData.name}입니다!`,
            isCompleted: false
          }
        }
        roomCounts.event++
      } else if (roomCounts.empty < ROOM_LIMITS.empty && Math.random() < 0.4) {
        // 빈방 생성 (40% 확률로 대폭 증가, 제한 내에서)
        room = generateEmptyRoom(pos, floorNumber)
        roomCounts.empty++
      } else {
        // 전투방 생성 (기본값)
        const availableEnemies = getEnemiesForDungeonLevel(floorNumber);
        const enemy = { ...availableEnemies[Math.floor(Math.random() * availableEnemies.length)] }
        
        // 적 레벨 조정 (던전 층수에 따라 세밀한 난이도 조정)
        if (enemy.stats && adjustedEnemyMultiplier !== 1.0) {
          const scaledStats = { ...enemy.stats }
          Object.entries(enemy.stats).forEach(([key, value]) => {
            if (typeof value === 'number') {
              scaledStats[key] = Math.max(1, Math.floor(value * adjustedEnemyMultiplier))
            } else {
              scaledStats[key] = value
            }
          })
          enemy.stats = scaledStats
          enemy.level = Math.max(enemy.level || 1, floorNumber) // 적 레벨도 최소 던전 층수만큼
        }
        
        room = {
          id: uuidv4(),
          type: 'battle',
          status: 'hidden',
          difficulty: floorNumber,
          position: pos,
          connections: [],
          description: '적의 기척이 느껴집니다.',
          payload: {
            enemy: enemy,
            rewards: []
          }
        }
        roomCounts.battle++
      }
    }
    
    grid[pos.y][pos.x] = room
    rooms.push(room)
  }
  
  // 연결 생성
  createConnections(rooms, grid)
  
  // 디버그 정보
  const totalRooms = rooms.length
  const battleRooms = rooms.filter(r => r.type === 'battle').length
  const treasureRooms = rooms.filter(r => r.type === 'treasure').length
  const emptyRooms = rooms.filter(r => r.type === 'empty').length // 새로운 empty 타입으로 구분
  const actualEventRooms = roomCounts.event
  
  console.log(`던전 ${floorNumber}층 생성 완료: 총 ${totalRooms}개 방`)
  console.log(`입구(${entrancePos.x},${entrancePos.y}), 출구(${exitPos.x},${exitPos.y})`)
  console.log(`방 구성: 전투 ${battleRooms}개, 보물 ${treasureRooms}개, 이벤트 ${actualEventRooms}개, 빈방 ${emptyRooms}개`)
  console.log(`난이도 배율: 적 ${adjustedEnemyMultiplier.toFixed(2)}x, 보상 ${adjustedRewardMultiplier.toFixed(2)}x`)
  
  // 상세 방 정보
  rooms.forEach(room => {
    if (room.position) {
      console.log(`${room.type}(${room.position.x},${room.position.y}): 연결 ${room.connections.length}개`)
    }
  })
  
  return rooms
}