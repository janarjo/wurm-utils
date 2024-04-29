import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  SimpleGrid
} from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { HighwayCost, calcHighwayCost } from './util/Highways'
import { ItemCode } from './util/Domain'

export default function Highways() {
  const [ cost, setCost ] = useState<HighwayCost | null>(null)

  const onSubmit = useMemo(() => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const length = Number(formData.get('length'))
    const width = Number(formData.get('width'))
    const sandLining = formData.get('sandLining') === 'sandLining'
    const cost = calcHighwayCost(length, width, ItemCode.STONE_BRICK, sandLining)
    setCost(cost)
  }, [setCost])

  return (
    <Box padding={8} maxWidth={600}>
      <Heading as='h3' size={'lg'} marginBottom={8}>Highway Cost Calculator</Heading>
      <Box as='form' name='highwayCost' onSubmit={onSubmit} marginBottom={8}>
        <SimpleGrid columns={2} gap={4} marginBottom={4}>
          <FormControl isRequired>
            <FormLabel>Highway length</FormLabel>
            <Input name='length' type='number' placeholder='Length' required />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Highway width</FormLabel>
            <Input name='width' type='number' placeholder='Width' required defaultValue={2} />
          </FormControl>
          <Checkbox name='sandLining' value='sandLining'>Line with sand</Checkbox>
        </SimpleGrid>
        <Button type='submit'>Calculate</Button>
        <Button type='reset' onClick={() => setCost(null)} marginLeft={4}>Reset</Button>
      </Box>
      {cost && (
        <Box marginBottom={8}>
          <Heading as='h4' size={'md'} marginBottom={4}>Calculated Cost</Heading>
          <List>
            <ListItem>Bricks: {cost.amounts.get(ItemCode.STONE_BRICK)}</ListItem>
            <ListItem>Catseyes: {cost.amounts.get(ItemCode.CATSEYE)}</ListItem>
            <ListItem>Piles of Sand: {cost.amounts.get(ItemCode.PILE_OF_SAND)}</ListItem>
          </List>
        </Box>
      )}
      <ChakraLink as={ReactRouterLink} to='/'>Back to Main Page</ChakraLink>
    </Box>
  )
}
