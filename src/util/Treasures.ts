import { Point } from '../Domain'

export interface Location {
    point: Point
    grid?: string
    quality?: number
    notes?: string
}
