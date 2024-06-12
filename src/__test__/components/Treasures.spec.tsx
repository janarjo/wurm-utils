import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import Treasures from '../../components/Treasures'
import { MemoryRouter } from 'react-router-dom'
import { Server } from '../../Domain'
import { LocalStorageKey } from '../../Storage'
import { TreasureMap } from '../../util/Treasures'

describe('Treasures', () => {
  let renderOpts: ReturnType<typeof render>
  beforeEach(() => {
    window.localStorage.clear()
    renderOpts = render(
      <MemoryRouter>
        <Treasures />
      </MemoryRouter>
    )
  })

  describe('initially', () => {
    it('should render', () => {
      expect(screen.getByRole('table')).toBeVisible()
      expect(screen.getByRole('heading')).toBeVisible()
    })

    it('should have default server selected', () => {
      const { server } = mainElems()
      expect(server).toHaveValue(Server.XANADU)
    })

    it('should have no position defined', () => {
      const { currPosX, currPosY } = mainElems()
      expect(currPosX).toHaveValue('')
      expect(currPosY).toHaveValue('')
    })

    it('should have a disabled button for adding maps', () => {
      const { addMapBtn } = mainElems()
      expect(addMapBtn).toBeDisabled()
    })
  })

  describe('when a position is defined', () => {
    beforeEach(() => {
      const { currPosX, currPosY } = mainElems()
      fireEvent.change(currPosX, { target: { value: '20' } })
      fireEvent.change(currPosY, { target: { value: '30' } })
    })

    it('should enable the button for adding maps', () => {
      const { addMapBtn } = mainElems()
      expect(addMapBtn).toBeEnabled()
    })

    it('should open a dialog when the button is clicked', async () => {
      const { addMapBtn, addLocationPopup } = mainElems()
      fireEvent.click(addMapBtn)
      expect(await addLocationPopup).toBeInTheDocument()
    })
  })

  describe('when a map is added', () => {
    beforeEach(async () => {
      const { currPosX, currPosY } = mainElems()
      fireEvent.change(currPosX, { target: { value: '20' } })
      fireEvent.change(currPosY, { target: { value: '30' } })

      await addMap({ point: [40, 50], grid: 'A1', quality: 15, notes: 'Some notes' })
    })

    it('should have appropriate table headers', () => {
      const { mapTable } = mainElems()
      const headers = within(mapTable).getAllByRole('columnheader')

      expect(headers).toHaveLength(5)
      expect(headers[0]).toHaveTextContent('Location (x, y)')
      expect(headers[1]).toHaveTextContent('Quality')
      expect(headers[2]).toHaveTextContent('Distance')
      expect(headers[3]).toHaveTextContent('Notes')
    })

    it('should have appropriate buttons', () => {
      const { mapTable } = mainElems()
      const buttons = within(mapTable).getAllByRole('button')

      expect(buttons).toHaveLength(3)
      expect(buttons[0]).toHaveTextContent('Claim')
      expect(buttons[1]).toHaveTextContent('Edit')
      expect(buttons[2]).toHaveTextContent('Delete')
    })

    it('should add the map to the table', () => {
      const { mapTable } = mainElems()
      const rows = within(mapTable).getAllByRole('row')

      expect(rows).toHaveLength(2)

      const addedRow = rows[1]
      const cells = within(addedRow).getAllByRole('cell')

      expect(cells[0]).toHaveTextContent('(40, 50) - A1')
      expect(cells[1]).toHaveTextContent('15')
      expect(cells[2]).toHaveTextContent('28')
      expect(cells[3]).toHaveTextContent('Some notes')
    })

    it('should persist the map in local storage', () => {
      const stored = JSON.parse(window.localStorage.getItem(LocalStorageKey.TREASURE_MAPS) || '[]')
      expect(stored).toHaveLength(1)

      const storedMap = stored[0]
      expect(storedMap).toMatchObject({
        point: [40, 50],
        grid: 'A1',
        quality: '15',
        distance: 28.284271247461902,
        notes: 'Some notes',
      })
    })

    describe('when pressing claim', () => {
      beforeEach(async () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        const { claimBtn } = rowElems(rows[1])
        fireEvent.click(claimBtn)
      })

      it('should open a dialog', async () => {
        const { claimPopup } = mainElems()
        expect(await claimPopup).toBeInTheDocument()
      })

      it('should have appropriate buttons', async () => {
        const { claimPopup } = mainElems()
        const { treasureBtn, newMapBtn } = claimElems(await claimPopup)

        expect(treasureBtn).toBeInTheDocument()
        expect(newMapBtn).toBeInTheDocument()
      })
    })

    describe('when the map is completed', () => {
      beforeEach(async () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        await claimMap(rows[1])
      })

      it('should remove the map from the table', () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        expect(rows).toHaveLength(1)
      })

      it('should update the position', () => {
        const { currPosX, currPosY } = mainElems()
        expect(currPosX).toHaveValue('40')
        expect(currPosY).toHaveValue('50')
      })
    })

    describe('when the map is replaced', () => {
      beforeEach(async () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        await replaceMap(rows[1], { point: [80, 90], grid: 'B2', quality: 20, notes: 'New notes' })
      })

      it('should update the position', () => {
        const { currPosX, currPosY } = mainElems()
        expect(currPosX).toHaveValue('40')
        expect(currPosY).toHaveValue('50')
      })

      it('should update the map in the table', () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')

        expect(rows).toHaveLength(2)

        const updatedRow = rows[1]
        const cells = within(updatedRow).getAllByRole('cell')

        expect(cells[0]).toHaveTextContent('(80, 90) - B2')
        expect(cells[1]).toHaveTextContent('20')
        expect(cells[2]).toHaveTextContent('57')
        expect(cells[3]).toHaveTextContent('New notes')
      })
    })

    describe('when the map is edited', () => {
      beforeEach(async () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')

        await editMap(rows[1], { point: [60, 70], grid: 'B2', quality: 20, notes: 'Edited notes' })
      })

      it('should update the map in the table', () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')

        expect(rows).toHaveLength(2)

        const updatedRow = rows[1]
        const cells = within(updatedRow).getAllByRole('cell')

        expect(cells[0]).toHaveTextContent('(60, 70) - B2')
        expect(cells[1]).toHaveTextContent('20')
        expect(cells[2]).toHaveTextContent('57')
        expect(cells[3]).toHaveTextContent('Edited notes')
      })
    })

    describe('when the map is deleted', () => {
      beforeEach(() => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        const { deleteBtn } = rowElems(rows[1])
        fireEvent.click(deleteBtn)
      })

      it('should remove the map from the table', () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        expect(rows).toHaveLength(1)
      })
    })
  })

  describe('when multiple maps are added', () => {
    beforeEach(async () => {
      const { currPosX, currPosY } = mainElems()
      fireEvent.change(currPosX, { target: { value: '20' } })
      fireEvent.change(currPosY, { target: { value: '30' } })

      await addMap({ point: [80, 90] })
      await addMap({ point: [60, 70] })
      await addMap({ point: [40, 50] })
    })

    it('should add all maps to the table', () => {
      const { mapTable } = mainElems()
      const rows = within(mapTable).getAllByRole('row')
      expect(rows).toHaveLength(4)
    })

    it('should be ordered by distance', () => {
      const { mapTable } = mainElems()
      const rows = within(mapTable).getAllByRole('row')

      const distances = rows.slice(1).map(row => within(row).getAllByRole('cell')[2].textContent)
      expect(distances).toEqual(['28', '57', '85'])
    })

    describe('when position is updated', () => {
      beforeEach(() => {
        const { currPosX, currPosY } = mainElems()
        fireEvent.change(currPosX, { target: { value: '80' } })
        fireEvent.change(currPosY, { target: { value: '90' } })
      })

      it('should update and reorder the distances', () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')

        const distances = rows.slice(1).map(row => within(row).getAllByRole('cell')[2].textContent)
        expect(distances).toEqual(['0', '28', '57'])
      })
    })

    describe('when the page is reloaded', () => {
      beforeEach(() => {
        renderOpts.unmount()
        render(
          <MemoryRouter>
            <Treasures />
          </MemoryRouter>
        )
      })

      it('should restore current position', () => {
        const { currPosX, currPosY } = mainElems()
        expect(currPosX).toHaveValue('20')
        expect(currPosY).toHaveValue('30')
      })

      it('should restore maps', () => {
        const { mapTable } = mainElems()
        const rows = within(mapTable).getAllByRole('row')
        expect(rows).toHaveLength(4)

        const distances = rows.slice(1).map(row => within(row).getAllByRole('cell')[2].textContent)
        expect(distances).toEqual(['28', '57', '85'])
      })
    })
  })
})

