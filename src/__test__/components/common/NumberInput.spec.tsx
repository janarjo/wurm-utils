import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import NumberInput from '../../../components/common/NumberInput'

describe('NumberInput (default)', () => {
  const setup = () => {
    const onChange = jest.fn()
    const utils = render(<NumberInput onChange={onChange} />)
    const input = screen.getByRole('textbox')
    return {
      input,
      onChange,
      ...utils,
    }
  }

  it('should render', () => {
    const { input } = setup()
    expect(input).toBeVisible()
    expect(input).toHaveValue('')
  })

  it('should accept numbers', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '10' } })
    expect(onChange).toHaveBeenCalledWith('10')
  })

  it('should not accept letters', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should not accept negative numbers', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '-10' } })
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should not accept decimals', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '10.5' } })
    expect(onChange).toHaveBeenCalledWith('')
  })
})

describe('NumberInput (allowNegative)', () => {
  const setup = () => {
    const onChange = jest.fn()
    const utils = render(<NumberInput onChange={onChange} allowNegative />)
    const input = screen.getByRole('textbox')
    return {
      input,
      onChange,
      ...utils,
    }
  }

  it ('should accept - sign as starting value', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '-' } })
    expect(onChange).toHaveBeenCalledWith('-')
  })

  it('should accept negative numbers', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '-10' } })
    expect(onChange).toHaveBeenCalledWith('-10')
  })

  it('should not accept negative decimals', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '-10.5' } })
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should not accept minus sign in the middle of the number', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '1-0' } })
    expect(onChange).toHaveBeenCalledWith('')
  })
})

describe('NumberInput (allowDecimal)', () => {
  const setup = () => {
    const onChange = jest.fn()
    const utils = render(<NumberInput onChange={onChange} allowDecimal />)
    const input = screen.getByRole('textbox')
    return {
      input,
      onChange,
      ...utils,
    }
  }

  it('should accept decimals', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '10.5' } })
    expect(onChange).toHaveBeenCalledWith('10.5')
  })

  it('should not accept negative decimals', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '-10.5' } })
    expect(onChange).toHaveBeenCalledWith('')
  })
})


describe('NumberInput (allowNegative, allowDecimal)', () => {
  const setup = () => {
    const onChange = jest.fn()
    const utils = render(<NumberInput onChange={onChange} allowNegative allowDecimal />)
    const input = screen.getByRole('textbox')
    return {
      input,
      onChange,
      ...utils,
    }
  }

  it('should accept negative decimals', () => {
    const { input, onChange } = setup()
    fireEvent.change(input, { target: { value: '-10.5' } })
    expect(onChange).toHaveBeenCalledWith('-10.5')
  })
})
