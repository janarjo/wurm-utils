import { ItemCode } from '../../Domain'
import { BridgeSection, BridgeType, calcBridgeCost } from '../../util/Bridges'

describe('Bridge costs', () => {

  describe('Flat wood bridge', () => {
    it('calculates cost correctly with length of 2', () => {
      expect(calcBridgeCost(BridgeType.FLAT_WOOD, 2, 1)).toEqual({
        sections: [BridgeSection.ABUTMENT, BridgeSection.ABUTMENT],
        totalMats: new Map([
          [ItemCode.LARGE_NAILS, 8],
          [ItemCode.SMALL_NAILS, 4],
          [ItemCode.WOODEN_BEAM, 16],
          [ItemCode.SHAFT, 8],
          [ItemCode.PLANK, 48],
          [ItemCode.IRON_RIBBON, 8]
        ])
      })
    })

    it('calculates cost correctly with length of 3', () => {
      expect(calcBridgeCost(BridgeType.FLAT_WOOD, 3, 1)).toEqual({
        sections: [BridgeSection.ABUTMENT, BridgeSection.CROWN, BridgeSection.ABUTMENT],
        totalMats: new Map([
          [ItemCode.LARGE_NAILS, 11],
          [ItemCode.SMALL_NAILS, 6],
          [ItemCode.WOODEN_BEAM, 20],
          [ItemCode.SHAFT, 12],
          [ItemCode.PLANK, 72],
          [ItemCode.IRON_RIBBON, 10]
        ])
      })
    })

    it('calculates cost correctly with length of 4', () => {
      expect(calcBridgeCost(BridgeType.FLAT_WOOD, 4, 1)).toEqual({
        sections: [
          BridgeSection.ABUTMENT,
          BridgeSection.CROWN,
          BridgeSection.CROWN,
          BridgeSection.ABUTMENT],
        totalMats: new Map([
          [ItemCode.LARGE_NAILS, 14],
          [ItemCode.SMALL_NAILS, 8],
          [ItemCode.WOODEN_BEAM, 24],
          [ItemCode.SHAFT, 16],
          [ItemCode.PLANK, 96],
          [ItemCode.IRON_RIBBON, 12]
        ])
      })
    })

    it('calculates cost correctly with length of 5', () => {
      expect(calcBridgeCost(BridgeType.FLAT_WOOD, 5, 1)).toEqual({
        sections: [
          BridgeSection.ABUTMENT,
          BridgeSection.CROWN,
          BridgeSection.CROWN,
          BridgeSection.CROWN,
          BridgeSection.ABUTMENT],
        totalMats: new Map([
          [ItemCode.LARGE_NAILS, 17],
          [ItemCode.SMALL_NAILS, 10],
          [ItemCode.WOODEN_BEAM, 28],
          [ItemCode.SHAFT, 20],
          [ItemCode.PLANK, 120],
          [ItemCode.IRON_RIBBON, 14]
        ])
      })
    })
  })
})
