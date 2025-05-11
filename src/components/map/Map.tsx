import { Box, Flex, Spinner } from '@chakra-ui/react'
import { MAP_DATA, Point, Server } from '../../Domain'
import { TreasureMap } from '../../util/Treasures'
import { useEffect, useState } from 'react'
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
  const [displayWidth, displayHeight] = [600, 600]
  const scale = ([x, y]: Point) => [x * displayWidth / mapWidth, y * displayHeight / mapHeight]

  useEffect(() => {
    setImageLoaded(false)
  }, [imagePath])

  return (
    <Box position="relative" width={displayWidth} height={displayHeight}>
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
        alt="Map background"
        width={displayWidth}
        height={displayHeight}
        onLoad={() => setImageLoaded(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          imageRendering: 'pixelated',
        }}
      />
      <svg
        width={displayWidth}
        height={displayHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        {maps.map(({ position }, index) => {
          const [x, y] = scale(position)
          const isHovered = hoveredIndex === index
          const isTarget = targetIndex === index
          const color = isTarget ? '#319795' : '#3182CE'

          return (
            <g key={position.join()}>
              <circle
                cx={x}
                cy={y}
                r={6}
                fill={color}
                opacity={isHovered ? 0.5 : 1}
                onMouseEnter={() => onHover(index)}
                onMouseLeave={() => onHover(undefined)}
                pointerEvents="auto"
              />
              <title>{`(${x}, ${y})`}</title>
            </g>
          )
        })}
        {position && (
          <circle
            cx={scale(position)[0]}
            cy={scale(position)[1]}
            r={6}
            fill="#E53E3E"
          />
        )}
      </svg>
    </Box>
  )
}

