import {
  Button,
  ButtonGroup,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger
} from '@chakra-ui/react'
import NumberInput, { NumberInputProps } from './NumberInput'
import PointsInput from './PointsInput'
import { useCallback, useState } from 'react'
import { Point } from '../../Domain'
import { calcDistance } from '../../util/Common'

export interface LengthInputProps extends NumberInputProps {
}

export default function LengthInput({ onChange, ...rest }: LengthInputProps) {
  const [ points, setPoints ] = useState<Point[]>([])
  const [ pointKey, setPointKey ] = useState<number>(0)

  const onAdd = useCallback((point: Point) => {
    if (!onChange) return
    if (points.length >= 2) {
      const length = calcDistance(points[0], points[1])
      onChange(length.toString())
      setPoints([])
      return
    }
    setPoints([...points, point])
  }, [onChange, points])

  const onRemove = useCallback((index: number) => {
    setPoints(points.filter((_, i) => i !== index))
  }, [points])

  const onCalculate = useCallback(() => {
    if (points.length !== 2) return
    const length = calcDistance(points[0], points[1])
    onChange(Math.ceil(length).toString())
    setPoints([])
    setPointKey(prev => prev + 1)
  }, [onChange, points])

  return (
    <Flex
      alignItems='center'
      justifyContent='space-between'
      gap={2}
      marginBottom={4}>
      <NumberInput onChange={onChange} {...rest} />
      <Popover>
        {({ onClose }) => (
          <>
            <PopoverTrigger>
              <Button colorScheme='teal'>Measure</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>
                Calculate length from two points
              </PopoverHeader>
              <PopoverBody>
                <PointsInput
                  name='points'
                  points={points}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  maxPoints={2}
                  key={pointKey}/>
              </PopoverBody>
              <PopoverFooter
                display='flex'
                justifyContent='flex-end'
                gap={4}>
                <ButtonGroup size='sm'>
                  <Button
                    isDisabled={points.length !== 2}
                    colorScheme='blue'
                    onClick={() => {
                      onCalculate()
                      onClose()
                    }}>
                      Calculate
                  </Button>
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </ButtonGroup>
              </PopoverFooter>
            </PopoverContent>
          </>
        )}
      </Popover>
    </Flex>
  )
}
