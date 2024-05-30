import { fireEvent, render, screen, within } from '@testing-library/react'
import LengthInput from '../../../components/common/LengthInput'
import '@testing-library/jest-dom'
import { Point } from '../../../Domain'

describe('LengthInput', () => {
  let onChange: jest.Mock
  beforeEach(() => {
    onChange = jest.fn()
    render(<LengthInput onChange={onChange} />)
  })

  it('should render', () => {
    const input = screen.getByRole('textbox')
    expect(input).toBeVisible()
    expect(input).toHaveValue('')
  })

  it('should have a measure button', () => {
    const measureBtn = screen.getByText('Measure')
    expect(measureBtn).toBeVisible()
  })

  it('should accept numbers', () => {
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '10' } })
    expect(onChange).toHaveBeenCalledWith('10')
  })

  describe('when measuring', () => {
    let popup: HTMLElement
    beforeEach(async () => {
      const measureBtn = screen.getByText('Measure')
      fireEvent.click(measureBtn)
      popup = await screen.getByRole('dialog', { hidden: true })
      console.log('logging', popup.innerHTML)
    })

    it('should open measure tooltip', () => {
      const { x, y, addBtn } = dialogElems(popup)

      expect(popup).toBeInTheDocument()
      expect(x).toBeInTheDocument()
      expect(y).toBeInTheDocument()
      expect(addBtn).toBeInTheDocument()
    })

    it('should add points', () => {
      addPoint(popup, [5, 8])
      expect(within(popup).getByText('5, 8')).toBeInTheDocument()
    })

    it('should measure length from two points', () => {
      const { calculateBtn } = dialogElems(popup)

      addPoint(popup, [5, 5])
      addPoint(popup, [5, 8])

      fireEvent.click(calculateBtn)

      expect(onChange).toHaveBeenCalledWith('3')
    })

    it('should measure length from multiple points', () => {
      const { calculateBtn } = dialogElems(popup)

      addPoint(popup, [5, 5])
      addPoint(popup, [5, 8])
      addPoint(popup, [8, 8])
      addPoint(popup, [8, 5])

      fireEvent.click(calculateBtn)

      expect(onChange).toHaveBeenCalledWith('9')
    })
  })

})

describe('LengthInput (max points)', () => {
  beforeEach(() => {
    render(<LengthInput onChange={jest.fn()} maxPoints={2} />)
  })

  it('should not allow more than max points', async () => {
    const measureBtn = screen.getByText('Measure')
    fireEvent.click(measureBtn)
    const popup = await screen.getByRole('dialog', { hidden: true })
    const { addBtn } = dialogElems(popup)

    addPoint(popup, [5, 5])
    addPoint(popup, [5, 8])

    expect(addBtn).toBeDisabled()
  })
})

function addPoint(popup: HTMLElement, point: Point) {
  const { x, y, addBtn } = dialogElems(popup)
  fireEvent.change(x, { target: { value: point[0].toString() } })
  fireEvent.change(y, { target: { value: point[1].toString() } })
  fireEvent.click(addBtn)
}

const dialogElems = (popup: HTMLElement) => ({
  get x() { return within(popup).getByPlaceholderText('x') },
  get y() { return within(popup).getByPlaceholderText('y') },
  get addBtn() { return within(popup).getByText('Add') },
  get calculateBtn() { return within(popup).getByText('Calculate') },
})
