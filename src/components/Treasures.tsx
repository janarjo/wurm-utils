import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link as ChakraLink,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  SimpleGrid,
  Select
} from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { Location } from '../util/Treasures'
import { MAP_HOSTS, Point, Server } from '../Domain'
import PointInput from './common/PointInput'
import NumberInput from './common/NumberInput'
import { calcDistance } from '../util/Common'

export default function Treasures() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isReplaceOpen, onOpen: onReplaceOpen, onClose: onReplaceClose } = useDisclosure()
  const [ locations, setLocations ] = useState<Location[]>([])
  const [ editIndex, setEditIndex ] = useState<number>()
  const [ currLocation, setCurrLocation ] = useState<Point>()
  const [ server, setServer ] = useState<Server>(Server.XANADU)

  const updateLocations = useCallback((locations: Location[]) => {
    if (!currLocation) return
    const newLocations = locations
      .map(location => ({
        ...location,
        distance: calcDistance(currLocation, location.point)
      }))
      .sort((a, b) => a.distance - b.distance)
    setLocations(
      oldLocations => {
        if (oldLocations.length === newLocations.length &&
          oldLocations.every((location, index) => location === newLocations[index])) {
          return oldLocations
        }
        return newLocations
      }
    )
  }, [currLocation])

  const updateCurrLocation = useCallback((point: Point) => {
    setCurrLocation(point)
    updateLocations(locations)
  }, [locations, updateLocations])

  const onAdd = useCallback((location: Location) => {
    updateLocations([...locations, location ])
  }, [locations, updateLocations])

  const onEdit = useCallback((location: Location, index: number | undefined) => {
    if (index === undefined) return
    const newLocations = [...locations]
    newLocations[index] = location
    updateLocations(newLocations)
  }, [locations, updateLocations])

  const onDelete = useCallback((index: number | undefined) => {
    console.log('delete', index)
    if (index === undefined) return
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    updateLocations(newLocations)
    setEditIndex(undefined)
    onEditClose()
  }, [locations, onEditClose, updateLocations])

  return (
    <Box padding={8} maxWidth={800}>
      <Heading as='h3' size='lg' marginBottom={8}>Treasure Hunter</Heading>
      <Box marginBottom={4}>
        <Text marginBottom={2}>{`This tool is meant to help you on your treasure hunts 
        by finding the closest treasure to your current location. 
        Your location will be updated with each treasure you claim.`}
        </Text>
        <Text>{`Simply add the locations of the treasures
        you want to find. The distances will be automatically calculated and sorted 
        by distance from your current location. Once you find a treasure ingame, claim it
        and it will be removed from the list and your location will be updated.
        Feel free to edit or delete any location whenever you'd like at any point.`}
        </Text>
      </Box>
      <SimpleGrid columns={2} spacing={4} marginBottom={4}>
        <FormControl isRequired>
          <FormLabel>Server</FormLabel>
          <Select value={server} onChange={(event) => setServer(event.target.value as Server)}>
            {Object.keys(MAP_HOSTS).map(server => (
              <option key={server} value={server}>
                {server.charAt(0) + server.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Current Location (x, y)</FormLabel>
          <PointInput
            initialPoint={currLocation}
            onChange={updateCurrLocation} />
        </FormControl>
      </SimpleGrid>
      <Button
        colorScheme='teal'
        onClick={onAddOpen}
        isDisabled={!currLocation || !server}
        marginBottom={4}>
          Add Map
      </Button>
      <LocationModal
        isOpen={isAddOpen}
        onSave={onAdd}
        onClose={onAddClose} />
      <LocationModal
        isOpen={isEditOpen}
        location={editIndex !== undefined ? locations[editIndex] : undefined}
        onSave={(location) => onEdit(location, editIndex)}
        onClose={() => {
          setEditIndex(undefined)
          onEditClose()
        }}/>
      <LocationModal
        isOpen={isReplaceOpen}
        location={editIndex !== undefined
          ? {
            ...locations[editIndex],
            point: undefined,
            grid: undefined
          } as unknown as NullableLocation
          : undefined}
        onSave={(location) => {
          editIndex !== undefined && updateCurrLocation(locations[editIndex].point)
          onEdit(location, editIndex)
        }}
        onClose={() => {
          setEditIndex(undefined)
          onReplaceClose()
        }}/>
      <TableContainer marginBottom={8}>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>Location (x, y)</Th>
              <Th>Quality</Th>
              <Th>Distance</Th>
              <Th>Notes</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {locations.map(({ point, distance, grid, quality, notes }, index) => (
              <Tr key={index}>
                <Td>
                  <ChakraLink
                    color='teal'
                    href={`${MAP_HOSTS[server]}/#${point[0]},${point[1]}`}
                    target='_blank'>
                    ({point[0]}, {point[1]}) {grid && ` - ${grid}`}
                  </ChakraLink>
                </Td>
                <Td>{quality}</Td>
                <Td>{distance?.toFixed(0) ?? '???'}</Td>
                <Td maxWidth={150}>
                  <Tooltip label={notes}><Text noOfLines={1}>{notes}</Text>
                  </Tooltip>
                </Td>
                <Td maxWidth={175}>
                  <Flex justifyContent='center' gap={2}>
                    <ClaimButton
                      onFindTreasure={() => {
                        updateCurrLocation(point)
                        onDelete(index)
                      }}
                      onFindMap={() => {
                        setEditIndex(index)
                        onReplaceOpen()
                      }}
                    />
                    <Button
                      flexGrow={1}
                      size={'sm'}
                      colorScheme='blue'
                      onClick={() => {
                        setEditIndex(index)
                        onEditOpen()
                      }}>
                      Edit
                    </Button>
                    <Button
                      flexGrow={1}
                      size={'sm'}
                      colorScheme='red'
                      onClick={() => onDelete(index)}>
                      Delete
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <ChakraLink color='teal' as={ReactRouterLink} to='/'>Back to Main Page</ChakraLink>
    </Box>
  )
}

type NullableLocation = Location & { point: Point | undefined }
function LocationModal({ isOpen, location, onSave, onClose }: {
  isOpen: boolean,
  location?: NullableLocation,
  onSave: (location: Location) => void,
  onClose: () => void,
}) {
  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const point = [Number(formData.get('x')), Number(formData.get('y'))] as Point
    const grid = formData.get('grid') as string
    const quality = Number(formData.get('quality')) || undefined
    const notes = formData.get('notes') as string
    onSave({ point, grid, quality, notes })
    onClose()
  }, [onSave, onClose])

  return (
    <Modal size='sm' isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{location ? 'Edit Location' : 'Add Location'}</ModalHeader>
        <ModalCloseButton />
        <Box as='form' onSubmit={onSubmit}>
          <ModalBody>
            <FormControl marginBottom={4} isRequired>
              <FormLabel>Coordinate (x, y)</FormLabel>
              <PointInput initialPoint={location?.point}/>
            </FormControl>
            <FormControl marginBottom={4}>
              <Input name='grid' maxLength={3} defaultValue={location?.grid} placeholder='Grid'/>
            </FormControl>
            <FormControl marginBottom={4}>
              <NumberInput
                name='quality'
                value={location?.quality}
                placeholder='Quality'
                allowDecimal/>
            </FormControl>
            <FormControl>
              <Textarea name='notes' defaultValue={location?.notes} placeholder='Notes' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type='submit' colorScheme='blue' mr={3}>{location ? 'Save' : 'Add'}</Button>
            <Button variant='ghost' onClick={onClose}>Close</Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  )
}

function ClaimButton({ onFindTreasure, onFindMap }: {
    onFindTreasure: () => void,
    onFindMap: () => void
  }) {
  return (
    <Popover >
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button flexGrow={1} size='sm' colorScheme='teal'>
          Claim
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <Text>What did you find?</Text>
            </PopoverBody>
            <PopoverFooter>
              <ButtonGroup size='sm'>
                <Button
                  colorScheme='teal'
                  onClick={() => {
                    onFindTreasure()
                    onClose()
                  }}>
                  Treasure
                </Button>
                <Button onClick={onFindMap}>
                  New Map
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
