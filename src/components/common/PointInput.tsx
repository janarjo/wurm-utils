import {
  Button,
  Flex,
  Input,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Point } from '../../Domain'

export interface PointInputProps {
  name: string,
  points: Point[],
  initialPoint: Point,
  onAdd: (point: Point) => void,
  onRemove: (index: number) => void,
}

export default function PointInput({
  name,
  points,
  initialPoint,
  onAdd,
  onRemove,
}: PointInputProps) {
  const [ x, setX ] = useState<number>(0)
  const [ y, setY ] = useState<number>(0)

  useEffect(() => {
    setX(initialPoint[0])
    setY(initialPoint[1])
  }, [initialPoint])

  const onPaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!text) return
    if (!text.replace(' ', '').match(/^\d+,\d+$/)) return
    event.preventDefault()

    const [x, y] = text.split(',').map(point => Number(point))
    setX(x)
    setY(y)
  }, [])

  const onChangeX = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = toNumber(event.target.value)
    if (value !== undefined) setX(value)
  }, [])

  const onChangeY = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = toNumber(event.target.value)
    if (value !== undefined) setY(value)
  }, [])

  const onEnter = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onAdd([x, y])
    }
  }, [x, y, onAdd])

  return (
    <SimpleGrid columns={3} gap={4}>
      <Input
        type='text'
        required
        value={x}
        onKeyDown={onEnter}
        onChange={onChangeX}
        onPaste={onPaste}/>
      <Input
        type='text'
        required
        value={y}
        onKeyDown={onEnter}
        onChange={onChangeY}
        onPaste={onPaste}/>
      <Button onClick={() => onAdd([x, y])}>Add</Button>
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
  )
}

const toNumber = (value: string) => {
  if (value.length > 0 && !value.match(/^\d+$/)) return

  let number: number
  if (value.length === 0) {
    number = 0
  } else if (value.length > 1 && value.startsWith('0')) {
    number = Number(value.slice(1))
  } else {
    number = Number(value)
  }

  return number
}
