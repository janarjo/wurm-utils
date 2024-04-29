import { ItemCode } from '../../util/Domain'
import { calcHighwayCost } from '../../util/Highways'

describe('Road costs', () => {

  it('calculates road cost correctly', () => {
    expect(calcHighwayCost(100)).toEqual({
      amounts: new Map([
        ['STONE_BRICK', 200],
        ['PILE_OF_SAND', 0],
        ['CATSEYE', 100]
      ])
    })
  })

  it('calculates road cost correctly with width', () => {
    expect(calcHighwayCost(100, 4)).toEqual({
      amounts: new Map([
        ['STONE_BRICK', 400],
        ['PILE_OF_SAND', 0],
        ['CATSEYE', 100]
      ])
    })
  })

  it('calculates road cost correctly with sand lining', () => {
    expect(calcHighwayCost(100, 1, ItemCode.STONE_BRICK, true)).toEqual({
      amounts: new Map([
        ['STONE_BRICK', 100],
        ['PILE_OF_SAND', 200],
        ['CATSEYE', 100]
      ])
    })
  })
})
