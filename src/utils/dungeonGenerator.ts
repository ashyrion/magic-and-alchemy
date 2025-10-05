import { v4 as uuidv4 } from 'uuid'
import { testEnemies } from '../data/battleTestData'
import { testItems } from '../data/testData'
import type { DungeonRoom, DungeonConfig } from '../types/dungeon'



const DEFAULT_CONFIG: Required<DungeonConfig> = {
  roomsPerFloor: 14, // 4x4 그리드 (입구, 출구 포함하여 최대 16개)
  treasureChance: 0.3,
  eventChance: 0.2,
  layoutType: 'grid',
  guaranteeRest: false,
  guaranteeTreasure: false,
  enemyLevelMultiplier: 1.0,
  rewardMultiplier: 1.0,
  seed: 12345
}

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
  
  // 3단계: 추가 양방향 연결 생성 (40% 확률)
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
        
        // 40% 확률로 추가 양방향 연결 (이미 연결된 경우 제외)
        if (Math.random() < 0.4 && !room.connections.includes(connectionKey)) {
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
  const { roomsPerFloor, treasureChance, eventChance, enemyLevelMultiplier, rewardMultiplier } = mergedConfig

  const grid: (DungeonRoom | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  const rooms: DungeonRoom[] = []
  
  // 랜덤 위치 생성
  const positions: Position[] = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      positions.push({ x, y })
    }
  }
  
  // 위치 섞기
  const shuffledPositions = positions.sort(() => Math.random() - 0.5)
  const selectedPositions = shuffledPositions.slice(0, Math.min(roomsPerFloor, 16))
  
  // 첫 번째는 입구, 마지막은 출구
  const entrancePos = selectedPositions[0]
  const exitPos = selectedPositions[selectedPositions.length - 1]
  
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
  
  // 나머지 방들 생성
  for (let i = 1; i < selectedPositions.length - 1; i++) {
    const pos = selectedPositions[i]
    const rand = Math.random()
    
    let room: DungeonRoom
    
    if (rand < treasureChance) {
      // 보물방
      const treasureItems = [testItems[Math.floor(Math.random() * testItems.length)]]
      const gold = Math.floor((50 + Math.random() * 100) * rewardMultiplier)
      
      room = {
        id: uuidv4(),
        type: 'treasure',
        status: 'hidden',
        difficulty: floorNumber,
        position: pos,
        connections: [],
        description: '보물이 숨겨진 방입니다.',
        payload: {
          items: treasureItems,
          gold: gold,
          materials: [],
          isOpened: false
        }
      }
    } else if (rand < treasureChance + eventChance) {
      // 이벤트방
      const healValue = Math.floor(20 + Math.random() * 30)
      
      room = {
        id: uuidv4(),
        type: 'event',
        status: 'hidden',
        difficulty: floorNumber,
        position: pos,
        connections: [],
        description: '무언가 특별한 일이 일어날 것 같습니다.',
        payload: {
          eventType: 'rest' as const,
          effect: 'heal' as const,
          value: healValue,
          description: 'HP와 MP가 회복됩니다.',
          isCompleted: false
        }
      }
    } else {
      // 전투방
      const enemy = { ...testEnemies[Math.floor(Math.random() * testEnemies.length)] }
      
      // 적 레벨 조정
      if (enemy.stats && enemyLevelMultiplier !== 1.0) {
        const scaledStats = { ...enemy.stats }
        Object.entries(enemy.stats).forEach(([key, value]) => {
          if (typeof value === 'number') {
            scaledStats[key] = Math.max(1, Math.floor(value * enemyLevelMultiplier))
          } else {
            scaledStats[key] = value
          }
        })
        enemy.stats = scaledStats
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
    }
    
    grid[pos.y][pos.x] = room
    rooms.push(room)
  }
  
  // 연결 생성
  createConnections(rooms, grid)
  
  // 디버그 정보
  console.log(`던전 생성 완료: ${rooms.length}개 방, 입구(${entrancePos.x},${entrancePos.y}), 출구(${exitPos.x},${exitPos.y})`)
  rooms.forEach(room => {
    if (room.position) {
      console.log(`${room.type}(${room.position.x},${room.position.y}): 연결 ${room.connections.length}개 - [${room.connections.join(', ')}]`)
    }
  })
  
  return rooms
}