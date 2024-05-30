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
  maxPoints?: number
}

export default function LengthInput({ maxPoints, onChange, ...rest }: LengthInputProps) {
  const [ points, setPoints ] = useState<Point[]>([])
  const [ pointKey, setPointKey ] = useState<number>(0)

  const onAdd = useCallback((point: Point) => {
    if (maxPoints && points.length >= maxPoints) return
    setPoints([...points, point])
  }, [maxPoints, points])

  const onRemove = useCallback((index: number) => {
    setPoints(points.filter((_, i) => i !== index))
  }, [points])

  const onCalculate = useCallback(() => {
    if (points.length < 2) return
    const length = points.reduce((acc, point, index) => {
      if (index === 0) return acc
      return acc + calcDistance(points[index - 1], point)
    }, 0)
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
                Calculate length from points
              </PopoverHeader>
              <PopoverBody>
                <PointsInput
                  name='points'
                  points={points}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  maxPoints={maxPoints}
                  key={pointKey}/>
              </PopoverBody>
              <PopoverFooter
                display='flex'
                justifyContent='flex-end'
                gap={4}>
                <ButtonGroup size='sm'>
                  <Button
                    type='submit'
                    isDisabled={points.length < 2}
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
