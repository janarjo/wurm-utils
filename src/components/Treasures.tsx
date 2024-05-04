import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  TagLabel,
  Text,
  Textarea,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Form, Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { Location } from '../util/Treasures'
import { Point } from '../Domain'
import PointInput from './common/PointInput'
import NumberInput from './common/NumberInput'

export default function Treasures() {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const [ locations, setLocations ] = useState<Location[]>([])
  const [ editIndex, setEditIndex ] = useState<number>()

  const onAdd = useCallback((location: Location) => {
    setLocations([...locations, location ])
  }, [locations])

  const onEdit = useCallback((location: Location, index: number) => {
    const newLocations = [...locations]
    newLocations[index] = location
    setLocations(newLocations)
  }, [locations])

  return (
    <Box padding={8} maxWidth={600}>
      <Heading as='h3' size='lg' marginBottom={8}>Treasure Hunter</Heading>
      <Box marginBottom={4}>
        <Text marginBottom={2}>{`This tool is meant to help you on your treasure hunts 
        by finding the closest treasure to your current location.`}
        </Text>
        <Text>{`Simply add the locations of the treasures
        you want to find. You can add as many treasures as you want.
        You can also remove treasures you no longer want to find.`}
        </Text>
      </Box>
      <Box marginBottom={4}>
        <Button colorScheme='teal' onClick={onAddOpen}>Add Location</Button>
      </Box>
      <LocationModal isOpen={isAddOpen} onSave={onAdd} onClose={onAddClose} />
      <LocationModal
        isOpen={isEditOpen}
        location={editIndex !== undefined ? locations[editIndex] : undefined}
        onSave={(location) => editIndex !== undefined ? onEdit(location, editIndex) : undefined}
        onClose={() => {
          setEditIndex(undefined)
          onEditClose()
        }}/>
      <List marginBottom={8}>
        {locations.map(({ point, grid, quality, notes }, index) => (
          <ListItem key={index} marginBottom={2}>
            <Tooltip label={notes}>
              <Tag
                size='lg'
                borderRadius='full'
                variant='solid'
                colorScheme={index === editIndex ? 'gray' : index === 0 ? 'red' : 'blue'}
                cursor={'pointer'}
                onClick={() => {
                  console.log('Edit', index)
                  setEditIndex(index)
                  onEditOpen()
                }}>
                <TagLabel>
                ({point[0]}, {point[1]})
                  {grid && ` - ${grid}`}
                  {quality && ` Ql: ${quality}`}</TagLabel>
              </Tag>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <ChakraLink color='teal' as={ReactRouterLink} to='/'>Back to Main Page</ChakraLink>
    </Box>
  )
}

export interface LocationModalProps {
    isOpen: boolean,
    location?: Location,
    onSave: (point: Location) => void,
    onClose: () => void
}

function LocationModal({ isOpen, location, onSave, onClose }: LocationModalProps) {
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
