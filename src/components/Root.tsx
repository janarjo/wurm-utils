import { Box, Heading, List, ListItem } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

export default function Root() {

  return (
    <Box padding={8} maxWidth={800}>
      <Heading marginBottom={4}>Wurm Utilities</Heading>
      <Box marginBottom={2}>{`
        Wurm Utilities is a collection of tools and calculators for the game Wurm Online.
        The tools are designed to help players with common tasks such as treasure hunting,
        highway building, and bridge building.`}
      </Box>
      <Box marginBottom={2}>{`
        This is a personal project under active development, there may be bugs and 
        functionality may break or change. It is is not affiliated with 
        Code Club AB or Wurm Online.`}
      </Box>
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
        <ListItem>
          <ChakraLink as={ReactRouterLink} to='/bridges' color='teal'>
            Bridge Calculator
          </ChakraLink>
        </ListItem>
      </List>
    </Box>
  )
}
