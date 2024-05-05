import { Button, ChakraProps, SimpleGrid } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Point } from '../../Domain'
import NumberInput from './NumberInput'

export interface PointInputProps extends ChakraProps {
    initialPoint?: Point,
    onAdd?: (point: Point) => void,
    onChange?: (point: Point) => void
}

export default function PointInput({
  initialPoint,
  onAdd,
  onChange,
  ...rest
}: PointInputProps) {
  const [ x, setX ] = useState<number | undefined>()
  const [ y, setY ] = useState<number | undefined>()

  const setPoint = useCallback((point: Point) => {
    setX(point[0])
    setY(point[1])
    if (onChange) onChange(point)
  }, [onChange, setX, setY])

  useEffect(() => {
    if (!initialPoint) return
    setPoint(initialPoint)
  }, [initialPoint, setPoint])

  const onPaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!text) return
    if (!text.replace(' ', '').match(/^\d+,\d+$/)) return
    event.preventDefault()

    const [x, y] = text.split(',').map(point => Number(point))
    setPoint([x, y])
  }, [setPoint])

  const onChangeX = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    if (!isNaN(value)) setPoint([value, y ?? 0])
  }, [setPoint, y])

  const onChangeY = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    if (!isNaN(value)) setPoint([x ?? 0, value])
  }, [setPoint, x])

  const onEnter = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!onAdd) return
    if (event.key === 'Enter') {
      event.preventDefault()
      onAdd([x ?? 0, y ?? 0])
    }
  }, [x, y, onAdd])

  return (
    <SimpleGrid {...rest} columns={onAdd ? 3 : 2} gap={4}>
      <NumberInput
        name='x'
        placeholder='x'
        required
        value={x}
        onKeyDown={onEnter}
        onChange={onChangeX}
        onPaste={onPaste}/>
      <NumberInput
        name='y'
        placeholder='y'
        required
        value={y}
        onKeyDown={onEnter}
        onChange={onChangeY}
        onPaste={onPaste}/>
      {onAdd && (
        <Button onClick={() => onAdd([x ?? 0, y ?? 0])}>Add</Button>
      )}
    </SimpleGrid>
  )
}

