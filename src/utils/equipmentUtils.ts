import type { Equipment } from '../types/gameTypes'

export const calculateEquipmentStats = (equipment: Equipment) => {
  const stats: { [key: string]: number } = {}

  // 각 장비의 스탯을 누적
  Object.values(equipment).forEach(item => {
    if (!item?.stats) {
      return
    }

    Object.entries(item.stats).forEach(([key, value]) => {
      if (typeof value !== 'number') {
        return
      }

      stats[key] = (stats[key] ?? 0) + value
    })
  })

  return stats
}
