import { Box, Flex, Spinner } from '@chakra-ui/react'
import { MAP_DATA, Point, Server } from '../../Domain'
import { TreasureMap } from '../../util/Treasures'
import { memo, useCallback, useEffect, useState } from 'react'
import { getMapImage } from './MapLoader'

export function Map({ position, maps, server, hoveredIndex, onHover, targetIndex }: {
  position: Point | undefined;
  maps: TreasureMap[];
  server: Server;
  hoveredIndex?: number;
  onHover: (index?: number) => void;
  targetIndex?: number;
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { imageName, mapSize } = MAP_DATA[server] || {}
  const imagePath = getMapImage(imageName)
  const [mapWidth, mapHeight] = mapSize
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState([0, 0] as [number, number])
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<[number, number] | undefined>(undefined)
  const [displayWidth, displayHeight] = [600, 600]

  // Calculate the display width and height based on the zoom level and panning offset
  const transformPoint = useCallback(([x, y]: Point) => [
    (x * displayWidth / mapWidth) * zoom + offset[0],
    (y * displayHeight / mapHeight) * zoom + offset[1]
  ] as [number, number], [displayWidth, displayHeight, mapWidth, mapHeight, zoom, offset])

  // Clamp the offset to ensure the image stays within the bounds of the display
  const clampOffset = ([ox, oy]: [number, number], zoom: number) => {
    const minOffsetX = Math.min(0, displayWidth - displayWidth * zoom)
    const minOffsetY = Math.min(0, displayHeight - displayHeight * zoom)

    return [
      Math.max(minOffsetX, Math.min(ox, 0)),
      Math.max(minOffsetY, Math.min(oy, 0)),
    ] as [number, number]
  }

  const handleLoad = () => {
    setZoom(1)
    setOffset([0, 0])
    setImageLoaded(true)
  }

  useEffect(() => {
    setImageLoaded(false)
  }, [imagePath])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (!imageLoaded) return

    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // clamp zoom between 1x and 5x
    const zoomDelta = -e.deltaY * 0.001
    const newZoom = Math.min(Math.max(zoom + zoomDelta, 1), 10)
    if (newZoom === zoom) return

    // Calculate mouse position relative to the scaled map
    const mouseXInMap = (mouseX - offset[0]) / zoom
    const mouseYInMap = (mouseY - offset[1]) / zoom

    // Calculate new offset based on the new zoom level
    const newOffsetX = mouseX - mouseXInMap * newZoom
    const newOffsetY = mouseY - mouseYInMap * newZoom

    setZoom(newZoom)
    setOffset(clampOffset([newOffsetX, newOffsetY], newZoom))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos([e.clientX, e.clientY])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageLoaded || !isDragging || !lastMousePos) return
    const dx = e.clientX - lastMousePos[0]
    const dy = e.clientY - lastMousePos[1]
    setOffset(([ox, oy]) => clampOffset([ox + dx, oy + dy], zoom))
    setLastMousePos([e.clientX, e.clientY])
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setLastMousePos(undefined)
  }

  return (
    <div
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        contain: 'strict'
      }}>
      <Box
        position="absolute"
        top={0}
        left={0}
        width={displayWidth}
        height={displayHeight}
        transform={`translate(${offset[0]}px, ${offset[1]}px) scale(${zoom})`}
        transformOrigin="top left"
        pointerEvents="none"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      >
        {!imageLoaded && (
          <Flex
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            align="center"
            justify="center"
            bg="rgba(255, 255, 255, 0.3)"
            zIndex={1}
          >
            <Spinner size="lg" color="blue.500" />
          </Flex>)}
        <img
          src={imagePath}
          alt={`Map of ${server}`}
          width={displayWidth}
          height={displayHeight}
          onLoad={handleLoad}
          fetchPriority='high'
          decoding='async'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            imageRendering: 'pixelated',
          }}
        />
      </Box>
      <MapOverlay
        dimensions={[displayWidth, displayHeight]}
        maps={maps}
        position={position}
        hoveredIndex={hoveredIndex}
        onHover={onHover}
        targetIndex={targetIndex}
        transformPoint={transformPoint} />
    </div>
  )
}

const MapOverlay = memo(({
  dimensions,
  maps,
  position,
  hoveredIndex,
  onHover,
  targetIndex,
  transformPoint
}: {
  dimensions: [number, number]
  maps: TreasureMap[]
  position: Point | undefined
  hoveredIndex?: number
  onHover: (index?: number) => void
  targetIndex?: number
  transformPoint: (point: Point) => [number, number]
}) => (
  <svg
    width={dimensions[0]}
    height={dimensions[1]}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      pointerEvents: 'none',
    }}
  >
    {maps.map(({ position }, index) => {
      const [x, y] = position
      const [tx, ty] = transformPoint(position)
      const isHovered = hoveredIndex === index
      const isTarget = targetIndex === index
      const color = isTarget ? '#319795' : '#3182CE'

      return (
        <g key={position.join()}>
          <circle
            cx={tx}
            cy={ty}
            r={6}
            fill={color}
            opacity={isHovered ? 0.5 : 1}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(undefined)}
            pointerEvents="auto" />
          <title>{`(${x}, ${y})`}</title>
        </g>
      )
    })}
    {position && (
      <circle
        cx={transformPoint(position)[0]}
        cy={transformPoint(position)[1]}
        r={6}
        fill="#E53E3E" />
    )}
    <rect
      x={10}
      y={10}
      width={120}
      height={60}
      fill="white"
      opacity={0.9}
      stroke="#B0BEC5"
      strokeWidth="1" />
    <text x={15} y={25} fontSize="12" fill="#1A202C">Legend:</text>
    <text x={15} y={40} fontSize="10" fill="#E53E3E">- Current Position</text>
    <text x={15} y={50} fontSize="10" fill="#3182CE">- All Treasures</text>
    <text x={15} y={60} fontSize="10" fill="#319795">- Target Treasure</text>
  </svg>
))
