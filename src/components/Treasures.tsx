import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
  useDisclosure
} from '@chakra-ui/react'
import { Form, Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Location } from '../util/Treasures'
import { Point } from '../Domain'
import PointInput from './common/PointInput'
import NumberInput from './common/NumberInput'
import { calcDistance } from '../util/Common'

export default function Treasures() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const [ locations, setLocations ] = useState<Location[]>([])
  const [ editIndex, setEditIndex ] = useState<number>()
  const [ currLocation, setCurrLocation ] = useState<Point>()

  const updateLocations = useCallback((locations: Location[]) => {
    const newLocations = locations
      .map(location => ({
        ...location,
        distance: calcDistance(currLocation ?? [0, 0], location.point)
      }))
      .sort((a, b) => a.distance - b.distance)
    setLocations(newLocations)
  }, [currLocation])

  useEffect(() => {
    updateLocations(locations)
  }, [currLocation, locations, updateLocations])

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
        Your location will be updated with each treasure you dig up.`}
        </Text>
        <Text>{`Simply add the locations of the treasures
        you want to find. You can add as many treasures as you want.
        You can also remove treasures you no longer want to find.`}
        </Text>
      </Box>
      <FormControl marginBottom={4} isRequired>
        <FormLabel>Current Location (x, y)</FormLabel>
        <PointInput
          width={300}
          initialPoint={currLocation}
          onChange={(point) => setCurrLocation(point)} />
      </FormControl>
      <Button
        colorScheme='teal'
        onClick={onAddOpen}
        isDisabled={!currLocation}
        marginBottom={4}>
          Add Map
      </Button>
      <LocationModal
        currLocation={currLocation ?? [0, 0]}
        isOpen={isAddOpen}
        onSave={onAdd}
        onClose={onAddClose} />
      <LocationModal
        currLocation={currLocation ?? [0, 0]}
        isOpen={isEditOpen}
        location={editIndex !== undefined ? locations[editIndex] : undefined}
        onSave={(location) => onEdit(location, editIndex)}
        onClose={() => {
          setEditIndex(undefined)
          onEditClose()
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
                <Td>({point[0]}, {point[1]}) {grid && ` - ${grid}`}</Td>
                <Td>{quality}</Td>
                <Td>{distance.toFixed(0)}</Td>
                <Td maxWidth={150}>
                  <Tooltip label={notes}><Text noOfLines={1}>{notes}</Text>
                  </Tooltip>
                </Td>
                <Td maxWidth={175}>
                  <Flex justifyContent='center' gap={2}>
                    <Button
                      flexGrow={1}
                      size={'sm'}
                      colorScheme='teal'
                      onClick={() => setCurrLocation(point)}>
                      Claim
                    </Button>
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

export interface LocationModalProps {
    currLocation: Point,
    isOpen: boolean,
    location?: Location,
    onSave: (point: Location) => void,
    onClose: () => void,
}

function LocationModal({
  currLocation,
  isOpen,
  location,
  onSave,
  onClose
}: LocationModalProps) {
  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const point = [Number(formData.get('x')), Number(formData.get('y'))] as Point
    const distance = calcDistance(currLocation, point)
    const grid = formData.get('grid') as string
    const quality = Number(formData.get('quality')) || undefined
    const notes = formData.get('notes') as string
    onSave({ point, distance, grid, quality, notes })
    onClose()
  }, [currLocation, onSave, onClose])

  return (
    <Modal size='sm' isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{location ? 'Edit Location' : 'Add Location'}</ModalHeader>
        <ModalCloseButton />
        <Form onSubmit={onSubmit}>
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
        </Form>
      </ModalContent>
    </Modal>
  )
}
