import { Point } from '../Domain'

export interface Location {
    point: Point
    distance: number
    grid?: string
    quality?: number
    notes?: string
}
