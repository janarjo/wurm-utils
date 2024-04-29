import { Box, Heading } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

export default function Root() {

  return (
    <Box padding={8}>
      <Heading marginBottom={4}>Wurm Utilities</Heading>
      <p>Wurm Utilities is a collection of tools for the game Wurm Online.</p>
      <ChakraLink as={ReactRouterLink} to='/highways'>Highway Cost Calculator</ChakraLink>
    </Box>
  )
}
