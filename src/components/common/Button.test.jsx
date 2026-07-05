import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Flame } from 'lucide-react'
import Button from './Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Start Practice</Button>)
    expect(screen.getByRole('button', { name: 'Start Practice' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continue</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Continue
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders an optional leading icon', () => {
    render(<Button icon={Flame}>Streak</Button>)
    const button = screen.getByRole('button', { name: 'Streak' })
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
})
