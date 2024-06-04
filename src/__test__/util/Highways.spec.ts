import { ItemCode, Line } from '../../Domain'
import { calcHighwayCost } from '../../util/Highways'

describe('Highway costs', () => {

  it('calculates single segment cost correctly', () => {
    const segments: Line[] = [[[0, 0], [0, 10]],]
    expect(calcHighwayCost(segments, 2)).toEqual({
      length: 10,
      totalMats: new Map([
        ['STONE_BRICK', 20],
        ['PILE_OF_SAND', 0],
        ['CATSEYE', 10]
      ])
    })
  })

  it('calculates road cost correctly with sand lining', () => {
    const segments: Line[] = [[[0, 0], [0, 10]]]
    expect(calcHighwayCost(segments, 1, ItemCode.STONE_BRICK, true)).toEqual({
      length: 10,
      totalMats: new Map([
        ['STONE_BRICK', 10],
        ['PILE_OF_SAND', 20],
        ['CATSEYE', 10]
      ])
    })
  })

  it('calculates road cost with multiple segments correctly', () => {
    const segments: Line[] = [
      [[0, 0], [0, 10]],
      [[0, 10], [10, 10]],
      [[10, 10], [10, 0]],
    ]

    expect(calcHighwayCost(segments, 1)).toEqual({
      length: 30,
      totalMats: new Map([
        ['STONE_BRICK', 30],
        ['PILE_OF_SAND', 0],
        ['CATSEYE', 30]
      ])
    })
  })
})
