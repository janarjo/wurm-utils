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
