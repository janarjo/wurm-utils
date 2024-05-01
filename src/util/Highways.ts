import { ItemCode, Line } from '../Domain'
import { calcTileLength } from './Common'

export interface HighwayCost {
    amounts: Map<ItemCode, number>
    length: number
}

export const calcTotalTileLength = (segments: Line[]) => segments
  .reduce((acc, segment) => acc + calcTileLength(segment), 0)

export function calcHighwayCost(
  segments: Line[],
  width: number,
  paving: ItemCode = ItemCode.STONE_BRICK,
  sandLining: boolean = false): HighwayCost {
  const totalLength = calcTotalTileLength(segments)
  return {
    length: totalLength,
    amounts: new Map([
      [paving, totalLength * width],
      [ItemCode.PILE_OF_SAND, sandLining ? totalLength * 2 : 0],
      [ItemCode.CATSEYE, totalLength]
    ])
  }
}