const addMap = async (map: TreasureMap) => {
  const { addMapBtn, addLocationPopup } = mainElems()
  fireEvent.click(addMapBtn)

  submitPopupForm(await addLocationPopup, map)
}

const editMap = async (row: HTMLElement, map: TreasureMap) => {
  const { editLocationPopup } = mainElems()
  const { editBtn } = rowElems(row)

  fireEvent.click(editBtn)

  submitPopupForm(await editLocationPopup, map)
}

const claimMap = async (row: HTMLElement) => {
  const { claimPopup } = mainElems()
  const { claimBtn } = rowElems(row)
  fireEvent.click(claimBtn)

  const popup = await claimPopup
  const { treasureBtn } = claimElems(popup)
  fireEvent.click(treasureBtn)
}

const replaceMap = async (row: HTMLElement, map: TreasureMap) => {
  const { claimPopup, editLocationPopup } = mainElems()
  const { claimBtn } = rowElems(row)
  fireEvent.click(claimBtn)

  const popup = await claimPopup
  const { newMapBtn } = claimElems(popup)
  fireEvent.click(newMapBtn)

  submitPopupForm(await editLocationPopup, map)
}

const submitPopupForm = (popup: HTMLElement, map: TreasureMap) => {
  const { x, y, grid, quality, notes, submitBtn } = dialogElems(popup)

  fireEvent.change(x, { target: { value: map.point[0] } })
  fireEvent.change(y, { target: { value: map.point[1] } })
  fireEvent.change(grid, { target: { value: map.grid } })
  fireEvent.change(quality, { target: { value: map.quality } })
  fireEvent.change(notes, { target: { value: map.notes } })
  fireEvent.click(submitBtn)
}

