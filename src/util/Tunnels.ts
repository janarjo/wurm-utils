
export const oreProbability = 1/20
export const avgActionsPerOreVein = 5000
const actionsPerStoneTile = 50

export interface TunnelCost {
  totalTiles: number
  totalOreVeins: number
  stoneActions: number
  oreActions: number
  wallAmount: number
  floorAmount: number
}

export function calcTunnelCost(length: number, width: number): TunnelCost {
  const totalTiles = length * width
  const totalOreVeins = Math.ceil(totalTiles * oreProbability)
  const stoneTiles = totalTiles - totalOreVeins

  const stoneActions = stoneTiles * actionsPerStoneTile
  const oreActions = totalOreVeins * avgActionsPerOreVein

  const wallAmount = length * 2
  const floorAmount = length * width

  return {
    totalTiles,
    totalOreVeins,
    stoneActions,
    oreActions,
    wallAmount,
    floorAmount,
  }
}
