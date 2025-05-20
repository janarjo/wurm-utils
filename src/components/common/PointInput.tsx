import { Button, ChakraProps, SimpleGrid } from '@chakra-ui/react'
import { useCallback } from 'react'
import { Point } from '../../Domain'
import NumberInput from './NumberInput'

export interface PointInputProps extends ChakraProps {
    id?: string,
    point?: Point,
    onAdd?: (point: Point) => void,
    onChange: (point: Point) => void,
    disabled?: boolean,
}

export default function PointInput({
  id,
  point,
  onAdd,
  onChange,
  disabled,
  ...rest
}: PointInputProps) {
  const [x, y] = point ?? []

  const onPaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!text) return
    if (!text.replace(' ', '').match(/^\d+,\d+$/)) return
    event.preventDefault()

    const [x, y] = text.split(',').map(point => Number(point))
    onChange([x, y])
  }, [onChange])

  const onChangeX = useCallback((value: string) => {
    const x = Number(value)
    if (!isNaN(x)) onChange([x, y ?? 0])
  }, [onChange, y])

  const onChangeY = useCallback((value: string) => {
    const y = Number(value)
    if (!isNaN(y)) onChange([x ?? 0, y])
  }, [onChange, x])

  const onEnter = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!onAdd) return
    if (x === undefined || y === undefined) return
    if (event.key === 'Enter') {
      event.preventDefault()
      onAdd([x, y])
    }
  }, [onAdd, x, y])

  return (
    <SimpleGrid {...rest} columns={onAdd ? 3 : 2} gap={4}>
      <NumberInput
        id={`${id}-x`}
        name='x'
        placeholder='x'
        required
        value={x}
        onKeyDown={onEnter}
        onChange={onChangeX}
        onPaste={onPaste}
        disabled={disabled}/>
      <NumberInput
        id={`${id}-y`}
        name='y'
        placeholder='y'
        required
        value={y}
        onKeyDown={onEnter}
        onChange={onChangeY}
        onPaste={onPaste}
        disabled={disabled}/>
      {onAdd && (
        <Button
          onClick={() => onAdd([x ?? 0, y ?? 0])}
          isDisabled={disabled || x  === undefined || y === undefined}>
            Add
        </Button>
      )}
    </SimpleGrid>
  )
}
