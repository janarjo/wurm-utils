import { calcTunnelCost } from '../../util/Tunnels'

describe('Tunnel costs', () => {

  it('calculates 0 length and 0 width tunnel cost correctly', () => {
    expect(calcTunnelCost(0, 0)).toEqual({
      totalTiles: 0,
      totalOreVeins: 0,
      stoneActions: 0,
      oreActions: 0,
      floorAmount: 0,
      wallAmount: 0,
    })
  })

  it('calculates 50 tile 1x1 tunnel cost correctly', () => {
    expect(calcTunnelCost(50, 1)).toEqual({
      totalTiles: 50,
      totalOreVeins: 3,
      stoneActions: 2350,
      oreActions: 15000,
      floorAmount: 50,
      wallAmount: 100,
    })
  })

  it('calculates 100 tile 1x1 tunnel cost correctly', () => {
    expect(calcTunnelCost(100, 1)).toEqual({
      totalTiles: 100,
      totalOreVeins: 5,
      stoneActions: 4750,
      oreActions: 25000,
      floorAmount: 100,
      wallAmount: 200,
    })
  })

  it('calculates 50 tile 1x2 tunnel cost correctly', () => {
    expect(calcTunnelCost(50, 2)).toEqual({
      totalTiles: 100,
      totalOreVeins: 5,
      stoneActions: 4750,
      oreActions: 25000,
      floorAmount: 100,
      wallAmount: 100,
    })
  })

  it('calculates 50 tile 1x3 tunnel cost correctly', () => {
    expect(calcTunnelCost(50, 3)).toEqual({
      totalTiles: 150,
      totalOreVeins: 8,
      stoneActions: 7100,
      oreActions: 40000,
      floorAmount: 150,
      wallAmount: 100,
    })
  })

  it('calculates 75 tile 1x3 tunnel cost correctly', () => {
    expect(calcTunnelCost(75, 3)).toEqual({
      totalTiles: 225,
      totalOreVeins: 12,
      stoneActions: 10650,
      oreActions: 60000,
      floorAmount: 225,
      wallAmount: 150,
    })
  })
})
