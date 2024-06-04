import { ItemCode } from '../Domain'

export enum BridgeType {
  ROPE = 'ROPE',
  FLAT_WOOD = 'FLAT_WOOD',
  FLAT_STONE = 'FLAT_STONE',
  FLAT_MARBLE = 'FLAT_MARBLE',
  FLAT_SLATE = 'FLAT_SLATE',
  FLAT_ROUNDED_STONE = 'FLAT_ROUNDED_STONE',
  FLAT_POTTERY = 'FLAT_POTTERY',
  FLAT_SANDSTONE = 'FLAT_SANDSTONE',
  FLAT_RENDERED = 'FLAT_RENDERED',
  ARCHED_WOOD = 'ARCHED_WOOD',
  ARCHED_BRICK = 'ARCHED_BRICK',
  ARCHED_MARBLE = 'ARCHED_MARBLE',
  ARCHED_SLATE = 'ARCHED_SLATE',
  ARCHED_ROUNDED_STONE = 'ARCHED_ROUNDED_STONE',
  ARCHED_POTTERY = 'ARCHED_POTTERY',
  ARCHED_SANDSTONE = 'ARCHED_SANDSTONE',
  ARCHED_RENDERED = 'ARCHED_RENDERED',
}

export enum BridgeSection {
  ABUTMENT = 'ABUTMENT',
  DOUBLE_ABUTMENT = 'DOUBLE_ABUTMENT',
  SUPPORT = 'SUPPORT',
  CROWN = 'CROWN',
  BRACING = 'BRACING',
}

const getStandardFlatStoneBridgeCosts = (code: ItemCode) => ({
  [BridgeSection.SUPPORT]: [
    { code, amount: 172 },
    { code: ItemCode.MORTAR, amount: 150 },
    { code: ItemCode.STONE_SHARD, amount: 60 },
  ],
  [BridgeSection.DOUBLE_ABUTMENT]: [
    { code, amount: 82 },
    { code: ItemCode.MORTAR, amount: 60 },
    { code: ItemCode.STONE_SHARD, amount: 24 },
  ],
  [BridgeSection.ABUTMENT]: [
    { code, amount: 40 },
    { code: ItemCode.MORTAR, amount: 62 },
    { code: ItemCode.STONE_SHARD, amount: 16 },
  ],
  [BridgeSection.BRACING]: [
    { code, amount: 47 },
    { code: ItemCode.MORTAR, amount: 25 },
    { code: ItemCode.STONE_SHARD, amount: 8 },
  ],
})

