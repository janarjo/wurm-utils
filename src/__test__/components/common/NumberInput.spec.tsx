import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import NumberInput from '../../../components/common/NumberInput'

describe('NumberInput (default)', () => {
  const setup = () => {
    const utils = render(<NumberInput />)
    const input = screen.getByRole('textbox')
    return {
      input,
      ...utils,
    }
  }

  it('should render', () => {
    const { input } = setup()
    expect(input).toBeVisible()
    expect(input).toHaveValue('')
  })

  it('should accept numbers', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '10' } })
    expect(input).toHaveValue('10')
  })

  it('should not accept letters', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input).toHaveValue('')
  })

  it('should not accept negative numbers', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '-10' } })
    expect(input).toHaveValue('')
  })

  it('should not accept decimals', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '10.5' } })
    expect(input).toHaveValue('')
  })
})

describe('NumberInput (allowNegative)', () => {
  const setup = () => {
    const utils = render(<NumberInput allowNegative />)
    const input = screen.getByRole('textbox')
    return {
      input,
      ...utils,
    }
  }

  it ('should accept - sign as starting value', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '-' } })
    expect(input).toHaveValue('-')
  })

  it('should accept negative numbers', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '-10' } })
    expect(input).toHaveValue('-10')
  })

  it('should not accept negative decimals', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '-10.5' } })
    expect(input).toHaveValue('')
  })

  it('should not accept minus sign in the middle of the number', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '1-0' } })
    expect(input).toHaveValue('')
  })
})

describe('NumberInput (allowDecimal)', () => {
  const setup = () => {
    const utils = render(<NumberInput allowDecimal />)
    const input = screen.getByRole('textbox')
    return {
      input,
      ...utils,
    }
  }

  it('should accept decimals', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '10.5' } })
    expect(input).toHaveValue('10.5')
  })

  it('should not accept negative decimals', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '-10.5' } })
    expect(input).toHaveValue('')
  })
})


describe('NumberInput (allowNegative, allowDecimal)', () => {
  const setup = () => {
    const utils = render(<NumberInput allowNegative allowDecimal />)
    const input = screen.getByRole('textbox')
    return {
      input,
      ...utils,
    }
  }

  it('should accept negative decimals', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: '-10.5' } })
    expect(input).toHaveValue('-10.5')
  })
})
