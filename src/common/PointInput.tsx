import {
  Button,
  Flex,
  Input,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Point } from '../Domain'

export interface PointInputProps {
  name: string,
  initialPoints: Point[],
}

export default function PointInput({ name, initialPoints }: PointInputProps) {
  const [ points, setPoints ] = useState<Point[]>([])
  const [ x, setX ] = useState<number>(0)
  const [ y, setY ] = useState<number>(0)

  useEffect(() => {
    setPoints(initialPoints)
    setX(0)
    setY(0)
  }, [initialPoints])

  const onPaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!text) return
    if (!text.replace(' ', '').match(/^\d+,\d+$/)) return
    event.preventDefault()

    const [x, y] = text.split(',').map(point => Number(point))
    setX(x)
    setY(y)
  }, [])

  const onAdd = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setPoints([...points, [x, y]])
  }, [points, x, y])

  const onRemove = useCallback((index: number) => {
    setPoints(points.filter((_, i) => i !== index))
  }, [points])

  return (
    <SimpleGrid columns={3} gap={4}>
      <Input
        type='number'
        placeholder='x'
        required
        value={x}
        onChange={event => setX(Number(event.target.value))}
        onPaste={onPaste}/>
      <Input
        type='number'
        placeholder='y'
        required
        value={y}
        onChange={event => setY(Number(event.target.value))}
        onPaste={onPaste}/>
      <Button onClick={onAdd}>Add</Button>
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
        value={points.map(([x, y]) => `${x},${y}`).join(';')}/>
    </SimpleGrid>
  )
}
