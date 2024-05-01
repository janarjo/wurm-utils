import { Line, Point } from '../Domain'

export const calcSegments = (points: Point[]) => points
  .map((point, index, points) => {
    if (index === 0) return undefined
    return [points[index - 1], point] as Line
  })
  .filter((segment): segment is Line => segment !== undefined)

export const calcTileLength = (line: Line) => {
  const [start, end] = line
  return Math.max(Math.abs(start[0] - end[0]), Math.abs(start[1] - end[1]))
}
