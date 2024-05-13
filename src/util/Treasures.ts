import { Point } from '../Domain'

export interface TreasureMap {
    point: Point
    distance?: number
    grid?: string
    quality?: number
    notes?: string
}
