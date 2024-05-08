export enum Server {
  XANADU = 'XANADU',
  CELEBRATION = 'CELEBRATION',
  DELIVERANCE = 'DELIVERANCE',
  EXODUS = 'EXODUS',
  INDEPENDENCE = 'INDEPENDENCE',
  PRISTINE = 'PRISTINE',
  RELEASE = 'RELEASE',
  CADENCE = 'CADENCE',
  MELODY = 'MELODY',
  HARMONY = 'HARMONY',
}

export const MAP_HOSTS = {
  [Server.CELEBRATION]: 'https://celebration.yaga.host',
  [Server.DELIVERANCE]: 'https://deliverance.yaga.host',
  [Server.EXODUS]: 'https://exodus.yaga.host',
  [Server.INDEPENDENCE]: 'https://independence.yaga.host',
  [Server.PRISTINE]: 'https://pristine.yaga.host',
  [Server.RELEASE]: 'https://release.yaga.host',
  [Server.XANADU]: 'https://xanadu.yaga.host',
  [Server.CADENCE]: 'https://cadence.yaga.host',
  [Server.MELODY]: 'https://melody.yaga.host',
  [Server.HARMONY]: 'https://harmony.yaga.host',
}

export type Point = readonly [number, number]
export type Line = readonly [Point, Point]

export enum ItemCode {
    STONE_SHARD = 'STONE_SHARD',
    STONE_BRICK = 'STONE_BRICK',
    PILE_OF_SAND = 'PILE_OF_SAND',
    BLIND_CATSEYE = 'BLIND_CATSEYE',
    CATSEYE = 'CATSEYE'
}

export interface Ingredient {
    code: ItemCode
    weight: number
}

export interface Recipe {
    ingredients: Ingredient[]
    result: Item
}

export interface Item {
    code: ItemCode
    weight: number
}

export const recipes: { [key in ItemCode]?: Recipe } = {
  [ItemCode.STONE_BRICK]: {
    ingredients: [{ code: ItemCode.STONE_SHARD, weight: 15 }],
    result: { code: ItemCode.STONE_BRICK, weight: 15 }
  },
  [ItemCode.BLIND_CATSEYE]: {
    ingredients: [{ code: ItemCode.STONE_SHARD, weight: 0.55 }],
    result: { code: ItemCode.BLIND_CATSEYE, weight: 0.50 }
  },
}