const mainElems = () => ({
  get server() { return screen.getByRole('combobox') },
  get currPosX() { return screen.getByPlaceholderText('x') },
  get currPosY() { return screen.getByPlaceholderText('y') },
  get addMapBtn() { return screen.getByRole('button', { name: /Add Map/i }) },
  get mapTable() { return screen.getByRole('table') },
  get addLocationPopup() {
    return screen.findByRole('dialog', { name: /Add Location/i, hidden: true })
  },
  get editLocationPopup() {
    return screen.findByRole('dialog', { name: /Edit Location/i, hidden: true })
  },
  get claimPopup() {
    return screen.findByRole('dialog', { description: /What did you find/i, hidden: true })
  },
})

const rowElems = (row: HTMLElement) => ({
  get claimBtn() { return within(row).getByRole('button', { name: /Claim/i }) },
  get editBtn() { return within(row).getByRole('button', { name: /Edit/i }) },
  get deleteBtn() { return within(row).getByRole('button', { name: /Delete/i }) },
})

const dialogElems = (popup: HTMLElement) => ({
  get x() { return within(popup).getByPlaceholderText('x') },
  get y() { return within(popup).getByPlaceholderText('y') },
  get grid() { return within(popup).getByPlaceholderText('Grid') },
  get quality() { return within(popup).getByPlaceholderText('Quality') },
  get notes() { return within(popup).getByPlaceholderText('Notes') },
  get submitBtn() { return within(popup).getByRole('button', { name: /Add|Save/i }) },
})

const claimElems = (popup: HTMLElement) => ({
  get treasureBtn() { return within(popup).getByRole('button', { name: /Treasure/i }) },
  get newMapBtn() { return within(popup).getByRole('button', { name: /New Map/i }) },
})
