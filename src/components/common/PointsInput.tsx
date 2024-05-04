import {
  Flex,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel } from '@chakra-ui/react'
import { Point } from '../../Domain'
import PointInput from './PointInput'

export interface PointInputProps {
  name: string,
  points: Point[],
  initialPoint: Point,
  onAdd: (point: Point) => void,
  onRemove: (index: number) => void,
}

export default function PointsInput({
  name,
  points,
  initialPoint,
  onAdd,
  onRemove,
}: PointInputProps) {
  return (<>
    <PointInput initialPoint={initialPoint} onAdd={onAdd} marginBottom={4} />
    <SimpleGrid columns={3} gap={4}>
      {points.length > 0 && (
        <Flex gridColumn='span 3' gap={2} flexWrap={'wrap'}>
          {points.map(([x, y], index) => (
            <Flex key={index} gap={0.5}>
              <Tag size='md' borderRadius='full' variant='solid' colorScheme='blue'>
                <TagLabel>{x}, {y}</TagLabel>
                <TagCloseButton onClick={() => onRemove(index)} />
              </Tag>
            </Flex>
          ))}
        </Flex>
      )}
      <input
        name={name}
        type='text'
        hidden
        readOnly
        value={points.map(([x, y]) => `${x},${y}`).join(';')}/>
    </SimpleGrid>
  </>
  )
}

