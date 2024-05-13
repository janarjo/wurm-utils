import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  SimpleGrid,
  useToast
} from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { HighwayCost, calcHighwayCost } from '../util/Highways'
import { ItemCode, Point } from '../Domain'
import PointsInput from './common/PointsInput'
import { calcSegments } from '../util/Common'

export default function Highways() {
  const [ cost, setCost ] = useState<HighwayCost | null>(null)
  const [ points, setPoints ] = useState<Point[]>([])
  const [ pointKey, setPointKey ] = useState<number>(0)
  const [ width, setWidth ] = useState<number>(2)
  const [ sandLining, setSandLining ] = useState<boolean>(false)
  const [ fieldErrors, setFieldErrors ] = useState<Record<string, string>>({})
  const toast = useToast()

  const onPointAdd = useCallback((point: Point) => {
    setPoints([...points, point])
  }, [points])

  const onPointRemove = useCallback((index: number) => {
    setPoints(points.filter((_, i) => i !== index))
  }, [points])

  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})

    const error = validatePoints(points)
    if (error) {
      setFieldErrors({ points: error })
      toast({
        title: 'Invalid points',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
      return
    }

    const segments = calcSegments(points)
    const cost = calcHighwayCost(segments, width, ItemCode.STONE_BRICK, sandLining)
    setCost(cost)
  }, [points, width, sandLining, toast])

  const onReset = useCallback(() => {
    setCost(null)
    setPoints([])
    setPointKey(prev => prev + 1)
    setWidth(2)
    setSandLining(false)
    setFieldErrors({})
  }, [])

  return (
    <Box padding={8} maxWidth={600}>
      <Heading as='h3' size={'lg'} marginBottom={8}>Highway Calculator</Heading>
      <Box as='form' name='highwayCost' onSubmit={onSubmit} marginBottom={8}>
        <SimpleGrid columns={2} gap={4} marginBottom={4}>
          <FormControl isInvalid={!!fieldErrors.points}>
            <FormLabel>Highway points</FormLabel>
            <PointsInput
              name='points'
              points={points}
              key={pointKey}
              onAdd={onPointAdd}
              onRemove={onPointRemove}/>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Highway width</FormLabel>
            <Input
              name='width'
              type='number'
              placeholder='Width'
              required
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}/>
          </FormControl>
          <Checkbox
            name='sandLining'
            value={sandLining ? 'true' : 'false'}
            onChange={(event) => setSandLining(event.target.checked)}>
            Line with sand
          </Checkbox>
        </SimpleGrid>
        <Button type='submit'>Calculate</Button>
        <Button type='reset' onClick={onReset} marginLeft={4}>Reset</Button>
      </Box>
      {cost && (
        <Card size='sm' marginBottom={8}>
          <CardHeader>
            <Heading as='h4' size='sm'>Calculated Cost</Heading>
          </CardHeader>
          <CardBody>
            <Text>Total length (tiles): {cost.length}</Text>
            <Text>Bricks: {cost.amounts.get(ItemCode.STONE_BRICK)}</Text>
            <Text>Catseyes: {cost.amounts.get(ItemCode.CATSEYE)}</Text>
            <Text>Piles of Sand: {cost.amounts.get(ItemCode.PILE_OF_SAND)}</Text>
          </CardBody>
        </Card>
      )}
      <ChakraLink color='teal' as={ReactRouterLink} to='/'>Back to Main Page</ChakraLink>
    </Box>
  )
}

const validatePoints = (points: Point[]) => {
  if (points.length < 2) {
    return 'At least two points are required for a highway segment!'
  }

  points.forEach(([x, y]) => {
    if (isNaN(x) || isNaN(y)) {
      return 'All points must be numbers!'
    }

    if (x < 0 || y < 0) {
      return 'All points must be positive!'
    }
  })
}
