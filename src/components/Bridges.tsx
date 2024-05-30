import {
  Box,
  Heading,
  Link as ChakraLink,
  FormControl,
  FormLabel,
  SimpleGrid,
  Select
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'
import LengthInput from './common/LengthInput'
import NumberInput from './common/NumberInput'
import { BridgeType } from '../util/Bridges'

export default function Bridges() {
  const [ length, setLength ] = useState<number>(0)
  const [ width, setWidth ] = useState<number>(1)
  const [ bridgeType, setBridgeType ] = useState<BridgeType>(BridgeType.FLAT_WOOD)

  return (
    <Box padding={8} maxWidth={600}>
      <Heading as='h3' size='lg' marginBottom={8}>Bridge Calculator</Heading>
      <SimpleGrid columns={2} gap={4} marginBottom={4}>
        <FormControl isRequired>
          <FormLabel>Bridge length</FormLabel>
          <LengthInput
            name='length'
            placeholder='Length'
            value={length}
            onChange={(value) => setLength(Number(value))}
            maxPoints={2}/>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Bridge width</FormLabel>
          <NumberInput
            name='width'
            value={width}
            onChange={(value) => setWidth(Number(value))}/>
        </FormControl>
        <FormControl>
          <FormLabel>Bridge type</FormLabel>
          <Select
            value={bridgeType}
            onChange={(event) => setBridgeType(event.target.value as BridgeType)}>
            {Object.values(BridgeType).map((type) => (
              <option key={type} value={type}>
                {type.slice(0, 1) + type.slice(1).toLowerCase().replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </FormControl>
      </SimpleGrid>
      <ChakraLink color='teal' as={ReactRouterLink} to='/'>Back to Main Page</ChakraLink>
    </Box>
  )
}
