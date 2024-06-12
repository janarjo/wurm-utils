import { Point } from '../Domain'

export interface TreasureMap {
  position: Point
  distance?: number
  grid?: string
  quality?: number
  notes?: string
}
