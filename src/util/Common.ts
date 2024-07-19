import { Line, Point } from '../Domain'

export const equals = (p1: Point, p2: Point) => p1[0] === p2[0] && p1[1] === p2[1]

export const calcSegments = (points: Point[]) => points
  .map((point, index, points) => {
    if (index === 0) return undefined
    return [points[index - 1], point] as Line
  })
  .filter((segment): segment is Line => segment !== undefined)

export const calcTileDistance = (line: Line) => {
  const [start, end] = line
  return Math.max(Math.abs(start[0] - end[0]), Math.abs(start[1] - end[1]))
}

export function calcRealDistance(line: Line): number {
  const [start, end] = line
  return Math.sqrt((start[0] - end[0]) ** 2 + (start[1] - end[1]) ** 2)
}

export const formatCode = (value: string) => {
  return value.slice(0, 1) + value.slice(1).toLowerCase().replace(/_/g, ' ')
}
