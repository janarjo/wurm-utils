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
import { LocalStorageKey, load, remove, save } from '../Storage'
import PointInput from './common/PointInput'
import NumberInput from './common/NumberInput'
import { calcDistance } from '../util/Common'

export default function Treasures() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isReplaceOpen, onOpen: onReplaceOpen, onClose: onReplaceClose } = useDisclosure()
  const [ maps, setMaps ] = useState<TreasureMap[]>(
    () => load(LocalStorageKey.TREASURE_MAPS) ?? [])
  const [ editIndex, setEditIndex ] = useState<number>()
  const [ currPosition, setCurrPosition ] = useState<Point | undefined>(
    () => load(LocalStorageKey.CURRENT_POSITION))
  const [ server, setServer ] = useState<Server>(
    () => load(LocalStorageKey.SERVER) ?? Server.XANADU)

  const deleteAll = useCallback(() => {
    setMaps([])
    remove(LocalStorageKey.TREASURE_MAPS)
  }, [])

  const updateServer = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const server = event.target.value as Server
    setServer(server)
    save(LocalStorageKey.SERVER, server)
  }, [])

  const updateMaps = useCallback((maps: TreasureMap[], currPosition?: Point) => {
    if (!currPosition) return
    const newMaps = maps
      .map(map => ({
        ...map,
        distance: calcDistance(currPosition, map.position)
      }))
      .sort((a, b) => a.distance - b.distance)
    setMaps(newMaps)
    save(LocalStorageKey.TREASURE_MAPS, newMaps)
  }, [])

  const updateCurrPosition = useCallback((position: Point) => {
    setCurrPosition(position)
    save(LocalStorageKey.CURRENT_POSITION, position)
    updateMaps(maps, position)
  }, [maps, updateMaps])

  const onAdd = useCallback((map: TreasureMap) => {
    updateMaps([...maps, map ], currPosition)
  }, [currPosition, maps, updateMaps])

  const onEdit = useCallback((map: TreasureMap, index: number | undefined) => {
    if (index === undefined) return
    const newMaps = [...maps]
    newMaps[index] = map
    updateMaps(newMaps, currPosition)
  }, [currPosition, maps, updateMaps])

  const onDelete = useCallback((index: number | undefined) => {
    if (index === undefined) return
    const newMaps = [...maps]
    newMaps.splice(index, 1)
    updateMaps(newMaps, currPosition)
    setEditIndex(undefined)
    onEditClose()
  }, [currPosition, maps, onEditClose, updateMaps])

  const onReplace = useCallback((
    map: TreasureMap,
    index: number | undefined,
    currLocation: Point) => {
    if (index === undefined) return
    const newMaps = [...maps]
    newMaps[index] = map
    updateCurrPosition(currLocation)
    updateMaps(newMaps, currLocation)
  }, [maps, updateCurrPosition, updateMaps])

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
          <Select value={server} onChange={updateServer}>
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
            point={currPosition}
            onChange={updateCurrPosition} />
        </FormControl>
      </SimpleGrid>
      <Flex marginBottom={4} gap={2}>
        <Button
          colorScheme='teal'
          onClick={onAddOpen}
          isDisabled={!currPosition || !server}>
          Add Map
        </Button>
        <DeleteAllButton onDeleteAll={deleteAll} isDisabled={maps.length === 0}/>
      </Flex>
      <MapModal
        isOpen={isAddOpen}
        onSave={onAdd}
        onClose={onAddClose}
        key={'add' + (isAddOpen ? 'Open' : 'Closed')}/>
      <MapModal
        key={'edit' + editIndex}
        isOpen={isEditOpen}
        map={editIndex !== undefined ? maps[editIndex] : undefined}
        onSave={(map) => onEdit(map, editIndex)}
        onClose={() => {
          setEditIndex(undefined)
          onEditClose()
        }}/>
      <MapModal
        key={'replace' + editIndex}
        isOpen={isReplaceOpen}
        map={editIndex !== undefined
          ? {
            ...maps[editIndex],
            position: undefined,
            grid: undefined
          }
          : undefined}
        onSave={(map) => editIndex !== undefined
          && onReplace(map, editIndex, maps[editIndex].position)}
        onClose={() => {
          setEditIndex(undefined)
          onReplaceClose()
        }}/>
      <TableContainer marginBottom={8}>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>Position (x, y)</Th>
              <Th>Quality</Th>
              <Th>Distance</Th>
              <Th>Notes</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {maps.map(({ position, distance, grid, quality, notes }, index) => (
              <Tr key={index}>
                <Td>
                  <ChakraLink
                    color='teal'
                    href={`${MAP_HOSTS[server]}/#${position[0]},${position[1]}`}
                    target='_blank'>
                    ({position[0]}, {position[1]}) {grid && ` - ${grid}`}
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
                        updateCurrPosition(position)
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

type PartialMap = Omit<TreasureMap, 'position'> & { position?: Point }
function MapModal({ isOpen, map: editMap, onSave, onClose }: {
  isOpen: boolean,
  map?: PartialMap,
  onSave: (location: TreasureMap) => void,
  onClose: () => void,
}) {
  const [map, setMap ] = useState<PartialMap>({
    ...editMap,
  })
  const { position, grid, quality, notes } = map

  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!map.position) return
    onSave({ ...map, position: map.position })
    onClose()
  }, [map, onSave, onClose])

  const onFieldChange = useCallback((key: keyof PartialMap, value: string | number | Point) => {
    setMap(oldMap => ({
      ...oldMap,
      [key]: value
    }))
  }, [])

  return (
    <Modal size='sm' isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editMap ? 'Edit Map' : 'Add Map'}</ModalHeader>
        <ModalCloseButton />
        <Box as='form' onSubmit={onSubmit}>
          <ModalBody>
            <FormControl marginBottom={4} isRequired>
              <FormLabel>Position (x, y)</FormLabel>
              <PointInput
                point={position}
                onChange={(point) => onFieldChange('position', point)}/>
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
            <Button type='submit' colorScheme='blue' mr={3}>{editMap ? 'Save' : 'Add'}</Button>
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

function DeleteAllButton({ isDisabled, onDeleteAll }: {
  isDisabled: boolean,
  onDeleteAll: () => void
}) {
  return (
    <Popover>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              colorScheme='red'
              isDisabled={isDisabled}>
                Delete All
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <Text>Are you sure you want to delete all treasure maps?</Text>
            </PopoverBody>
            <PopoverFooter>
              <ButtonGroup size='sm'>
                <Button colorScheme='red' onClick={() => {
                  onDeleteAll()
                  onClose()
                }}>
                  Yes
                </Button>
                <Button onClick={onClose}>
                  No
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}
