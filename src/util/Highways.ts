import { ItemCode, Line } from '../Domain'
import { calcTileDistance } from './Common'

export interface HighwayCost {
    totalMats: Map<ItemCode, number>
    length: number
}

export const calcTotalTileLength = (segments: Line[]) => segments
  .reduce((acc, segment) => acc + calcTileDistance(segment), 0)

export function calcHighwayCost(
  segments: Line[],
  width: number,
  paving: ItemCode = ItemCode.STONE_BRICK,
  sandLining: boolean = false): HighwayCost {
  const totalLength = calcTotalTileLength(segments)
  return {
    length: totalLength,
    totalMats: new Map([
      [paving, totalLength * width],
      [ItemCode.PILE_OF_SAND, sandLining ? totalLength * 2 : 0],
      [ItemCode.CATSEYE, totalLength]
    ])
  }
}
