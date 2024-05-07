import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Treasures from '../../components/Treasures'
import { MemoryRouter } from 'react-router-dom'

describe('Treasures (initial)', () => {
  render(<MemoryRouter><Treasures /></MemoryRouter>)
  const table = screen.getByRole('table')
  const heading = screen.getByRole('heading')

  it('should render', () => {
    expect(table).toBeVisible()
    expect(heading).toBeVisible()
  })
})
