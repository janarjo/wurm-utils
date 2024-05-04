import { Box, Heading, List, ListItem } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

export default function Root() {

  return (
    <Box padding={8}>
      <Heading marginBottom={4}>Wurm Utilities</Heading>
      <Box marginBottom={2}>Wurm Utilities is a collection of tools for the game Wurm Online.</Box>
      <List>
        <ListItem>
          <ChakraLink as={ReactRouterLink} to='/treasures' color='teal'>
            Treasure Hunter
          </ChakraLink>
        </ListItem>
        <ListItem>
          <ChakraLink as={ReactRouterLink} to='/highways' color='teal'>
            Highway Calculator
          </ChakraLink>
        </ListItem>
      </List>
    </Box>
  )
}
