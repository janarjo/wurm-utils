import { Line, Point } from '../../Domain'
import { calcSegments, calcTileDistance } from '../../util/Common'

describe('Segments', () => {

  it('calculates segments correctly', () => {
    const points: Point[] = [[0, 0], [0, 10], [10, 10], [10, 0]]
    const segments = calcSegments(points)
    expect(segments).toEqual([
      [[0, 0], [0, 10]],
      [[0, 10], [10, 10]],
      [[10, 10], [10, 0]]
    ])
  })

  it('calculates segments correctly with one point', () => {
    const points: Point[] = [[0, 0]]
    const segments = calcSegments(points)
    expect(segments).toEqual([])
  })
})

describe('Tiled length', () => {

  it('calculates line length correctly', () => {
    const line: Line = [[0, 0], [0, 10]]
    expect(calcTileDistance(line)).toEqual(10)
  })

  it('calculates line length correctly with 90 degree junction', () => {
    const line: Line = [[0, 0], [10, 0]]
    expect(calcTileDistance(line)).toEqual(10)
  })

  it('calculates line length correctly with 45 degree junction', () => {
    const line: Line = [[0, 0], [10, 10]]
    expect(calcTileDistance(line)).toEqual(10)
  })

  it('calculates line length correctly subtle angle', () => {
    const line: Line = [[0, 0], [10, 1]]
    expect(calcTileDistance(line)).toEqual(10)
  })

  it('calculates line length correctly with opposite subtle angle', () => {
    const line: Line = [[0, 0], [1, 10]]
    expect(calcTileDistance(line)).toEqual(10)
  })
})
