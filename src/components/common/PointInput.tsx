import { Button, ChakraProps, SimpleGrid } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Point } from '../../Domain'
import NumberInput from './NumberInput'

export interface PointInputProps extends ChakraProps {
    initialPoint: Point,
    onAdd?: (point: Point) => void,
}

export default function PointInput({
  initialPoint,
  onAdd,
  ...rest
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
    if (!onAdd) return
    if (event.key === 'Enter') {
      event.preventDefault()
      onAdd([x, y])
    }
  }, [x, y, onAdd])

  return (
    <SimpleGrid {...rest} columns={onAdd ? 3 : 2} gap={4}>
      <NumberInput
        required
        value={x}
        onKeyDown={onEnter}
        onChange={onChangeX}
        onPaste={onPaste}/>
      <NumberInput
        required
        value={y}
        onKeyDown={onEnter}
        onChange={onChangeY}
        onPaste={onPaste}/>
      {onAdd && (
        <Button onClick={() => onAdd([x, y])}>Add</Button>
      )}
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
