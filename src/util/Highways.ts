import { ItemCode } from '../Domain'

export interface HighwayCost {
    amounts: Map<ItemCode, number>
}

export const calcHighwayCost = (
  length: number,
  width: number = 2,
  paving: ItemCode = ItemCode.STONE_BRICK,
  sandLining: boolean = false
) => {
  return {
    amounts: new Map([
      [paving, length * width],
      [ItemCode.PILE_OF_SAND, sandLining ? length * 2 : 0],
      [ItemCode.CATSEYE, length]
    ])
  }
}
