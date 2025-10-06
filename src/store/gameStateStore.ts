import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface GameStateStore {
  currentLocation: 'town' | 'dungeon'
  setLocation: (location: 'town' | 'dungeon') => void
  goToTown: () => void
  enterDungeon: () => void
}

export const useGameStateStore = create<GameStateStore>()(
  devtools(
    (set) => ({
      currentLocation: 'town',
      
      setLocation: (location: 'town' | 'dungeon') => {
        console.log(`[GameState] 위치 변경: ${location}`)
        set({ currentLocation: location })
      },
      
      goToTown: () => {
        console.log('[GameState] 마을로 이동')
        set({ currentLocation: 'town' })
      },
      
      enterDungeon: () => {
        console.log('[GameState] 던전 입장')
        set({ currentLocation: 'dungeon' })
      }
    }),
    {
      name: 'GameStateStore',
    }
  )
)