import { Box, Flex, Spinner } from '@chakra-ui/react'
import { MAP_DATA, Point, Server } from '../../Domain'
import { TreasureMap } from '../../util/Treasures'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { getMapImage } from './MapLoader'

export function Map({ position, maps, server, hoveredIndex, onHover, targetIndex }: {
  position: Point | undefined;
  maps: TreasureMap[];
  server: Server;
  hoveredIndex?: number;
  onHover: (index?: number) => void;
  targetIndex?: number;
}) {
  const { imageName, mapSize } = MAP_DATA[server] || {}
  const imagePath = getMapImage(imageName)
  const [mapWidth, mapHeight] = mapSize
  const [currentImageSrc, setCurrentImageSrc] = useState(imagePath)
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState([0, 0] as [number, number])
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState<[number, number] | undefined>(undefined)
  const [displayWidth, displayHeight] = [600, 600]

  // Transform the points based on the map size, display size, zoom level, and offset
  const transformPoint = useCallback(([x, y]: Point) => [
    (x * displayWidth / mapWidth) * zoom + offset[0],
    (y * displayHeight / mapHeight) * zoom + offset[1]
  ] as [number, number], [displayWidth, displayHeight, mapWidth, mapHeight, zoom, offset])

  const transformedPoints = useMemo(() => maps.map(({ position }) =>
    transformPoint(position)), [maps, transformPoint])

  const transformedPosition = useMemo(() => {
    if (!position) return undefined
    return transformPoint(position)
  }, [position, transformPoint])

  // Clamp the offset to ensure the image stays within the bounds of the display
  const clampOffset = ([ox, oy]: [number, number], zoom: number) => {
    const minOffsetX = Math.min(0, displayWidth - displayWidth * zoom)
    const minOffsetY = Math.min(0, displayHeight - displayHeight * zoom)

    return [
      Math.max(minOffsetX, Math.min(ox, 0)),
      Math.max(minOffsetY, Math.min(oy, 0)),
    ] as [number, number]
  }

  // Preload the new image when the image path changes
  useEffect(() => {
    if (imagePath === currentImageSrc && !isLoadingImage) return

    setIsLoadingImage(true)

    const handleImageLoad = () => {
      setCurrentImageSrc(imagePath)
      setZoom(1)
      setOffset([0, 0])

      // Add a small delay before fading in to ensure smooth transition
      setTimeout(() => {
        setIsLoadingImage(false)
      }, 100)
    }

    const img = new Image()
    img.src = imagePath
    img.decode()
      .then(handleImageLoad)
      .catch(() => {
        console.warn('Image decode() failed, falling back to onload')
        img.onload = handleImageLoad
        img.onerror = () => {
          console.error('Failed to load image:', imagePath)
          setIsLoadingImage(false)
        }
      })

  }, [currentImageSrc, imagePath, isLoadingImage])

  const handleWheel = (e: React.WheelEvent) => {
    if (isLoadingImage) return

    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // clamp zoom between 1x and 30x
    const zoomDelta = -e.deltaY * 0.01
    const newZoom = Math.min(Math.max(zoom + zoomDelta, 1), 30)
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
    if (isLoadingImage || !isDragging || !lastMousePos) return
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
        contain: 'strict',
        border: '2px solid #3182CE',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#f9fafb',
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
        {isLoadingImage && (
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
          src={currentImageSrc}
          alt={`Map of ${server}`}
          width={displayWidth}
          height={displayHeight}
          fetchPriority='high'
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
        points={transformedPoints}
        currPosition={transformedPosition}
        hoveredIndex={hoveredIndex}
        onHover={onHover}
        targetIndex={targetIndex} />
    </div>
  )
}

const MapOverlay = memo(({
  dimensions,
  points,
  currPosition,
  hoveredIndex,
  onHover,
  targetIndex
}: {
  dimensions: [number, number]
  points: Point[]
  currPosition: Point | undefined
  hoveredIndex?: number
  onHover: (index?: number) => void
  targetIndex?: number
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
    {points.map(([x, y], index) => {
      const isHovered = hoveredIndex === index
      const isTarget = targetIndex === index
      const color = isTarget ? '#319795' : '#3182CE'

      return (
        <g key={index}>
          <circle
            cx={x}
            cy={y}
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
    {currPosition && (
      <circle
        cx={currPosition[0]}
        cy={currPosition[1]}
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
