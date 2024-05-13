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
import { TreasureMap } from '../util/Treasures'
import { MAP_HOSTS, Point, Server } from '../Domain'
import PointInput from './common/PointInput'
import NumberInput from './common/NumberInput'
import { calcDistance } from '../util/Common'

export default function Treasures() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isReplaceOpen, onOpen: onReplaceOpen, onClose: onReplaceClose } = useDisclosure()
  const [ locations, setLocations ] = useState<TreasureMap[]>([])
  const [ editIndex, setEditIndex ] = useState<number>()
  const [ currLocation, setCurrLocation ] = useState<Point>()
  const [ server, setServer ] = useState<Server>(Server.XANADU)

  const updateLocations = useCallback((locations: TreasureMap[], currLocation?: Point) => {
    if (!currLocation) return
    const newLocations = locations
      .map(location => ({
        ...location,
        distance: calcDistance(currLocation, location.point)
      }))
      .sort((a, b) => a.distance - b.distance)
    setLocations(newLocations)
  }, [])

  const updateCurrLocation = useCallback((point: Point) => {
    setCurrLocation(point)
    updateLocations(locations, point)
  }, [locations, updateLocations])

  const onAdd = useCallback((location: TreasureMap) => {
    updateLocations([...locations, location ], currLocation)
  }, [currLocation, locations, updateLocations])

  const onEdit = useCallback((location: TreasureMap, index: number | undefined) => {
    if (index === undefined) return
    const newLocations = [...locations]
    newLocations[index] = location
    updateLocations(newLocations, currLocation)
  }, [currLocation, locations, updateLocations])

  const onDelete = useCallback((index: number | undefined) => {
    if (index === undefined) return
    const newLocations = [...locations]
    newLocations.splice(index, 1)
    updateLocations(newLocations, currLocation)
    setEditIndex(undefined)
    onEditClose()
  }, [currLocation, locations, onEditClose, updateLocations])

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
            point={currLocation}
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
        onClose={onAddClose}
        key={'add' + (isAddOpen ? 'Open' : 'Closed')}/>
      <LocationModal
        key={'edit' + editIndex}
        isOpen={isEditOpen}
        location={editIndex !== undefined ? locations[editIndex] : undefined}
        onSave={(location) => onEdit(location, editIndex)}
        onClose={() => {
          setEditIndex(undefined)
          onEditClose()
        }}/>
      <LocationModal
        key={'replace' + editIndex}
        isOpen={isReplaceOpen}
        location={editIndex !== undefined
          ? {
            ...locations[editIndex],
            point: undefined,
            grid: undefined
          }
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

type PartialMap = Omit<TreasureMap, 'point'> & { point?: Point }
function LocationModal({ isOpen, location: editLocation, onSave, onClose }: {
  isOpen: boolean,
  location?: PartialMap,
  onSave: (location: TreasureMap) => void,
  onClose: () => void,
}) {
  const [location, setLocation ] = useState<PartialMap>({
    ...editLocation,
  })
  const { point, grid, quality, notes } = location

  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!location.point) return
    onSave({ ...location, point: location.point })
    onClose()
  }, [location, onSave, onClose])

  const onFieldChange = useCallback((key: string, value: string | number | Point) => {
    setLocation(oldLocation => ({
      ...oldLocation,
      [key]: value
    }))
  }, [])

  return (
    <Modal size='sm' isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editLocation ? 'Edit Location' : 'Add Location'}</ModalHeader>
        <ModalCloseButton />
        <Box as='form' onSubmit={onSubmit}>
          <ModalBody>
            <FormControl marginBottom={4} isRequired>
              <FormLabel>Coordinate (x, y)</FormLabel>
              <PointInput
                point={point}
                onChange={(point) => onFieldChange('point', point)}/>
            </FormControl>
            <FormControl marginBottom={4}>
              <Input
                name='grid'
                placeholder='Grid'
                maxLength={3}
                value={grid ?? ''}
                onChange={(event) => onFieldChange('grid', event.target.value)}/>
            </FormControl>
            <FormControl marginBottom={4}>
              <NumberInput
                name='quality'
                value={quality}
                placeholder='Quality'
                allowDecimal
                onChange={(value) => onFieldChange('quality', value)}/>
            </FormControl>
            <FormControl>
              <Textarea
                name='notes'
                value={notes ?? ''}
                placeholder='Notes'
                onChange={(event) => onFieldChange('notes', event.target.value)}/>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type='submit' colorScheme='blue' mr={3}>{editLocation ? 'Save' : 'Add'}</Button>
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
