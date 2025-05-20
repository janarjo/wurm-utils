import { Box, Flex, IconButton, Spinner } from '@chakra-ui/react'
import { MAP_DATA, Point, Server } from '../../Domain'
import { TreasureMap } from '../../util/Treasures'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getMapImage } from './MapLoader'
import { ExpandableBox } from '../common/ExpandableBox'
import { BiCollapse, BiExpand } from 'react-icons/bi'

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

  const fullScreenPadding = 100
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [displaySize, setDisplaySize] = useState<[number, number]>([600, 600])
  const [displayWidth, displayHeight] = displaySize

  // Transform positions based on the map size, display size, zoom level, and offset
  const transformPosition = useCallback(([x, y]: Point) => {
    return [
      (x * displayWidth / mapWidth) * zoom + offset[0],
      (y * displayHeight / mapHeight) * zoom + offset[1]
    ] as [number, number]
  }, [displayWidth, displayHeight, mapWidth, mapHeight, zoom, offset])

  const overlayMarkers = useMemo(() => [
    ...(position ? [{
      position: transformPosition(position),
      label: `(${position[0]}, ${position[1]})`,
      color: '#E53E3E',
    }] : []),
    ...maps.map((({ position }, index) => ({
      position: transformPosition(position),
      label: `(${position[0]}, ${position[1]})`,
      opacity: hoveredIndex === index ? 0.5 : 1,
      color: targetIndex === index ? '#319795' : '#3182CE',
      onMouseEnter: () => onHover(index),
      onMouseLeave: () => onHover(undefined),
    }))),
  ] as OverlayMarker[], [hoveredIndex, maps, onHover, position, targetIndex, transformPosition])

  // Clamp the offset to ensure the image stays within the bounds of the map
  const clampOffset = useCallback(([ox, oy]: [number, number], zoom: number) => {
    const zoomedWidth = displayWidth * zoom
    const zoomedHeight = displayHeight * zoom

    // Calculate the content boundaries, accounting for actual map dimensions
    const contentWidth = Math.max(zoomedWidth, displayWidth)
    const contentHeight = Math.max(zoomedHeight, displayHeight)

    const minOffsetX = Math.min(0, displayWidth - contentWidth)
    const minOffsetY = Math.min(0, displayHeight - contentHeight)

    return [
      Math.max(minOffsetX, Math.min(ox, 0)),
      Math.max(minOffsetY, Math.min(oy, 0))
    ] as [number, number]
  }, [displayWidth, displayHeight])

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

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    if (isLoadingImage) return

    const container = mapContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
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
  }, [clampOffset, isLoadingImage, offset, zoom])

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

  // Attach the wheel event listener to the map container to prevent default scrolling
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Handle window resize events to adjust map dimensions
  useEffect(() => {
    const handleResize = () => {
      if (isFullScreen && mapContainerRef.current) {
        // Calculate the size while maintaining aspect ratio
        const availableWidth = window.innerWidth - fullScreenPadding
        const availableHeight = window.innerHeight - fullScreenPadding

        // Use the smaller dimension to ensure it fits in the viewport
        const maxSize = Math.min(availableWidth, availableHeight)

        setDisplaySize([maxSize, maxSize])
        setOffset(current => clampOffset(current, zoom))
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call it once to set the initial size
    return () => window.removeEventListener('resize', handleResize)
  }, [clampOffset, isFullScreen, zoom])

  const handleExpand = useCallback(() => {
    setIsFullScreen(true)

    const availableWidth = window.innerWidth - fullScreenPadding
    const availableHeight = window.innerHeight - fullScreenPadding
    const maxSize = Math.min(availableWidth, availableHeight)

    setDisplaySize([maxSize, maxSize])
    setZoom(1)
    setOffset([0, 0])
    setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 50)
  }, [])

  const handleCollapse = useCallback(() => {
    setIsFullScreen(false)
    setDisplaySize([600, 600])
    setZoom(1)
    setOffset([0, 0])
  }, [])

  return (
    <ExpandableBox isExpanded={isFullScreen} onClose={handleCollapse}>
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: displayWidth,
          height: displayHeight,
          overflow: 'hidden',
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
              width={displayWidth}
              height={displayHeight}
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
            fetchPriority='high'
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              imageRendering: 'pixelated',
              userSelect: 'none',
              pointerEvents: 'none',
              width: displayWidth,
              height: displayHeight,
              objectFit: 'contain',
            }}
          />
        </Box>
        <MapOverlay
          width={displayWidth}
          height={displayHeight}
          markers={overlayMarkers}/>
        <IconButton
          icon={isFullScreen
            ? <BiCollapse color='white' size={24}/>
            : <BiExpand  color='white' size={24}/>}
          colorScheme='teal'
          aria-label="Expand/Minimize map"
          position="absolute"
          top={2}
          right={2}
          opacity={0.7}
          onClick={(e) => {
            e.stopPropagation()
            if (isFullScreen) handleCollapse(); else handleExpand()
          }}
          zIndex={10}
          _hover={{ opacity: 1 }}
        />
      </div>
    </ExpandableBox>
  )
}

export interface OverlayMarker {
  position: Point
  label: string
  color: string
  opacity?: number
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const MapOverlay = memo(({ width, height, markers }: {
  width: number
  height: number
  markers: OverlayMarker[]
}) => (
  <svg
    width={width}
    height={height}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      pointerEvents: 'none',
    }}
  >
    {markers.map((point, index) => (
      <g key={index}>
        <circle
          cx={point.position[0]}
          cy={point.position[1]}
          r={6}
          fill={point.color}
          opacity={point.opacity}
          onMouseEnter={() => point.onMouseEnter?.()}
          onMouseLeave={() => point.onMouseLeave?.()}
          pointerEvents="auto" />
        <title>{point.label}</title>
      </g>
    ))}
    <rect
      x={10}
      y={10}
      width={120}
      height={60}
      fill="white"
      opacity={0.7}
      stroke="#B0BEC5"
      strokeWidth="1" />
    <text x={15} y={25} fontSize="12" fill="#1A202C">Legend:</text>
    <text x={15} y={40} fontSize="10" fill="#E53E3E">- Last Position</text>
    <text x={15} y={50} fontSize="10" fill="#3182CE">- All Treasures</text>
    <text x={15} y={60} fontSize="10" fill="#319795">- Target Treasure</text>
  </svg>
))