export type BridgeMaterials = Partial<Record<BridgeSection, { code: ItemCode, amount: number }[]>>
export const BridgeCosts: Record<BridgeType, BridgeMaterials> = {
  [BridgeType.ROPE]: {},
  [BridgeType.FLAT_WOOD]: {
    [BridgeSection.ABUTMENT]: [
      { code: ItemCode.LARGE_NAILS, amount: 4 },
      { code: ItemCode.SMALL_NAILS, amount: 2 },
      { code: ItemCode.WOODEN_BEAM, amount: 8 },
      { code: ItemCode.SHAFT, amount: 4 },
      { code: ItemCode.PLANK, amount: 24 },
      { code: ItemCode.IRON_RIBBON, amount: 4 },
    ],
    [BridgeSection.SUPPORT]: [
      { code: ItemCode.LARGE_NAILS, amount: 7 },
      { code: ItemCode.SMALL_NAILS, amount: 2 },
      { code: ItemCode.WOODEN_BEAM, amount: 20 },
      { code: ItemCode.SHAFT, amount: 4 },
      { code: ItemCode.PLANK, amount: 24 },
      { code: ItemCode.IRON_RIBBON, amount: 10 },
    ],
    [BridgeSection.CROWN]: [
      { code: ItemCode.LARGE_NAILS, amount: 3 },
      { code: ItemCode.SMALL_NAILS, amount: 2 },
      { code: ItemCode.WOODEN_BEAM, amount: 4 },
      { code: ItemCode.SHAFT, amount: 4 },
      { code: ItemCode.PLANK, amount: 24 },
      { code: ItemCode.IRON_RIBBON, amount: 2 },
    ],
  },
  [BridgeType.FLAT_STONE]: getStandardFlatStoneBridgeCosts(ItemCode.STONE_BRICK),
  [BridgeType.FLAT_MARBLE]: getStandardFlatStoneBridgeCosts(ItemCode.MARBLE_BRICK),
  [BridgeType.FLAT_SLATE]: getStandardFlatStoneBridgeCosts(ItemCode.SLATE_BRICK),
  [BridgeType.FLAT_ROUNDED_STONE]: getStandardFlatStoneBridgeCosts(ItemCode.ROUNDED_STONE),
  [BridgeType.FLAT_POTTERY]: getStandardFlatStoneBridgeCosts(ItemCode.POTTERY_BRICK),
  [BridgeType.FLAT_SANDSTONE]: getStandardFlatStoneBridgeCosts(ItemCode.SANDSTONE_BRICK),
  [BridgeType.FLAT_RENDERED]: {
    [BridgeSection.SUPPORT]: [
      ... getStandardFlatStoneBridgeCosts(ItemCode.STONE_BRICK)[BridgeSection.SUPPORT],
      { code: ItemCode.CLAY, amount: 18 },
    ],
    [BridgeSection.DOUBLE_ABUTMENT]: [
      ... getStandardFlatStoneBridgeCosts(ItemCode.STONE_BRICK)[BridgeSection.DOUBLE_ABUTMENT],
      { code: ItemCode.CLAY, amount: 9 },
    ],
    [BridgeSection.ABUTMENT]: [
      ... getStandardFlatStoneBridgeCosts(ItemCode.STONE_BRICK)[BridgeSection.ABUTMENT],
      { code: ItemCode.CLAY, amount: 7 },
    ],
    [BridgeSection.BRACING]: [
      ... getStandardFlatStoneBridgeCosts(ItemCode.STONE_BRICK)[BridgeSection.BRACING],
      { code: ItemCode.CLAY, amount: 5 },
    ],
  },
  [BridgeType.ARCHED_WOOD]: {},
  [BridgeType.ARCHED_BRICK]: {},
  [BridgeType.ARCHED_MARBLE]: {},
  [BridgeType.ARCHED_SLATE]: {},
  [BridgeType.ARCHED_ROUNDED_STONE]: {},
  [BridgeType.ARCHED_POTTERY]: {},
  [BridgeType.ARCHED_SANDSTONE]: {},
  [BridgeType.ARCHED_RENDERED]: {},
}

export interface BridgeCost {
  sections: BridgeSection[],
  totalMats: Map<ItemCode, number>
}

export function calcBridgeCost(
  bridgeType: BridgeType,
  length: number,
  width: number
): BridgeCost {
  const sectionCosts = BridgeCosts[bridgeType]
  if (!sectionCosts) {
    throw new Error(`Unspecified cost for bridge type ${bridgeType}`)
  }

  const sections = calcBridgeSections(bridgeType, length)
  const totalMats = new Map<ItemCode, number>()
  for (const section of sections) {
    const sectionMaterials = sectionCosts[section]
    if (!sectionMaterials) {
      throw new Error(`Unspecified cost for bridge section ${section}`)
    }

    for (const { code, amount } of sectionMaterials) {
      const existing = totalMats.get(code) || 0
      totalMats.set(code, existing + amount * width)
    }
  }

  return {
    sections,
    totalMats
  }
}

// Bridges are made of sections, sections have placement limits
// We need to first figure out the default placement of sections
// Start and end sections must be abutments
function calcBridgeSections(bridgeType: BridgeType, length: number): BridgeSection[] {
  if (bridgeType === BridgeType.FLAT_WOOD) {
    if (length === 1) {
      return [BridgeSection.DOUBLE_ABUTMENT]
    }
    if (length === 2) {
      return [BridgeSection.ABUTMENT, BridgeSection.ABUTMENT]
    }
    if (length === 3) {
      return [BridgeSection.ABUTMENT, BridgeSection.CROWN, BridgeSection.ABUTMENT]
    }
    if (length === 4) {
      return [
        BridgeSection.ABUTMENT,
        BridgeSection.CROWN,
        BridgeSection.CROWN,
        BridgeSection.ABUTMENT]
    }
    if (length === 5) {
      return [BridgeSection.ABUTMENT,
        BridgeSection.CROWN,
        BridgeSection.CROWN,
        BridgeSection.CROWN,
        BridgeSection.ABUTMENT]
    }
  }

  return []
}
