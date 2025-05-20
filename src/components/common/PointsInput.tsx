import {
  Flex,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel } from '@chakra-ui/react'
import { Point } from '../../Domain'
import PointInput from './PointInput'
import { useState } from 'react'

export interface PointInputProps {
  id?: string,
  name: string,
  points: Point[],
  initialPoint?: Point,
  onAdd: (point: Point) => void,
  onRemove: (index: number) => void,
  maxPoints?: number,
}

export default function PointsInput({
  id,
  name,
  points,
  onAdd,
  onRemove,
  maxPoints,
}: PointInputProps) {
  const [point, setPoint] = useState<Point | undefined>(undefined)
  return (
    <>
      <PointInput
        id={id}
        point={point}
        onChange={setPoint}
        onAdd={onAdd}
        marginBottom={4}
        disabled={maxPoints !== undefined && points.length >= maxPoints} />
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
