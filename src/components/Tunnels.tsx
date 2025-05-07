import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import LengthInput from './common/LengthInput'
import { useCallback, useState } from 'react'
import NumberInput from './common/NumberInput'
import { TunnelCost, avgActionsPerOreVein, calcTunnelCost, oreProbability } from '../util/Tunnels'

export default function Tunnels() {
  const [ length, setLength ] = useState<number>(0)
  const [ width, setWidth ] = useState<number>(1)
  const [ cost, setCost ] = useState<TunnelCost | null>(null)

  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cost = calcTunnelCost(length, width)
    setCost(cost)
  }, [length, width])

  const onReset = useCallback(() => {
    setLength(0)
    setWidth(1)
    setCost(null)
  }, [])

  return (
    <Box padding={8} maxWidth={600}>
      <Breadcrumb size='sm' marginBottom={4}>
        <BreadcrumbItem>
          <BreadcrumbLink as={ReactRouterLink} to='/'>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={ReactRouterLink} to='/tunnels'>
            Tunnels
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Heading as='h3' size='lg' marginBottom={8}>Tunnel Calculator</Heading>
      <Box marginBottom={4}>
        <Text marginBottom={2}>{`
          The tunnel calculator will help you determine the cost of a tunnel based on the length.
          The cost is calculated based on the number of tiles in the tunnel 
          and the expected amount of ores you will hit.`}
        </Text>
        <Text>{`
          The ore probability is considered to be roughly ${(oreProbability * 100).toFixed(0)}%.
          This means there may be significant inaccuracies in cost because 
          ore veins count for most of the effort of creating a tunnel 
          and there can be large variances in ore density. 
          Ore amount per vein is also averaged to be around ${avgActionsPerOreVein} actions.`}
        </Text>
      </Box>
      <Box as='form' name='tunnelCost' onSubmit={onSubmit} onReset={onReset} marginBottom={8}>
        <SimpleGrid columns={2} gap={4} marginBottom={4}>
          <FormControl isRequired>
            <FormLabel>Tunnel length</FormLabel>
            <LengthInput
              name='length'
              placeholder='Length'
              value={length}
              onChange={(value) => setLength(Number(value))}
              maxPoints={2}/>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Tunnel width</FormLabel>
            <NumberInput
              name='width'
              type='number'
              placeholder='Width'
              required
              value={width}
              onChange={(value) => setWidth(Number(value))}/>
          </FormControl>
        </SimpleGrid>
        <Button type='submit'>Calculate</Button>
        <Button type='reset' marginLeft={4}>Reset</Button>
      </Box>
      {cost && (
        <Card size='sm' marginBottom={8}>
          <CardHeader>
            <Heading as='h4' size='sm'>Calculated Cost</Heading>
          </CardHeader>
          <CardBody>
            <Text marginBottom={2}>{`
              Tunnel will have a total of ${cost.wallAmount} wall 
              and ${cost.floorAmount} floor tiles.`}
            </Text>
            <Text>{`A total of ${cost.totalTiles} tiles need to be mined 
              of which ${cost.totalOreVeins} are expected to be ore veins. 
              This will require a total of ${cost.stoneActions + cost.oreActions} 
              (${cost.stoneActions} stone and ~${cost.oreActions} ore) mining actions to complete.`}
            </Text>
          </CardBody>
        </Card>
      )}
    </Box>
  )
}
